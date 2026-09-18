import { MaterialCommunityIcons } from "@expo/vector-icons";

import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ShopLoyaltyProps {
  purchaseAmount: number;
  pointsEarned: number;
  pointsForDiscount: number;
  discountAmount: number;

  editable?: boolean;

  onPurchaseAmountChange: (value: number) => void;

  onPointsEarnedChange: (value: number) => void;

  onPointsForDiscountChange: (value: number) => void;

  onDiscountAmountChange: (value: number) => void;
}

interface FieldProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  placeholder: string;
  suffix: string;
  editable: boolean;
  onChangeText: (value: string) => void;
}

function Field({
  icon,
  label,
  value,
  placeholder,
  suffix,
  editable,
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldTop}>
        <View style={[styles.fieldIcon, !editable && styles.fieldIconDisabled]}>
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color={editable ? COLORS.primary : COLORS.Gray}
          />
        </View>

        <Text style={[styles.label, !editable && styles.labelDisabled]}>
          {label}
        </Text>
      </View>

      <View
        style={[styles.inputWrapper, !editable && styles.inputWrapperDisabled]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.Gray}
          keyboardType="numeric"
          editable={editable}
          selectTextOnFocus={editable}
          autoCorrect={false}
          style={[styles.input, !editable && styles.inputDisabled]}
        />

        <Text style={[styles.suffix, !editable && styles.suffixDisabled]}>
          {suffix}
        </Text>
      </View>
    </View>
  );
}

const formatAmount = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) {
    return "0";
  }

  return new Intl.NumberFormat("fr-FR").format(value);
};

export default function ShopLoyalty({
  purchaseAmount,
  pointsEarned,
  pointsForDiscount,
  discountAmount,
  editable = true,
  onPurchaseAmountChange,
  onPointsEarnedChange,
  onPointsForDiscountChange,
  onDiscountAmountChange,
}: ShopLoyaltyProps) {
  const handlePurchaseAmountChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    onPurchaseAmountChange(cleaned.length > 0 ? Number(cleaned) : 0);
  };

  const handlePointsEarnedChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    onPointsEarnedChange(cleaned.length > 0 ? Number(cleaned) : 0);
  };

  const handlePointsForDiscountChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    onPointsForDiscountChange(cleaned.length > 0 ? Number(cleaned) : 0);
  };

  const handleDiscountAmountChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    onDiscountAmountChange(cleaned.length > 0 ? Number(cleaned) : 0);
  };

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="star-circle-outline"
            size={19}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Programme de fidélité</Text>

          <Text style={styles.subtitle}>
            Configurez les points gagnés et les réductions disponibles.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* RULE SUMMARY                                       */}
      {/* ================================================== */}

      <View style={styles.ruleCard}>
        <View style={styles.ruleHeader}>
          <MaterialCommunityIcons
            name="gift-outline"
            size={16}
            color={COLORS.secondary}
          />

          <Text style={styles.ruleTitle}>Règle de fidélité</Text>
        </View>

        <Text style={styles.ruleText}>
          Pour chaque{" "}
          <Text style={styles.ruleValue}>
            {formatAmount(purchaseAmount)} FC
          </Text>{" "}
          d'achat, le client gagne{" "}
          <Text style={styles.ruleValue}>{pointsEarned} points</Text>.
        </Text>

        <Text style={styles.ruleText}>
          Avec <Text style={styles.ruleValue}>{pointsForDiscount} points</Text>,
          il obtient{" "}
          <Text style={styles.ruleValue}>
            {formatAmount(discountAmount)} FC
          </Text>{" "}
          de réduction.
        </Text>
      </View>

      {/* ================================================== */}
      {/* FIELDS                                             */}
      {/* ================================================== */}

      <View style={styles.fields}>
        <Field
          icon="cash-multiple"
          label="Montant d'achat pour gagner des points"
          value={purchaseAmount > 0 ? String(purchaseAmount) : ""}
          placeholder="3000"
          suffix="FC"
          editable={editable}
          onChangeText={handlePurchaseAmountChange}
        />

        <Field
          icon="star-plus-outline"
          label="Points gagnés"
          value={pointsEarned > 0 ? String(pointsEarned) : ""}
          placeholder="10"
          suffix="points"
          editable={editable}
          onChangeText={handlePointsEarnedChange}
        />

        <Field
          icon="star-check-outline"
          label="Points nécessaires pour une réduction"
          value={pointsForDiscount > 0 ? String(pointsForDiscount) : ""}
          placeholder="100"
          suffix="points"
          editable={editable}
          onChangeText={handlePointsForDiscountChange}
        />

        <Field
          icon="cash-refund"
          label="Montant de la réduction"
          value={discountAmount > 0 ? String(discountAmount) : ""}
          placeholder="1000"
          suffix="FC"
          editable={editable}
          onChangeText={handleDiscountAmountChange}
        />
      </View>

      {/* ================================================== */}
      {/* INFORMATION                                        */}
      {/* ================================================== */}

      <View style={styles.info}>
        <MaterialCommunityIcons
          name="information-outline"
          size={16}
          color={COLORS.info}
        />

        <Text style={styles.infoText}>
          Les points sont calculés à partir du montant d'achat selon la règle
          définie par votre boutique.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ========================================================
  // HEADER
  // ========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 17,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1DE",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  // ========================================================
  // RULE SUMMARY
  // ========================================================

  ruleCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FFF9EF",
    borderWidth: 1,
    borderColor: "#F5E6C9",
  },

  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  ruleTitle: {
    marginLeft: 6,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.secondary,
  },

  ruleText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.darkGray,
  },

  ruleValue: {
    fontFamily: fonts.bold,
    color: COLORS.text,
  },

  // ========================================================
  // FIELDS
  // ========================================================

  fields: {
    paddingTop: 5,
  },

  field: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  fieldTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F0",
  },

  fieldIconDisabled: {
    backgroundColor: "#F2F2F0",
  },

  label: {
    flex: 1,
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  labelDisabled: {
    color: COLORS.Gray,
  },

  inputWrapper: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
  },

  inputWrapperDisabled: {
    backgroundColor: "#F5F5F3",
  },

  input: {
    flex: 1,
    minHeight: 41,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  inputDisabled: {
    color: COLORS.Gray,
  },

  suffix: {
    marginLeft: 8,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.primary,
  },

  suffixDisabled: {
    color: COLORS.Gray,
  },

  // ========================================================
  // INFO
  // ========================================================

  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 13,
    paddingHorizontal: 2,
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },
});
