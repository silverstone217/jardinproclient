import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { COLORS, fontSizes } from "@/utils/styles";

interface CustomerPreviewSkeletonProps {
  showHistory?: boolean;
}

const CustomerPreviewSkeleton = memo(
  ({ showHistory = true }: CustomerPreviewSkeletonProps) => {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.backButton} />

          <View style={styles.profileRow}>
            <View style={styles.avatar} />

            <View style={styles.profileInfo}>
              <View style={styles.nameLine} />
              <View style={styles.phoneLine} />
              <View style={styles.createdLine} />
            </View>
          </View>

          <View style={styles.contextLine} />
        </View>

        {/* Fidélité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitle} />
              <View style={styles.sectionSubtitle} />
            </View>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyIcon} />

            <View style={styles.loyaltyInfo}>
              <View style={styles.pointsLine} />
              <View style={styles.pointsLabelLine} />
            </View>
          </View>

          <View style={styles.loyaltyDetails}>
            <View style={styles.detailBlock}>
              <View style={styles.detailIcon} />

              <View style={styles.detailText}>
                <View style={styles.detailValue} />
                <View style={styles.detailLabel} />
              </View>
            </View>

            <View style={styles.detailSeparator} />

            <View style={styles.detailBlock}>
              <View style={styles.detailIcon} />

              <View style={styles.detailText}>
                <View style={styles.detailValue} />
                <View style={styles.detailLabel} />
              </View>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitle} />
              <View style={styles.sectionSubtitle} />
            </View>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.statsGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={`stat-${index}`} style={styles.statCard}>
                <View style={styles.statIcon} />
                <View style={styles.statValue} />
                <View style={styles.statLabel} />
              </View>
            ))}
          </View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitle} />
              <View style={styles.sectionSubtitle} />
            </View>

            <View style={styles.headerIcon} />
          </View>

          <View style={styles.infoCard}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={`info-${index}`}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon} />

                  <View style={styles.infoText}>
                    <View style={styles.infoLabel} />
                    <View style={styles.infoValue} />
                  </View>
                </View>

                {index < 3 && <View style={styles.infoSeparator} />}
              </View>
            ))}
          </View>
        </View>

        {/* Historique */}
        {showHistory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <View style={styles.sectionTitle} />
                <View style={styles.sectionSubtitle} />
              </View>

              <View style={styles.headerIcon} />
            </View>

            {Array.from({ length: 3 }).map((_, index) => (
              <View key={`order-${index}`} style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View style={styles.orderIcon} />

                  <View style={styles.orderInfo}>
                    <View style={styles.orderNumber} />
                    <View style={styles.orderDate} />
                  </View>

                  <View style={styles.orderTotal} />
                </View>

                <View style={styles.orderSeparator} />

                <View style={styles.orderBottom}>
                  <View style={styles.orderItems} />
                  <View style={styles.orderPos} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  },
);

CustomerPreviewSkeleton.displayName = "CustomerPreviewSkeleton";

export default CustomerPreviewSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lightGray,
    marginBottom: 18,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.lightGray,
    marginRight: 14,
  },

  profileInfo: {
    flex: 1,
  },

  nameLine: {
    width: "55%",
    height: fontSizes.large,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginBottom: 8,
  },

  phoneLine: {
    width: "35%",
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginBottom: 6,
  },

  createdLine: {
    width: "50%",
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  contextLine: {
    width: 145,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginTop: 16,
  },

  // --------------------------------------------------
  // SECTIONS
  // --------------------------------------------------

  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    width: 115,
    height: fontSizes.large,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginBottom: 5,
  },

  sectionSubtitle: {
    width: 185,
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },

  // --------------------------------------------------
  // LOYALTY
  // --------------------------------------------------

  loyaltyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
  },

  loyaltyIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.neutral,
    marginRight: 13,
  },

  loyaltyInfo: {
    flex: 1,
  },

  pointsLine: {
    width: 75,
    height: fontSizes.xlarge,
    borderRadius: 6,
    backgroundColor: COLORS.neutral,
    marginBottom: 5,
  },

  pointsLabelLine: {
    width: 125,
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.neutral,
  },

  loyaltyDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  detailBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.lightGray,
    marginRight: 9,
  },

  detailText: {
    flex: 1,
  },

  detailValue: {
    width: 48,
    height: fontSizes.medium,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginBottom: 4,
  },

  detailLabel: {
    width: 75,
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  detailSeparator: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 10,
  },

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statCard: {
    width: "48%",
    minHeight: 128,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginBottom: 10,
  },

  statValue: {
    width: "55%",
    height: fontSizes.large,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginBottom: 7,
  },

  statLabel: {
    width: "70%",
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  // --------------------------------------------------
  // INFORMATIONS
  // --------------------------------------------------

  infoCard: {
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    width: 70,
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginBottom: 5,
  },

  infoValue: {
    width: "45%",
    height: fontSizes.medium,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  infoSeparator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },

  // --------------------------------------------------
  // HISTORIQUE
  // --------------------------------------------------

  orderCard: {
    padding: 14,
    paddingRight: 42,
    borderRadius: 14,
    backgroundColor: COLORS.neutral,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 10,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
  },

  orderInfo: {
    flex: 1,
  },

  orderNumber: {
    width: "60%",
    height: fontSizes.medium,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginBottom: 5,
  },

  orderDate: {
    width: "75%",
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  orderTotal: {
    width: 70,
    height: fontSizes.medium,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginLeft: 10,
  },

  orderSeparator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },

  orderBottom: {
    gap: 8,
  },

  orderItems: {
    width: "75%",
    height: fontSizes.small,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
  },

  orderPos: {
    width: 100,
    height: 25,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
});
