import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePackagingStore } from "@/store/packaging.store";
import { useProductStore } from "@/store/product.store";
import { useRecipeStore } from "@/store/recipe.store";
import { COLORS, fonts } from "@/utils/styles";

interface VariantForm {
  packagingId: string;
  sku: string;
  price: string;
  shelfLifeDays: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const createEmptyVariant = (): VariantForm => ({
  packagingId: "",
  sku: "",
  price: "",
  shelfLifeDays: "2",
});

export default function NewProductScreen() {
  const { createProduct, updateProductImage, isCreating, isUploadingImage } =
    useProductStore();

  const { recipes, initialize: initializeRecipes } = useRecipeStore();

  const { packagings, initialize: initializePackagings } = usePackagingStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);

  const [variants, setVariants] = useState<VariantForm[]>([
    createEmptyVariant(),
  ]);

  useFocusEffect(
    useCallback(() => {
      initializeRecipes();
      initializePackagings();
    }, [initializeRecipes, initializePackagings]),
  );

  const isBusy = isCreating || isUploadingImage || isCheckingImage;

  // ============================================================
  // IMAGE
  // ============================================================

  const handlePickImage = async () => {
    if (isBusy) {
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
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];

      setIsCheckingImage(true);

      let fileSize = asset.fileSize;

      /*
       * Certains environnements peuvent ne pas
       * fournir fileSize directement.
       *
       * On vérifie donc réellement le fichier local.
       */
      if (fileSize === undefined || fileSize === null) {
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          fileSize = blob.size;
        } catch (error) {
          console.warn(
            "Impossible de déterminer la taille de l'image :",
            error,
          );
        }
      }

      setIsCheckingImage(false);

      if (
        fileSize !== undefined &&
        fileSize !== null &&
        fileSize > MAX_IMAGE_SIZE
      ) {
        const sizeInMb = (fileSize / (1024 * 1024)).toFixed(2);

        Alert.alert(
          "Image trop volumineuse",
          `Cette image fait ${sizeInMb} Mo.\n\nLa taille maximale autorisée est de 2 Mo.`,
        );

        return;
      }

