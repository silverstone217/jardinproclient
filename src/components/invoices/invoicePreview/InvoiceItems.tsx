import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceItemsProps {
  invoice: Invoice;
}

const BOTTLE_SIZE_LABELS: Record<Invoice["items"][number]["size"], string> = {
  ML_200: "200 ml",
  ML_500: "500 ml",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

function getBottleSizeLabel(size: Invoice["items"][number]["size"]): string {
  return BOTTLE_SIZE_LABELS[size] ?? size;
}

export function InvoiceItems({ invoice }: InvoiceItemsProps) {
  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
        </View>

        <Text style={styles.sectionTitle}>Détail de la commande</Text>
      </View>

      {/* ================================================== */}
      {/* TABLE HEADER                                       */}
      {/* ================================================== */}

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.productColumn]}>Produit</Text>

        <Text style={[styles.headerText, styles.quantityColumn]}>Qté</Text>

        <Text style={[styles.headerText, styles.priceColumn]}>Prix</Text>

        <Text style={[styles.headerText, styles.totalColumn]}>Total</Text>
      </View>

      {/* ================================================== */}
      {/* ITEMS                                              */}
      {/* ================================================== */}

      <View style={styles.items}>
        {invoice.items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.item,
              index === invoice.items.length - 1 && styles.lastItem,
            ]}
          >
            {/* Produit */}
            <View style={styles.productColumn}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.productName}
              </Text>

              <Text style={styles.productSize}>
                {getBottleSizeLabel(item.size)}
              </Text>
            </View>

            {/* Quantité */}
            <Text style={[styles.itemText, styles.quantityColumn]}>
              {item.quantity}
            </Text>

            {/* Prix unitaire */}
            <Text
              style={[styles.itemText, styles.priceColumn]}
              numberOfLines={1}
            >
              {formatAmount(item.unitPrice)}
            </Text>

            {/* Total */}
            <Text
              style={[styles.itemTotal, styles.totalColumn]}
              numberOfLines={1}
            >
              {formatAmount(item.subtotal)}
            </Text>
          </View>
        ))}
      </View>

      {/* ================================================== */}
      {/* EMPTY STATE                                        */}
      {/* ================================================== */}

      {invoice.items.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="basket-outline" size={20} color={COLORS.Gray} />

          <Text style={styles.emptyText}>
            Aucun article dans cette facture.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  sectionTitle: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  tableHeader: {
    minHeight: 30,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: "#F4F5F1",
  },

  headerText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.Gray,
    textTransform: "uppercase",
  },

  items: {
    marginTop: 2,
  },

  item: {
    minHeight: 57,
    paddingHorizontal: 9,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1EE",
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  productColumn: {
    flex: 1,
    paddingRight: 5,
  },

  quantityColumn: {
    width: 32,
    textAlign: "center",
  },

  priceColumn: {
    width: 67,
    textAlign: "right",
  },

  totalColumn: {
    width: 72,
    textAlign: "right",
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    lineHeight: 14,
    color: COLORS.text,
  },

  productSize: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  itemText: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  itemTotal: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.text,
  },

  empty: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DDE1D9",
    borderRadius: 12,
    marginTop: 6,
  },

  emptyText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },
});
