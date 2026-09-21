import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type {
  InvoiceFilters as InvoiceFiltersType,
  InvoicePeriod,
} from "@/types/invoice";

import { COLORS, fonts } from "@/utils/styles";

interface InvoiceFiltersProps {
  filters: InvoiceFiltersType;
  onChange: (filters: Partial<InvoiceFiltersType>) => void;
  onClear: () => void;
  onApply: () => void;
}

const PERIODS: {
  value: InvoicePeriod;
  label: string;
}[] = [
  {
    value: "day",
    label: "Jour",
  },
  {
    value: "week",
    label: "Semaine",
  },
  {
    value: "month",
    label: "Mois",
  },
  {
    value: "year",
    label: "Année",
  },
];

export function InvoiceFilters({
  filters,
  onChange,
  onClear,
  onApply,
}: InvoiceFiltersProps) {
  const hasFilters =
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined ||
    filters.period !== undefined ||
    filters.date !== undefined ||
    !!filters.customerPhone?.trim();

  const handleMinAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    onChange({
      minAmount: numericValue.length > 0 ? Number(numericValue) : undefined,
    });
  };

  const handleMaxAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    onChange({
      maxAmount: numericValue.length > 0 ? Number(numericValue) : undefined,
    });
  };

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.icon}>
            <Ionicons name="filter-outline" size={17} color={COLORS.primary} />
          </View>

          <View>
            <Text style={styles.title}>Filtrer les factures</Text>

            <Text style={styles.subtitle}>
              Retrouvez rapidement une facture
            </Text>
          </View>
        </View>

        {hasFilters && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Text style={styles.clear}>Effacer</Text>
          </Pressable>
        )}
      </View>

      {/* ================================================== */}
      {/* CLIENT                                             */}
      {/* ================================================== */}

      <View style={styles.field}>
        <Text style={styles.label}>Téléphone du client</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={16} color={COLORS.Gray} />

          <TextInput
            value={filters.customerPhone ?? ""}
            onChangeText={(value) =>
              onChange({
                customerPhone: value,
              })
            }
            placeholder="0XXXXXXXXX"
            placeholderTextColor={COLORS.Gray}
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={10}
          />
        </View>
      </View>

      {/* ================================================== */}
      {/* PÉRIODE                                            */}
      {/* ================================================== */}

      <View style={styles.field}>
        <Text style={styles.label}>Période</Text>

        <View style={styles.periods}>
          {PERIODS.map((period) => {
            const active = filters.period === period.value;

            return (
              <Pressable
                key={period.value}
                onPress={() =>
                  onChange({
                    period: active ? undefined : period.value,
                  })
                }
                style={[
                  styles.periodButton,
                  active && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[styles.periodText, active && styles.periodTextActive]}
                >
                  {period.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ================================================== */}
      {/* DATE                                               */}
      {/* ================================================== */}

      <View style={styles.field}>
        <Text style={styles.label}>Date exacte</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.Gray} />

          <TextInput
            value={filters.date ?? ""}
            onChangeText={(value) =>
              onChange({
                date: value.length > 0 ? value : undefined,
              })
            }
            placeholder="AAAA-MM-JJ"
            placeholderTextColor={COLORS.Gray}
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>
      </View>

      {/* ================================================== */}
      {/* MONTANT                                            */}
      {/* ================================================== */}

      <View style={styles.amountRow}>
        {/* MINIMUM */}

        <View style={[styles.field, styles.amountField]}>
          <Text style={styles.label}>Montant min.</Text>

          <TextInput
            value={
              filters.minAmount !== undefined ? String(filters.minAmount) : ""
            }
            onChangeText={handleMinAmountChange}
            placeholder="0"
            placeholderTextColor={COLORS.Gray}
            keyboardType="numeric"
            style={styles.amountInput}
          />
        </View>

        {/* MAXIMUM */}

        <View style={[styles.field, styles.amountField]}>
          <Text style={styles.label}>Montant max.</Text>

          <TextInput
            value={
              filters.maxAmount !== undefined ? String(filters.maxAmount) : ""
            }
            onChangeText={handleMaxAmountChange}
            placeholder="0"
            placeholderTextColor={COLORS.Gray}
            keyboardType="numeric"
            style={styles.amountInput}
          />
        </View>
      </View>

      {/* ================================================== */}
      {/* APPLY                                              */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.applyButton,
          pressed && styles.applyPressed,
        ]}
        onPress={onApply}
      >
        <Ionicons name="search-outline" size={17} color={COLORS.white} />

        <Text style={styles.applyText}>Rechercher</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  title: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    marginLeft: 9,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  clear: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.error,
  },

  // ==========================================================
  // FIELD
  // ==========================================================

  field: {
    marginBottom: 13,
  },

  label: {
    marginBottom: 6,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // INPUT
  // ==========================================================

  inputWrapper: {
    height: 42,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  // ==========================================================
  // PERIODS
  // ==========================================================

  periods: {
    flexDirection: "row",
    gap: 7,
  },

  periodButton: {
    flex: 1,
    minHeight: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F2",
    borderWidth: 1,
    borderColor: "#EEEEEA",
  },

  periodButtonActive: {
    backgroundColor: "#EDF4EB",
    borderColor: "#D7E5D3",
  },

  periodText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  periodTextActive: {
    fontFamily: fonts.semibold,
    color: COLORS.primary,
  },

  // ==========================================================
  // AMOUNT
  // ==========================================================

  amountRow: {
    flexDirection: "row",
    gap: 10,
  },

  amountField: {
    flex: 1,
  },

  amountInput: {
    height: 42,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E7E7E3",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  // ==========================================================
  // APPLY
  // ==========================================================

  applyButton: {
    height: 44,
    marginTop: 1,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  applyText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  applyPressed: {
    opacity: 0.75,
  },
});
