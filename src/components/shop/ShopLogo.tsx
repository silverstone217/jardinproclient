import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, fonts } from "@/utils/styles";

interface ShopLogoProps {
  logo: string | null;
  name: string;
  editable?: boolean;
  isUploading?: boolean;
  onImageSelected: (uri: string) => Promise<void>;
  onRemove: () => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function ShopLogo({
  logo,
  name,
  editable = false,
  isUploading = false,
  onImageSelected,
  onRemove,
}: ShopLogoProps) {
  const pickImage = async () => {
    if (isUploading || !editable) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à votre galerie pour modifier le logo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 7],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      Alert.alert(
        "Image trop volumineuse",
        "Le logo doit faire moins de 2 Mo.",
      );
      return;
    }

    try {
      await onImageSelected(asset.uri);
    } catch {}
  };

  const confirmRemove = () => {
    Alert.alert(
      "Supprimer le logo",
      "Le logo actuel sera supprimé de votre boutique.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: onRemove,
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        {logo ? (
          <ImageBackground
            source={{ uri: logo }}
            style={styles.background}
            imageStyle={styles.backgroundImage}
          >
            <View style={styles.overlay} />
          </ImageBackground>
        ) : (
          <View style={styles.emptyBackground}>
            <MaterialCommunityIcons
              name="store-outline"
              size={76}
              color="rgba(255,255,255,0.18)"
            />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.logoCircle}>
            {logo ? (
              <ImageBackground
                source={{ uri: logo }}
                style={styles.logoImage}
                imageStyle={styles.logoImageStyle}
              />
            ) : (
              <MaterialCommunityIcons
                name="store-outline"
                size={38}
                color={COLORS.primary}
              />
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.shopLabel} numberOfLines={1}>
              MA BOUTIQUE
            </Text>

            <Text style={styles.shopName} numberOfLines={2}>
              {name || "Votre boutique"}
            </Text>
          </View>
        </View>

        {editable && (
          <Pressable
            style={({ pressed }) => [
              styles.cameraButton,
              pressed && styles.pressed,
            ]}
            onPress={pickImage}
            disabled={isUploading}
          >
            <MaterialCommunityIcons
              name={isUploading ? "loading" : "camera-outline"}
              size={20}
              color={COLORS.white}
            />
          </Pressable>
        )}
      </View>

      {editable && logo && (
        <Pressable
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.pressed,
          ]}
          onPress={confirmRemove}
          disabled={isUploading}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={17}
            color={COLORS.error}
          />

          <Text style={styles.removeText}>Supprimer le logo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  banner: {
    height: 190,
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    position: "relative",
  },

  background: {
    ...StyleSheet.absoluteFill,
  },

  backgroundImage: {
    opacity: 0.95,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 45, 17, 0.62)",
  },

  emptyBackground: {
    ...StyleSheet.absoluteFill,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 28,
    backgroundColor: COLORS.primary,
  },

  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 25,
  },

  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
  },

  logoImage: {
    width: "100%",
    height: "100%",
  },

  logoImageStyle: {
    resizeMode: "cover",
  },

  info: {
    flex: 1,
    marginLeft: 17,
  },

  shopLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: "rgba(255,255,255,0.72)",
  },

  shopName: {
    marginTop: 5,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    color: COLORS.white,
  },

  cameraButton: {
    position: "absolute",
    right: 17,
    top: 17,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  removeButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
    paddingVertical: 5,
  },

  removeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.error,
  },

  pressed: {
    opacity: 0.65,
  },
});
