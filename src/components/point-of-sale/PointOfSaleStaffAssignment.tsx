import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Employee } from "@/types/employee";

import type {
  PointOfSale,
  PointOfSaleStaffAssignment as StaffAssignment,
} from "@/types/point-of-sale";

import { COLORS, fonts } from "@/utils/styles";

interface PointOfSaleStaffAssignmentProps {
  pointOfSale: PointOfSale;
  staffAssignments: StaffAssignment[];
  employees: Employee[];

  isAssigning?: boolean;
  isRemoving?: boolean;

  onAssign: (employeeId: string) => Promise<void>;

  onRemove: (employeeId: string, employeeName: string) => Promise<void>;

  onAddEmployee?: () => void;
}

const getInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function PointOfSaleStaffAssignment({
  pointOfSale,
  staffAssignments,
  employees,
  isAssigning = false,
  isRemoving = false,
  onAssign,
  onRemove,
  onAddEmployee,
}: PointOfSaleStaffAssignmentProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  // ==========================================================
  // PERSONNEL ACTUELLEMENT AFFECTÉ
  // ==========================================================

  const activeAssignments = useMemo(
    () =>
      staffAssignments.filter(
        (assignment) => assignment.isActive && assignment.user.isActive,
      ),
    [staffAssignments],
  );

  // ==========================================================
  // EMPLOYÉS DISPONIBLES
  // ==========================================================

  const availableEmployees = useMemo(() => {
    return employees.filter(
      (employee) =>
        employee.role === "EMPLOYEE" &&
        employee.isActive &&
        !employee.assignments.some((assignment) => assignment.isActive),
    );
  }, [employees]);

  // ==========================================================
  // OUVRIR LE MODAL
  // ==========================================================

  const openModal = () => {
    if (isAssigning || isRemoving) {
      return;
    }

    setSelectedEmployeeId(null);
    setIsModalVisible(true);
  };

  // ==========================================================
  // FERMER LE MODAL
  // ==========================================================

  const closeModal = () => {
    if (isAssigning) {
      return;
    }

    setSelectedEmployeeId(null);
    setIsModalVisible(false);
  };

  // ==========================================================
  // SÉLECTIONNER UN EMPLOYÉ
  // ==========================================================

  const handleSelectEmployee = (employeeId: string) => {
    if (isAssigning) {
      return;
    }

    setSelectedEmployeeId((current) =>
      current === employeeId ? null : employeeId,
    );
  };

  // ==========================================================
  // AFFECTER
  // ==========================================================

  const handleAssign = async () => {
    if (!selectedEmployeeId || isAssigning) {
      return;
    }

    try {
      await onAssign(selectedEmployeeId);

      setSelectedEmployeeId(null);
      setIsModalVisible(false);
    } catch {
      // Le parent affiche déjà l'erreur.
    }
  };

  // ==========================================================
  // RETIRER
  // ==========================================================

  const handleRemove = (employeeId: string, employeeName: string) => {
    if (isRemoving) {
      return;
    }

    Alert.alert(
      "Retirer l'employé ?",
      `Voulez-vous retirer « ${employeeName} » de ${pointOfSale.name} ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              await onRemove(employeeId, employeeName);
            } catch {
              // Le parent gère l'erreur.
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <View style={styles.container}>
      {/* ==================================================== */}
      {/* PERSONNEL AFFECTÉ */}
      {/* ==================================================== */}

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
                  <Ionicons name="call-outline" size={11} color={COLORS.Gray} />

                  <Text style={styles.telephoneText} numberOfLines={1}>
                    {assignment.user.telephone}
                  </Text>
                </View>
              </View>

              <View style={styles.staffActions}>
                <View style={styles.assignedIndicator}>
                  <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                </View>

                <Pressable
                  onPress={() =>
                    handleRemove(assignment.user.id, assignment.user.name)
                  }
                  disabled={isRemoving}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.pressedButton,
                    isRemoving && styles.disabledButton,
                  ]}
                >
                  {isRemoving ? (
                    <ActivityIndicator size="small" color={COLORS.error} />
                  ) : (
                    <Ionicons
                      name="person-remove-outline"
                      size={15}
                      color={COLORS.error}
                    />
                  )}
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyStaff}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={18} color={COLORS.Gray} />
          </View>

          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyTitle}>Aucun personnel affecté</Text>

            <Text style={styles.emptyText}>
              Aucun membre du personnel ne travaille actuellement sur ce point
              de vente.
            </Text>
          </View>
        </View>
      )}

      {/* ==================================================== */}
      {/* BOUTON AFFECTATION */}
      {/* ==================================================== */}

      <Pressable
        onPress={openModal}
        disabled={isAssigning || isRemoving || !pointOfSale.isActive}
        style={({ pressed }) => [
          styles.assignButton,
          pressed && styles.pressedButton,
          !pointOfSale.isActive && styles.disabledAssignButton,
        ]}
      >
        <Ionicons name="person-add-outline" size={17} color={COLORS.primary} />

        <Text style={styles.assignButtonText}>
          {activeAssignments.length > 0
            ? "Ajouter du personnel"
            : "Affecter du personnel"}
        </Text>

        <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
      </Pressable>

      {/* ==================================================== */}
      {/* MODAL */}
      {/* ==================================================== */}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.handle} />

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Affecter du personnel</Text>

                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {pointOfSale.name}
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={isAssigning}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="close" size={21} color={COLORS.darkGray} />
              </Pressable>
            </View>

            {/* ================================================= */}
            {/* INFORMATION */}
            {/* ================================================= */}

            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.infoText}>
                Sélectionnez un employé disponible pour l'affecter à ce point de
                vente.
              </Text>
            </View>

            {/* ================================================= */}
            {/* LISTE DES EMPLOYÉS DISPONIBLES */}
            {/* ================================================= */}

            <ScrollView
              style={styles.employeeList}
              contentContainerStyle={styles.employeeListContent}
              showsVerticalScrollIndicator={false}
            >
              {availableEmployees.length === 0 ? (
                <View style={styles.noEmployee}>
                  <View style={styles.noEmployeeIcon}>
                    <Ionicons
                      name="people-outline"
                      size={24}
                      color={COLORS.Gray}
                    />
                  </View>

                  <Text style={styles.noEmployeeTitle}>
                    Aucun employé disponible
                  </Text>

                  <Text style={styles.noEmployeeText}>
                    Tous les employés actifs sont actuellement affectés à un
                    point de vente, ou aucun employé n'a encore été ajouté.
                  </Text>
                </View>
              ) : (
                <>
                  {availableEmployees.map((employee) => {
                    const selected = selectedEmployeeId === employee.id;

                    return (
                      <Pressable
                        key={employee.id}
                        onPress={() => handleSelectEmployee(employee.id)}
                        disabled={isAssigning}
                        style={({ pressed }) => [
                          styles.employeeRow,
                          selected && styles.selectedEmployeeRow,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <View style={styles.employeeAvatar}>
                          <Text style={styles.avatarText}>
                            {getInitials(employee.name)}
                          </Text>
                        </View>

                        <View style={styles.employeeInfo}>
                          <Text style={styles.employeeName} numberOfLines={1}>
                            {employee.name}
                          </Text>

                          <View style={styles.employeeMeta}>
                            <Text style={styles.employeePhone}>
                              {employee.telephone}
                            </Text>

                            <View style={styles.metaDot} />

                            <Text style={styles.employeeRole}>Employé</Text>
                          </View>

                          <Text style={styles.availableLabel}>Disponible</Text>
                        </View>

                        <View
                          style={[
                            styles.selectIndicator,
                            selected && styles.selectIndicatorActive,
                          ]}
                        >
                          {selected ? (
                            <Ionicons
                              name="checkmark"
                              size={17}
                              color={COLORS.white}
                            />
                          ) : (
                            <Ionicons
                              name="person-outline"
                              size={16}
                              color={COLORS.Gray}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}

                  {/* =========================================== */}
                  {/* AJOUTER UN EMPLOYÉ */}
                  {/* =========================================== */}

                  {onAddEmployee && (
                    <Pressable
                      onPress={onAddEmployee}
                      disabled={isAssigning}
                      style={({ pressed }) => [
                        styles.addEmployeeButton,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.addEmployeeIcon}>
                        <Ionicons name="add" size={21} color={COLORS.primary} />
                      </View>

                      <View style={styles.addEmployeeTextContainer}>
                        <Text style={styles.addEmployeeTitle}>
                          Ajouter un employé
                        </Text>

                        <Text style={styles.addEmployeeSubtitle}>
                          Créer un nouveau membre du personnel
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={COLORS.primary}
                      />
                    </Pressable>
                  )}
                </>
              )}
            </ScrollView>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeModal}
                disabled={isAssigning}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={handleAssign}
                disabled={!selectedEmployeeId || isAssigning}
                style={({ pressed }) => [
                  styles.assignConfirmButton,
                  (!selectedEmployeeId || isAssigning) && styles.disabledButton,
                  pressed && selectedEmployeeId && styles.savePressed,
                ]}
              >
                {isAssigning ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color={COLORS.white} />

                    <Text style={styles.assignConfirmText}>Affecter</Text>
                  </>
                )}
              </Pressable>
            </View>
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

  // ==========================================================
  // STAFF
  // ==========================================================

  staffList: {
    gap: 8,
  },

  staffRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: "#FAFAFA",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#E8F2E5",
  },

  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  staffInfo: {
    flex: 1,
    minWidth: 0,
  },

  staffName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  staffMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },

  telephoneText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  staffActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },

  assignedIndicator: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEEEE",
  },

  emptyStaff: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FAFAFA",
  },

  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#F0F0F0",
  },

  emptyTextContainer: {
    flex: 1,
  },

  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  assignButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 7,
    borderWidth: 1,
    borderColor: "#DDE8D9",
    borderRadius: 12,
    backgroundColor: "#F7FAF6",
  },

  assignButtonText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },

  disabledAssignButton: {
    opacity: 0.45,
  },

  pressedButton: {
    opacity: 0.7,
  },

  disabledButton: {
    opacity: 0.45,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  modal: {
    maxHeight: "88%",
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.white,
  },

  handle: {
    width: 42,
    height: 4,
    alignSelf: "center",
    marginTop: 9,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  modalHeaderIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#E8F2E5",
  },

  modalHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#F7FAF6",
  },

  infoIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 9,
    backgroundColor: "#E8F2E5",
  },

  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // LISTE EMPLOYÉS
  // ==========================================================

  employeeList: {
    maxHeight: 420,
    marginTop: 10,
  },

  employeeListContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  employeeRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 15,
    backgroundColor: COLORS.white,
  },

  selectedEmployeeRow: {
    borderColor: "#BFD5BA",
    backgroundColor: "#F5FAF4",
  },

  employeeAvatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#E8F2E5",
  },

  employeeInfo: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },

  employeeName: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  employeeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  employeePhone: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  employeeRole: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.primary,
  },

  metaDot: {
    width: 3,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: COLORS.Gray,
  },

  availableLabel: {
    marginTop: 3,
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.success,
  },

  selectIndicator: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    backgroundColor: "#FAFAFA",
  },

  selectIndicatorActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  // ==========================================================
  // AJOUT EMPLOYÉ
  // ==========================================================

  addEmployeeButton: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginTop: 3,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#BFD5BA",
    borderRadius: 15,
    backgroundColor: "#F9FCF8",
  },

  addEmployeeIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#E8F2E5",
  },

  addEmployeeTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  addEmployeeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.primary,
  },

  addEmployeeSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // AUCUN EMPLOYÉ
  // ==========================================================

  noEmployee: {
    alignItems: "center",
    paddingVertical: 35,
  },

  noEmployeeIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#F0F0F0",
  },

  noEmployeeTitle: {
    marginTop: 10,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  noEmployeeText: {
    maxWidth: 280,
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.Gray,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  modalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: COLORS.white,
  },

  cancelButton: {
    flex: 0.8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F3F3F3",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.darkGray,
  },

  assignConfirmButton: {
    flex: 1.2,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  assignConfirmText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
  },

  savePressed: {
    opacity: 0.85,
  },
});
