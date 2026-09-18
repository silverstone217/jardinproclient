import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { LossCategory, LossItem, LossReason } from "@/types/loss";

import { COLORS, fonts } from "@/utils/styles";

interface LossHistoryCardProps {
  item: LossItem;
}

const CATEGORY_CONFIG: Record<
  LossCategory,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    backgroundColor: string;
  }
> = {
  RAW_INGREDIENT: {
    label: "Matière première",
    icon: "leaf-outline",
    color: COLORS.primary,
    backgroundColor: "#E8F2E5",
  },

  PACKAGING: {
    label: "Emballage",
    icon: "cube-outline",
    color: COLORS.secondary,
    backgroundColor: "#FFF3DF",
  },

  FINISHED_PRODUCT: {
    label: "Produit fini",
    icon: "flask-outline",
    color: "#7952A8",
    backgroundColor: "#F3EAF8",
  },
};

const REASON_CONFIG: Record<
  LossReason,
  {
    label: string;
    color: string;
    backgroundColor: string;
  }
> = {
  EXPIRED: {
    label: "Expiré",
    color: COLORS.error,
    backgroundColor: "#FDECEC",
  },

  DAMAGED: {
    label: "Endommagé",
    color: COLORS.secondary,
    backgroundColor: "#FFF3DF",
  },

  STOLEN: {
    label: "Volé",
    color: "#7952A8",
    backgroundColor: "#F3EAF8",
  },

  QUAL_REJECT: {
    label: "Rejet qualité",
    color: COLORS.info,
    backgroundColor: "#E8F1FB",
  },

  OTHER: {
    label: "Autre",
    color: COLORS.Gray,
    backgroundColor: "#F1F1EE",
  },
};

export function LossHistoryCard({ item }: LossHistoryCardProps) {
  const category = CATEGORY_CONFIG[item.category];

  const reason = REASON_CONFIG[item.reason];

  const quantity = Number(item.quantity);

  const formattedDate = new Date(item.reportedAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = new Date(item.reportedAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemName = getItemName(item);

  const itemDescription = getItemDescription(item);

  const locationName = item.pointOfSale?.name ?? "Boutique principale";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: category.backgroundColor,
            },
          ]}
        >
          <Ionicons name={category.icon} size={18} color={category.color} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.nameRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {itemName}
            </Text>

            <View
              style={[
                styles.reasonBadge,
                {
                  backgroundColor: reason.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.reasonText,
                  {
                    color: reason.color,
                  },
                ]}
              >
                {reason.label}
              </Text>
            </View>
          </View>

          <Text style={styles.itemDescription} numberOfLines={1}>
            {itemDescription}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="remove-circle-outline"
              size={14}
              color={COLORS.error}
            />
          </View>

          <View>
            <Text style={styles.detailLabel}>Quantité</Text>

            <Text style={styles.quantity}>{formatQuantity(quantity)}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={[styles.detailIcon, styles.locationIcon]}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Emplacement</Text>

            <Text style={styles.detailValue} numberOfLines={1}>
              {locationName}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={[styles.detailIcon, styles.dateIcon]}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.info} />
          </View>

          <View>
            <Text style={styles.detailLabel}>Date</Text>

            <Text style={styles.detailValue}>{formattedDate}</Text>

            <Text style={styles.time}>{formattedTime}</Text>
          </View>
        </View>
      </View>

      {item.note && (
        <View style={styles.noteContainer}>
          <Ionicons name="chatbox-outline" size={14} color={COLORS.Gray} />

          <Text style={styles.note} numberOfLines={2}>
            {item.note}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.categoryLabel}>
          <Text
            style={[
              styles.categoryText,
              {
                color: category.color,
              },
            ]}
          >
            {category.label}
          </Text>
        </View>

        <View style={styles.reportedBy}>
          <Ionicons name="person-outline" size={12} color={COLORS.Gray} />

          <Text style={styles.reportedByText} numberOfLines={1}>
            {item.reportedBy.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getItemName(item: LossItem): string {
  if (item.ingredient) {
    return item.ingredient.name;
  }

  if (item.packaging) {
    return item.packaging.name;
  }

  if (item.variant) {
    return item.variant.product.name;
  }

  return "Article inconnu";
}

function getItemDescription(item: LossItem): string {
  if (item.ingredient) {
    return item.ingredient.unit;
  }

  if (item.packaging) {
    return `${item.packaging.size} · ${item.packaging.capacityMl} ml`;
  }

  if (item.variant) {
    return `${item.variant.packaging.name} · ${item.variant.packaging.size} · ${item.variant.sku}`;
  }

  return "";
}

function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return `${quantity}`;
  }

  return quantity.toFixed(3).replace(/\.?0+$/, "");
}

const styles = StyleSheet.create({
  container: {
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECECE8",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  mainContent: {
    flex: 1,
    marginLeft: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemName: {
    flex: 1,
    paddingRight: 7,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  itemDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  reasonBadge: {
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  reasonText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
  },

  details: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEA",
  },

  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 7,
  },

  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  locationIcon: {
    backgroundColor: "#E8F2E5",
  },

  dateIcon: {
    backgroundColor: "#E8F1FB",
  },

  detailTextContainer: {
    flex: 1,
    marginLeft: 6,
  },

  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: COLORS.Gray,
  },

  quantity: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: COLORS.error,
  },

  detailValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.text,
  },

  time: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 7.5,
    color: COLORS.Gray,
  },

  noteContainer: {
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F1EE",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },

  note: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.darkGray,
  },

  footer: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryLabel: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: COLORS.white,
  },

  categoryText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
  },

  reportedBy: {
    maxWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  reportedByText: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },
});
