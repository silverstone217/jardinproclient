import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Production } from "@/types/production";

import { COLORS, fonts } from "@/utils/styles";

interface ProductionDetailsProps {
  production: Production;
  onClose?: () => void;
}

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

// ============================================================
// FORMAT DATE + HEURE
// ============================================================

const formatDateTime = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ============================================================
// FORMAT VOLUME
// ============================================================

const formatVolume = (volumeMl: number): string => {
  if (volumeMl >= 1000) {
    const liters = volumeMl / 1000;

    return Number.isInteger(liters) ? `${liters} L` : `${liters.toFixed(1)} L`;
  }

  return `${volumeMl} ml`;
};

// ============================================================
// FORMAT QUANTITÉ
// ============================================================

const formatQuantity = (quantity: number): string => {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }

  return quantity.toLocaleString("fr-FR", {
    maximumFractionDigits: 3,
  });
};

// ============================================================
// FORMAT UNITÉ
// ============================================================

const formatUnit = (unit: string): string => {
  const units: Record<string, string> = {
    PIECE: "pièce(s)",
    GRAM: "g",
    KILOGRAM: "kg",
    MILLILITER: "ml",
    LITER: "L",
  };

  return units[unit] ?? unit.toLowerCase();
};

// ============================================================
// FORMAT EXPIRATION
// ============================================================

const formatExpiration = (
  value: string,
): {
  label: string;
  color: string;
  background: string;
  isExpired: boolean;
} => {
  const expirationDate = new Date(value);

  if (Number.isNaN(expirationDate.getTime())) {
    return {
      label: "Date inconnue",
      color: COLORS.Gray,
      background: "#F3F3F1",
      isExpired: false,
    };
  }

  const now = new Date();

  const isExpired = expirationDate.getTime() <= now.getTime();

  if (isExpired) {
    return {
      label: "Expiré",
      color: COLORS.error,
      background: "#FDECEC",
      isExpired: true,
    };
  }

  return {
    label: `Expire le ${new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(expirationDate)}`,
    color: COLORS.success,
    background: "#EAF6EC",
    isExpired: false,
  };
};

// ============================================================
// COMPONENT
// ============================================================

