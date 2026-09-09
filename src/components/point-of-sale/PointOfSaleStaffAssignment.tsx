import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { PointOfSaleStaffAssignment as StaffAssignment } from "@/types/point-of-sale";

import { COLORS, fonts } from "@/utils/styles";

interface PointOfSaleStaffAssignmentProps {
  staffAssignments: StaffAssignment[];
  onAssign?: () => void;
}

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getRoleLabel = (role: StaffAssignment["user"]["role"]): string => {
  switch (role) {
    case "MANAGER":
      return "Manager";

    case "EMPLOYEE":
      return "Employé";

    default:
      return role;
  }
};

export default function PointOfSaleStaffAssignment({
  staffAssignments,
  onAssign,
}: PointOfSaleStaffAssignmentProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const activeAssignments = staffAssignments.filter(
    (assignment) => assignment.isActive && assignment.user.isActive,
  );

  const handleAssign = () => {
    if (onAssign) {
      onAssign();
      return;
    }

    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {activeAssignments.length > 0 ? (
        <View style={styles.staffList}>
          {activeAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.staffRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(assignment.user.name)}
                </Text>
              </View>

              <View style={styles.staffInfo}>
                <Text style={styles.staffName} numberOfLines={1}>
                  {assignment.user.name}
                </Text>

                <View style={styles.staffMeta}>
                  <Text style={styles.roleText}>
                    {getRoleLabel(assignment.user.role)}
                  </Text>

                  <View style={styles.metaDot} />

                  <Text style={styles.telephoneText} numberOfLines={1}>
                    {assignment.user.telephone}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyStaff}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={18} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyText}>
            Aucun membre du personnel n'est affecté à ce point de vente.
          </Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.assignButton,
          pressed && styles.pressedButton,
        ]}
        onPress={handleAssign}
      >
        <Ionicons name="person-add-outline" size={17} color={COLORS.primary} />

        <Text style={styles.assignButtonText}>
          {activeAssignments.length > 0
            ? "Gérer les affectations"
            : "Affecter un membre du personnel"}
        </Text>
      </Pressable>

      {/* ================================================== */}
      {/* MODAL TEMPORAIRE */}
      {/* ================================================== */}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="people-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.modalTitle}>Affectation du personnel</Text>

            <Text style={styles.modalDescription}>
              La gestion des affectations du personnel sera disponible
              prochainement.
            </Text>

            <View style={styles.comingSoon}>
              <Ionicons
                name="time-outline"
                size={16}
                color={COLORS.secondary}
              />

              <Text style={styles.comingSoonText}>Bientôt disponible</Text>
            </View>

            <Pressable
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Compris</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  staffList: {
    gap: 10,
  },

  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FAFAFA",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    marginRight: 10,
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  staffMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  roleText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.primary,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.Gray,
    marginHorizontal: 6,
  },

  telephoneText: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  emptyStaff: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FAFAFA",
  },

  emptyIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    marginRight: 10,
  },

  emptyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.Gray,
  },

  assignButton: {
    marginTop: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE8D9",
    backgroundColor: "#F7FAF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  assignButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },

  pressedButton: {
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },

  modalIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    marginBottom: 14,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
  },

  modalDescription: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.darkGray,
    textAlign: "center",
  },

  comingSoon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFF6E7",
  },

  comingSoonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#B86D00",
  },

  modalButton: {
    width: "100%",
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginTop: 20,
  },

  modalButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.white,
  },
});
