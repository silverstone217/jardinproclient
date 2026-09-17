import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailEntryCardProps {
  entry: StockTypes.Entry;
}

export function StockDetailEntryCard({ entry }: StockDetailEntryCardProps) {
  const getOriginInfo = () => {
    switch (entry.origin) {
      case "PRODUCTION":
        return {
          label: "Production",
          description: "Entrée issue d'une production",
          icon: "factory",
          color: COLORS.primary,
          backgroundColor: "#EAF2E7",
        };

      case "ACHAT":
        return {
          label: "Achat",
          description: "Entrée provenant d'un achat",
          icon: "cart-outline",
          color: COLORS.secondary,
          backgroundColor: "#FFF3E3",
        };

      case "RECUPERATION":
        return {
          label: "Récupération",
          description: "Stock récupéré",
          icon: "backup-restore",
          color: COLORS.info,
          backgroundColor: "#EAF3FC",
        };

      case "AJUSTEMENT":
        return {
          label: "Ajustement",
          description: "Ajustement manuel du stock",
          icon: "tune-variant",
          color: COLORS.warning,
          backgroundColor: "#FFF8E2",
        };

      default:
        return {
          label: "Entrée",
          description: "Mouvement de stock",
          icon: "package-variant-plus",
          color: COLORS.primary,
          backgroundColor: "#EAF2E7",
        };
    }
  };

  const formatDate = (date: string) => {
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

  const formatTime = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const origin = getOriginInfo();

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View
          style={[
            styles.originIcon,
            {
              backgroundColor: origin.backgroundColor,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={origin.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={origin.color}
          />
        </View>

        <View style={styles.originContent}>
          <Text style={styles.originLabel}>{origin.label}</Text>

          <Text style={styles.originDescription} numberOfLines={1}>
            {origin.description}
          </Text>
        </View>

        <View style={styles.quantityBadge}>
          <Text style={styles.quantityPrefix}>+</Text>

          <Text style={styles.quantityValue}>{entry.quantity}</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* DETAILS                                            */}
      {/* ================================================== */}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.Gray} />
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date</Text>

            <Text style={styles.detailValue}>
              {formatDate(entry.createdAt)}
              {" · "}
              {formatTime(entry.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="person-outline" size={14} color={COLORS.Gray} />
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Enregistré par</Text>

            <Text style={styles.detailValue} numberOfLines={1}>
              {entry.createdBy.name}
            </Text>
          </View>
        </View>
      </View>

      {/* ================================================== */}
      {/* NOTE                                               */}
      {/* ================================================== */}

      {entry.note && (
        <View style={styles.noteContainer}>
          <View style={styles.noteIcon}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={COLORS.darkGray}
            />
          </View>

          <View style={styles.noteContent}>
            <Text style={styles.noteLabel}>Note</Text>

            <Text style={styles.noteText}>{entry.note}</Text>
          </View>
        </View>
      )}
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
  },

  originIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  originContent: {
    flex: 1,
    marginLeft: 10,
  },

  originLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  originDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  quantityBadge: {
    minWidth: 48,
    minHeight: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  quantityPrefix: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  quantityValue: {
    marginLeft: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  details: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
  },

  detailRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F3",
  },

  detailContent: {
    flex: 1,
    marginLeft: 9,
  },

  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  detailValue: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // NOTE
  // ==========================================================

  noteContainer: {
    marginTop: 11,
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FAFAF8",
  },

  noteIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  noteContent: {
    flex: 1,
    marginLeft: 9,
  },

  noteLabel: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.Gray,
  },

  noteText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.darkGray,
  },
});
