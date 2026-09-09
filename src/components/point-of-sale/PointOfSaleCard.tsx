import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { Employee } from "@/types/employee";
import type { PointOfSale } from "@/types/point-of-sale";

import { COLORS, fonts } from "@/utils/styles";

import PointOfSaleStaffAssignment from "./PointOfSaleStaffAssignment";

interface PointOfSaleCardProps {
  pointOfSale: PointOfSale;
  employees: Employee[];

  isAssigningStaff?: boolean;
  isRemovingStaff?: boolean;

  onEdit: (pointOfSale: PointOfSale) => void;

  onDelete: (pointOfSale: PointOfSale) => void;

  onAssignEmployee: (
    pointOfSaleId: string,
    employeeId: string,
  ) => Promise<void>;

  onRemoveEmployee: (
    pointOfSaleId: string,
    employeeId: string,
    employeeName: string,
  ) => Promise<void>;

  onAddEmployee?: () => void;
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("fr-FR").format(value);
};

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function PointOfSaleCard({
  pointOfSale,
  employees,
  isAssigningStaff = false,
  isRemovingStaff = false,
  onEdit,
  onDelete,
  onAssignEmployee,
  onRemoveEmployee,
  onAddEmployee,
}: PointOfSaleCardProps) {
  const activeStaff = pointOfSale.staffAssignments.filter(
    (assignment) => assignment.isActive && assignment.user.isActive,
  );

  const handleDelete = () => {
    if (pointOfSale.isMainStore) {
      Alert.alert(
        "Action impossible",
        "Le magasin principal ne peut pas être supprimé.",
      );

      return;
    }

    Alert.alert(
      "Supprimer le point de vente ?",
      `Voulez-vous vraiment supprimer « ${pointOfSale.name} » ? Cette action est définitive.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onDelete(pointOfSale),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="storefront-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.titleContent}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {pointOfSale.name}
              </Text>

              {pointOfSale.isMainStore && (
                <View style={styles.mainBadge}>
                  <Ionicons name="star" size={11} color={COLORS.secondary} />

                  <Text style={styles.mainBadgeText}>Principal</Text>
                </View>
              )}
            </View>

            <Text style={styles.code}>{pointOfSale.code}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            pointOfSale.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              pointOfSale.isActive ? styles.activeDot : styles.inactiveDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              pointOfSale.isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {pointOfSale.isActive ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* INFORMATIONS */}
      {/* ================================================== */}

      {(pointOfSale.address || pointOfSale.telephone) && (
        <View style={styles.infoContainer}>
          {pointOfSale.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={17} color={COLORS.Gray} />

              <Text style={styles.infoText} numberOfLines={2}>
                {pointOfSale.address}
              </Text>
            </View>
          ) : null}

          {pointOfSale.telephone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={17} color={COLORS.Gray} />

              <Text style={styles.infoText}>{pointOfSale.telephone}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* ================================================== */}
      {/* STATISTIQUES */}
      {/* ================================================== */}

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <View style={styles.metricIcon}>
            <Ionicons name="cube-outline" size={17} color={COLORS.primary} />
          </View>

          <View>
            <Text style={styles.metricValue}>
              {formatNumber(pointOfSale.finishedStockCount)}
            </Text>

            <Text style={styles.metricLabel}>Produits</Text>
          </View>
        </View>

        <View style={styles.metricSeparator} />

        <View style={styles.metric}>
          <View style={[styles.metricIcon, styles.salesIcon]}>
            <Ionicons name="receipt-outline" size={17} color={COLORS.info} />
          </View>

          <View>
            <Text style={styles.metricValue}>
              {formatNumber(pointOfSale.salesCount)}
            </Text>

            <Text style={styles.metricLabel}>Ventes</Text>
          </View>
        </View>

        <View style={styles.metricSeparator} />

        <View style={styles.metric}>
          <View style={[styles.metricIcon, styles.lossIcon]}>
            <Ionicons name="warning-outline" size={17} color={COLORS.error} />
          </View>

          <View>
            <Text style={styles.metricValue}>
              {formatNumber(pointOfSale.lossCount)}
            </Text>

            <Text style={styles.metricLabel}>Pertes</Text>
          </View>
        </View>
      </View>

      {/* ================================================== */}
      {/* PERSONNEL */}
      {/* ================================================== */}

      <View style={styles.staffSection}>
        <View style={styles.staffHeader}>
          <View>
            <Text style={styles.sectionTitle}>Personnel</Text>

            <Text style={styles.sectionSubtitle}>
              {activeStaff.length === 0
                ? "Aucun membre affecté"
                : `${activeStaff.length} membre${
                    activeStaff.length > 1 ? "s" : ""
                  } affecté${activeStaff.length > 1 ? "s" : ""}`}
            </Text>
          </View>

          <View style={styles.staffAvatars}>
            {activeStaff.slice(0, 3).map((assignment) => (
              <View key={assignment.id} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(assignment.user.name)}
                </Text>
              </View>
            ))}

            {activeStaff.length > 3 && (
              <View style={[styles.avatar, styles.moreAvatar]}>
                <Text style={styles.moreAvatarText}>
                  +{activeStaff.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        <PointOfSaleStaffAssignment
          pointOfSale={pointOfSale}
          staffAssignments={pointOfSale.staffAssignments}
          employees={employees}
          isAssigning={isAssigningStaff}
          isRemoving={isRemovingStaff}
          onAssign={(employeeId) =>
            onAssignEmployee(pointOfSale.id, employeeId)
          }
          onRemove={(employeeId, employeeName) =>
            onRemoveEmployee(pointOfSale.id, employeeId, employeeName)
          }
          onAddEmployee={onAddEmployee}
        />
      </View>

      {/* ================================================== */}
      {/* ACTIONS */}
      {/* ================================================== */}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() => onEdit(pointOfSale)}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />

          <Text style={styles.editText}>Modifier</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressedButton,
          ]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    marginRight: 12,
  },

  titleContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  code: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.Gray,
    letterSpacing: 0.7,
  },

  mainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FFF4DF",
  },

  mainBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: "#B86D00",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },

  activeBadge: {
    backgroundColor: "#EAF7EC",
  },

  inactiveBadge: {
    backgroundColor: "#F2F2F2",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: COLORS.success,
  },

  inactiveDot: {
    backgroundColor: COLORS.Gray,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },

  activeText: {
    color: COLORS.success,
  },

  inactiveText: {
    color: COLORS.Gray,
  },

  infoContainer: {
    marginTop: 18,
    gap: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.darkGray,
  },

  metrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },

  metric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3E8",
  },

  salesIcon: {
    backgroundColor: "#EAF3FB",
  },

  lossIcon: {
    backgroundColor: "#FDECEC",
  },

  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  metricLabel: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  metricSeparator: {
    width: 1,
    height: 30,
    backgroundColor: "#EAEAEA",
  },

  staffSection: {
    marginTop: 18,
  },

  staffHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  staffAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 2,
    borderColor: COLORS.white,
    marginLeft: -6,
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  moreAvatar: {
    backgroundColor: "#F1F1F1",
  },

  moreAvatarText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.darkGray,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },

  editButton: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#EEF5EC",
  },

  editText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.primary,
  },

  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEEEE",
  },

  pressedButton: {
    opacity: 0.7,
  },
});
