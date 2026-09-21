// src/utils/invoice/invoice.file.ts

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

// ============================================================
// TYPES
// ============================================================

export type SaveInvoicePdfResult =
  | {
      status: "saved";
      uri: string;
    }
  | {
      status: "cancelled";
    };

// ============================================================
// HELPERS INTERNES
// ============================================================

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "-");
}

function getInvoiceFileName(invoiceNumber: string): string {
  const safeNumber = sanitizeFileName(invoiceNumber || "facture");

  return `Facture-${safeNumber}.pdf`;
}

async function ensureDirectoryExists(directoryUri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(directoryUri);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryUri, {
      intermediates: true,
    });
  }
}

// ============================================================
// SAUVEGARDER LE PDF
// ============================================================

/**
 * Sauvegarde un PDF déjà généré.
 *
 * Android :
 * - ouvre le sélecteur de dossier système ;
 * - crée la facture PDF dans le dossier choisi.
 *
 * iOS :
 * - copie le PDF dans le dossier Documents de l'application.
 *
 * `pdfUri` est l'URI retournée par generateInvoicePdf().
 */
export async function saveInvoicePdf(
  pdfUri: string,
  invoiceNumber: string,
): Promise<SaveInvoicePdfResult> {
  if (!pdfUri) {
    throw new Error("INVOICE_PDF_URI_REQUIRED");
  }

  const fileName = getInvoiceFileName(invoiceNumber);

  if (Platform.OS === "android") {
    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permission.granted) {
      return { status: "cancelled" };
    }

    const directoryUri = permission.directoryUri;

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName.replace(/\.pdf$/i, ""),
        "application/pdf",
      );

    const base64 = await FileSystem.readAsStringAsync(pdfUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await FileSystem.writeAsStringAsync(destinationUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      status: "saved",
      uri: destinationUri,
    };
  }

  // iOS : stockage persistant dans les documents de l'application.
  const documentsDirectory = FileSystem.documentDirectory;

  if (!documentsDirectory) {
    throw new Error("INVOICE_DOCUMENT_DIRECTORY_UNAVAILABLE");
  }

  const invoicesDirectory = `${documentsDirectory}Factures/`;

  await ensureDirectoryExists(invoicesDirectory);

  const destinationUri = `${invoicesDirectory}${fileName}`;
  const existingFile = await FileSystem.getInfoAsync(destinationUri);

  if (existingFile.exists) {
    await FileSystem.deleteAsync(destinationUri, {
      idempotent: true,
    });
  }

  await FileSystem.copyAsync({
    from: pdfUri,
    to: destinationUri,
  });

  return {
    status: "saved",
    uri: destinationUri,
  };
}

// ============================================================
// PARTAGER LE PDF
// ============================================================

/**
 * Ouvre la feuille de partage native avec le PDF.
 *
 * L'utilisateur peut choisir WhatsApp, e-mail, etc.
 * La fonction ne garantit pas que le destinataire a reçu le fichier.
 */
export async function shareInvoicePdf(
  pdfUri: string,
  invoiceNumber?: string,
): Promise<void> {
  if (!pdfUri) {
    throw new Error("INVOICE_PDF_URI_REQUIRED");
  }

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("INVOICE_SHARING_UNAVAILABLE");
  }

  await Sharing.shareAsync(pdfUri, {
    mimeType: "application/pdf",
    dialogTitle: invoiceNumber
      ? `Partager la facture ${invoiceNumber}`
      : "Partager la facture",
    UTI: "com.adobe.pdf",
  });
}
