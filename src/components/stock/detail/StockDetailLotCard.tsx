import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailLotCardProps {
  lot: StockTypes.Lot;
}

export function StockDetailLotCard({ lot }: StockDetailLotCardProps) {
  const isEmpty = lot.remainingQuantity <= 0;

  const getStatus = () => {
    if (lot.isExpired) {
      return {
        label: "Expiré",
        color: COLORS.error,
        backgroundColor: "#FDECEC",
        icon: "alert-circle-outline" as const,
      };
    }

    if (isEmpty) {
      return {
        label: "Épuisé",
        color: COLORS.Gray,
        backgroundColor: "#F0F0ED",
        icon: "checkmark-circle-outline" as const,
      };
    }

    return {
      label: "Disponible",
      color: COLORS.success,
      backgroundColor: "#EAF6EC",
      icon: "checkmark-circle-outline" as const,
    };
  };

  const status = getStatus();

  const formatDate = (date: string | null) => {
    if (!date) {
      return "Non définie";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date invalide";
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRemainingPercentage = () => {
    if (lot.quantity <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, (lot.remainingQuantity / lot.quantity) * 100),
    );
  };

  const remainingPercentage = getRemainingPercentage();

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.lotIdentity}>
          <View style={styles.lotIcon}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={17}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.lotInfo}>
            <Text style={styles.lotLabel}>Lot</Text>

            <Text style={styles.lotDate} numberOfLines={1}>
              Créé le {formatDate(lot.createdAt)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: status.backgroundColor,
            },
          ]}
        >
          <Ionicons name={status.icon} size={13} color={status.color} />

          <Text
            style={[
              styles.statusText,
              {
                color: status.color,
              },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* QUANTITIES                                         */}
      {/* ================================================== */}

      <View style={styles.quantitySection}>
        <View style={styles.quantityBlock}>
          <Text style={styles.quantityLabel}>Quantité initiale</Text>

          <Text style={styles.quantityValue}>{lot.quantity}</Text>

          <Text style={styles.quantityUnit}>unités</Text>
        </View>

        <View style={styles.quantityDivider} />

        <View style={styles.quantityBlock}>
          <Text style={styles.quantityLabel}>Quantité restante</Text>

          <Text
            style={[
              styles.quantityValue,
              lot.remainingQuantity <= 0 && styles.emptyQuantity,
            ]}
          >
            {lot.remainingQuantity}
          </Text>

          <Text style={styles.quantityUnit}>unités</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* PROGRESS                                           */}
      {/* ================================================== */}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Stock restant</Text>

          <Text style={styles.progressPercentage}>
            {Math.round(remainingPercentage)}%
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${remainingPercentage}%`,
                backgroundColor: lot.isExpired
                  ? COLORS.error
                  : lot.remainingQuantity <= 0
                    ? COLORS.Gray
                    : COLORS.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* ================================================== */}
      {/* EXPIRATION                                         */}
      {/* ================================================== */}

      <View
        style={[
          styles.expirationRow,
          lot.isExpired && styles.expirationRowExpired,
        ]}
      >
        <View
          style={[
            styles.expirationIcon,
            lot.isExpired && styles.expirationIconExpired,
          ]}
        >
          <MaterialCommunityIcons
            name="calendar-clock-outline"
            size={16}
            color={lot.isExpired ? COLORS.error : COLORS.warning}
          />
        </View>

        <View style={styles.expirationContent}>
          <Text style={styles.expirationLabel}>Date d'expiration</Text>

          <Text
            style={[
              styles.expirationDate,
              lot.isExpired && styles.expirationDateExpired,
            ]}
          >
            {formatDate(lot.expiresAt)}
          </Text>
        </View>

        {lot.isExpired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredBadgeText}>À retirer</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  },

  lotIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  lotIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  lotInfo: {
    flex: 1,
    marginLeft: 9,
  },

  lotLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  lotDate: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
  },

  // ==========================================================
  // QUANTITIES
  // ==========================================================

  quantitySection: {
    marginTop: 15,
    paddingVertical: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FAFAF8",
  },

  quantityBlock: {
    flex: 1,
  },

  quantityLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  quantityValue: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  emptyQuantity: {
    color: COLORS.Gray,
  },

  quantityUnit: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  quantityDivider: {
    width: 1,
    height: 42,
    marginHorizontal: 12,
    backgroundColor: "#E8E8E5",
  },

  // ==========================================================
  // PROGRESS
  // ==========================================================

  progressSection: {
    marginTop: 14,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },

  progressPercentage: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  progressTrack: {
    height: 5,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "#EAEAE7",
  },

  progressBar: {
    height: "100%",
    borderRadius: 3,
  },

  // ==========================================================
  // EXPIRATION
  // ==========================================================

  expirationRow: {
    marginTop: 14,
    padding: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E9",
  },

  expirationRowExpired: {
    backgroundColor: "#FDECEC",
  },

  expirationIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C7",
  },

  expirationIconExpired: {
    backgroundColor: "#F8D8D8",
  },

  expirationContent: {
    flex: 1,
    marginLeft: 9,
  },

  expirationLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  expirationDate: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  expirationDateExpired: {
    color: COLORS.error,
  },

  expiredBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F8D8D8",
  },

  expiredBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.error,
  },
});
