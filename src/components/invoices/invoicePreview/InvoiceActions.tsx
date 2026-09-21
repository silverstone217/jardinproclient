import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

export type InvoiceAction = "print" | "share" | "save" | "whatsapp" | null;

interface InvoiceActionsProps {
  onPrint: () => void | Promise<void>;
  onShare: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onWhatsApp: () => void | Promise<void>;

  activeAction?: InvoiceAction;
  disabled?: boolean;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void | Promise<void>;
  active?: boolean;
  disabled?: boolean;
  variant?: "default" | "whatsapp";
}

function ActionButton({
  icon,
  label,
  onPress,
  active = false,
  disabled = false,
  variant = "default",
}: ActionButtonProps) {
  const isDisabled = disabled || active;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,

        variant === "whatsapp" && styles.whatsappButton,

        isDisabled && styles.actionButtonDisabled,

        pressed && !isDisabled && styles.actionButtonPressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <View
        style={[
          styles.iconContainer,

          variant === "whatsapp" && styles.whatsappIconContainer,

          isDisabled && styles.iconContainerDisabled,
        ]}
      >
        {active ? (
          <ActivityIndicator
            size="small"
            color={variant === "whatsapp" ? COLORS.primary : COLORS.primary}
          />
        ) : (
          <Ionicons
            name={icon}
            size={18}
            color={
              isDisabled
                ? COLORS.Gray
                : variant === "whatsapp"
                  ? COLORS.primary
                  : COLORS.primary
            }
          />
        )}
      </View>

      <Text
        style={[styles.actionLabel, isDisabled && styles.actionLabelDisabled]}
      >
        {active ? "En cours..." : label}
      </Text>
    </Pressable>
  );
}

export function InvoiceActions({
  onPrint,
  onShare,
  onSave,
  onWhatsApp,
  activeAction = null,
  disabled = false,
}: InvoiceActionsProps) {
  const isProcessing = activeAction !== null;

  const isDisabled = disabled || isProcessing;

  return (
    <View style={styles.container}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="ellipsis-horizontal-circle-outline"
            size={17}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Actions</Text>

          <Text style={styles.subtitle}>
            Imprimez, partagez ou envoyez cette facture
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* ACTIONS                                            */}
      {/* ================================================== */}

      <View style={styles.actions}>
        <ActionButton
          icon="print-outline"
          label="Imprimer"
          onPress={onPrint}
          active={activeAction === "print"}
          disabled={isDisabled}
        />

        <ActionButton
          icon="share-outline"
          label="Partager"
          onPress={onShare}
          active={activeAction === "share"}
          disabled={isDisabled}
        />

        <ActionButton
          icon="download-outline"
          label="Enregistrer"
          onPress={onSave}
          active={activeAction === "save"}
          disabled={isDisabled}
        />

        <ActionButton
          icon="logo-whatsapp"
          label="WhatsApp"
          onPress={onWhatsApp}
          active={activeAction === "whatsapp"}
          disabled={isDisabled}
          variant="whatsapp"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ========================================================
  // HEADER
  // ========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  headerContent: {
    flex: 1,
    marginLeft: 9,
  },

  title: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ========================================================
  // ACTIONS
  // ========================================================

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  actionButton: {
    flexGrow: 1,
    flexBasis: "46%",
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9F6",
    borderWidth: 1,
    borderColor: "#E5E8E2",
  },

  whatsappButton: {
    backgroundColor: "#F1F8EF",
    borderColor: "#D9EAD4",
  },

  actionButtonDisabled: {
    opacity: 0.65,
  },

  actionButtonPressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  whatsappIconContainer: {
    backgroundColor: "#E1F0DC",
  },

  iconContainerDisabled: {
    backgroundColor: "#ECEDEB",
  },

  actionLabel: {
    marginTop: 5,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.text,
    textAlign: "center",
  },

  actionLabelDisabled: {
    color: COLORS.Gray,
  },
});
