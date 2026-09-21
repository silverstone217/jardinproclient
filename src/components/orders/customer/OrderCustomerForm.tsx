import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface OrderCustomerFormProps {
  name: string;
  phone: string;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

export function OrderCustomerForm({
  name,
  phone,
  isCreating,
  onNameChange,
  onCreate,
  onBack,
}: OrderCustomerFormProps) {
  const isValid = name.trim().length >= 2 && /^0\d{9}$/.test(phone);

  return (
    <View style={styles.card}>
      <View style={styles.newCustomerBanner}>
        <View style={styles.bannerIcon}>
          <Ionicons
            name="person-add-outline"
            size={17}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Nouveau client</Text>

          <Text style={styles.bannerText}>
            Aucun compte trouvé avec ce numéro.
          </Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nom du client</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={17} color={COLORS.primary} />

          <TextInput
            value={name}
            onChangeText={onNameChange}
            placeholder="Nom complet"
            placeholderTextColor={COLORS.Gray}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isCreating}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (isValid && !isCreating) {
                onCreate();
              }
            }}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Numéro de téléphone</Text>

        <View style={[styles.inputContainer, styles.disabledInput]}>
          <Ionicons name="call-outline" size={17} color={COLORS.Gray} />

          <Text style={styles.phone}>{phone}</Text>

          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          !isValid && styles.createButtonDisabled,
          pressed && isValid && styles.createButtonPressed,
        ]}
        onPress={onCreate}
        disabled={!isValid || isCreating}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color={isValid ? COLORS.white : COLORS.Gray}
          />
        )}

        <Text
          style={[
            styles.createButtonText,
            !isValid && styles.createButtonTextDisabled,
          ]}
        >
          {isCreating ? "Enregistrement..." : "Créer et continuer"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={onBack}
        disabled={isCreating}
      >
        <Ionicons name="arrow-back-outline" size={15} color={COLORS.darkGray} />

        <Text style={styles.backText}>Modifier le numéro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7E7E3",
  },

  newCustomerBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#FFF7E8",
    borderWidth: 1,
    borderColor: "#F5E1B4",
  },

  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0CF",
  },

  bannerContent: {
    flex: 1,
    marginLeft: 9,
  },

  bannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: "#725B16",
  },

  bannerText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: "#927A2C",
  },

  field: {
    marginTop: 17,
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  inputContainer: {
    height: 48,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E1E2DD",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  disabledInput: {
    backgroundColor: "#F3F3F1",
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    paddingVertical: 0,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: COLORS.text,
  },

  phone: {
    flex: 1,
    marginLeft: 9,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: COLORS.Gray,
  },

  createButton: {
    minHeight: 48,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  createButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  createButtonPressed: {
    opacity: 0.8,
  },

  createButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  createButtonTextDisabled: {
    color: COLORS.Gray,
  },

  backButton: {
    minHeight: 40,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  backText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.darkGray,
  },
});
