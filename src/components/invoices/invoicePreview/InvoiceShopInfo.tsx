import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { Invoice } from "@/types/invoice";
import { COLORS, fonts } from "@/utils/styles";

interface InvoiceShopInfoProps {
  invoice: Invoice;
}

export function InvoiceShopInfo({ invoice }: InvoiceShopInfoProps) {
  const { shop, pointOfSale } = invoice;

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* SHOP                                               */}
      {/* ================================================== */}

      <View style={styles.shopHeader}>
        <View style={styles.logo}>
          <Ionicons name="leaf-outline" size={22} color={COLORS.white} />
        </View>

        <View style={styles.shopIdentity}>
          <Text style={styles.shopName}>{shop.name}</Text>

          <Text style={styles.posName}>{pointOfSale.name}</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* CONTACT                                            */}
      {/* ================================================== */}

      {(pointOfSale.address || pointOfSale.telephone) && (
        <View style={styles.contactSection}>
          {pointOfSale.address && (
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={15} color={COLORS.Gray} />

              <Text style={styles.contactText}>{pointOfSale.address}</Text>
            </View>
          )}

          {pointOfSale.telephone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={15} color={COLORS.Gray} />

              <Text style={styles.contactText}>{pointOfSale.telephone}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEDE9",
  },

  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  shopIdentity: {
    flex: 1,
    marginLeft: 12,
  },

  shopName: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  posName: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.primary,
  },

  contactSection: {
    marginTop: 12,
    gap: 6,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  contactText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },
});
