import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface CustomerSearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomerSearchBar({
  value,
  onChangeText,
  placeholder = "Rechercher par nom ou téléphone...",
  disabled = false,
}: CustomerSearchBarProps) {
  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.iconContainer}>
        <Ionicons name="search-outline" size={19} color={COLORS.primary} />
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.Gray}
        style={styles.input}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        returnKeyType="search"
        clearButtonMode="never"
      />

      {value.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.pressed,
          ]}
          onPress={handleClear}
          disabled={disabled}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={19} color={COLORS.Gray} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    paddingHorizontal: 11,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E5E1",
  },

  containerDisabled: {
    opacity: 0.55,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  input: {
    flex: 1,
    minHeight: 44,
    marginLeft: 9,
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: COLORS.text,
  },

  clearButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.55,
  },
});