export function ProductionDetails({
  production,
  onClose,
}: ProductionDetailsProps) {
  const totalProduced = production.items.reduce(
    (total, item) => total + item.quantityProduced,
    0,
  );

  const totalRemaining = production.items.reduce(
    (total, item) => total + item.remainingQuantity,
    0,
  );

  const totalPackagings = production.packagings.reduce(
    (total, item) => total + item.quantityUsed,
    0,
  );

  const productNames = Array.from(
    new Set(production.items.map((item) => item.variant.product.name)),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="flask-outline" size={22} color={COLORS.primary} />
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.eyebrow}>PRODUCTION</Text>

              <Text style={styles.title} numberOfLines={2}>
                {productNames.length > 0
                  ? productNames.join(" · ")
                  : "Production"}
              </Text>

              <Text style={styles.date}>
                {formatDateTime(production.producedAt)}
              </Text>
            </View>

            {onClose ? (
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
                onPress={onClose}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color={COLORS.darkGray} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.completedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={COLORS.success}
            />

            <Text style={styles.completedText}>Production enregistrée</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* SUMMARY                                            */}
        {/* ================================================== */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.volumeIcon]}>
              <Ionicons name="water-outline" size={18} color={COLORS.info} />
            </View>

            <Text style={styles.summaryLabel}>Volume</Text>

            <Text style={styles.summaryValue}>
              {formatVolume(production.totalVolumeMl)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.productionIcon]}>
              <Ionicons
                name="wine-outline"
                size={18}
                color={COLORS.secondary}
              />
            </View>

            <Text style={styles.summaryLabel}>Produits</Text>

            <Text style={styles.summaryValue}>{totalProduced}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.remainingIcon]}>
              <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
            </View>

            <Text style={styles.summaryLabel}>Restants</Text>

            <Text style={styles.summaryValue}>{totalRemaining}</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* INFORMATIONS                                       */}
        {/* ================================================== */}

        <View style={styles.card}>
          <SectionHeader
            icon="information-circle-outline"
            title="Informations"
            subtitle="Détails généraux de la production"
          />

          <InfoRow
            icon="calendar-outline"
            label="Date de production"
            value={formatDate(production.producedAt)}
          />

          <InfoRow
            icon="time-outline"
            label="Heure"
            value={new Intl.DateTimeFormat("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(production.producedAt))}
          />

          <InfoRow
            icon="person-outline"
            label="Responsable"
            value={production.manager.name}
          />

          <InfoRow
            icon="business-outline"
            label="Lieu"
            value="Boutique principale"
            last
          />
        </View>

        {/* ================================================== */}
        {/* PRODUITS FINIS                                     */}
        {/* ================================================== */}

        <View style={styles.card}>
          <SectionHeader
            icon="wine-outline"
            title="Produits finis"
            subtitle={`${production.items.length} format${
              production.items.length > 1 ? "s" : ""
            } produit${production.items.length > 1 ? "s" : ""}`}
          />

          {production.items.map((item, index) => {
            const expiration = formatExpiration(item.expiresAt);

            return (
              <View
                key={item.id}
                style={[
                  styles.productItem,
                  index === production.items.length - 1 &&
                    styles.productItemLast,
                ]}
              >
                <View style={styles.productItemTop}>
                  <View style={styles.productIcon}>
                    <Ionicons
                      name="water-outline"
                      size={17}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.productContent}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.variant.product.name}
                    </Text>

                    <Text style={styles.productFormat}>
                      {item.variant.packaging.name} ·{" "}
                      {item.variant.packaging.capacityMl} ml
                    </Text>

                    <Text style={styles.sku}>SKU : {item.variant.sku}</Text>
                  </View>

                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityValue}>
                      {item.quantityProduced}
                    </Text>

                    <Text style={styles.quantityLabel}>
                      produit
                      {item.quantityProduced > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.productMeta}>
                  <View style={styles.remainingBadge}>
                    <Text style={styles.remainingBadgeText}>
                      {item.remainingQuantity} restant
                      {item.remainingQuantity > 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.expirationBadge,
                      {
                        backgroundColor: expiration.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        expiration.isExpired
                          ? "alert-circle-outline"
                          : "calendar-outline"
                      }
                      size={12}
                      color={expiration.color}
                    />

                    <Text
                      style={[
                        styles.expirationText,
                        {
                          color: expiration.color,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {expiration.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ================================================== */}
        {/* MATIÈRES PREMIÈRES                                */}
        {/* ================================================== */}

        <View style={styles.card}>
          <SectionHeader
            icon="leaf-outline"
            title="Matières premières"
            subtitle="Quantités réellement utilisées"
          />

          {production.ingredients.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.materialRow,
                index === production.ingredients.length - 1 &&
                  styles.materialRowLast,
              ]}
            >
              <View style={styles.materialIcon}>
                <Ionicons
                  name="nutrition-outline"
                  size={15}
                  color={COLORS.success}
                />
              </View>

              <View style={styles.materialContent}>
                <Text style={styles.materialName}>{item.ingredient.name}</Text>

                <Text style={styles.materialUnit}>
                  {formatUnit(item.ingredient.unit)}
                </Text>
              </View>

              <Text style={styles.materialQuantity}>
                {formatQuantity(item.quantityUsed)}{" "}
                {formatUnit(item.ingredient.unit)}
              </Text>
            </View>
          ))}
        </View>

        {/* ================================================== */}
        {/* EMBALLAGES                                         */}
        {/* ================================================== */}

        <View style={styles.card}>
          <SectionHeader
            icon="cube-outline"
            title="Emballages"
            subtitle={`${totalPackagings} emballage${
              totalPackagings > 1 ? "s" : ""
            } utilisé${totalPackagings > 1 ? "s" : ""}`}
          />

          {production.packagings.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.materialRow,
                index === production.packagings.length - 1 &&
                  styles.materialRowLast,
              ]}
            >
              <View style={styles.packagingIcon}>
                <Ionicons
                  name="cube-outline"
                  size={15}
                  color={COLORS.secondary}
                />
              </View>

              <View style={styles.materialContent}>
                <Text style={styles.materialName}>{item.packaging.name}</Text>

                <Text style={styles.materialUnit}>
                  {item.packaging.size} · {item.packaging.capacityMl} ml
                </Text>
              </View>

              <Text style={styles.materialQuantity}>
                {item.quantityUsed} unité
                {item.quantityUsed > 1 ? "s" : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* ================================================== */}
        {/* NOTES                                              */}
        {/* ================================================== */}

        {production.notes ? (
          <View style={styles.card}>
            <SectionHeader
              icon="document-text-outline"
              title="Notes"
              subtitle="Informations complémentaires"
            />

            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{production.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* ================================================== */}
        {/* STOCK                                              */}
        {/* ================================================== */}

        <View style={styles.stockInfo}>
          <View style={styles.stockInfoIcon}>
            <Ionicons name="archive-outline" size={17} color={COLORS.primary} />
          </View>

          <View style={styles.stockInfoContent}>
            <Text style={styles.stockInfoTitle}>
              Stock de la boutique principale
            </Text>

            <Text style={styles.stockInfoText}>
              Les produits issus de cette production ont été enregistrés dans le
              stock de la boutique principale. Ils pourront ensuite être
              distribués vers les points de vente.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={17} color={COLORS.primary} />
      </View>

      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ============================================================
// INFO ROW
// ============================================================

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}

function InfoRow({ icon, label, value, last = false }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Ionicons name={icon} size={16} color={COLORS.Gray} />

      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.3,
    color: COLORS.primary,
  },

  title: {
    marginTop: 3,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
    color: COLORS.text,
  },

  date: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F1",
  },

  completedBadge: {
    alignSelf: "flex-start",
    marginTop: 15,
    paddingHorizontal: 9,
    minHeight: 28,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF6EC",
  },

  completedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.success,
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryCard: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  volumeIcon: {
    backgroundColor: "#EAF3FB",
  },

  productionIcon: {
    backgroundColor: "#FFF1DE",
  },

  remainingIcon: {
    backgroundColor: "#EDF4EB",
  },

  summaryLabel: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  summaryValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.text,
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#EEEEEB",
  },

  // ==========================================================
  // CARDS
  // ==========================================================

  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  sectionContent: {
    flex: 1,
    marginLeft: 9,
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // INFORMATION
  // ==========================================================

  infoRow: {
    minHeight: 45,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
    flexDirection: "row",
    alignItems: "center",
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    marginLeft: 9,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  infoValue: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
    textAlign: "right",
  },

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  productItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  productItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  productItemTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  productIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  productContent: {
    flex: 1,
    marginLeft: 9,
    marginRight: 8,
  },

  productName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  productFormat: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  sku: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  quantityContainer: {
    minWidth: 55,
    alignItems: "flex-end",
  },

  quantityValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.primary,
  },

  quantityLabel: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  productMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  remainingBadge: {
    paddingHorizontal: 8,
    minHeight: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6F1",
  },

  remainingBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.darkGray,
  },

  expirationBadge: {
    flex: 1,
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  expirationText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 8.5,
  },

  // ==========================================================
  // MATERIALS
  // ==========================================================

  materialRow: {
    minHeight: 54,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
    flexDirection: "row",
    alignItems: "center",
  },

  materialRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  materialIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6EC",
  },

  packagingIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1DE",
  },

  materialContent: {
    flex: 1,
    marginLeft: 9,
  },

  materialName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  materialUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  materialQuantity: {
    marginLeft: 8,
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  // ==========================================================
  // NOTES
  // ==========================================================

  notesBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
  },

  notesText: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 17,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // STOCK
  // ==========================================================

  stockInfo: {
    marginTop: 12,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#EDF4EB",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stockInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  stockInfoContent: {
    flex: 1,
    marginLeft: 9,
  },

  stockInfoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  stockInfoText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  bottomSpacer: {
    height: 100,
  },

  pressed: {
    opacity: 0.6,
  },
});
