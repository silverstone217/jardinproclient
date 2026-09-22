import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InvoiceActions } from "@/components/invoices/invoicePreview/InvoiceActions";
import { InvoiceCustomerInfo } from "@/components/invoices/invoicePreview/InvoiceCustomerInfo";
import { InvoiceItems } from "@/components/invoices/invoicePreview/InvoiceItems";
import { InvoiceLoyalty } from "@/components/invoices/invoicePreview/InvoiceLoyalty";
import { InvoicePaymentInfo } from "@/components/invoices/invoicePreview/InvoicePaymentInfo";
import { InvoiceShopInfo } from "@/components/invoices/invoicePreview/InvoiceShopInfo";
import { InvoiceTotals } from "@/components/invoices/invoicePreview/InvoiceTotals";
import { useInvoiceStore } from "@/store/invoice.store";
import { useShopStore } from "@/store/shop.store";
import type { Invoice } from "@/types/invoice";
import { InvoiceDocumentData } from "@/utils/invoice/invoice";
import { openWhatsAppChat } from "@/utils/invoice/invoice.whatsapp";
import { saveInvoicePdf, shareInvoicePdf } from "@/utils/invoice/invoiceFile";
import { generateInvoicePdf, printInvoice } from "@/utils/invoice/invoicePdf";
import { COLORS, fonts } from "@/utils/styles";

function toInvoiceDocumentData(
  invoice: Invoice,
  shopLogo?: string | null,
): InvoiceDocumentData {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    shopName: invoice.shop.name,
    shopLogo: shopLogo ?? null,
    pointOfSaleName: invoice.pointOfSale.name,
    pointOfSaleAddress: invoice.pointOfSale.address,
    pointOfSaleTelephone: invoice.pointOfSale.telephone,
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    discountAmount: invoice.discountAmount,
    totalAmount: invoice.totalAmount,
    paymentMethod: invoice.paymentMethod,
    customer: { name: invoice.customer.name, phone: invoice.customer.phone },
    loyalty: {
      pointsEarned: invoice.loyalty.pointsEarned,
      pointsUsed: invoice.loyalty.pointsUsed,
    },
    items: invoice.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      currency: item.currency,
    })),
  };
}

