import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useProductStore } from "@/store/product.store";

import { COLORS, fonts } from "@/utils/styles";

import type { Product } from "@/types/product";

interface ProductActionsProps {
  product: Product;
  disabled?: boolean;
}

export function ProductActions({
  product,
  disabled = false,
}: ProductActionsProps) {
  const { deleteProduct, isDeleting } = useProductStore();

  const isBusy = disabled || isDeleting;

  // ============================================================
  // SUPPRESSION
  // ============================================================

  const handleDelete = () => {
    if (isBusy) {
      return;
    }

    Alert.alert(
      "Supprimer le produit",
      `Voulez-vous vraiment supprimer « ${product.name} » ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteProduct(product.id);

              if (result.deactivated) {
                Alert.alert(
                  "Produit désactivé",
                  "Ce produit possède déjà un historique. Il a donc été désactivé au lieu d'être supprimé définitivement.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        router.back();
                      },
                    },
                  ],
                );

                return;
              }

              Alert.alert(
                "Produit supprimé",
                "Le produit a été supprimé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.back();
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Erreur suppression produit :", error);

              Alert.alert(
                "Erreur",
                "Impossible de supprimer ce produit. Veuillez réessayer.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Gestion du produit</Text>

          <Text style={styles.subtitle}>
            Actions disponibles pour ce produit.
          </Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* PRODUCT STATUS                                         */}
      {/* ====================================================== */}

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIcon,
            product.isActive
              ? styles.statusIconActive
              : styles.statusIconInactive,
          ]}
        >
          <Ionicons
            name={
              product.isActive
                ? "checkmark-circle-outline"
                : "pause-circle-outline"
            }
            size={18}
            color={product.isActive ? COLORS.success : COLORS.Gray}
          />
        </View>

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {product.isActive ? "Produit actif" : "Produit inactif"}
          </Text>

          <Text style={styles.statusDescription}>
            {product.isActive
              ? "Ce produit peut être utilisé dans les opérations de vente."
              : "Ce produit n'est plus disponible dans les opérations courantes."}
          </Text>
        </View>
      </View>

      {/* ====================================================== */}
      {/* DELETE                                                 */}
      {/* ====================================================== */}

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          isBusy && styles.deleteButtonDisabled,
          pressed && !isBusy && styles.deleteButtonPressed,
        ]}
        onPress={handleDelete}
        disabled={isBusy}
      >
        <View style={styles.deleteIcon}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          )}
        </View>

        <View style={styles.deleteContent}>
          <Text style={styles.deleteTitle}>
            {isDeleting ? "Suppression en cours..." : "Supprimer le produit"}
          </Text>

          <Text style={styles.deleteDescription}>
            {isDeleting
              ? "Veuillez patienter."
              : "Cette action peut désactiver le produit s'il possède déjà un historique."}
          </Text>
        </View>

        {!isDeleting && (
          <Ionicons name="chevron-forward" size={18} color={COLORS.error} />
        )}
      </Pressable>

      {/* ====================================================== */}
      {/* INFO                                                   */}
      {/* ====================================================== */}

      <View style={styles.info}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={COLORS.Gray}
        />

        <Text style={styles.infoText}>
          La suppression définitive n'est possible que lorsqu'aucun historique
          n'est associé au produit.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  statusIconActive: {
    backgroundColor: "#EAF6EA",
  },

  statusIconInactive: {
    backgroundColor: "#F1F1F1",
  },

  statusContent: {
    flex: 1,
    marginLeft: 10,
  },

  statusTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  statusDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // DELETE
  // ==========================================================

  deleteButton: {
    marginTop: 14,
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#F7DCDC",
    flexDirection: "row",
    alignItems: "center",
  },

  deleteButtonDisabled: {
    opacity: 0.55,
  },

  deleteButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  deleteIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  deleteContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  deleteTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.error,
  },

  deleteDescription: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#B56A6A",
  },

  // ==========================================================
  // INFO
  // ==========================================================

  info: {
    marginTop: 12,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.Gray,
  },
});
