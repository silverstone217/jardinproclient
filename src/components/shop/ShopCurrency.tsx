import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ShopCurrency } from "@/types/shop";

import { COLORS, fonts } from "@/utils/styles";

interface ShopCurrencyProps {
  value: ShopCurrency;
  onChange: (value: ShopCurrency) => void;
}

const currencies: {
  value: ShopCurrency;
  label: string;
  symbol: string;
}[] = [
  {
    value: "CDF",
    label: "Franc congolais",
    symbol: "FC",
  },
  {
    value: "USD",
    label: "Dollar américain",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "Euro",
    symbol: "€",
  },
];

export default function ShopCurrency({ value, onChange }: ShopCurrencyProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={20}
            color={COLORS.secondary}
          />
        </View>

        <View>
          <Text style={styles.title}>Devise de la boutique</Text>

          <Text style={styles.subtitle}>
            Utilisée pour vos prix et vos ventes.
          </Text>
        </View>
      </View>

      <View style={styles.options}>
        {currencies.map((item) => {
          const selected = item.value === value;

          return (
            <Pressable
              key={item.value}
              onPress={() => onChange(item.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.symbol, selected && styles.selectedSymbol]}>
                <Text
                  style={[
                    styles.symbolText,
                    selected && styles.selectedSymbolText,
                  ]}
                >
                  {item.symbol}
                </Text>
              </View>

              <View style={styles.optionText}>
                <Text style={styles.currency}>{item.value}</Text>

                <Text style={styles.description}>{item.label}</Text>
              </View>

              {selected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={21}
                  color={COLORS.primary}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5E8",
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  options: {
    gap: 9,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.neutral,
  },

  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: "#F1F6F0",
  },

  symbol: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
  },

  selectedSymbol: {
    backgroundColor: COLORS.primary,
  },

  symbolText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.darkGray,
  },

  selectedSymbolText: {
    color: COLORS.white,
  },

  optionText: {
    flex: 1,
    marginLeft: 11,
  },

  currency: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  description: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.7,
  },
});
