import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useProductStore } from "@/store/product.store";
import { COLORS, fonts } from "@/utils/styles";

interface ProductImageProps {
  productId: string;
  image: string | null;
  productName: string;
  disabled?: boolean;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function ProductImage({
  productId,
  image,
  productName,
  disabled = false,
}: ProductImageProps) {
  const { updateProductImage, removeProductImage, isUploadingImage } =
    useProductStore();

  const handlePickImage = async () => {
    if (disabled || isUploadingImage) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès à vos photos pour ajouter une image au produit.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];

      if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
        const sizeInMb = (asset.fileSize / (1024 * 1024)).toFixed(1);

        Alert.alert(
          "Image trop volumineuse",
          `Cette image fait ${sizeInMb} Mo. La taille maximale autorisée est de 2 Mo.`,
        );

        return;
      }

      await updateProductImage(productId, asset.uri);
    } catch (error) {
      console.error("Erreur sélection image produit :", error);

      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible de modifier l'image du produit.",
      );
    }
  };

  const handleRemoveImage = () => {
    if (disabled || isUploadingImage) {
      return;
    }

    Alert.alert(
      "Supprimer l'image",
      `Voulez-vous vraiment supprimer l'image de « ${productName} » ?`,
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
              await removeProductImage(productId);
            } catch (error) {
              console.error("Erreur suppression image produit :", error);

              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Impossible de supprimer l'image du produit.",
              );
            }
          },
        },
      ],
    );
  };

  const renderImageContent = () => {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Image du produit ${productName}`}
        />
      );
    }

    return (
      <View style={styles.emptyImage}>
        <View style={styles.emptyIcon}>
          <Ionicons name="image-outline" size={34} color={COLORS.primary} />
        </View>

        <Text style={styles.emptyTitle}>Aucune image</Text>

        <Text style={styles.emptySubtitle}>Ajoutez une photo du produit</Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="image-outline" size={19} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Image du produit</Text>

          <Text style={styles.subtitle}>
            Une belle image aide à identifier rapidement le produit.
          </Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* IMAGE                                              */}
      {/* ================================================== */}

      <View style={styles.imageContainer}>
        {renderImageContent()}

        {isUploadingImage && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={COLORS.white} />

              <Text style={styles.loadingText}>Enregistrement...</Text>
            </View>
          </View>
        )}

        {image && !isUploadingImage && (
          <View style={styles.imageBadge}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={COLORS.success}
            />

            <Text style={styles.imageBadgeText}>Image ajoutée</Text>
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* INFO                                               */}
      {/* ================================================== */}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="crop-outline" size={15} color={COLORS.Gray} />

          <Text style={styles.infoText}>Format carré recommandé</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="document-outline" size={15} color={COLORS.Gray} />

          <Text style={styles.infoText}>2 Mo maximum</Text>
        </View>
      </View>

      {/* ================================================== */}
      {/* ACTIONS                                            */}
      {/* ================================================== */}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            disabled && styles.buttonDisabled,
            pressed && !disabled && styles.buttonPressed,
          ]}
          onPress={handlePickImage}
          disabled={disabled || isUploadingImage}
        >
          <Ionicons
            name={image ? "create-outline" : "cloud-upload-outline"}
            size={17}
            color={COLORS.white}
          />

          <Text style={styles.primaryButtonText}>
            {image ? "Modifier l'image" : "Ajouter une image"}
          </Text>
        </Pressable>

        {image && (
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              disabled && styles.deleteButtonDisabled,
              pressed && !disabled && styles.buttonPressed,
            ]}
            onPress={handleRemoveImage}
            disabled={disabled || isUploadingImage}
          >
            <Ionicons name="trash-outline" size={17} color={COLORS.error} />

            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: COLORS.Gray,
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    marginTop: 17,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#F4F5F2",
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F4F5F2",
  },

  emptyImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7F8F5",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  emptyTitle: {
    marginTop: 13,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  emptySubtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(45, 90, 39, 0.68)",
  },

  loadingBox: {
    minWidth: 145,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 55, 27, 0.88)",
  },

  loadingText: {
    marginTop: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  // ==========================================================
  // IMAGE BADGE
  // ==========================================================

  imageBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },

  imageBadgeText: {
    marginLeft: 5,
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: COLORS.success,
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
    paddingHorizontal: 2,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    marginLeft: 5,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ACTIONS
  // ==========================================================

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 9,
  },

  primaryButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  deleteButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F5D2D2",
  },

  deleteButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.error,
  },

  // ==========================================================
  // DISABLED / PRESSED
  // ==========================================================

  buttonDisabled: {
    opacity: 0.55,
  },

  deleteButtonDisabled: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});
