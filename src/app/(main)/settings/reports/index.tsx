// src/app/settings/(main)/reports/index.tsx

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ExportReportButton } from "@/components/report/ExportReportButton";
import { PointOfSaleSelector } from "@/components/report/PointOfSaleSelector";
import { ProductionReport } from "@/components/report/ProductionReport";
import { ReportHeader } from "@/components/report/ReportHeader";
import { SalesReport } from "@/components/report/SalesReport";
import { StockReport } from "@/components/report/StockReport";
import { useReport } from "@/hooks/useReport";
import type { ReportType } from "@/types/report";
import { COLORS, fonts, fontSizes } from "@/utils/styles";
import { SafeAreaView } from "react-native-safe-area-context";

const REPORT_TYPES: {
  type: ReportType;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  {
    type: "SALES",
    label: "Ventes",
    description: "Ventes et chiffre d'affaires",
    icon: "cash-register",
  },
  {
    type: "PRODUCTION",
    label: "Production",
    description: "Productions réalisées",
    icon: "factory",
  },
  {
    type: "RAW_MATERIAL_STOCK",
    label: "Matières premières",
    description: "Stocks et mouvements",
    icon: "food-apple-outline",
  },
  {
    type: "FINISHED_STOCK",
    label: "Produits finis",
    description: "Stock disponible",
    icon: "bottle-soda-outline",
  },
];

