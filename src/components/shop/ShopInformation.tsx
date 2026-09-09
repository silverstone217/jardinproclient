import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ShopInformationProps {
  name: string;
  slogan: string;
  telephone: string;
  email: string;
  address: string;

  onNameChange: (value: string) => void;
  onSloganChange: (value: string) => void;
  onTelephoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAddressChange: (value: string) => void;
}

interface FieldProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  onChangeText: (value: string) => void;
}

function Field({
  icon,
  label,
  value,
  placeholder,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
  onChangeText,
}: FieldProps) {
  return (
    <View style={[styles.field, multiline && styles.multilineField]}>
      <View style={styles.fieldTop}>
        <View style={styles.fieldIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.label}>{label}</Text>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.Gray}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.addressInput]}
      />
    </View>
  );
}

export default function ShopInformation({
  name,
  slogan,
  telephone,
  email,
  address,
  onNameChange,
  onSloganChange,
  onTelephoneChange,
  onEmailChange,
  onAddressChange,
}: ShopInformationProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="store-edit-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Informations de la boutique</Text>

          <Text style={styles.subtitle}>
            Ces informations apparaîtront sur vos documents.
          </Text>
        </View>
      </View>

      {/* Fields */}
      <View style={styles.fields}>
        <Field
          icon="store-outline"
          label="Nom de la boutique"
          value={name}
          placeholder="Ex. Jus Jardin"
          onChangeText={onNameChange}
          autoCapitalize="words"
        />

        <Field
          icon="format-quote-open"
          label="Slogan"
          value={slogan}
          placeholder="Ex. Le goût naturel au quotidien"
          onChangeText={onSloganChange}
        />

        <Field
          icon="phone-outline"
          label="Téléphone"
          value={telephone}
          placeholder="0812345678"
          keyboardType="phone-pad"
          onChangeText={onTelephoneChange}
          autoCapitalize="none"
        />

        <Field
          icon="email-outline"
          label="Adresse email"
          value={email}
          placeholder="contact@boutique.com"
          keyboardType="email-address"
          onChangeText={onEmailChange}
          autoCapitalize="none"
        />

        <Field
          icon="map-marker-outline"
          label="Adresse"
          value={address}
          placeholder="Ex. Avenue..., Kinshasa"
          multiline
          onChangeText={onAddressChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 17,
    marginBottom: 4,
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

  /* Fields */
  fields: {
    paddingTop: 8,
  },

  field: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  multilineField: {
    paddingBottom: 4,
    borderBottomWidth: 0,
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

  label: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
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

  addressInput: {
    minHeight: 78,
    paddingTop: 12,
    lineHeight: 19,
  },
});
