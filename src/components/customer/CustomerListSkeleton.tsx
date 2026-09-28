import { StyleSheet, View } from "react-native";

import { COLORS } from "@/utils/styles";

interface CustomerListSkeletonProps {
  count?: number;
}

function SkeletonBlock({ style }: { style?: object }) {
  return <View style={[styles.skeleton, style]} />;
}

function CustomerCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <SkeletonBlock style={styles.avatar} />

        <View style={styles.identity}>
          <SkeletonBlock style={styles.name} />

          <SkeletonBlock style={styles.phone} />
        </View>

        <SkeletonBlock style={styles.chevron} />
      </View>

      {/* ================================================== */}
      {/* SEPARATOR                                          */}
      {/* ================================================== */}

      <View style={styles.separator} />

      {/* ================================================== */}
      {/* STATS                                              */}
      {/* ================================================== */}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <SkeletonBlock style={styles.statIcon} />

          <View style={styles.statContent}>
            <SkeletonBlock style={styles.statLabel} />

            <SkeletonBlock style={styles.statValue} />
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <SkeletonBlock style={styles.statIcon} />

          <View style={styles.statContent}>
            <SkeletonBlock style={styles.statLabel} />

            <SkeletonBlock style={styles.statValue} />
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <SkeletonBlock style={styles.statIcon} />

          <View style={styles.statContent}>
            <SkeletonBlock style={styles.statLabel} />

            <SkeletonBlock style={styles.statValue} />
          </View>
        </View>
      </View>

      {/* ================================================== */}
      {/* FOOTER                                             */}
      {/* ================================================== */}

      <View style={styles.footer}>
        <View style={styles.lastPurchase}>
          <SkeletonBlock style={styles.footerIcon} />

          <SkeletonBlock style={styles.footerText} />

          <SkeletonBlock style={styles.footerDate} />
        </View>

        <SkeletonBlock style={styles.posBadge} />
      </View>
    </View>
  );
}

export function CustomerListSkeleton({ count = 5 }: CustomerListSkeletonProps) {
  const items = Array.from(
    {
      length: Math.max(1, count),
    },
    (_, index) => index,
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel="Chargement des clients"
      accessibilityRole="progressbar"
    >
      {items.map((index) => (
        <CustomerCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CONTAINER
  // ==========================================================

  container: {
    width: "100%",
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    marginBottom: 11,
    padding: 15,
    borderRadius: 19,
    backgroundColor: COLORS.white,
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

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
  },

  identity: {
    flex: 1,
    marginLeft: 11,
  },

  name: {
    width: "55%",
    height: 13,
    borderRadius: 5,
  },

  phone: {
    width: "35%",
    height: 9,
    marginTop: 7,
    borderRadius: 4,
  },

  chevron: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },

  // ==========================================================
  // SEPARATOR
  // ==========================================================

  separator: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#F0F0ED",
  },

  // ==========================================================
  // STATS
  // ==========================================================

  stats: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
  },

  statContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
  },

  statLabel: {
    width: "65%",
    height: 7,
    borderRadius: 3,
  },

  statValue: {
    width: "80%",
    height: 10,
    marginTop: 5,
    borderRadius: 4,
  },

  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
    backgroundColor: "#EEEEEB",
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lastPurchase: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  footerIcon: {
    width: 13,
    height: 13,
    borderRadius: 4,
  },

  footerText: {
    width: 55,
    height: 7,
    borderRadius: 3,
  },

  footerDate: {
    width: 65,
    height: 8,
    borderRadius: 3,
  },

  posBadge: {
    width: 58,
    height: 24,
    borderRadius: 8,
  },

  // ==========================================================
  // SKELETON
  // ==========================================================

  skeleton: {
    backgroundColor: "#ECECE8",
  },
});
