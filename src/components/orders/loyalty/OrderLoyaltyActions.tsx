import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { OrderLoyaltyRedemption } from "@/types/order";

import { COLORS, fonts } from "@/utils/styles";

interface OrderLoyaltyActionsProps {
  redemption: OrderLoyaltyRedemption;
  pointsUsed: number;
  onPointsUsedChange: (points: number) => void;
  onContinue: () => void;
  disabled?: boolean;
}

export function OrderLoyaltyActions({
  redemption,
  pointsUsed,
  onPointsUsedChange,
  onContinue,
  disabled = false,
}: OrderLoyaltyActionsProps) {
  const {
    pointsRequired,
    discountAmount,
    availablePoints,
    usablePoints,
    maxPointsUsable,
    maxDiscountAmount,
  } = redemption;

  const isUsingPoints = pointsUsed > 0;

  // ==========================================================
  // RÉDUCTION ACTUELLE
  // ==========================================================

  const discount =
    pointsRequired > 0
      ? Math.floor(pointsUsed / pointsRequired) * discountAmount
      : 0;

  // ==========================================================
  // UTILISER LES POINTS
  // ==========================================================

  const handleUsePoints = () => {
    if (disabled || usablePoints <= 0) {
      return;
    }

    if (isUsingPoints) {
      onPointsUsedChange(0);
      return;
    }

    onPointsUsedChange(Math.min(maxPointsUsable, usablePoints));
  };

  // ==========================================================
  // MODIFIER LE NOMBRE DE POINTS
  // ==========================================================

  const handlePointsChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      onPointsUsedChange(0);
      return;
    }

    const parsedValue = Number(numericValue);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    if (pointsRequired <= 0) {
      onPointsUsedChange(Math.min(parsedValue, maxPointsUsable));

      return;
    }

    const roundedValue =
      Math.floor(parsedValue / pointsRequired) * pointsRequired;

    const clampedValue = Math.min(roundedValue, maxPointsUsable);

    onPointsUsedChange(clampedValue);
  };

  // ==========================================================
  // UTILISER TOUS LES POINTS
  // ==========================================================

  const handleUseAllPoints = () => {
    if (disabled || usablePoints <= 0) {
      return;
    }

    onPointsUsedChange(Math.min(maxPointsUsable, usablePoints));
  };

  // ==========================================================
  // POINTS RESTANTS
  // ==========================================================

  const remainingPoints = Math.max(availablePoints - pointsUsed, 0);

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* SECTION HEADER                                     */}
      {/* ================================================== */}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>Que souhaitez-vous faire ?</Text>

          <Text style={styles.sectionSubtitle}>
            Choisissez comment utiliser vos points fidélité.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* CONSERVER LES POINTS                              */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.option,
          !isUsingPoints && styles.optionSelected,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={() => {
          if (disabled) {
            return;
          }

          onPointsUsedChange(0);
        }}
        disabled={disabled}
      >
        <View
          style={[
            styles.optionIcon,
            !isUsingPoints && styles.optionIconSelected,
          ]}
        >
          <Ionicons
            name="wallet-outline"
            size={19}
            color={!isUsingPoints ? COLORS.primary : COLORS.Gray}
          />
        </View>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Conserver mes points</Text>

          <Text style={styles.optionDescription}>
            Vous gardez vos points pour une prochaine commande.
          </Text>
        </View>

        <View style={[styles.radio, !isUsingPoints && styles.radioSelected]}>
          {!isUsingPoints && <View style={styles.radioDot} />}
        </View>
      </Pressable>

      {/* ================================================== */}
      {/* UTILISER LES POINTS                               */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.option,
          isUsingPoints && styles.optionSelected,
          usablePoints <= 0 && styles.optionDisabled,
          pressed && !disabled && usablePoints > 0 && styles.pressed,
        ]}
        onPress={handleUsePoints}
        disabled={disabled || usablePoints <= 0}
      >
        <View
          style={[
            styles.optionIcon,
            isUsingPoints && styles.optionIconSelected,
            usablePoints <= 0 && styles.optionIconDisabled,
          ]}
        >
          <Ionicons
            name="gift-outline"
            size={19}
            color={
              isUsingPoints
                ? COLORS.primary
                : usablePoints > 0
                  ? COLORS.secondary
                  : COLORS.Gray
            }
          />
        </View>

        <View style={styles.optionContent}>
          <View style={styles.optionTitleRow}>
            <Text
              style={[
                styles.optionTitle,
                usablePoints <= 0 && styles.optionTitleDisabled,
              ]}
            >
              Utiliser mes points
            </Text>

            {usablePoints > 0 && (
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>
                  {usablePoints} utilisables
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.optionDescription,
              usablePoints <= 0 && styles.optionDescriptionDisabled,
            ]}
          >
            {usablePoints > 0
              ? "Utilisez vos points pour obtenir une réduction."
              : "Aucun point utilisable pour cette commande."}
          </Text>
        </View>

        <View
          style={[
            styles.radio,
            isUsingPoints && styles.radioSelected,
            usablePoints <= 0 && styles.radioDisabled,
          ]}
        >
          {isUsingPoints && <View style={styles.radioDot} />}
        </View>
      </Pressable>

      {/* ================================================== */}
      {/* REDEMPTION                                        */}
      {/* ================================================== */}

      {isUsingPoints && (
        <View style={styles.redemptionPanel}>
          <View style={styles.redemptionHeader}>
            <View>
              <Text style={styles.redemptionTitle}>Utilisation des points</Text>

              <Text style={styles.redemptionSubtitle}>
                {pointsRequired > 0
                  ? `${pointsRequired} points = ${discountAmount.toLocaleString("fr-FR")} de réduction`
                  : "Définissez le nombre de points à utiliser"}
              </Text>
            </View>

            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                - {discount.toLocaleString("fr-FR")}
              </Text>
            </View>
          </View>

          {/* ============================================== */}
          {/* INPUT                                          */}
          {/* ============================================== */}

          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Points à utiliser</Text>

              <Pressable
                onPress={handleUseAllPoints}
                disabled={disabled || usablePoints <= 0}
                hitSlop={6}
              >
                <Text
                  style={[
                    styles.useAllText,
                    (disabled || usablePoints <= 0) &&
                      styles.useAllTextDisabled,
                  ]}
                >
                  Tout utiliser
                </Text>
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="sparkles-outline"
                size={17}
                color={COLORS.primary}
              />

              <TextInput
                value={pointsUsed > 0 ? String(pointsUsed) : ""}
                onChangeText={handlePointsChange}
                placeholder="0"
                placeholderTextColor={COLORS.Gray}
                keyboardType="number-pad"
                editable={!disabled}
                style={styles.input}
              />

              <Text style={styles.inputSuffix}>points</Text>
            </View>
          </View>

          {/* ============================================== */}
          {/* DISCOUNT                                       */}
          {/* ============================================== */}

          <View style={styles.discountRow}>
            <View>
              <Text style={styles.discountLabel}>Réduction obtenue</Text>

              <Text style={styles.discountHint}>
                Après utilisation de vos points
              </Text>
            </View>

            <Text style={styles.discountValue}>
              - {discount.toLocaleString("fr-FR")}
            </Text>
          </View>

          {/* ============================================== */}
          {/* REMAINING POINTS                               */}
          {/* ============================================== */}

          <View style={styles.remainingRow}>
            <Text style={styles.remainingLabel}>Solde après utilisation</Text>

            <Text style={styles.remainingValue}>{remainingPoints} points</Text>
          </View>

          {/* ============================================== */}
          {/* LIMIT                                          */}
          {/* ============================================== */}

          {maxDiscountAmount > discount && (
            <View style={styles.limitInfo}>
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={COLORS.secondary}
              />

              <Text style={styles.limitText}>
                La réduction maximale autorisée est de{" "}
                {maxDiscountAmount.toLocaleString("fr-FR")}.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ================================================== */}
      {/* CONTINUE                                         */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          disabled && styles.continueButtonDisabled,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={onContinue}
        disabled={disabled}
      >
        <Text
          style={[styles.continueText, disabled && styles.continueTextDisabled]}
        >
          Continuer
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color={disabled ? COLORS.Gray : COLORS.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  // ========================================================
  // SECTION HEADER
  // ========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ========================================================
  // OPTIONS
  // ========================================================

  option: {
    minHeight: 78,
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  optionSelected: {
    borderColor: "#CFE0CA",
    backgroundColor: "#FAFCF9",
  },

  optionDisabled: {
    opacity: 0.55,
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F1",
  },

  optionIconSelected: {
    backgroundColor: "#EAF2E7",
  },

  optionIconDisabled: {
    backgroundColor: "#F1F1EF",
  },

  optionContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  optionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  optionTitleDisabled: {
    color: COLORS.Gray,
  },

  optionDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  optionDescriptionDisabled: {
    color: "#A8A8A5",
  },

  pointsBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FFF3DD",
  },

  pointsBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: "#A86D00",
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#CFCFCA",
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDisabled: {
    borderColor: "#D9D9D5",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // ========================================================
  // REDEMPTION
  // ========================================================

  redemptionPanel: {
    marginTop: 2,
    marginBottom: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#F8FAF6",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  redemptionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  redemptionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  redemptionSubtitle: {
    maxWidth: 220,
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "#EAF2E7",
  },

  discountBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  // ========================================================
  // INPUT
  // ========================================================

  inputSection: {
    marginTop: 15,
  },

  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  inputLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  useAllText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  useAllTextDisabled: {
    color: COLORS.Gray,
  },

  inputContainer: {
    minHeight: 45,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E1E6DE",
  },

  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 9,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  inputSuffix: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ========================================================
  // DISCOUNT
  // ========================================================

  discountRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E4EADF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  discountLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  discountHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  discountValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.primary,
  },

  // ========================================================
  // REMAINING
  // ========================================================

  remainingRow: {
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E4EADF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  remainingLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  remainingValue: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.text,
  },

  // ========================================================
  // LIMIT
  // ========================================================

  limitInfo: {
    marginTop: 11,
    padding: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7E8",
  },

  limitText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: "#8A681D",
  },

  // ========================================================
  // CONTINUE
  // ========================================================

  continueButton: {
    minHeight: 52,
    marginTop: 8,
    borderRadius: 15,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
  },

  continueButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  continueText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
  },

  continueTextDisabled: {
    color: COLORS.Gray,
  },

  pressed: {
    opacity: 0.6,
  },
});
