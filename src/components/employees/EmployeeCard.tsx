import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Employee } from "@/types/employee";
import { COLORS, fonts } from "@/utils/styles";
import EmployeeAvatar from "./EmployeeAvatar";

interface EmployeeCardProps {
  employee: Employee;
  onPress: () => void;
}

const getAssignment = (employee: Employee) => {
  return employee.assignments.find((assignment) => assignment.isActive);
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

export default function EmployeeCard({ employee, onPress }: EmployeeCardProps) {
  const assignment = getAssignment(employee);

  const pointOfSale = assignment?.pointOfSale;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <EmployeeAvatar employee={employee} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {employee.name}
            </Text>

            <Text style={styles.telephone} numberOfLines={1}>
              {employee.telephone}
            </Text>
          </View>

          <StatusBadge isActive={employee.isActive} />
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.posContainer}>
            <View style={styles.posIcon}>
              <Ionicons
                name="storefront-outline"
                size={13}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.posName} numberOfLines={1}>
              {pointOfSale?.name ?? "Aucun point de vente"}
            </Text>

            {pointOfSale?.code && (
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{pointOfSale.code}</Text>
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={18} color={COLORS.Gray} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 84,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  cardPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.995 }],
  },

  content: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  nameContainer: {
    flex: 1,
    marginRight: 8,
  },

  name: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.text,
  },

  telephone: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
    marginTop: 3,
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  posContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  posIcon: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  posName: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  codeBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "#F4F4F4",
  },

  codeText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
    color: COLORS.Gray,
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
    borderRadius: 2.5,
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
});