function getToday(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function shouldShowPointOfSaleSelector(type: ReportType): boolean {
  return type === "SALES" || type === "FINISHED_STOCK";
}

export default function ReportsScreen() {
  const {
    report,
    filters,
    isLoading,
    error,
    generateReport,
    setFilters,
    clearError,
    clearReport,
  } = useReport();

  const scrollViewRef = useRef<ScrollView>(null);
  const resultSectionY = useRef(0);

  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(filters.dateTo ?? "");

  useEffect(() => {
    setDateFrom(filters.dateFrom ?? "");
    setDateTo(filters.dateTo ?? "");
  }, [filters.dateFrom, filters.dateTo]);

  async function handleGenerateReport() {
    clearError();
    clearReport();

    const nextFilters = {
      ...filters,
      dateFrom: dateFrom.trim() || undefined,
      dateTo: dateTo.trim() || undefined,
    };

    setFilters(nextFilters);

    try {
      await generateReport(nextFilters);

      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(resultSectionY.current - 20, 0),
          animated: true,
        });
      });
    } catch {
      // L'erreur est déjà gérée par le store.
    }
  }

  function handleTypeChange(type: ReportType) {
    setFilters({
      type,
      pointOfSaleId: undefined,
      pointOfSaleName: undefined,
      allPointOfSales: true,
    });
  }

  function handlePointOfSaleChange(
    pointOfSaleId: string | undefined,
    pointOfSaleName?: string,
  ) {
    clearError();
    clearReport();

    setFilters({
      pointOfSaleId,
      pointOfSaleName,
      allPointOfSales: pointOfSaleId === undefined,
    });
  }

  function renderReport() {
    if (!report) {
      return (
        <View style={styles.emptyReport}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="chart-box-outline"
              size={30}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>Aucun rapport généré</Text>

          <Text style={styles.emptyText}>
            Sélectionnez un type de rapport et une période, puis appuyez sur «
            Générer le rapport ».
          </Text>
        </View>
      );
    }

    switch (report.type) {
      case "SALES":
        return <SalesReport report={report} />;

      case "PRODUCTION":
        return <ProductionReport report={report} />;

      case "RAW_MATERIAL_STOCK":
      case "FINISHED_STOCK":
        return <StockReport report={report} />;

      default:
        return null;
    }
  }

  const showPointOfSaleSelector = shouldShowPointOfSaleSelector(filters.type);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: 60,
      }}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        <ReportHeader
          title="Rapports"
          subtitle="Analysez les ventes, la production et les stocks de votre boutique."
          icon="bar-chart-outline"
        />

        <View style={styles.filtersCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionTitle}>Type de rapport</Text>

              <Text style={styles.sectionSubtitle}>
                Choisissez les données à analyser.
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={18}
                color={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.typeList}>
            {REPORT_TYPES.map((item) => {
              const isSelected = filters.type === item.type;

              return (
                <Pressable
                  key={item.type}
                  onPress={() => handleTypeChange(item.type)}
                  style={[
                    styles.typeItem,
                    isSelected && styles.typeItemSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      isSelected && styles.typeIconSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={19}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                  </View>

                  <View style={styles.typeContent}>
                    <Text
                      style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <Text style={styles.typeDescription}>
                      {item.description}
                    </Text>
                  </View>

                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {showPointOfSaleSelector ? (
            <>
              <View style={styles.divider} />

              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.sectionTitle}>Point de vente</Text>

                  <Text style={styles.sectionSubtitle}>
                    Analysez tous les POS ou un POS précis.
                  </Text>
                </View>

                <View style={styles.sectionIcon}>
                  <MaterialCommunityIcons
                    name="store-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View style={styles.posSelectorContainer}>
                <PointOfSaleSelector
                  value={filters.pointOfSaleId}
                  onChange={handlePointOfSaleChange}
                  disabled={isLoading}
                />
              </View>
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.dateHeader}>
            <View style={styles.sectionHeaderContent}>
              <Text style={styles.sectionTitle}>Période</Text>

              <Text style={styles.sectionSubtitle}>
                Laissez vide pour utiliser la période par défaut.
              </Text>
            </View>

            <MaterialCommunityIcons
              name="calendar-range-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>Du</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={17}
                  color={COLORS.Gray}
                />

                <TextInput
                  value={dateFrom}
                  onChangeText={setDateFrom}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.Gray}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.dateSeparator}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={16}
                color={COLORS.Gray}
              />
            </View>

            <View style={styles.dateField}>
              <Text style={styles.inputLabel}>Au</Text>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={17}
                  color={COLORS.Gray}
                />

                <TextInput
                  value={dateTo}
                  onChangeText={setDateTo}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={COLORS.Gray}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          <View style={styles.quickDates}>
            <Pressable
              onPress={() => {
                const today = getToday();

                setDateFrom(today);
                setDateTo(today);
              }}
              style={styles.quickDateButton}
            >
              <Text style={styles.quickDateText}>Aujourd'hui</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setDateFrom("");
                setDateTo("");
              }}
              style={styles.quickDateButton}
            >
              <Text style={styles.quickDateText}>Réinitialiser</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color={COLORS.error}
              />

              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleGenerateReport}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.generateButton,
              pressed && !isLoading && styles.generateButtonPressed,
              isLoading && styles.generateButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <MaterialCommunityIcons
                name="file-chart-outline"
                size={20}
                color={COLORS.white}
              />
            )}

            <Text style={styles.generateButtonText}>
              {isLoading ? "Génération..." : "Générer le rapport"}
            </Text>
          </Pressable>
        </View>

        {report ? (
          <View
            style={styles.reportContainer}
            onLayout={(event) => {
              resultSectionY.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTitle}>Résultats</Text>

                <Text style={styles.resultSubtitle}>
                  {REPORT_TYPES.find((item) => item.type === report.type)
                    ?.label ?? "Rapport"}
                </Text>
              </View>

              <View style={styles.resultBadge}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={15}
                  color={COLORS.success}
                />

                <Text style={styles.resultBadgeText}>Généré</Text>
              </View>
            </View>

            {renderReport()}

            <ExportReportButton report={report} filters={filters} />
          </View>
        ) : (
          <View style={styles.reportContainer}>{renderReport()}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  filtersCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginLeft: 12,
  },

  typeList: {
    marginTop: 13,
    gap: 8,
  },

  typeItem: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },

  typeItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#F7FAF6",
  },

  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginRight: 10,
  },

  typeIconSelected: {
    backgroundColor: COLORS.primary,
  },

  typeContent: {
    flex: 1,
    minWidth: 0,
  },

  typeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  typeLabelSelected: {
    color: COLORS.primary,
  },

  typeDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 17,
  },

  posSelectorContainer: {
    marginTop: 13,
  },

  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 13,
  },

  dateField: {
    flex: 1,
  },

  dateSeparator: {
    width: 30,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    marginBottom: 5,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  inputContainer: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.background,
  },

  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
    padding: 0,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: COLORS.text,
  },

  quickDates: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },

  quickDateButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: COLORS.neutral,
  },

  quickDateText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.primary,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#FDECEC",
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.error,
  },

  generateButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },

  generateButtonPressed: {
    opacity: 0.85,
  },

  generateButtonDisabled: {
    opacity: 0.65,
  },

  generateButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.white,
  },

  reportContainer: {
    gap: 14,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  resultTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
  },

  resultSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#EAF6EC",
  },

  resultBadgeText: {
    marginLeft: 4,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.success,
  },

  emptyReport: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral,
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
