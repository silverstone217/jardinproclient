import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

type StockItem =
  | StockTypes.RawIngredient
  | StockTypes.Packaging
  | StockTypes.FinishedProduct;

interface StockProductCardProps {
  item: StockItem;
  onPress?: () => void;
}

function formatNumber(value: number, maximumFractionDigits = 2): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("fr-FR", {
    maximumFractionDigits,
  });
}

function formatPrice(value: number): string {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("fr-FR", {
    maximumFractionDigits: 0,
  });
}

function getRawIngredientUnitLabel(
  unit: StockTypes.RawIngredient["unit"],
): string {
  switch (unit) {
    case "PIECE":
      return "pièce";

    case "GRAM":
      return "g";

    case "KILOGRAM":
      return "kg";

    case "MILLILITER":
      return "ml";

    case "LITER":
      return "L";

    default:
      return "";
  }
}

function getPackagingSizeLabel(
  size: StockTypes.Packaging["size"],
  capacityMl: number,
): string {
  const capacity = Number(capacityMl);

  if (Number.isFinite(capacity) && capacity > 0) {
    return `${formatNumber(capacity, 0)} ml`;
  }

  switch (size) {
    case "ML_200":
      return "200 ml";

    case "ML_500":
      return "500 ml";

    default:
      return "Format inconnu";
  }
}

function getFinishedPackagingLabel(item: StockTypes.FinishedProduct): string {
  const capacity = Number(item.capacityMl);

  if (Number.isFinite(capacity) && capacity > 0) {
    return `${formatNumber(capacity, 0)} ml`;
  }

  switch (item.packagingSize) {
    case "ML_200":
      return "200 ml";

    case "ML_500":
      return "500 ml";

    default:
      return "Format inconnu";
  }
}

function isRawIngredient(item: StockItem): item is StockTypes.RawIngredient {
  return "stockQty" in item && "minAlert" in item && "unit" in item;
}

function isPackaging(item: StockItem): item is StockTypes.Packaging {
  return (
    "stockQty" in item &&
    "capacityMl" in item &&
    "size" in item &&
    "minAlert" in item
  );
}

function isFinishedProduct(
  item: StockItem,
): item is StockTypes.FinishedProduct {
  return (
    "variantId" in item &&
    "productName" in item &&
    "packagingName" in item &&
    "quantity" in item
  );
}

