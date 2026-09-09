import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ProfileInformationProps {
  name: string;
  telephone: string;
  email: string;

  onNameChange: (value: string) => void;
  onTelephoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;

  disabled?: boolean;
}

interface InputFieldProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  maxLength?: number;
  disabled?: boolean;
  isLast?: boolean;
}

function InputField({
  icon,
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  disabled = false,
  isLast = false,
}: InputFieldProps) {
  return (
    <View style={[styles.field, isLast && styles.lastField]}>
      <View style={styles.fieldTop}>
        <View style={[styles.fieldIcon, disabled && styles.fieldIconDisabled]}>
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color={disabled ? COLORS.Gray : COLORS.primary}
          />
        </View>

        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.Gray}
        style={[styles.input, disabled && styles.inputDisabled]}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={!disabled}
        maxLength={maxLength}
      />
    </View>
  );
}

export function ProfileInformation({
  name,
  telephone,
  email,
  onNameChange,
  onTelephoneChange,
  onEmailChange,
  disabled = false,
}: ProfileInformationProps) {
  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="account-edit-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Informations personnelles</Text>

          <Text style={styles.subtitle}>
            Ces informations permettent de vous reconnaître dans l'application.
          </Text>
        </View>
      </View>

      {/* FIELDS */}
      <View style={styles.fields}>
        <InputField
          icon="account-outline"
          label="Nom complet"
          value={name}
          placeholder="Votre nom complet"
          onChangeText={onNameChange}
          maxLength={40}
          disabled={disabled}
          autoCapitalize="words"
        />

        <InputField
          icon="phone-outline"
          label="Numéro de téléphone"
          value={telephone}
          placeholder="0XXXXXXXXX"
          onChangeText={onTelephoneChange}
          keyboardType="phone-pad"
          autoCapitalize="none"
          maxLength={10}
          disabled={disabled}
        />

        <InputField
          icon="email-outline"
          label="Adresse email"
          value={email}
          placeholder="exemple@email.com"
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={disabled}
          isLast
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  fields: {
    paddingTop: 6,
  },

  field: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  lastField: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  fieldTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F0",
  },

  fieldIconDisabled: {
    backgroundColor: "#F1F1F1",
  },

  label: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  labelDisabled: {
    color: COLORS.Gray,
  },

  input: {
    minHeight: 43,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 13,
    color: COLORS.text,
  },

  inputDisabled: {
    backgroundColor: "#F5F5F3",
    color: COLORS.Gray,
  },
});
