import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { OrderStep } from "@/types/order";
import { COLORS, fonts } from "@/utils/styles";

interface OrderResumeCardProps {
  currentStep: OrderStep;
  onResume: () => void;
}

interface StepInfo {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  buttonLabel: string;
}

const STEP_INFO: Record<Exclude<OrderStep, "PRODUCTS">, StepInfo> = {
  CUSTOMER: {
    icon: "person-outline",
    title: "Client à identifier",
    description:
      "Votre commande a été interrompue avant l'identification du client.",
    buttonLabel: "Continuer la commande",
  },

  LOYALTY: {
    icon: "gift-outline",
    title: "Fidélité à terminer",
    description:
      "Votre commande a été interrompue pendant la gestion des points de fidélité.",
    buttonLabel: "Reprendre la commande",
  },

  PREVIEW: {
    icon: "receipt-outline",
    title: "Commande prête à valider",
    description:
      "Votre commande est prête. Il reste à vérifier les informations et effectuer la validation.",
    buttonLabel: "Voir la commande",
  },
};

export function OrderResumeCard({
  currentStep,
  onResume,
}: OrderResumeCardProps) {
  if (currentStep === "PRODUCTS") {
    return null;
  }

  const stepInfo = STEP_INFO[currentStep as Exclude<OrderStep, "PRODUCTS">];

  if (!stepInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={stepInfo.icon} size={20} color={COLORS.primary} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.eyebrow}>COMMANDE EN COURS</Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>Non terminée</Text>
            </View>
          </View>

          <Text style={styles.title}>{stepInfo.title}</Text>

          <Text style={styles.description}>{stepInfo.description}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Pressable
        style={({ pressed }) => [
          styles.resumeButton,
          pressed && styles.resumeButtonPressed,
        ]}
        onPress={onResume}
      >
        <Text style={styles.resumeButtonText}>{stepInfo.buttonLabel}</Text>

        <Ionicons name="arrow-forward" size={17} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFDF6",
    borderWidth: 1,
    borderColor: "#F1E5B9",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4EBC9",
  },

  content: {
    flex: 1,
    marginLeft: 11,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  eyebrow: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.1,
    color: "#8A6B12",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#FFF4CC",
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
    backgroundColor: "#C28A00",
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: "#8A6B12",
  },

  title: {
    marginTop: 5,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  description: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F0E7C7",
  },

  resumeButton: {
    minHeight: 43,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  resumeButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  resumeButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.white,
  },
});