function formatInvoiceAmount(
  amount: number,
  currency: Invoice["currency"],
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  const fractionDigits = currency === "CDF" ? 0 : 2;

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeAmount)} ${currency}`;
}

export default function InvoiceDetailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    invoiceId?: string | string[];
  }>();

  const invoiceId = Array.isArray(params.invoiceId)
    ? params.invoiceId[0]
    : params.invoiceId;

  const {
    invoices,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    fetchInvoiceById,
    clearError,
    getInvoiceById,
  } = useInvoiceStore();

  const { shop } = useShopStore();

  const [invoice, setInvoice] = useState<Invoice | null>(
    invoiceId ? (getInvoiceById(invoiceId) ?? null) : null,
  );

  const [activeAction, setActiveAction] = useState<
    "print" | "share" | "save" | "whatsapp" | null
  >(null);

  // ============================================================
  // SYNCHRONISER AVEC LE CACHE DU STORE
  // ============================================================

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(null);
      return;
    }

    const cachedInvoice = getInvoiceById(invoiceId);

    if (cachedInvoice) {
      setInvoice(cachedInvoice);
    }
  }, [invoiceId, invoices, getInvoiceById]);

  // ============================================================
  // CHARGER LA FACTURE
  // ============================================================

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) {
      return;
    }

    try {
      clearError();

      const result = await fetchInvoiceById(invoiceId);

      if (result) {
        setInvoice(result);
      }
    } catch (loadError) {
      console.error("Erreur chargement facture :", loadError);
    }
  }, [invoiceId, clearError, fetchInvoiceById]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  // ============================================================
  // RETOUR
  // ============================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/invoices");
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const handlePrint = useCallback(async () => {
    if (!invoice) {
      return;
    }

    try {
      setActiveAction("print");

      const document = toInvoiceDocumentData(invoice, shop?.logo);

      const result = await printInvoice(document);

      if (result.status === "cancelled") {
        return;
      }
    } catch (actionError) {
      console.error("Erreur impression facture :", actionError);

      Alert.alert("Erreur", "Impossible d'imprimer cette facture.");
    } finally {
      setActiveAction(null);
    }
  }, [invoice]);

  // ============================================================
  // PARTAGER / EXPORTER
  // ============================================================

  const handleShare = async () => {
    if (!invoice || activeAction !== null) {
      return;
    }

    try {
      setActiveAction("share");

      // Préparer les données du document
      const invoiceData = toInvoiceDocumentData(invoice, shop?.logo);

      // Générer le PDF
      const pdf = await generateInvoicePdf(invoiceData);

      // Ouvrir la feuille de partage native
      await shareInvoicePdf(pdf.uri, invoice.invoiceNumber);
    } catch (error) {
      console.error("Erreur partage facture :", error);

      Alert.alert(
        "Erreur",
        "Impossible de partager la facture pour le moment.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  // ============================================================
  // ENREGISTRER LE PDF
  // ============================================================

  const handleSave = useCallback(async () => {
    if (!invoice || activeAction) {
      return;
    }

    try {
      setActiveAction("save");

      const document = toInvoiceDocumentData(invoice, shop?.logo);
      const pdf = await generateInvoicePdf(document);

      if (!pdf.uri) {
        throw new Error("INVOICE_PDF_URI_REQUIRED");
      }

      const result = await saveInvoicePdf(pdf.uri, invoice.invoiceNumber);

      if (result.status === "cancelled") {
        return;
      }

      if (result.status === "saved") {
        Alert.alert(
          "Facture enregistrée",
          `Le fichier ${result.fileName} a été enregistré dans le dossier choisi.`,
        );

        return;
      }

      if (result.status === "share-sheet-opened") {
        Alert.alert(
          "Exporter la facture",
          `Le menu de partage iOS a été ouvert pour ${result.fileName}.\n\nSi vous avez choisi « Enregistrer dans Fichiers », vous pourrez retrouver le PDF dans le dossier sélectionné.`,
        );
      }
    } catch (actionError) {
      console.error("Erreur sauvegarde facture :", actionError);

      const message =
        actionError instanceof Error
          ? actionError.message
          : String(actionError);

      Alert.alert(
        "Échec de la sauvegarde",
        __DEV__
          ? `Impossible d'enregistrer le PDF.\n\n${message}`
          : "Impossible d'enregistrer cette facture. Vérifiez l'espace disponible et réessayez.",
      );
    } finally {
      setActiveAction(null);
    }
  }, [invoice, activeAction]);

  // ============================================================
  // WHATSAPP
  // ============================================================

  const handleWhatsApp = useCallback(async () => {
    if (!invoice || activeAction) {
      return;
    }

    // ----------------------------------------------------------
    // Vérifier que la facture possède un numéro client
    // ----------------------------------------------------------

    const customerPhone = invoice.customer?.phone?.trim();

    if (!customerPhone) {
      Alert.alert(
        "Numéro client manquant",
        "Cette facture ne contient pas de numéro de téléphone client.",
      );

      return;
    }

    try {
      setActiveAction("whatsapp");

      // --------------------------------------------------------
      // 1. Préparer le document
      // --------------------------------------------------------

      const document = toInvoiceDocumentData(invoice, shop?.logo);

      // --------------------------------------------------------
      // 2. Générer le PDF
      // --------------------------------------------------------

      const pdf = await generateInvoicePdf(document);

      if (!pdf.uri) {
        throw new Error("INVOICE_PDF_URI_REQUIRED");
      }

      // --------------------------------------------------------
      // 3. Exporter le PDF sur le téléphone
      //
      // IMPORTANT :
      // Sur iPhone / Expo Go, cela ouvre la feuille iOS.
      // L'utilisateur doit choisir :
      //
      //    Enregistrer dans Fichiers
      //
      // puis sélectionner l'emplacement.
      // --------------------------------------------------------

      const saveResult = await saveInvoicePdf(pdf.uri, invoice.invoiceNumber);

      // L'utilisateur a annulé
      if (saveResult.status === "cancelled") {
        return;
      }

      // --------------------------------------------------------
      // 4. Préparer le message WhatsApp
      // --------------------------------------------------------

      const message =
        `Bonjour,\n\n` +
        `Veuillez trouver votre facture ` +
        `${invoice.invoiceNumber} ` +
        `d'un montant de ` +
        `${invoice.totalAmount.toLocaleString("fr-FR")} ` +
        `${invoice.currency}.\n\n` +
        `Merci pour votre confiance.`;

      // --------------------------------------------------------
      // 5. Ouvrir WhatsApp directement sur le client
      //
      // Exemple :
      // 0812345678
      //       ↓
      // 243812345678
      //
      // Le numéro n'a pas besoin d'être enregistré.
      // --------------------------------------------------------

      await openWhatsAppChat(customerPhone, message);
    } catch (actionError) {
      console.error("Erreur WhatsApp facture :", actionError);

      const errorMessage =
        actionError instanceof Error
          ? actionError.message
          : String(actionError);

      Alert.alert(
        "Échec de l'envoi",
        __DEV__
          ? `Impossible de préparer l'envoi de la facture.\n\n${errorMessage}`
          : "Impossible de préparer l'envoi de cette facture. Vérifiez le numéro du client et réessayez.",
      );
    } finally {
      setActiveAction(null);
    }
  }, [invoice, activeAction]);

  // ============================================================
  // LOADING INITIAL
  // ============================================================

  if (isLoading && !invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <Ionicons name="receipt-outline" size={28} color={COLORS.primary} />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={styles.stateLoader}
          />

          <Text style={styles.stateTitle}>Chargement de la facture</Text>

          <Text style={styles.stateDescription}>
            Récupération des informations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // FACTURE INTROUVABLE
  // ============================================================

  if (!invoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorStateIcon}>
            <Ionicons name="receipt-outline" size={30} color={COLORS.error} />
          </View>

          <Text style={styles.stateTitle}>Facture introuvable</Text>

          <Text style={styles.stateDescription}>
            {error ?? "Cette facture n'est pas disponible sur cet appareil."}
          </Text>

          {isOffline && (
            <Text style={styles.offlineDescription}>
              Vous êtes actuellement hors ligne.
            </Text>
          )}

          <View style={styles.stateActions}>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
              onPress={loadInvoice}
            >
              <Ionicons name="refresh-outline" size={17} color={COLORS.white} />

              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Retour aux factures</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backIconButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>

          <View style={styles.topBarContent}>
            <Text style={styles.topBarEyebrow}>FACTURE</Text>

            <Text style={styles.topBarTitle} numberOfLines={1}>
              {invoice.invoiceNumber}
            </Text>
          </View>

          <View style={styles.receiptIcon}>
            <Ionicons name="receipt-outline" size={19} color={COLORS.primary} />
          </View>
        </View>

        {/* ================================================== */}
        {/* OFFLINE                                            */}
        {/* ================================================== */}

        {isOffline && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineIcon}>
              <Ionicons
                name="cloud-offline-outline"
                size={16}
                color={COLORS.warning}
              />
            </View>

            <View style={styles.offlineContent}>
              <Text style={styles.offlineTitle}>Mode hors ligne</Text>

              <Text style={styles.offlineText}>
                Affichage de la facture enregistrée localement.
              </Text>
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* CONTENT                                            */}
        {/* ================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={loadInvoice}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* ================================================== */}
          {/* INVOICE CARD                                       */}
          {/* ================================================== */}

          <View style={styles.invoiceCard}>
            {/* ============================================== */}
            {/* SHOP                                           */}
            {/* ============================================== */}

            <InvoiceShopInfo invoice={invoice} />

            {/* ============================================== */}
            {/* INVOICE META                                    */}
            {/* ============================================== */}

            <View style={styles.invoiceMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>N° facture</Text>

                <Text style={styles.metaValue} numberOfLines={1}>
                  {invoice.invoiceNumber}
                </Text>
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Date</Text>

                <Text style={styles.metaValue}>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(invoice.createdAt))}
                </Text>
              </View>
            </View>

            {/* ============================================== */}
            {/* CUSTOMER                                       */}
            {/* ============================================== */}

            <InvoiceCustomerInfo invoice={invoice} />

            {/* ============================================== */}
            {/* ITEMS                                          */}
            {/* ============================================== */}

            <InvoiceItems invoice={invoice} />

            {/* ============================================== */}
            {/* TOTALS                                         */}
            {/* ============================================== */}

            <InvoiceTotals invoice={invoice} />

            {/* ============================================== */}
            {/* PAYMENT                                        */}
            {/* ============================================== */}

            <InvoicePaymentInfo invoice={invoice} />

            {/* ============================================== */}
            {/* LOYALTY                                        */}
            {/* ============================================== */}

            <InvoiceLoyalty invoice={invoice} />
          </View>

          {/* ================================================== */}
          {/* ACTIONS                                            */}
          {/* ================================================== */}

          <InvoiceActions
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
            onWhatsApp={handleWhatsApp}
            activeAction={activeAction}
            disabled={false}
          />

          {/* ================================================== */}
          {/* BOTTOM                                            */}
          {/* ================================================== */}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  topBarContent: {
    flex: 1,
    marginLeft: 11,
  },

  topBarEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  topBarTitle: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  receiptIcon: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  // ==========================================================
  // OFFLINE
  // ==========================================================

  offlineBanner: {
    marginHorizontal: 18,
    marginBottom: 12,
    padding: 11,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
  },

  offlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C9",
  },

  offlineContent: {
    flex: 1,
    marginLeft: 9,
  },

  offlineTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: "#725B16",
  },

  offlineText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: "#927A2C",
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },

  // ==========================================================
  // INVOICE
  // ==========================================================

  invoiceCard: {
    padding: 17,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  invoiceMeta: {
    minHeight: 57,
    marginTop: 15,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9F6",
    borderWidth: 1,
    borderColor: "#E9ECE6",
  },

  metaItem: {
    flex: 1,
  },

  metaDivider: {
    width: 1,
    height: 27,
    marginHorizontal: 10,
    backgroundColor: "#E1E4DE",
  },

  metaLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  metaValue: {
    marginTop: 3,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.text,
  },

  // ==========================================================
  // STATES
  // ==========================================================

  centerState: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  stateIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  errorStateIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  stateLoader: {
    marginTop: 18,
  },

  stateTitle: {
    marginTop: 13,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },

  stateDescription: {
    maxWidth: 300,
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  offlineDescription: {
    marginTop: 7,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.warning,
    textAlign: "center",
  },

  stateActions: {
    width: "100%",
    maxWidth: 280,
    marginTop: 20,
    gap: 9,
  },

  retryButton: {
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  retryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  backButton: {
    minHeight: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7E2",
  },

  backButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  pressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpacer: {
    height: 100,
  },
});
