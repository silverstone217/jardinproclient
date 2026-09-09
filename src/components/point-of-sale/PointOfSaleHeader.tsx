import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS, fontSizes, fonts } from "@/utils/styles";

interface PointOfSaleHeaderProps {
  total: number;
  active: number;
  inactive: number;
  mainStore: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

export default function PointOfSaleHeader({
  total,
  active,
  inactive,
  mainStore,
  searchQuery,
  onSearchChange,
  onAdd,
}: PointOfSaleHeaderProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View style={styles.topRow}>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            router.back();
          }}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Points de vente</Text>

          <Text style={styles.subtitle}>
            Gérez votre réseau de distribution
          </Text>
        </View>

        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          hitSlop={6}
        >
          <Ionicons name="add" size={25} color={COLORS.white} />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* STATISTIQUES */}
      {/* ====================================================== */}

      <View style={styles.statsCard}>
        {/* Total */}

        <View style={styles.statItem}>
          <View style={[styles.statIcon, styles.totalIcon]}>
            <Ionicons
              name="storefront-outline"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{total}</Text>

            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        {/* Actifs */}

        <View style={styles.statItem}>
          <View style={[styles.statIcon, styles.activeIcon]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={COLORS.success}
            />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{active}</Text>

            <Text style={styles.statLabel}>Actifs</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        {/* Désactivés */}

        <View style={styles.statItem}>
          <View style={[styles.statIcon, styles.inactiveIcon]}>
            <Ionicons
              name="pause-circle-outline"
              size={18}
              color={COLORS.Gray}
            />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{inactive}</Text>

            <Text style={styles.statLabel}>Désactivés</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        {/* Principal */}

        <View style={styles.statItem}>
          <View style={[styles.statIcon, styles.mainIcon]}>
            <Ionicons name="star-outline" size={18} color={COLORS.secondary} />
          </View>

          <View style={styles.statContent}>
            <Text style={styles.statValue}>{mainStore}</Text>

            <Text style={styles.statLabel}>Principal</Text>
          </View>
        </View>
      </View>

      {/* ====================================================== */}
      {/* RECHERCHE */}
      {/* ====================================================== */}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORS.Gray}
          style={styles.searchIcon}
        />

        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Rechercher un point de vente..."
          placeholderTextColor="#A7A7A2"
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={handleClearSearch}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={19} color="#A7A7A2" />
          </Pressable>
        )}
      </View>

      {/* Petit indicateur contextuel */}

      {searchQuery.trim().length > 0 && (
        <View style={styles.searchInfo}>
          <Ionicons name="filter-outline" size={14} color={COLORS.primary} />

          <Text style={styles.searchInfoText}>
            Recherche dans le nom, le code et l'adresse
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 12,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECE8",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xlarge,
    color: COLORS.text,
    lineHeight: 25,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  // ==========================================================
  // STATISTIQUES
  // ==========================================================

  statsCard: {
    marginTop: 18,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#ECECE8",

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  totalIcon: {
    backgroundColor: "#E8F2E5",
  },

  activeIcon: {
    backgroundColor: "#EAF6EC",
  },

  inactiveIcon: {
    backgroundColor: "#F1F1EF",
  },

  mainIcon: {
    backgroundColor: "#FFF3DF",
  },

  statContent: {
    alignItems: "center",
    marginTop: 6,
  },

  statValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  statLabel: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#EEEEEA",
  },

  // ==========================================================
  // RECHERCHE
  // ==========================================================

  searchContainer: {
    height: 50,
    marginTop: 14,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E5E0",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },

  searchIcon: {
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,

    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.text,
  },

  clearButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  clearButtonPressed: {
    opacity: 0.6,
  },

  // ==========================================================
  // INFO RECHERCHE
  // ==========================================================

  searchInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    paddingHorizontal: 3,
  },

  searchInfoText: {
    marginLeft: 5,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },
});
