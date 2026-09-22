import * as Print from "expo-print";

import type { InvoiceDocumentData } from "./invoice";
import { buildInvoiceHtml } from "./invoiceHtml";

// ============================================================
// GÉNÉRER LE PDF
// ============================================================

/**
 * Génère un PDF temporaire dans le cache
 * de l'application.
 *
 * Le PDF peut ensuite être :
 * - enregistré ;
 * - partagé ;
 * - envoyé vers le système d'impression.
 */
export async function generateInvoicePdf(
  invoice: InvoiceDocumentData,
): Promise<Print.FilePrintResult> {
  const html = buildInvoiceHtml(invoice);

  return Print.printToFileAsync({
    html,
    width: 595,
    height: 842,
    margins: {
      top: 36,
      right: 36,
      bottom: 36,
      left: 36,
    },
  });
}

// ============================================================
// IMPRIMER
// ============================================================

/**
 * Ouvre la fenêtre native d'impression.
 *
 * IMPORTANT :
 * L'utilisateur peut fermer ou annuler la fenêtre
 * d'impression. Ce n'est PAS une erreur applicative.
 *
 * Dans ce cas, on retourne simplement :
 *
 * {
 *   status: "cancelled"
 * }
 */
export async function printInvoice(invoice: InvoiceDocumentData): Promise<{
  status: "printed" | "cancelled";
}> {
  const html = buildInvoiceHtml(invoice);

  try {
    await Print.printAsync({
      html,
    });

    return {
      status: "printed",
    };
  } catch (error) {
    // --------------------------------------------------------
    // L'utilisateur a annulé/fermé l'impression
    // --------------------------------------------------------

    if (isUserCancellation(error)) {
      return {
        status: "cancelled",
      };
    }

    // --------------------------------------------------------
    // Une vraie erreur d'impression
    // --------------------------------------------------------

    throw error;
  }
}

// ============================================================
// DÉTECTION ANNULATION
// ============================================================

function isUserCancellation(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message = error instanceof Error ? error.message : String(error);

  const normalized = message.toLowerCase();

  return (
    normalized.includes("cancel") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("dismiss") ||
    normalized.includes("user cancelled") ||
    normalized.includes("user canceled")
  );
}
