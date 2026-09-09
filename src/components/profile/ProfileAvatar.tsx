import { COLORS, fonts, fontSizes } from "@/utils/styles";
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
interface ProfileAvatarProps {
  image: string | null;
  name: string;
  isUploading: boolean;
  onImageSelected: (imageUri: string) => Promise<void>;
  onRemoveImage: () => Promise<void>;
}
export function ProfileAvatar({
  image,
  name,
  isUploading,
  onImageSelected,
  onRemoveImage,
}: ProfileAvatarProps) {
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission requise",
          "Autorisez l'accès à vos photos pour modifier votre photo de profil.",
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
      await onImageSelected(asset.uri);
    } catch (error) {
      console.error("Erreur sélection photo :", error);
      Alert.alert("Erreur", "Impossible de sélectionner cette image.");
    }
  };
  const handleRemoveImage = () => {
    Alert.alert(
      "Supprimer la photo",
      "Voulez-vous vraiment supprimer votre photo de profil ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await onRemoveImage();
          },
        },
      ],
    );
  };
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <View style={styles.container}>
      <View style={styles.avatarArea}>
        <View style={styles.avatarRing}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.avatar}
              accessibilityLabel={`Photo de profil de ${name}`}
            />
          ) : (
            <View style={styles.placeholder}>
              {initials ? (
                <Text style={styles.initials}> {initials} </Text>
              ) : (
                <Ionicons name="person" size={40} color={COLORS.primary} />
              )}
            </View>
          )}
          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={COLORS.white} />
            </View>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.cameraButton,
            pressed && styles.pressed,
          ]}
          onPress={handlePickImage}
          disabled={isUploading}
          hitSlop={8}
        >
          <Ionicons name="camera" size={18} color={COLORS.white} />
        </Pressable>
      </View>
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle}> Photo de profil </Text>
        <Text style={styles.photoSubtitle}>
          JPG, PNG ou WEBP · 2 Mo maximum
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
          onPress={handlePickImage}
          disabled={isUploading}
        >
          <Ionicons name="image-outline" size={17} color={COLORS.primary} />
          <Text style={styles.actionText}> Modifier </Text>
        </Pressable>
        {image && (
          <>
            <View style={styles.actionDivider} />
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
              onPress={handleRemoveImage}
              disabled={isUploading}
            >
              <Ionicons name="trash-outline" size={17} color={COLORS.error} />
              <Text style={[styles.actionText, styles.deleteText]}>
                Supprimer
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { alignItems: "center" },
  avatarArea: { position: "relative" },
  avatarRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    padding: 4,
    backgroundColor: "#EAF2E7",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 59,
    backgroundColor: COLORS.lightGray,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 59,
    backgroundColor: "#E8F2E5",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxlarge,
    color: COLORS.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    margin: 4,
    borderRadius: 59,
    backgroundColor: "rgba(45, 90, 39, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInfo: { alignItems: "center", marginTop: 14 },
  photoTitle: { fontFamily: fonts.semibold, fontSize: 13, color: COLORS.text },
  photoSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 13 },
  actionButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.primary,
  },
  deleteText: { color: COLORS.error },
  actionDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  pressed: { opacity: 0.55 },
});
