import { Linking } from "react-native";

// ============================================================
// NORMALISER LE NUMÉRO DRC
// ============================================================

export function normalizeWhatsAppPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  // Exemple :
  // 0812345678 -> 243812345678
  if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
    return `243${cleanPhone.substring(1)}`;
  }

  // Déjà au format international
  if (cleanPhone.length === 12 && cleanPhone.startsWith("243")) {
    return cleanPhone;
  }

  throw new Error("INVALID_WHATSAPP_PHONE");
}

// ============================================================
// OUVRIR WHATSAPP SUR LE CLIENT
// ============================================================

export async function openWhatsAppChat(
  phone: string,
  message?: string,
): Promise<void> {
  const normalizedPhone = normalizeWhatsAppPhone(phone);

  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";

  const url = `https://wa.me/${normalizedPhone}` + encodedMessage;

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error("WHATSAPP_UNAVAILABLE");
  }

  await Linking.openURL(url);
}
