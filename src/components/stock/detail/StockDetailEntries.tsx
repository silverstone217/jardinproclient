import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { StockDetailEntryCard } from "@/components/stock/detail/StockDetailEntryCard";

import { COLORS, fonts } from "@/utils/styles";

interface StockDetailEntriesProps {
  entries: StockTypes.Entry[];
}

export function StockDetailEntries({ entries }: StockDetailEntriesProps) {
  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="timeline-plus-outline"
            size={18}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Entrées de stock</Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>{entries.length}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Origine et historique des entrées de cette référence
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* EMPTY STATE                                        */}
      {/* ================================================== */}

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="timeline-remove-outline"
              size={25}
              color={COLORS.Gray}
            />
          </View>

          <Text style={styles.emptyTitle}>Aucune entrée</Text>

          <Text style={styles.emptyDescription}>
            Aucune entrée de stock n'est enregistrée pour cette référence.
          </Text>
        </View>
      ) : (
        /* ================================================== */
        /* ENTRIES                                             */
        /* ================================================== */

        <View style={styles.entries}>
          {entries.map((entry) => (
            <StockDetailEntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 18,
    marginBottom: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    marginLeft: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  countText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ENTRIES
  // ==========================================================

  entries: {
    paddingTop: 15,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    minHeight: 155,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyTitle: {
    marginTop: 11,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 5,
    maxWidth: 280,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },
});
