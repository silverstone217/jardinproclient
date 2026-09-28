import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

type CustomerEmptyVariant = "no-customers" | "no-results" | "no-point-of-sale";

interface CustomerEmptyProps {
  variant?: CustomerEmptyVariant;
  search?: string;
}

interface EmptyContent {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function CustomerEmpty({
  variant = "no-customers",
  search = "",
}: CustomerEmptyProps) {
  const getContent = (): EmptyContent => {
    switch (variant) {
      case "no-point-of-sale":
        return {
          icon: "storefront-outline",
          title: "Aucun point de vente affecté",
          description:
            "Vous n'êtes actuellement affecté à aucun point de vente. Les informations clients sont accessibles uniquement depuis un point de vente auquel vous êtes affecté.",
        };

      case "no-results":
        return {
          icon: "search-outline",
          title: "Aucun client trouvé",
          description: search.trim()
            ? `Aucun client ne correspond à « ${search.trim()} ».`
            : "Aucun client ne correspond à votre recherche.",
        };

      case "no-customers":
      default:
        return {
          icon: "people-outline",
          title: "Aucun client",
          description:
            "Aucun client n'est encore enregistré pour ce point de vente.",
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.iconBackground}>
          <Ionicons name={content.icon} size={31} color={COLORS.primary} />
        </View>
      </View>

      <Text style={styles.title}>{content.title}</Text>

      <Text style={styles.description}>{content.description}</Text>

      {variant === "no-point-of-sale" && (
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={COLORS.info}
            />
          </View>

          <Text style={styles.infoText}>
            Contactez votre responsable pour qu'il vous affecte à un point de
            vente.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 42,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // ICON
  // ==========================================================

  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconBackground: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  // ==========================================================
  // TEXT
  // ==========================================================

  title: {
    marginTop: 17,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    maxWidth: 310,
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoBox: {
    width: "100%",
    maxWidth: 330,
    marginTop: 18,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF4FB",
    borderWidth: 1,
    borderColor: "#DCE9F6",
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1EFFB",
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#496A88",
  },
});
