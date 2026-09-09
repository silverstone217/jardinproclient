import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Employee } from "@/types/employee";
import { COLORS, fonts } from "@/utils/styles";

import EmployeeAvatar from "./EmployeeAvatar";

interface EmployeeDetailsModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const getAssignment = (employee: Employee) => {
  return employee.assignments.find((assignment) => assignment.isActive);
};

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <View
    style={[
      styles.statusBadge,
      isActive ? styles.statusActive : styles.statusInactive,
    ]}
  >
    <View
      style={[
        styles.statusDot,
        isActive ? styles.dotActive : styles.dotInactive,
      ]}
    />

    <Text
      style={[
        styles.statusText,
        isActive ? styles.textActive : styles.textInactive,
      ]}
    >
      {isActive ? "Actif" : "Désactivé"}
    </Text>
  </View>
);

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  danger?: boolean;
}

const InfoRow = ({ icon, label, value, danger = false }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIcon, danger && styles.dangerInfoIcon]}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? COLORS.error : COLORS.primary}
      />
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={[styles.infoValue, danger && styles.dangerText]}>
        {value}
      </Text>
    </View>
  </View>
);

export default function EmployeeDetailsModal({
  visible,
  employee,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}: EmployeeDetailsModalProps) {
  if (!employee) {
    return null;
  }

  const assignment = getAssignment(employee);

  const pointOfSale = assignment?.pointOfSale;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={isDeleting ? undefined : onClose}
        />

        <View style={styles.modal}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Détails de l'employé</Text>

            <Pressable
              onPress={onClose}
              disabled={isDeleting}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={COLORS.darkGray} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.profileCard}>
              <EmployeeAvatar employee={employee} size={74} />

              <View style={styles.profileInfo}>
                <Text style={styles.name} numberOfLines={2}>
                  {employee.name}
                </Text>

                <View style={styles.profileMeta}>
                  <View style={styles.roleBadge}>
                    <Ionicons
                      name="person-outline"
                      size={12}
                      color={COLORS.primary}
                    />

                    <Text style={styles.roleText}>Employé</Text>
                  </View>

                  <StatusBadge isActive={employee.isActive} />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coordonnées</Text>

              <View style={styles.infoCard}>
                <InfoRow
                  icon="call-outline"
                  label="Téléphone"
                  value={employee.telephone}
                />

                <View style={styles.divider} />

                <InfoRow
                  icon="mail-outline"
                  label="Adresse email"
                  value={employee.email ?? "Aucune adresse email"}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Affectation</Text>

              <View style={styles.assignmentCard}>
                <View style={styles.assignmentIcon}>
                  <Ionicons
                    name="storefront"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentName}>
                    {pointOfSale?.name ?? "Aucun point de vente"}
                  </Text>

                  {pointOfSale && (
                    <View style={styles.assignmentMeta}>
                      <Text style={styles.assignmentCodeLabel}>Code</Text>

                      <Text style={styles.assignmentCode}>
                        {pointOfSale.code}
                      </Text>

                      {pointOfSale.isMainStore && (
                        <View style={styles.mainStoreBadge}>
                          <Text style={styles.mainStoreText}>Principal</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compte</Text>

              <View style={styles.infoCard}>
                <InfoRow
                  icon="calendar-outline"
                  label="Membre depuis"
                  value={formatDate(employee.createdAt)}
                />

                {employee.isBanned && (
                  <>
                    <View style={styles.divider} />

                    <InfoRow
                      icon="ban-outline"
                      label="Compte suspendu"
                      value={employee.banReason ?? "Aucune raison indiquée"}
                      danger
                    />
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onDelete}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
                isDeleting && styles.disabled,
              ]}
            >
              <Ionicons name="trash-outline" size={19} color={COLORS.error} />

              <Text style={styles.deleteText}>Supprimer</Text>
            </Pressable>

            <Pressable
              onPress={onEdit}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
                isDeleting && styles.disabled,
              ]}
            >
              <Ionicons name="create-outline" size={19} color={COLORS.white} />

              <Text style={styles.editText}>Modifier</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "91%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    overflow: "hidden",
  },

  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D5D5D5",
    marginTop: 9,
    marginBottom: 5,
  },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 18,
    paddingBottom: 25,
  },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 20,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "#E8F2E5",
  },

  roleText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
    marginLeft: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  statusActive: {
    backgroundColor: "#EAF7ED",
  },

  statusInactive: {
    backgroundColor: "#F3F3F3",
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  dotActive: {
    backgroundColor: COLORS.success,
  },

  dotInactive: {
    backgroundColor: COLORS.Gray,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
  },

  textActive: {
    color: COLORS.success,
  },

  textInactive: {
    color: COLORS.Gray,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 8,
    marginLeft: 2,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  dangerInfoIcon: {
    backgroundColor: "#FFF0F0",
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
    marginBottom: 3,
  },

  infoValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  dangerText: {
    color: COLORS.error,
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 45,
  },

  assignmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  assignmentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  assignmentInfo: {
    flex: 1,
  },

  assignmentName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  assignmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  assignmentCodeLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
    marginRight: 5,
  },

  assignmentCode: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.darkGray,
  },

  mainStoreBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "#FFF4D9",
  },

  mainStoreText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: "#B87800",
  },

  actions: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 17,
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  deleteButton: {
    flex: 0.85,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FFD5D5",
    backgroundColor: "#FFF7F7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  deleteText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 7,
  },

  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  editText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 7,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});
