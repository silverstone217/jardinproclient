import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface OrderCustomerHeaderProps {
  isNewCustomer: boolean;
}

export function OrderCustomerHeader({
  isNewCustomer,
}: OrderCustomerHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={isNewCustomer ? "person-add-outline" : "person-outline"}
          size={22}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.step}>ÉTAPE 2 SUR 4</Text>

        <Text style={styles.title}>
          {isNewCustomer ? "Nouveau client" : "Identifier le client"}
        </Text>

        <Text style={styles.description}>
          {isNewCustomer
            ? "Enregistrez les informations du client pour continuer la commande."
            : "Recherchez le client avec son numéro de téléphone."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3E7",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  step: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  title: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: COLORS.text,
  },

  description: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },
});
