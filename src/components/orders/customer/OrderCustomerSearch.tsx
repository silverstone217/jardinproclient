import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  COLORS,
  fonts,
} from "@/utils/styles";

interface OrderCustomerSearchProps {
  phone: string;
  isSearching: boolean;
  onPhoneChange: (phone: string) => void;
  onSearch: () => void;
}

export function OrderCustomerSearch({
  phone,
  isSearching,
  onPhoneChange,
  onSearch,
}: OrderCustomerSearchProps) {
  const isValid =
    /^0\d{9}$/.test(phone);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="call-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>
            Numéro de téléphone
          </Text>

          <Text style={styles.subtitle}>
            Saisissez le numéro du client
          </Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={phone}
          onChangeText={(value) => {
            const cleaned =
              value.replace(/\D/g, "");

            onPhoneChange(
              cleaned.slice(0, 10),
            );
          }}
          placeholder="0XXXXXXXXX"
          placeholderTextColor={COLORS.Gray}
          keyboardType="phone-pad"
          maxLength={10}
          autoFocus
          style={styles.input}
          editable={!isSearching}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (isValid && !isSearching) {
              onSearch();
            }
          }}
        />

        <View
          style={[
            styles.statusIcon,
            isValid &&
              styles.statusIconValid,
          ]}
        >
          <Ionicons
            name={
              isValid
                ? "checkmark"
                : "call-outline"
            }
            size={17}
            color={
              isValid
                ? COLORS.success
                : COLORS.Gray
            }
          />
        </View>
      </View>

      <Text style={styles.helper}>
        Le numéro doit contenir exactement
        10 chiffres et commencer par 0.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !isValid &&
            styles.buttonDisabled,
          pressed &&
            isValid &&
            styles.buttonPressed,
        ]}
        onPress={onSearch}
        disabled={
          !isValid || isSearching
        }
      >
        {isSearching ? (
          <ActivityIndicator
            size="small"
            color={COLORS.white}
          />
        ) : (
          <Ionicons
            name="search-outline"
            size={18}
            color={
              isValid
                ? COLORS.white
                : COLORS.Gray
            }
          />
        )}

        <Text
          style={[
            styles.buttonText,
            !isValid &&
              styles.buttonTextDisabled,
          ]}
        >
          {isSearching
            ? "Recherche..."
            : "Rechercher le client"}
        </Text>
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

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  inputContainer: {
    height: 52,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#DCDDD8",
    borderRadius: 14,
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: fonts.semibold,
    fontSize: 17,
    letterSpacing: 0.5,
    color: COLORS.text,
  },

  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  statusIconValid: {
    backgroundColor: "#E8F5E9",
  },

  helper: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  button: {
    minHeight: 48,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  buttonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },

  buttonTextDisabled: {
    color: COLORS.Gray,
  },
});