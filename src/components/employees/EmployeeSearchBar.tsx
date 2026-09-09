import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface EmployeeSearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
}

export default function EmployeeSearchBar({
  value,
  onChangeText,
}: EmployeeSearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={COLORS.Gray} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher un employé..."
        placeholderTextColor={COLORS.Gray}
        style={styles.input}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={10}>
          <Ionicons name="close-circle" size={19} color={COLORS.Gray} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },
});
