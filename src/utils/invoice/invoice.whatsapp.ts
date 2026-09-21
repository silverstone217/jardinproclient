// src/utils/invoice/invoice.whatsapp.ts

import { Linking } from "react-native";

/**
 * Normalise un numéro congolais pour WhatsApp.
 *
 * Exemples :
 * 0812345678     -> 243812345678
 * +243812345678  -> 243812345678
 * 243812345678   -> 243812345678
 */
export function normalizeWhatsAppPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "");

  // Format local RDC : 0XXXXXXXXX
  if (/^0\d{9}$/.test(normalized)) {
    return `243${normalized.slice(1)}`;
  }

  // Format international RDC : 243XXXXXXXXX
  if (/^243\d{9}$/.test(normalized)) {
    return normalized;
  }

  throw new Error("INVALID_WHATSAPP_PHONE");
}

/**
 * Ouvre une conversation WhatsApp avec le numéro fourni.
 *
 * Le client n'a pas besoin d'être enregistré dans les contacts.
 * Le message, s'il est fourni, est prérempli, mais n'est pas envoyé
 * automatiquement.
 */
export async function openWhatsAppChat(
  phone: string,
  message?: string,
): Promise<void> {
  const whatsappPhone = normalizeWhatsAppPhone(phone);

  const baseUrl = `https://wa.me/${whatsappPhone}`;

  const url = message?.trim()
    ? `${baseUrl}?text=${encodeURIComponent(message.trim())}`
    : baseUrl;

  await Linking.openURL(url);
}