      setImageUri(asset.uri);
      setImageSize(fileSize ?? null);
    } catch (error) {
      setIsCheckingImage(false);

      console.error("Erreur sélection image produit :", error);

      Alert.alert("Erreur", "Impossible de sélectionner cette image.");
    }
  };

  const handleRemoveImage = () => {
    if (isBusy) {
      return;
    }

    setImageUri(null);
    setImageSize(null);
  };

  // ============================================================
  // VARIANTES
  // ============================================================

  const updateVariant = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    const activePackagings = packagings.filter(
      (packaging) => packaging.isActive,
    );

    if (variants.length >= 2) {
      Alert.alert(
        "Limite atteinte",
        "Un produit peut avoir au maximum deux variantes.",
      );
      return;
    }

    if (activePackagings.length <= variants.length) {
      Alert.alert(
        "Aucun autre format",
        "Il n'y a pas d'autre emballage actif disponible pour cette variante.",
      );
      return;
    }

    setVariants((current) => [...current, createEmptyVariant()]);
  };

  // pour plus tard
  //   const addVariant = () => {
  //   const activePackagings = packagings.filter(
  //     (packaging) => packaging.isActive,
  //   );

  //   if (activePackagings.length <= variants.length) {
  //     Alert.alert(
  //       "Aucun autre format",
  //       "Il n'y a plus d'emballage actif disponible pour cette variante.",
  //     );
  //     return;
  //   }

  //   setVariants((current) => [
  //     ...current,
  //     createEmptyVariant(),
  //   ]);
  // };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      Alert.alert(
        "Variante requise",
        "Un produit doit avoir au moins une variante.",
      );
      return;
    }

    setVariants((current) =>
      current.filter((_, variantIndex) => variantIndex !== index),
    );
  };

  // ============================================================
  // CREATION
  // ============================================================

  const handleCreate = async () => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      Alert.alert("Nom requis", "Veuillez saisir le nom du produit.");
      return;
    }

    const invalidVariant = variants.find(
      (variant) =>
        !variant.packagingId.trim() ||
        !variant.sku.trim() ||
        !variant.price.trim(),
    );

    if (invalidVariant) {
      Alert.alert(
        "Variantes incomplètes",
        "Veuillez compléter toutes les informations des variantes.",
      );
      return;
    }

    if (invalidVariant) {
      Alert.alert(
        "Variantes incomplètes",
        "Veuillez choisir un emballage et compléter le SKU et le prix pour chaque variante.",
      );
      return;
    }

    const parsedVariants = variants.map((variant) => ({
      packagingId: variant.packagingId.trim(),
      sku: variant.sku.trim(),
      price: Number(variant.price.replace(",", ".")),
      shelfLifeDays: Number(variant.shelfLifeDays),
      isActive: true,
    }));

    if (
      parsedVariants.some(
        (variant) => !Number.isFinite(variant.price) || variant.price <= 0,
      )
    ) {
      Alert.alert("Prix invalide", "Chaque prix doit être supérieur à 0.");
      return;
    }

    if (
      parsedVariants.some(
        (variant) =>
          !Number.isInteger(variant.shelfLifeDays) || variant.shelfLifeDays < 1,
      )
    ) {
      Alert.alert(
        "Conservation invalide",
        "La durée de conservation doit être d'au moins 1 jour.",
      );
      return;
    }

    try {
      // --------------------------------------------------------
      // 1. Création du produit
      // --------------------------------------------------------

      const product = await createProduct({
        name: cleanName,
        description: description.trim(),
        recipeId: recipeId || undefined,
        isActive: true,
        variants: parsedVariants,
      });

      // --------------------------------------------------------
      // 2. Upload de l'image
      // --------------------------------------------------------

      if (imageUri) {
        try {
          await updateProductImage(product.id, imageUri);
        } catch (imageError) {
          console.error("Erreur upload image produit :", imageError);

          Alert.alert(
            "Produit créé",
            "Le produit a bien été créé, mais son image n'a pas pu être envoyée. Vous pourrez l'ajouter depuis sa fiche.",
            [
              {
                text: "OK",
                onPress: () =>
                  router.replace(`/(main)/settings/products/${product.id}`),
              },
            ],
          );

          return;
        }
      }

      // --------------------------------------------------------
      // 3. Ouvrir la fiche du produit
      // --------------------------------------------------------

      router.replace(`/(main)/settings/products/${product.id}`);
    } catch (error) {
      Alert.alert(
        "Création impossible",
        error instanceof Error
          ? error.message
          : "Impossible de créer le produit.",
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            disabled={isBusy}
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>CATALOGUE</Text>

            <Text style={styles.title}>Nouveau produit</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================================================== */}
          {/* IMAGE                                             */}
          {/* ================================================== */}

          <View style={styles.imageSection}>
            <View style={styles.imageHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="image-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.imageHeaderText}>
                <Text style={styles.sectionTitle}>Image du produit</Text>

                <Text style={styles.sectionSubtitle}>
                  Une belle image pour votre catalogue.
                </Text>
              </View>
            </View>

            <View style={styles.imageArea}>
              {imageUri ? (
                <View style={styles.previewWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />

                  <View style={styles.imageOverlay}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.imageAction,
                        pressed && styles.imageActionPressed,
                      ]}
                      onPress={handlePickImage}
                      disabled={isBusy}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={17}
                        color={COLORS.white}
                      />

                      <Text style={styles.imageActionText}>Modifier</Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.imageAction,
                        styles.imageDeleteAction,
                        pressed && styles.imageActionPressed,
                      ]}
                      onPress={handleRemoveImage}
                      disabled={isBusy}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={COLORS.white}
                      />

                      <Text style={styles.imageActionText}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.imagePicker,
                    pressed && styles.imagePickerPressed,
                  ]}
                  onPress={handlePickImage}
                  disabled={isBusy}
                >
                  <View style={styles.imagePickerIcon}>
                    {isCheckingImage ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons
                        name="cloud-upload-outline"
                        size={27}
                        color={COLORS.primary}
                      />
                    )}
                  </View>

                  <Text style={styles.imagePickerTitle}>
                    {isCheckingImage ? "Vérification..." : "Ajouter une image"}
                  </Text>

                  <Text style={styles.imagePickerSubtitle}>
                    JPG, PNG ou WEBP
                  </Text>

                  <View style={styles.imageSizeBadge}>
                    <Ionicons
                      name="resize-outline"
                      size={13}
                      color={COLORS.Gray}
                    />

                    <Text style={styles.imageSizeText}>2 Mo maximum</Text>
                  </View>
                </Pressable>
              )}
            </View>

            {imageUri && (
              <View style={styles.selectedImageInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={COLORS.success}
                />

                <Text style={styles.selectedImageText}>
                  Image sélectionnée
                  {imageSize
                    ? ` · ${(imageSize / (1024 * 1024)).toFixed(1)} Mo`
                    : ""}
                </Text>
              </View>
            )}

            <Text style={styles.imageHint}>
              L'image sera envoyée après la création du produit.
            </Text>
          </View>

          {/* ================================================== */}
          {/* INFORMATIONS                                     */}
          {/* ================================================== */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>Informations</Text>

                <Text style={styles.sectionSubtitle}>
                  Présentez votre produit.
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Nom du produit</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex. Anaïs"
              placeholderTextColor={COLORS.Gray}
              style={styles.input}
              maxLength={80}
              editable={!isBusy}
            />

            <Text style={styles.label}>Description</Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez brièvement le produit..."
              placeholderTextColor={COLORS.Gray}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              maxLength={500}
              editable={!isBusy}
            />
          </View>

          {/* ================================================== */}
          {/* VARIANTES                                          */}
          {/* ================================================== */}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.variantIcon]}>
                  <Ionicons
                    name="layers-outline"
                    size={19}
                    color={COLORS.secondary}
                  />
                </View>

                <View>
                  <Text style={styles.sectionTitle}>
                    Formats et conservation
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Choisissez le format et indiquez sa durée de conservation.
                  </Text>
                </View>
              </View>

              <Text style={styles.counter}>{variants.length}/2</Text>
            </View>

            {variants.map((variant, index) => (
              <View key={index} style={styles.variantCard}>
                {/* HEADER VARIANTE */}
                <View style={styles.variantHeader}>
                  <View style={styles.variantNumber}>
                    <Text style={styles.variantNumberText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.variantTitle}>Variante {index + 1}</Text>

                  {variants.length > 1 && (
                    <Pressable
                      onPress={() => removeVariant(index)}
                      hitSlop={8}
                      disabled={isBusy}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.error}
                      />
                    </Pressable>
                  )}
                </View>

                {/* EMBALLAGE */}
                <Text style={styles.label}>Format de bouteille</Text>

                <View style={styles.packagingOptions}>
                  {packagings
                    .filter((packaging) => packaging.isActive)
                    .map((packaging) => {
                      const isSelected = variant.packagingId === packaging.id;

                      return (
                        <Pressable
                          key={packaging.id}
                          style={({ pressed }) => [
                            styles.packagingOption,
                            isSelected && styles.packagingOptionSelected,
                            pressed && styles.packagingOptionPressed,
                          ]}
                          onPress={() =>
                            updateVariant(index, "packagingId", packaging.id)
                          }
                          disabled={isBusy}
                        >
                          <View
                            style={[
                              styles.packagingIcon,
                              isSelected && styles.packagingIconSelected,
                            ]}
                          >
                            <Ionicons
                              name="flask-outline"
                              size={18}
                              color={isSelected ? COLORS.primary : COLORS.Gray}
                            />
                          </View>

                          <View style={styles.packagingContent}>
                            <Text
                              style={[
                                styles.packagingName,
                                isSelected && styles.packagingNameSelected,
                              ]}
                              numberOfLines={1}
                            >
                              {packaging.name}
                            </Text>

                            <Text style={styles.packagingCapacity}>
                              {packaging.capacityMl} ml
                            </Text>
                          </View>

                          <Ionicons
                            name={
                              isSelected
                                ? "checkmark-circle"
                                : "ellipse-outline"
                            }
                            size={21}
                            color={
                              isSelected ? COLORS.primary : COLORS.lightGray
                            }
                          />
                        </Pressable>
                      );
                    })}
                </View>

                {packagings.filter((packaging) => packaging.isActive).length ===
                  0 && (
                  <View style={styles.noPackaging}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={COLORS.warning}
                    />

                    <Text style={styles.noPackagingText}>
                      Aucun emballage actif n'est disponible. Ajoutez d'abord un
                      emballage dans les paramètres.
                    </Text>
                  </View>
                )}

                {/* SKU + PRIX */}
                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <Text style={styles.label}>SKU</Text>

                    <TextInput
                      value={variant.sku}
                      onChangeText={(value) =>
                        updateVariant(index, "sku", value)
                      }
                      placeholder="ANAIS-200"
                      placeholderTextColor={COLORS.Gray}
                      style={styles.input}
                      autoCapitalize="characters"
                      editable={!isBusy}
                    />
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Prix</Text>

                    <TextInput
                      value={variant.price}
                      onChangeText={(value) =>
                        updateVariant(index, "price", value)
                      }
                      placeholder="2500"
                      placeholderTextColor={COLORS.Gray}
                      style={styles.input}
                      keyboardType="decimal-pad"
                      editable={!isBusy}
                    />
                  </View>
                </View>

                {/* CONSERVATION */}
                <Text style={styles.label}>Durée de conservation</Text>

                <View style={styles.shelfLifeRow}>
                  <View style={styles.shelfLifeInputWrapper}>
                    <TextInput
                      value={variant.shelfLifeDays}
                      onChangeText={(value) =>
                        updateVariant(index, "shelfLifeDays", value)
                      }
                      placeholder="2"
                      placeholderTextColor={COLORS.Gray}
                      style={styles.input}
                      keyboardType="number-pad"
                      editable={!isBusy}
                    />
                  </View>

                  <View style={styles.daysBadge}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={COLORS.primary}
                    />

                    <Text style={styles.daysBadgeText}>jours</Text>
                  </View>
                </View>

                <Text style={styles.helper}>
                  Durée pendant laquelle le produit peut être vendu avant
                  expiration.
                </Text>
              </View>
            ))}

            {variants.length < 2 && (
              <Pressable
                style={({ pressed }) => [
                  styles.addVariantButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={addVariant}
                disabled={
                  isBusy ||
                  packagings.filter((packaging) => packaging.isActive).length <=
                    variants.length
                }
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.addVariantText}>Ajouter une variante</Text>
              </Pressable>
            )}
          </View>

          {/* ================================================== */}
          {/* RECETTE                                           */}
          {/* ================================================== */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, styles.recipeIcon]}>
                <Ionicons
                  name="flask-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>Recette</Text>

                <Text style={styles.sectionSubtitle}>
                  Associez une recette au produit.
                </Text>
              </View>
            </View>

            <View style={styles.recipeOptions}>
              <Pressable
                style={[
                  styles.recipeOption,
                  !recipeId && styles.recipeOptionSelected,
                ]}
                onPress={() => setRecipeId("")}
                disabled={isBusy}
              >
                <Ionicons
                  name={!recipeId ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={!recipeId ? COLORS.primary : COLORS.lightGray}
                />

                <View style={styles.recipeOptionContent}>
                  <Text style={styles.recipeOptionTitle}>Aucune recette</Text>

                  <Text style={styles.recipeOptionText}>
                    La recette pourra être ajoutée plus tard.
                  </Text>
                </View>
              </Pressable>

              {recipes.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={[
                    styles.recipeOption,
                    recipeId === recipe.id && styles.recipeOptionSelected,
                  ]}
                  onPress={() => setRecipeId(recipe.id)}
                  disabled={isBusy}
                >
                  <Ionicons
                    name={
                      recipeId === recipe.id
                        ? "checkmark-circle"
                        : "ellipse-outline"
                    }
                    size={20}
                    color={
                      recipeId === recipe.id ? COLORS.primary : COLORS.lightGray
                    }
                  />

                  <View style={styles.recipeOptionContent}>
                    <Text style={styles.recipeOptionTitle}>{recipe.name}</Text>

                    <Text style={styles.recipeOptionText}>
                      {recipe.items.length} ingrédients
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ================================================== */}
          {/* CREATE                                             */}
          {/* ================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              isBusy && styles.createButtonDisabled,
              pressed && !isBusy && styles.buttonPressed,
            ]}
            onPress={handleCreate}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={COLORS.white}
              />
            )}

            <Text style={styles.createButtonText}>
              {isCreating
                ? "Création du produit..."
                : isUploadingImage
                  ? "Envoi de l'image..."
                  : isCheckingImage
                    ? "Vérification de l'image..."
                    : "Créer le produit"}
            </Text>
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  headerText: {
    marginLeft: 12,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  title: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 21,
    color: COLORS.text,
  },

  content: {
    paddingHorizontal: 20,
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageSection: {
    marginBottom: 16,
    padding: 17,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  imageHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageHeaderText: {
    flex: 1,
  },

  imageArea: {
    marginTop: 15,
  },

  imagePicker: {
    minHeight: 220,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#B9CBB5",
    backgroundColor: "#F8FBF7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  imagePickerPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  imagePickerIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
    marginBottom: 13,
  },

  imagePickerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  imagePickerSubtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  imageSizeBadge: {
    marginTop: 11,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F0ED",
  },

  imageSizeText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  previewWrapper: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F0F0ED",
  },

  imagePreview: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    gap: 8,
  },

  imageAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(45, 90, 39, 0.92)",
  },

  imageDeleteAction: {
    backgroundColor: "rgba(244, 67, 54, 0.92)",
  },

  imageActionPressed: {
    opacity: 0.65,
  },

  imageActionText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.white,
  },

  selectedImageInfo: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  selectedImageText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: COLORS.success,
  },

  imageHint: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  // ==========================================================
  // SECTIONS
  // ==========================================================

  section: {
    marginBottom: 16,
    padding: 17,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantIcon: {
    backgroundColor: "#FFF3E2",
  },

  recipeIcon: {
    backgroundColor: "#F1EAF7",
  },

  sectionTitle: {
    marginLeft: 10,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginLeft: 10,
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  counter: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  // ==========================================================
  // INPUTS
  // ==========================================================

  label: {
    marginTop: 16,
    marginBottom: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  input: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E7E4",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },

  // ==========================================================
  // VARIANTS
  // ==========================================================

  variantCard: {
    marginTop: 15,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECECE8",
  },

  variantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  variantNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantNumberText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  variantTitle: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  helper: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  addVariantButton: {
    minHeight: 44,
    marginTop: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#B9CBB5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  addVariantText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  //

  packagingOptions: {
    marginTop: 2,
    gap: 8,
  },

  packagingOption: {
    minHeight: 64,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  packagingOptionSelected: {
    borderColor: "#B8D0B2",
    backgroundColor: "#F4F8F2",
  },

  packagingOptionPressed: {
    opacity: 0.65,
  },

  packagingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F0",
  },

  packagingIconSelected: {
    backgroundColor: "#E5F0E2",
  },

  packagingContent: {
    flex: 1,
    marginLeft: 10,
  },

  packagingName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  packagingNameSelected: {
    color: COLORS.primary,
  },

  packagingCapacity: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  noPackaging: {
    marginTop: 10,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  noPackagingText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: "#806B25",
  },

  shelfLifeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  shelfLifeInputWrapper: {
    flex: 1,
  },

  daysBadge: {
    height: 44,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#EAF2E7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  daysBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.primary,
  },

  // ==========================================================
  // RECIPES
  // ==========================================================

  recipeOptions: {
    marginTop: 15,
  },

  recipeOption: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  recipeOptionSelected: {
    borderColor: "#B8D0B2",
    backgroundColor: "#F4F8F2",
  },

  recipeOptionContent: {
    flex: 1,
    marginLeft: 9,
  },

  recipeOptionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  recipeOptionText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  createButton: {
    minHeight: 53,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: COLORS.primary,
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  pressed: {
    opacity: 0.55,
  },

  bottomSpace: {
    height: 100,
  },
});
