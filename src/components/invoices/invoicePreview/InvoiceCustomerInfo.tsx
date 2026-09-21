import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceCustomerInfoProps {
  invoice: Invoice;
}

export function InvoiceCustomerInfo({ invoice }: InvoiceCustomerInfoProps) {
  const { name, phone } = invoice.customer;

  const hasCustomer = Boolean(name) || Boolean(phone);

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-outline" size={16} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Client</Text>
      </View>

      {/* ================================================== */}
      {/* CUSTOMER                                           */}
      {/* ================================================== */}

      {hasCustomer ? (
        <View style={styles.customerContent}>
          {name && <Text style={styles.customerName}>{name}</Text>}

          {phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.Gray} />

              <Text style={styles.phone}>{phone}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.walkInCustomer}>
          <Ionicons name="person-outline" size={15} color={COLORS.Gray} />

          <Text style={styles.walkInText}>Client de passage</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F8F9F6",
    borderWidth: 1,
    borderColor: "#E9ECE6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  title: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  customerContent: {
    marginTop: 10,
    paddingLeft: 39,
  },

  customerName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  phoneRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  phone: {
    marginLeft: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  walkInCustomer: {
    marginTop: 10,
    paddingLeft: 39,
    flexDirection: "row",
    alignItems: "center",
  },

  walkInText: {
    marginLeft: 6,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },
});