export function StockProductCard({ item, onPress }: StockProductCardProps) {
  // ============================================================
  // MATIÈRE PREMIÈRE
  // ============================================================

  if (isRawIngredient(item)) {
    const quantity = Number(item.stockQty);
    const minAlert = Number(item.minAlert);
    const isLowStock = item.isLowStock === true;
    const unitLabel = getRawIngredientUnitLabel(item.unit);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.iconContainer, styles.rawIcon]}>
          <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactif</Text>
              </View>
            )}
          </View>

          <Text style={styles.categoryLabel}>Matière première</Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.quantityLabel}>Disponible</Text>

              <View style={styles.quantityRow}>
                <Text
                  style={[styles.quantity, isLowStock && styles.quantityLow]}
                >
                  {formatNumber(quantity)}
                </Text>

                {unitLabel ? (
                  <Text style={styles.unit}>{unitLabel}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.statusArea}>
              {isLowStock ? (
                <View style={styles.lowStockBadge}>
                  <Ionicons name="warning-outline" size={13} color="#B87500" />

                  <Text style={styles.lowStockText}>Stock faible</Text>
                </View>
              ) : (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />

                  <Text style={styles.availableText}>Disponible</Text>
                </View>
              )}
            </View>
          </View>

          {isLowStock && Number.isFinite(minAlert) && (
            <Text style={styles.thresholdText}>
              Seuil d'alerte : {formatNumber(minAlert)} {unitLabel}
            </Text>
          )}
        </View>

        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={17}
            color={COLORS.Gray}
            style={styles.chevron}
          />
        )}
      </Pressable>
    );
  }

  // ============================================================
  // EMBALLAGE
  // ============================================================

  if (isPackaging(item)) {
    const quantity = Number(item.stockQty);
    const minAlert = Number(item.minAlert);
    const isLowStock = item.isLowStock === true;
    const sizeLabel = getPackagingSizeLabel(item.size, item.capacityMl);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.iconContainer, styles.packagingIcon]}>
          <Ionicons name="cube-outline" size={20} color="#D88A00" />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactif</Text>
              </View>
            )}
          </View>

          <Text style={styles.categoryLabel}>Emballage · {sizeLabel}</Text>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.quantityLabel}>Disponible</Text>

              <View style={styles.quantityRow}>
                <Text
                  style={[styles.quantity, isLowStock && styles.quantityLow]}
                >
                  {formatNumber(quantity, 0)}
                </Text>

                <Text style={styles.unit}>pièces</Text>
              </View>
            </View>

            <View style={styles.statusArea}>
              {isLowStock ? (
                <View style={styles.lowStockBadge}>
                  <Ionicons name="warning-outline" size={13} color="#B87500" />

                  <Text style={styles.lowStockText}>Stock faible</Text>
                </View>
              ) : (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />

                  <Text style={styles.availableText}>Disponible</Text>
                </View>
              )}
            </View>
          </View>

          {isLowStock && Number.isFinite(minAlert) && (
            <Text style={styles.thresholdText}>
              Seuil d'alerte : {formatNumber(minAlert, 0)} pièces
            </Text>
          )}
        </View>

        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={17}
            color={COLORS.Gray}
            style={styles.chevron}
          />
        )}
      </Pressable>
    );
  }

  // ============================================================
  // PRODUIT FINI
  // ============================================================

  if (isFinishedProduct(item)) {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const capacityLabel = getFinishedPackagingLabel(item);

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={[styles.iconContainer, styles.finishedIcon]}>
          <Ionicons name="water-outline" size={20} color="#3478C5" />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.productName}
            </Text>

            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactif</Text>
              </View>
            )}
          </View>

          <View style={styles.productMeta}>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {item.packagingName}
            </Text>

            <View style={styles.metaSeparator} />

            <Text style={styles.categoryLabel}>{capacityLabel}</Text>
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.quantityLabel}>Disponible</Text>

              <View style={styles.quantityRow}>
                <Text style={styles.quantity}>{formatNumber(quantity, 0)}</Text>

                <Text style={styles.unit}>unités</Text>
              </View>
            </View>

            <View style={styles.priceArea}>
              <Text style={styles.priceLabel}>Prix</Text>

              <Text style={styles.price}>
                {formatPrice(price)} <Text style={styles.currency}>CDF</Text>
              </Text>
            </View>
          </View>

          <View style={styles.productFooter}>
            <View style={styles.skuContainer}>
              <Text style={styles.skuLabel}>SKU</Text>

              <Text style={styles.sku} numberOfLines={1}>
                {item.sku}
              </Text>
            </View>

            <Text style={styles.expiryText}>
              Conservation : {formatNumber(item.shelfLifeDays, 0)} jour
              {item.shelfLifeDays !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={17}
            color={COLORS.Gray}
            style={styles.chevron}
          />
        )}
      </Pressable>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    position: "relative",
    marginBottom: 9,
    padding: 13,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cardPressed: {
    opacity: 0.65,
  },

  // ==========================================================
  // ICON
  // ==========================================================

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  rawIcon: {
    backgroundColor: "#E8F2E5",
  },

  packagingIcon: {
    backgroundColor: "#FFF4D9",
  },

  finishedIcon: {
    backgroundColor: "#E8F1FB",
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  content: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    paddingRight: 4,
  },

  titleRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  categoryLabel: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // QUANTITY
  // ==========================================================

  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  quantityLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  quantityRow: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "baseline",
  },

  quantity: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.text,
  },

  quantityLow: {
    color: "#C57A00",
  },

  unit: {
    marginLeft: 4,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusArea: {
    alignItems: "flex-end",
  },

  lowStockBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#FFF5DC",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  lowStockText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: "#B87500",
  },

  availableBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#EDF6EA",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },

  availableText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // THRESHOLD
  // ==========================================================

  thresholdText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: "#B87500",
  },

  // ==========================================================
  // PRODUCT
  // ==========================================================

  productMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaSeparator: {
    width: 3,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: COLORS.Gray,
  },

  priceArea: {
    alignItems: "flex-end",
  },

  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  price: {
    marginTop: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  currency: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: COLORS.primary,
  },

  productFooter: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  skuContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  skuLabel: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: COLORS.Gray,
  },

  sku: {
    flex: 1,
    marginLeft: 5,
    fontFamily: fonts.medium,
    fontSize: 8,
    color: COLORS.darkGray,
  },

  expiryText: {
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  // ==========================================================
  // INACTIVE
  // ==========================================================

  inactiveBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    minHeight: 18,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  inactiveText: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // CHEVRON
  // ==========================================================

  chevron: {
    marginTop: 14,
    marginLeft: 3,
  },
});
