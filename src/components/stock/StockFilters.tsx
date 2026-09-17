import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface StockFiltersProps {
  filters: StockTypes.Filters;

  onSearchChange: (value: string) => void;
  onCategoryChange: (category: StockTypes.Category | null) => void;
  onLowStockChange: (value: boolean) => void;
}

interface CategoryButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

function CategoryButton({ label, icon, active, onPress }: CategoryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryButton,
        active && styles.categoryButtonActive,
        pressed && styles.categoryButtonPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? COLORS.white : COLORS.darkGray}
      />

      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StockFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onLowStockChange,
}: StockFiltersProps) {
  const hasActiveFilters =
    filters.category !== null ||
    filters.search.trim().length > 0 ||
    filters.lowStock;

  const handleClearFilters = () => {
    if (filters.search.length > 0) {
      onSearchChange("");
    }

    if (filters.category !== null) {
      onCategoryChange(null);
    }

    if (filters.lowStock) {
      onLowStockChange(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="options-outline" size={17} color={COLORS.primary} />
          </View>

          <View>
            <Text style={styles.title}>Filtrer le stock</Text>

            <Text style={styles.subtitle}>Affinez les éléments affichés.</Text>
          </View>
        </View>

        {hasActiveFilters && (
          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            onPress={handleClearFilters}
            hitSlop={6}
          >
            <Ionicons
              name="close-circle-outline"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.clearText}>Réinitialiser</Text>
          </Pressable>
        )}
      </View>

      {/* ================================================== */}
      {/* SEARCH                                             */}
      {/* ================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.Gray} />

        <TextInput
          value={filters.search}
          onChangeText={onSearchChange}
          placeholder="Rechercher dans le stock..."
          placeholderTextColor={COLORS.Gray}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {filters.search.length > 0 && (
          <Pressable
            onPress={() => onSearchChange("")}
            hitSlop={8}
            style={styles.clearSearch}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.Gray} />
          </Pressable>
        )}
      </View>

      {/* ================================================== */}
      {/* CATEGORIES                                         */}
      {/* ================================================== */}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Catégorie</Text>

        <View style={styles.categories}>
          <CategoryButton
            label="Toutes"
            icon="apps-outline"
            active={filters.category === null}
            onPress={() => onCategoryChange(null)}
          />

          <CategoryButton
            label="Matières"
            icon="leaf-outline"
            active={filters.category === "RAW_INGREDIENT"}
            onPress={() => onCategoryChange("RAW_INGREDIENT")}
          />

          <CategoryButton
            label="Emballages"
            icon="cube-outline"
            active={filters.category === "PACKAGING"}
            onPress={() => onCategoryChange("PACKAGING")}
          />

          <CategoryButton
            label="Jus"
            icon="water-outline"
            active={filters.category === "FINISHED_PRODUCT"}
            onPress={() => onCategoryChange("FINISHED_PRODUCT")}
          />
        </View>
      </View>

      {/* ================================================== */}
      {/* LOW STOCK                                          */}
      {/* ================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.lowStockButton,
          filters.lowStock && styles.lowStockButtonActive,
          pressed && styles.lowStockButtonPressed,
        ]}
        onPress={() => onLowStockChange(!filters.lowStock)}
      >
        <View
          style={[
            styles.lowStockIcon,
            filters.lowStock && styles.lowStockIconActive,
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={16}
            color={filters.lowStock ? "#B87500" : COLORS.Gray}
          />
        </View>

        <View style={styles.lowStockContent}>
          <Text
            style={[
              styles.lowStockTitle,
              filters.lowStock && styles.lowStockTitleActive,
            ]}
          >
            Stocks faibles uniquement
          </Text>

          <Text style={styles.lowStockSubtitle}>
            Afficher les matières et emballages sous le seuil d'alerte.
          </Text>
        </View>

        <View style={[styles.switch, filters.lowStock && styles.switchActive]}>
          <View
            style={[
              styles.switchThumb,
              filters.lowStock && styles.switchThumbActive,
            ]}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 22,
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

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  title: {
    marginLeft: 10,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    marginLeft: 10,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // CLEAR
  // ==========================================================

  clearButton: {
    minHeight: 30,
    paddingHorizontal: 7,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  clearButtonPressed: {
    opacity: 0.55,
  },

  clearText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.primary,
  },

  // ==========================================================
  // SEARCH
  // ==========================================================

  searchContainer: {
    height: 46,
    marginTop: 15,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    marginLeft: 9,
    paddingVertical: 0,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.text,
  },

  clearSearch: {
    marginLeft: 6,
  },

  // ==========================================================
  // CATEGORY
  // ==========================================================

  section: {
    marginTop: 15,
  },

  sectionLabel: {
    marginBottom: 8,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  categoryButton: {
    minHeight: 35,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E6E6E3",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryButtonPressed: {
    opacity: 0.65,
  },

  categoryText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.darkGray,
  },

  categoryTextActive: {
    color: COLORS.white,
  },

  // ==========================================================
  // LOW STOCK
  // ==========================================================

  lowStockButton: {
    minHeight: 62,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  lowStockButtonActive: {
    backgroundColor: "#FFF8E8",
    borderColor: "#F1DEAE",
  },

  lowStockButtonPressed: {
    opacity: 0.7,
  },

  lowStockIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  lowStockIconActive: {
    backgroundColor: "#FFF0CB",
  },

  lowStockContent: {
    flex: 1,
    marginLeft: 9,
    paddingRight: 8,
  },

  lowStockTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  lowStockTitleActive: {
    color: "#8A6200",
  },

  lowStockSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 12,
    color: COLORS.Gray,
  },

  // ==========================================================
  // SWITCH
  // ==========================================================

  switch: {
    width: 38,
    height: 22,
    padding: 2,
    borderRadius: 11,
    backgroundColor: "#D9D9D6",
    justifyContent: "center",
  },

  switchActive: {
    backgroundColor: COLORS.secondary,
  },

  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },

  switchThumbActive: {
    alignSelf: "flex-end",
  },
});
