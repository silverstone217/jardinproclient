import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface VariantForm {
  id: string;
  packagingId: string;
  sku: string;
  price: string;
  shelfLifeDays: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VARIANTS = 2;

const createEmptyVariant = (): VariantForm => ({
  id: `${Date.now()}-${Math.random()}`,
  packagingId: "",
  sku: "",
  price: "",
  shelfLifeDays: "2",
});

export default function NewProductScreen() {
  const { createProduct, isCreating } = useProductStore();

  const {
    packagings,
    initialize: initializePackagings,
    isLoading: isLoadingPackagings,
  } = usePackagingStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [imageSize, setImageSize] = useState<number | null>(null);

  const [isCheckingImage, setIsCheckingImage] = useState(false);

  const [variants, setVariants] = useState<VariantForm[]>([
    createEmptyVariant(),
  ]);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      initializePackagings();
    }, [initializePackagings]),
  );

  // ============================================================
  // DONNÉES
  // ============================================================

  const activePackagings = useMemo(
    () => packagings.filter((packaging) => packaging.isActive),
    [packagings],
  );

  // ============================================================
  // IMAGE
  // ============================================================

  const handlePickImage = async () => {
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

      setIsCheckingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      setIsCheckingImage(false);

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

      setImageUri(asset.uri);
      setImageSize(asset.fileSize ?? null);
    } catch (error) {
      setIsCheckingImage(false);

      console.error("Erreur sélection image :", error);

      Alert.alert("Erreur", "Impossible de sélectionner cette image.");
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageSize(null);
  };

  // ============================================================
  // VARIANTES
  // ============================================================

  const updateVariant = (
    id: string,
    field: keyof VariantForm,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) {
      Alert.alert(
        "Limite atteinte",
        `Un produit peut avoir au maximum ${MAX_VARIANTS} variantes.`,
      );

      return;
    }

    setVariants((current) => [...current, createEmptyVariant()]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      Alert.alert(
        "Variante requise",
        "Le produit doit avoir au moins une variante.",
      );

      return;
    }

    setVariants((current) => current.filter((variant) => variant.id !== id));
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      Alert.alert(
        "Nom invalide",
        "Le nom du produit doit contenir au moins 2 caractères.",
      );

      return false;
    }

    if (cleanName.length > 80) {
      Alert.alert(
        "Nom trop long",
        "Le nom du produit ne peut pas dépasser 80 caractères.",
      );

      return false;
    }

    if (imageSize !== null && imageSize > MAX_IMAGE_SIZE) {
      Alert.alert(
        "Image trop volumineuse",
        "La taille maximale autorisée est de 2 Mo.",
      );

      return false;
    }

    if (variants.length === 0) {
      Alert.alert(
        "Variante requise",
        "Ajoutez au moins une variante au produit.",
      );

      return false;
    }

    const usedPackagingIds = new Set<string>();

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];
      const variantNumber = index + 1;

      if (!variant.packagingId) {
        Alert.alert(
          "Emballage requis",
          `Sélectionnez un emballage pour la variante ${variantNumber}.`,
        );

        return false;
      }

      if (usedPackagingIds.has(variant.packagingId)) {
        Alert.alert(
          "Emballage en double",
          `L'emballage sélectionné pour la variante ${variantNumber} est déjà utilisé par une autre variante.`,
        );

        return false;
      }

      usedPackagingIds.add(variant.packagingId);

      const cleanSku = variant.sku.trim();

      if (!cleanSku) {
        Alert.alert(
          "SKU requis",
          `Saisissez un SKU pour la variante ${variantNumber}.`,
        );

        return false;
      }

      if (cleanSku.length > 50) {
        Alert.alert(
          "SKU trop long",
          `Le SKU de la variante ${variantNumber} ne peut pas dépasser 50 caractères.`,
        );

        return false;
      }

      const price = Number(variant.price);

      if (!variant.price.trim() || !Number.isFinite(price) || price <= 0) {
        Alert.alert(
          "Prix invalide",
          `Saisissez un prix valide pour la variante ${variantNumber}.`,
        );

        return false;
      }

      const shelfLifeDays = Number(variant.shelfLifeDays);

      if (
        !variant.shelfLifeDays.trim() ||
        !Number.isInteger(shelfLifeDays) ||
        shelfLifeDays <= 0
      ) {
        Alert.alert(
          "Durée de conservation invalide",
          `La durée de conservation de la variante ${variantNumber} doit être un nombre entier supérieur à 0.`,
        );

        return false;
      }

      if (shelfLifeDays > 365) {
        Alert.alert(
          "Durée de conservation invalide",
          `La durée de conservation de la variante ${variantNumber} ne peut pas dépasser 365 jours.`,
        );

        return false;
      }
    }

    return true;
  };

  // ============================================================
  // CRÉATION
  // ============================================================

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const product = await createProduct({
        name: name.trim(),
        description: description.trim(),
        isActive: true,
        variants: variants.map((variant) => ({
          packagingId: variant.packagingId,
          sku: variant.sku.trim(),
          price: Number(variant.price),
          shelfLifeDays: Number(variant.shelfLifeDays),
          isActive: true,
        })),
      });

      if (imageUri && product?.id) {
        try {
          await useProductStore
            .getState()
            .updateProductImage(product.id, imageUri);
        } catch (imageError) {
          console.error("Erreur upload image produit :", imageError);

          Alert.alert(
            "Produit créé",
            "Le produit a été créé, mais l'image n'a pas pu être enregistrée.",
          );
        }
      }

      if (product?.id) {
        router.replace(`/(main)/settings/products/${product.id}`);
        return;
      }

      router.back();
    } catch (error) {
      console.error("Erreur création produit :", error);
    }
  };

  // ============================================================
  // RENDU VARIANTE
  // ============================================================

  const renderVariant = (variant: VariantForm, index: number) => {
    const variantNumber = index + 1;

    return (
      <View key={variant.id} style={styles.variantCard}>
        <View style={styles.variantHeader}>
          <View style={styles.variantHeaderLeft}>
            <View style={styles.variantNumber}>
              <Text style={styles.variantNumberText}>{variantNumber}</Text>
            </View>

            <View>
              <Text style={styles.variantTitle}>Variante {variantNumber}</Text>

              <Text style={styles.variantSubtitle}>
                Format, prix et conservation
              </Text>
            </View>
          </View>

          {variants.length > 1 && (
            <Pressable
              onPress={() => removeVariant(variant.id)}
              disabled={isCreating}
              hitSlop={8}
              style={({ pressed }) => [
                styles.deleteVariantButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={17} color={COLORS.error} />
            </Pressable>
          )}
        </View>

        {/* EMBALLAGE */}

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons
              name="bottle-soda-outline"
              size={16}
              color={COLORS.primary}
            />

            <Text style={styles.label}>Emballage</Text>
          </View>

          {activePackagings.length === 0 ? (
            <View style={styles.emptyPackaging}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={COLORS.warning}
              />

              <Text style={styles.emptyPackagingText}>
                Aucun emballage actif. Créez d'abord un emballage dans les
                paramètres.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.packagingList}
            >
              {activePackagings.map((packaging) => {
                const selected = variant.packagingId === packaging.id;

                return (
                  <Pressable
                    key={packaging.id}
                    style={({ pressed }) => [
                      styles.packagingOption,
                      selected && styles.packagingOptionSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      updateVariant(variant.id, "packagingId", packaging.id)
                    }
                    disabled={isCreating}
                  >
                    <View
                      style={[
                        styles.packagingIcon,
                        selected && styles.packagingIconSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="bottle-soda"
                        size={19}
                        color={selected ? COLORS.white : COLORS.primary}
                      />
                    </View>

                    <View style={styles.packagingContent}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.packagingName,
                          selected && styles.packagingNameSelected,
                        ]}
                      >
                        {packaging.name}
                      </Text>

                      <Text
                        style={[
                          styles.packagingCapacity,
                          selected && styles.packagingCapacitySelected,
                        ]}
                      >
                        {packaging.capacityMl} ml
                      </Text>
                    </View>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color={COLORS.primary}
                        style={styles.packagingCheck}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* SKU */}

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons
              name="barcode"
              size={16}
              color={COLORS.primary}
            />

            <Text style={styles.label}>SKU</Text>
          </View>

          <TextInput
            value={variant.sku}
            onChangeText={(value) => updateVariant(variant.id, "sku", value)}
            placeholder="Ex. ANANAS-500"
            placeholderTextColor={COLORS.Gray}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={50}
            editable={!isCreating}
            style={styles.input}
          />
        </View>

        {/* PRIX + CONSERVATION */}

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons
                name="cash"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.label}>Prix</Text>
            </View>

            <View style={styles.inputWithSuffix}>
              <TextInput
                value={variant.price}
                onChangeText={(value) =>
                  updateVariant(
                    variant.id,
                    "price",
                    value.replace(/[^0-9.]/g, ""),
                  )
                }
                placeholder="0"
                placeholderTextColor={COLORS.Gray}
                keyboardType="decimal-pad"
                editable={!isCreating}
                style={styles.suffixInput}
              />

              <Text style={styles.inputSuffix}>CDF</Text>
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color={COLORS.primary}
              />

              <Text style={styles.label}>Conservation</Text>
            </View>

            <View style={styles.inputWithSuffix}>
              <TextInput
                value={variant.shelfLifeDays}
                onChangeText={(value) =>
                  updateVariant(
                    variant.id,
                    "shelfLifeDays",
                    value.replace(/[^0-9]/g, ""),
                  )
                }
                placeholder="2"
                placeholderTextColor={COLORS.Gray}
                keyboardType="number-pad"
                editable={!isCreating}
                style={styles.suffixInput}
              />

              <Text style={styles.inputSuffix}>jours</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // SCREEN
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            disabled={isCreating}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Nouveau produit</Text>

            <Text style={styles.headerSubtitle}>
              Ajoutez un nouveau jus au catalogue
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================================================== */}
          {/* INFORMATIONS GÉNÉRALES */}
          {/* ================================================== */}

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="fruit-cherries"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Informations générales</Text>

                <Text style={styles.sectionSubtitle}>
                  Présentez votre produit dans le catalogue
                </Text>
              </View>
            </View>

            {/* IMAGE */}

            <View style={styles.imageSection}>
              {imageUri ? (
                <View style={styles.imagePreviewWrapper}>
                  <Image
                    source={{
                      uri: imageUri,
                    }}
                    style={styles.imagePreview}
                  />

                  <Pressable
                    style={({ pressed }) => [
                      styles.removeImageButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleRemoveImage}
                    disabled={isCreating}
                  >
                    <Ionicons name="close" size={17} color={COLORS.white} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.imagePicker,
                    pressed && styles.pressed,
                  ]}
                  onPress={handlePickImage}
                  disabled={isCreating || isCheckingImage}
                >
                  {isCheckingImage ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <View style={styles.imagePickerIcon}>
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.imagePickerTitle}>
                        Ajouter une image
                      </Text>

                      <Text style={styles.imagePickerText}>
                        JPG, PNG ou WEBP · 2 Mo maximum
                      </Text>
                    </>
                  )}
                </Pressable>
              )}

              {imageUri && (
                <Pressable
                  style={({ pressed }) => [
                    styles.changeImageButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={handlePickImage}
                  disabled={isCreating || isCheckingImage}
                >
                  <Ionicons
                    name="image-outline"
                    size={16}
                    color={COLORS.primary}
                  />

                  <Text style={styles.changeImageText}>Modifier l'image</Text>
                </Pressable>
              )}
            </View>

            {/* NOM */}

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name="format-title"
                  size={17}
                  color={COLORS.primary}
                />

                <Text style={styles.label}>Nom du produit</Text>

                <Text style={styles.required}>*</Text>
              </View>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex. Jus d'ananas"
                placeholderTextColor={COLORS.Gray}
                maxLength={80}
                editable={!isCreating}
                style={styles.input}
              />

              <Text style={styles.characterCount}>{name.length}/80</Text>
            </View>

            {/* DESCRIPTION */}

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={17}
                  color={COLORS.primary}
                />

                <Text style={styles.label}>Description</Text>

                <Text style={styles.optional}>Facultatif</Text>
              </View>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Décrivez brièvement ce jus..."
                placeholderTextColor={COLORS.Gray}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                editable={!isCreating}
                style={[styles.input, styles.descriptionInput]}
              />

              <Text style={styles.characterCount}>
                {description.length}
                /500
              </Text>
            </View>
          </View>

          {/* ================================================== */}
          {/* VARIANTES */}
          {/* ================================================== */}

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, styles.variantSectionIcon]}>
                <MaterialCommunityIcons
                  name="bottle-soda-outline"
                  size={20}
                  color={COLORS.secondary}
                />
              </View>

              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>Variantes</Text>

                <Text style={styles.sectionSubtitle}>
                  Définissez les formats disponibles et leurs prix
                </Text>
              </View>

              <View style={styles.variantCounter}>
                <Text style={styles.variantCounterText}>
                  {variants.length}/{MAX_VARIANTS}
                </Text>
              </View>
            </View>

            {isLoadingPackagings && packagings.length === 0 ? (
              <View style={styles.loadingPackagings}>
                <ActivityIndicator size="small" color={COLORS.primary} />

                <Text style={styles.loadingPackagingsText}>
                  Chargement des emballages...
                </Text>
              </View>
            ) : (
              <View style={styles.variantsList}>
                {variants.map(renderVariant)}
              </View>
            )}

            {variants.length < MAX_VARIANTS && (
              <Pressable
                style={({ pressed }) => [
                  styles.addVariantButton,
                  pressed && styles.pressed,
                ]}
                onPress={addVariant}
                disabled={isCreating || activePackagings.length === 0}
              >
                <View style={styles.addVariantIcon}>
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </View>

                <Text style={styles.addVariantText}>Ajouter une variante</Text>
              </Pressable>
            )}
          </View>

          {/* ================================================== */}
          {/* RECETTE - INFORMATION */}
          {/* ================================================== */}

          <View style={styles.recipeInfoCard}>
            <View style={styles.recipeInfoIcon}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={19}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.recipeInfoContent}>
              <Text style={styles.recipeInfoTitle}>
                La recette sera ajoutée ensuite
              </Text>

              <Text style={styles.recipeInfoText}>
                Créez d'abord le produit. Vous pourrez ensuite définir sa
                recette et les matières premières utilisées depuis sa fiche.
              </Text>
            </View>
          </View>

          {/* ================================================== */}
          {/* CREATE BUTTON */}
          {/* ================================================== */}

          <View style={styles.bottomSection}>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                isCreating && styles.createButtonDisabled,
                pressed && !isCreating && styles.createButtonPressed,
              ]}
              onPress={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color={COLORS.white}
                />
              )}

              <Text style={styles.createButtonText}>
                {isCreating ? "Création en cours..." : "Créer le produit"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={() => router.back()}
              disabled={isCreating}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.large,
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // CARDS
  // ==========================================================

  card: {
    marginTop: 14,
    padding: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantSectionIcon: {
    backgroundColor: "#FFF1DF",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  // ==========================================================
  // IMAGE
  // ==========================================================

  imageSection: {
    alignItems: "center",
    paddingVertical: 18,
  },

  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DCE8D8",
    borderStyle: "dashed",
    backgroundColor: "#F8FBF7",
    alignItems: "center",
    justifyContent: "center",
  },

  imagePickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  imagePickerTitle: {
    marginTop: 9,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  imagePickerText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  imagePreviewWrapper: {
    position: "relative",
  },

  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },

  removeImageButton: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  changeImageButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  changeImageText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // INPUTS
  // ==========================================================

  inputGroup: {
    marginTop: 15,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  label: {
    marginLeft: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  required: {
    marginLeft: 3,
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.error,
  },

  optional: {
    marginLeft: "auto",
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  input: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E1",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  descriptionInput: {
    minHeight: 100,
    paddingTop: 12,
  },

  characterCount: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // VARIANTS
  // ==========================================================

  variantCounter: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F2F6F0",
  },

  variantCounterText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
  },

  variantsList: {
    marginTop: 2,
  },

  variantCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EAEAE6",
  },

  variantHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEA",
  },

  variantHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  variantNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantNumberText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: COLORS.primary,
  },

  variantTitle: {
    marginLeft: 9,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  variantSubtitle: {
    marginLeft: 9,
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  deleteVariantButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
  },

  // ==========================================================
  // PACKAGING
  // ==========================================================

  packagingList: {
    gap: 8,
    paddingRight: 4,
  },

  packagingOption: {
    minWidth: 145,
    maxWidth: 190,
    minHeight: 62,
    padding: 9,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E5E1",
  },

  packagingOptionSelected: {
    backgroundColor: "#F1F7EF",
    borderColor: "#BBD2B5",
  },

  packagingIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  packagingIconSelected: {
    backgroundColor: COLORS.primary,
  },

  packagingContent: {
    flex: 1,
    marginLeft: 8,
  },

  packagingName: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
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

  packagingCapacitySelected: {
    color: COLORS.primary,
  },

  packagingCheck: {
    marginLeft: 4,
  },

  emptyPackaging: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
  },

  emptyPackagingText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#806A27",
  },

  loadingPackagings: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingPackagingsText: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ROW INPUTS
  // ==========================================================

  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  inputWithSuffix: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E1",
    backgroundColor: "#FAFAF8",
    paddingRight: 11,
  },

  suffixInput: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  inputSuffix: {
    fontFamily: fonts.semibold,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ADD VARIANT
  // ==========================================================

  addVariantButton: {
    minHeight: 45,
    marginTop: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D8E5D4",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#F8FBF7",
  },

  addVariantIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  addVariantText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  // ==========================================================
  // RECIPE INFO
  // ==========================================================

  recipeInfoCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DCE8D8",
  },

  recipeInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  recipeInfoContent: {
    flex: 1,
    marginLeft: 10,
  },

  recipeInfoTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  recipeInfoText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.darkGray,
  },

  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSection: {
    marginTop: 20,
  },

  createButton: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
  },

  createButtonDisabled: {
    opacity: 0.65,
  },

  createButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  createButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.white,
  },

  cancelButton: {
    minHeight: 45,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.Gray,
  },

  bottomSpacer: {
    height: 80,
  },

  // ==========================================================
  // GENERAL
  // ==========================================================

  pressed: {
    opacity: 0.6,
  },
});
