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
      fileName: string;
    }
  | {
      status: "cancelled";
    }
  | {
      status: "share-sheet-opened";
      uri: string;
      fileName: string;
    };

// ============================================================
// NOM DU FICHIER
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

// ============================================================
// SAUVEGARDER / EXPORTER LE PDF
// ============================================================

export async function saveInvoicePdf(
  pdfUri: string,
  invoiceNumber: string,
): Promise<SaveInvoicePdfResult> {
  if (!pdfUri) {
    throw new Error("INVOICE_PDF_URI_REQUIRED");
  }

  const sourceInfo = await FileSystem.getInfoAsync(pdfUri);

  if (!sourceInfo.exists) {
    throw new Error("INVOICE_PDF_SOURCE_NOT_FOUND");
  }

  const fileName = getInvoiceFileName(invoiceNumber);

  // ==========================================================
  // ANDROID : CHOIX DU DOSSIER AVEC SAF
  // ==========================================================

  if (Platform.OS === "android") {
    const permission =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permission.granted) {
      return { status: "cancelled" };
    }

    const fileNameWithoutExtension = fileName.replace(/\.pdf$/i, "");

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        fileNameWithoutExtension,
        "application/pdf",
      );

    const base64 = await FileSystem.readAsStringAsync(pdfUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64) {
      throw new Error("INVOICE_PDF_EMPTY");
    }

    await FileSystem.writeAsStringAsync(destinationUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      status: "saved",
      uri: destinationUri,
      fileName,
    };
  }

  // ==========================================================
  // IOS : EXPORT VIA LA FEUILLE DE PARTAGE
  // ==========================================================

  const cacheDirectory = FileSystem.cacheDirectory;

  if (!cacheDirectory) {
    throw new Error("INVOICE_CACHE_DIRECTORY_UNAVAILABLE");
  }

  const exportUri = `${cacheDirectory}${fileName}`;

  // Éviter un conflit si le même numéro de facture existe
  const existingFile = await FileSystem.getInfoAsync(exportUri);

  if (existingFile.exists) {
    await FileSystem.deleteAsync(exportUri, {
      idempotent: true,
    });
  }

  // Copier le PDF avec un nom explicite avant le partage
  await FileSystem.copyAsync({
    from: pdfUri,
    to: exportUri,
  });

  const copiedFile = await FileSystem.getInfoAsync(exportUri);

  if (!copiedFile.exists) {
    throw new Error("INVOICE_PDF_EXPORT_COPY_FAILED");
  }

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("INVOICE_SHARING_UNAVAILABLE");
  }

  // Ouvre le menu iOS : l'utilisateur choisit
  // « Enregistrer dans Fichiers » et le dossier.
  await Sharing.shareAsync(exportUri, {
    mimeType: "application/pdf",
    dialogTitle: `Enregistrer ${fileName}`,
    UTI: "com.adobe.pdf",
  });

  // Important : cela signifie que la feuille de partage
  // a été ouverte/fermée, PAS que le fichier a été sauvegardé.
  return {
    status: "share-sheet-opened",
    uri: exportUri,
    fileName,
  };
}

// ============================================================
// PARTAGER / EXPORTER LE PDF
// ============================================================

/**
 * Ouvre la feuille de partage native avec le PDF.
 * L'utilisateur peut choisir WhatsApp, e-mail,
 * Google Drive, Fichiers, etc.
 */
export async function shareInvoicePdf(
  pdfUri: string,
  invoiceNumber?: string,
): Promise<void> {
  if (!pdfUri) {
    throw new Error("INVOICE_PDF_URI_REQUIRED");
  }

  const fileInfo = await FileSystem.getInfoAsync(pdfUri);

  if (!fileInfo.exists) {
    throw new Error("INVOICE_PDF_SOURCE_NOT_FOUND");
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
