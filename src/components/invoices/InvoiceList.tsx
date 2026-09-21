import { StyleSheet, Text, View } from "react-native";
import { InvoiceCard } from "@/components/invoices/InvoiceCard";
import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceListProps {
  invoices: Invoice[];
  onInvoicePress: (invoiceId: string) => void;
}

export function InvoiceList({ invoices, onInvoicePress }: InvoiceListProps) {
  if (invoices.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Factures récentes</Text>

        <Text style={styles.count}>{invoices.length}</Text>
      </View>

      <View style={styles.list}>
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onPress={() => onInvoicePress(invoice.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 17,
  },

  header: {
    marginBottom: 9,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  count: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
    fontFamily: fonts.semibold,
    fontSize: 9,
    lineHeight: 22,
    color: COLORS.primary,
    textAlign: "center",
  },

  list: {
    gap: 8,
  },
});
