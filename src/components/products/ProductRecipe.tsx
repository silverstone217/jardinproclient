import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import type { Product } from "@/types/product";

import type {
  CreateRecipePayload,
  Recipe,
  UpdateRecipeItemPayload,
  UpdateRecipePayload,
} from "@/types/recipe";

import { useProductStore } from "@/store/product.store";
import { useRawIngredientStore } from "@/store/raw-ingredient.store";
import { useRecipeStore } from "@/store/recipe.store";

import { COLORS, fonts } from "@/utils/styles";

interface ProductRecipeProps {
  product: Product;
  disabled?: boolean;
}

interface DraftItem {
  id?: string;
  ingredientId: string;
  quantity: string;
}

type RecipeMode = "create" | "edit";

const MAX_ITEMS = 50;

const UNIT_LABELS: Record<string, string> = {
  PIECE: "pièce(s)",
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  LITER: "L",
};

const formatVolume = (volumeMl: number): string => {
  if (!Number.isFinite(volumeMl)) {
    return "0 ml";
  }

  if (volumeMl >= 1000) {
    const liters = volumeMl / 1000;

    return Number.isInteger(liters)
      ? `${liters} L`
      : `${liters.toLocaleString("fr-FR", {
          maximumFractionDigits: 2,
        })} L`;
  }

  return `${volumeMl.toLocaleString("fr-FR")} ml`;
};

export function ProductRecipe({
  product,
  disabled = false,
}: ProductRecipeProps) {
  // ==========================================================
  // STORES
  // ==========================================================

  const {
    recipes,
    initialize: initializeRecipes,
    isLoading: isLoadingRecipes,
    isCreating: isCreatingRecipe,
    isUpdating: isUpdatingRecipe,
    isDeleting: isDeletingRecipe,
    error: recipeError,
  } = useRecipeStore();

  const {
    rawIngredients,
    initialize: initializeIngredients,
    isLoading: isLoadingIngredients,
  } = useRawIngredientStore();

  const { updateProduct, isUpdating: isUpdatingProduct } = useProductStore();

  // ==========================================================
  // FORM
  // ==========================================================

  const [mode, setMode] = useState<RecipeMode>("create");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isIngredientPickerVisible, setIsIngredientPickerVisible] =
    useState(false);

  const [recipeName, setRecipeName] = useState("");

  const [recipeDescription, setRecipeDescription] = useState("");

  const [productionVolumeMl, setProductionVolumeMl] = useState("");

  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | null
  >(null);

  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<DraftItem[]>([]);

  const [localError, setLocalError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const itemsRef = useRef<DraftItem[]>([]);

  const contentScrollRef = useRef<ScrollView>(null);

  const errorScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useEffect(() => {
    initializeRecipes();
    initializeIngredients();
  }, [initializeRecipes, initializeIngredients]);

  // ==========================================================
  // RECIPE
  // ==========================================================

  const recipe = useMemo<Recipe | undefined>(() => {
    if (!product.recipeId) {
      return undefined;
    }

    return recipes.find((item) => item.id === product.recipeId);
  }, [product.recipeId, recipes]);

  // ==========================================================
  // INGREDIENTS
  // ==========================================================

  const activeIngredients = useMemo(() => {
    return rawIngredients
      .filter((ingredient) => ingredient.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [rawIngredients]);

  const getIngredient = (ingredientId: string) => {
    return rawIngredients.find((ingredient) => ingredient.id === ingredientId);
  };

  const getIngredientName = (ingredientId: string) => {
    return getIngredient(ingredientId)?.name ?? "Matière première inconnue";
  };

  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = getIngredient(ingredientId);

    if (!ingredient) {
      return "";
    }

    return UNIT_LABELS[ingredient.unit] ?? ingredient.unit.toLowerCase();
  };

  // ==========================================================
  // DRAFT SOURCE OF TRUTH
  // ==========================================================

  const updateDraftItems = (
    updater: DraftItem[] | ((current: DraftItem[]) => DraftItem[]),
  ) => {
    setItems((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;

      itemsRef.current = next;

      return next;
    });
  };

  const resetForm = () => {
    const emptyItems: DraftItem[] = [];

    itemsRef.current = emptyItems;

    setRecipeName("");
    setRecipeDescription("");
    setProductionVolumeMl("");
    setSelectedIngredientId(null);
    setQuantity("");
    setItems(emptyItems);
    setLocalError(null);
    setIsIngredientPickerVisible(false);
  };

  // ==========================================================
  // MODAL
  // ==========================================================

  const openCreateModal = () => {
    if (disabled) {
      return;
    }

    resetForm();

    setMode("create");
    setIsModalVisible(true);
  };

  const openEditModal = () => {
    if (disabled || !recipe) {
      return;
    }

    const draftItems: DraftItem[] = recipe.items.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      quantity: String(item.quantity),
    }));

    itemsRef.current = draftItems;

    setRecipeName(recipe.name);

    setRecipeDescription(recipe.description ?? "");

    setProductionVolumeMl(String(recipe.productionVolumeMl));

    setItems(draftItems);
    setSelectedIngredientId(null);
    setQuantity("");
    setLocalError(null);
    setIsIngredientPickerVisible(false);

    setMode("edit");
    setIsModalVisible(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    Keyboard.dismiss();

    setIsIngredientPickerVisible(false);

    setIsModalVisible(false);
    setLocalError(null);
  };

  // ==========================================================
  // ERROR
  // ==========================================================

  const showError = (message: string) => {
    setLocalError(message);

    if (errorScrollTimeoutRef.current) {
      clearTimeout(errorScrollTimeoutRef.current);
    }

    errorScrollTimeoutRef.current = setTimeout(() => {
      contentScrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 80);
  };

  // ==========================================================
  // ADD INGREDIENT
  // ==========================================================

  const handleAddItem = () => {
    Keyboard.dismiss();
    setLocalError(null);

    if (!selectedIngredientId) {
      showError("Sélectionnez une matière première.");
      return;
    }

    const currentItems = itemsRef.current;

    if (currentItems.length >= MAX_ITEMS) {
      showError("Une recette ne peut pas contenir plus de 50 ingrédients.");
      return;
    }

    if (
      currentItems.some((item) => item.ingredientId === selectedIngredientId)
    ) {
      showError("Cette matière première est déjà présente dans la recette.");
      return;
    }

    const normalizedQuantity = quantity.trim().replace(",", ".");

    const numericQuantity = Number(normalizedQuantity);

    if (
      !normalizedQuantity ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      showError("La quantité doit être supérieure à 0.");
      return;
    }

    const newItem: DraftItem = {
      ingredientId: selectedIngredientId,
      quantity: String(numericQuantity),
    };

    updateDraftItems((current) => [...current, newItem]);

    setSelectedIngredientId(null);

    setQuantity("");

    setIsIngredientPickerVisible(false);

    setTimeout(() => {
      contentScrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  };

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================

  const handleQuantityChange = (itemIndex: number, value: string) => {
    const sanitized = value.replace(/[^0-9,.]/g, "");

    updateDraftItems((current) =>
      current.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              quantity: sanitized,
            }
          : item,
      ),
    );

    setLocalError(null);
  };

  // ==========================================================
  // REMOVE INGREDIENT
  // ==========================================================

  const handleRemoveItem = (itemIndex: number) => {
    Keyboard.dismiss();
    setLocalError(null);

    updateDraftItems((current) =>
      current.filter((_, index) => index !== itemIndex),
    );
  };

  // ==========================================================
  // SELECT INGREDIENT
  // ==========================================================

  const handleSelectIngredient = (ingredientId: string) => {
    setSelectedIngredientId(ingredientId);

    setLocalError(null);

    setIsIngredientPickerVisible(false);

    setTimeout(() => {
      contentScrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = (draftItems: DraftItem[]): boolean => {
    const cleanName = recipeName.trim();

    if (cleanName.length < 2) {
      showError("Le nom de la recette doit contenir au moins 2 caractères.");
      return false;
    }

    if (cleanName.length > 80) {
      showError("Le nom de la recette ne peut pas dépasser 80 caractères.");
      return false;
    }

    if (recipeDescription.trim().length > 500) {
      showError("La description ne peut pas dépasser 500 caractères.");
      return false;
    }

    // --------------------------------------------------------
    // VOLUME DE PRODUCTION DE RÉFÉRENCE
    // --------------------------------------------------------

    const normalizedVolume = productionVolumeMl.trim().replace(",", ".");

    const numericVolume = Number(normalizedVolume);

    if (
      !normalizedVolume ||
      !Number.isFinite(numericVolume) ||
      numericVolume <= 0
    ) {
      showError(
        "Le volume de production de référence doit être supérieur à 0.",
      );
      return false;
    }

    if (!Number.isInteger(numericVolume)) {
      showError("Le volume de production doit être un nombre entier en ml.");
      return false;
    }

    if (draftItems.length === 0) {
      showError("Ajoutez au moins une matière première à la recette.");
      return false;
    }

    if (draftItems.length > MAX_ITEMS) {
      showError("Une recette ne peut pas contenir plus de 50 ingrédients.");
      return false;
    }

    const ingredientIds = new Set<string>();

    for (let index = 0; index < draftItems.length; index++) {
      const item = draftItems[index];

      if (ingredientIds.has(item.ingredientId)) {
        showError(
          `La matière première "${getIngredientName(
            item.ingredientId,
          )}" est présente plusieurs fois.`,
        );

        return false;
      }

      ingredientIds.add(item.ingredientId);

      const normalizedQuantity = item.quantity.trim().replace(",", ".");

      const numericQuantity = Number(normalizedQuantity);

      if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        showError(
          `La quantité de "${getIngredientName(
            item.ingredientId,
          )}" doit être supérieure à 0.`,
        );

        return false;
      }
    }

    return true;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (isSubmitting || disabled) {
      return;
    }

    Keyboard.dismiss();
    setLocalError(null);

    const draftItems = itemsRef.current;

    if (!validateForm(draftItems)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedVolume = productionVolumeMl.trim().replace(",", ".");

      const normalizedItems = draftItems.map((item) => ({
        id: item.id,
        ingredientId: item.ingredientId,
        quantity: Number(item.quantity.trim().replace(",", ".")),
      }));

      const volumeMl = Number(normalizedVolume);

      // ======================================================
      // CREATE
      // ======================================================

      if (mode === "create") {
        const payload: CreateRecipePayload = {
          name: recipeName.trim(),

          description: recipeDescription.trim(),

          productionVolumeMl: volumeMl,

          items: normalizedItems.map((item) => ({
            ingredientId: item.ingredientId,

            quantity: item.quantity,
          })),
        };

        const createdRecipe = await useRecipeStore
          .getState()
          .createRecipe(payload);

        // ----------------------------------------------------
        // ASSOCIER LA RECETTE AU PRODUIT
        // ----------------------------------------------------

        await updateProduct(product.id, {
          name: product.name,

          description: product.description ?? undefined,

          recipeId: createdRecipe.id,

          isActive: product.isActive,

          variants: product.variants.map((variant) => ({
            id: variant.id,

            packagingId: variant.packagingId,

            sku: variant.sku,

            price: Number(variant.price),

            shelfLifeDays: Number(variant.shelfLifeDays),

            isActive: variant.isActive,
          })),
        });

        closeModal();

        Alert.alert(
          "Recette créée",
          `La recette "${createdRecipe.name}" a été créée pour une production de référence de ${formatVolume(
            createdRecipe.productionVolumeMl,
          )}, avec ${normalizedItems.length} matière(s) première(s).`,
        );

        return;
      }

      // ======================================================
      // EDIT
      // ======================================================

      if (!recipe) {
        showError("La recette à modifier est introuvable.");

        return;
      }

      const updateItems: UpdateRecipeItemPayload[] = normalizedItems.map(
        (item) => ({
          ...(item.id
            ? {
                id: item.id,
              }
            : {}),

          ingredientId: item.ingredientId,

          quantity: item.quantity,
        }),
      );

      const payload: UpdateRecipePayload = {
        name: recipeName.trim(),

        description: recipeDescription.trim(),

        productionVolumeMl: volumeMl,

        items: updateItems,
      };

      const updatedRecipe = await useRecipeStore
        .getState()
        .updateRecipe(recipe.id, payload);

      closeModal();

      Alert.alert(
        "Recette modifiée",
        `La recette "${updatedRecipe.name}" a été mise à jour.`,
      );
    } catch (error) {
      console.error("Erreur recette :", error);

      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la recette.";

      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // DELETE RECIPE
  // ==========================================================

  const handleDeleteRecipe = () => {
    if (disabled || !recipe || isDeletingRecipe || isUpdatingProduct) {
      return;
    }

    Alert.alert(
      "Supprimer la recette",
      `Voulez-vous vraiment supprimer la recette "${recipe.name}" ?`,
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
              // ------------------------------------------------
              // DÉTACHER LA RECETTE DU PRODUIT
              // ------------------------------------------------

              await updateProduct(product.id, {
                name: product.name,

                description: product.description ?? undefined,

                recipeId: "",

                isActive: product.isActive,

                variants: product.variants.map((variant) => ({
                  id: variant.id,

                  packagingId: variant.packagingId,

                  sku: variant.sku,

                  price: Number(variant.price),

                  shelfLifeDays: Number(variant.shelfLifeDays),

                  isActive: variant.isActive,
                })),
              });

              // ------------------------------------------------
              // SUPPRIMER LA RECETTE
              // ------------------------------------------------

              await useRecipeStore.getState().deleteRecipe(recipe.id);

              Alert.alert(
                "Recette supprimée",
                "La recette a été supprimée du produit.",
              );
            } catch (error) {
              console.error("Erreur suppression recette :", error);

              Alert.alert("Erreur", "Impossible de supprimer la recette.");
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  const isLoading = isLoadingRecipes || isLoadingIngredients;

  const isBusy =
    disabled ||
    isSubmitting ||
    isCreatingRecipe ||
    isUpdatingRecipe ||
    isUpdatingProduct ||
    isDeletingRecipe;

  // ==========================================================
  // RENDER ITEM
  // ==========================================================

  const renderDraftItem = (item: DraftItem, index: number) => {
    const ingredient = getIngredient(item.ingredientId);

    return (
      <View
        key={item.id ?? `${item.ingredientId}-${index}`}
        style={styles.itemCard}
      >
        <View style={styles.itemNumber}>
          <Text style={styles.itemNumberText}>{index + 1}</Text>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.itemNameContainer}>
              <Text style={styles.itemName} numberOfLines={1}>
                {ingredient?.name ?? "Matière première inconnue"}
              </Text>

              {ingredient && (
                <Text style={styles.itemUnit}>
                  Unité de stock :{" "}
                  {UNIT_LABELS[ingredient.unit] ?? ingredient.unit}
                </Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.removeItemButton,
                pressed && styles.pressed,
              ]}
              onPress={() => handleRemoveItem(index)}
              disabled={isBusy}
              hitSlop={6}
            >
              <Ionicons name="trash-outline" size={17} color={COLORS.error} />
            </Pressable>
          </View>

          <View style={styles.quantityRow}>
            <View style={styles.quantityLabelContainer}>
              <MaterialCommunityIcons
                name="flask-outline"
                size={15}
                color={COLORS.primary}
              />

              <Text style={styles.quantityLabel}>Quantité de référence</Text>
            </View>

            <View style={styles.quantityInputContainer}>
              <TextInput
                value={item.quantity}
                onChangeText={(value) => handleQuantityChange(index, value)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.Gray}
                style={styles.quantityInput}
                editable={!isBusy}
                selectTextOnFocus
              />

              <Text style={styles.quantityUnit}>
                {getIngredientUnit(item.ingredientId)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================
  // PICKER
  // ==========================================================

  const renderIngredientPicker = () => {
    if (!isIngredientPickerVisible) {
      return null;
    }

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <View>
            <Text style={styles.pickerTitle}>Matières premières</Text>

            <Text style={styles.pickerSubtitle}>
              Sélectionnez un ingrédient
            </Text>
          </View>

          <Pressable
            onPress={() => setIsIngredientPickerVisible(false)}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={COLORS.Gray} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.pickerList}
          contentContainerStyle={styles.pickerListContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {activeIngredients.length === 0 ? (
            <View style={styles.emptyPicker}>
              <Ionicons name="leaf-outline" size={28} color={COLORS.Gray} />

              <Text style={styles.emptyPickerTitle}>
                Aucune matière première
              </Text>

              <Text style={styles.emptyPickerText}>
                Ajoutez d'abord une matière première active.
              </Text>
            </View>
          ) : (
            activeIngredients.map((ingredient) => {
              const alreadyAdded = itemsRef.current.some(
                (item) => item.ingredientId === ingredient.id,
              );

              const isSelected = selectedIngredientId === ingredient.id;

              return (
                <Pressable
                  key={ingredient.id}
                  style={({ pressed }) => [
                    styles.ingredientOption,

                    isSelected && styles.ingredientOptionSelected,

                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    if (alreadyAdded) {
                      showError(
                        "Cette matière première est déjà présente dans la recette.",
                      );

                      return;
                    }

                    handleSelectIngredient(ingredient.id);
                  }}
                >
                  <View style={styles.ingredientIcon}>
                    <Ionicons
                      name="leaf-outline"
                      size={17}
                      color={alreadyAdded ? COLORS.Gray : COLORS.primary}
                    />
                  </View>

                  <View style={styles.ingredientOptionContent}>
                    <Text
                      style={[
                        styles.ingredientOptionName,

                        alreadyAdded && styles.disabledText,
                      ]}
                    >
                      {ingredient.name}
                    </Text>

                    <Text style={styles.ingredientOptionUnit}>
                      {UNIT_LABELS[ingredient.unit] ?? ingredient.unit}
                    </Text>
                  </View>

                  {alreadyAdded ? (
                    <View style={styles.alreadyAddedBadge}>
                      <Text style={styles.alreadyAddedText}>Déjà ajouté</Text>
                    </View>
                  ) : (
                    <Ionicons
                      name={
                        isSelected ? "checkmark-circle" : "add-circle-outline"
                      }
                      size={21}
                      color={isSelected ? COLORS.primary : COLORS.Gray}
                    />
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  // ==========================================================
  // MODAL
  // ==========================================================

  const renderModal = () => {
    return (
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();

              if (isIngredientPickerVisible) {
                setIsIngredientPickerVisible(false);
              }
            }}
          >
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContainer}>
                  {/* ======================================== */}
                  {/* HEADER FIXE                              */}
                  {/* ======================================== */}

                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderIcon}>
                      <MaterialCommunityIcons
                        name="flask-outline"
                        size={21}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.modalHeaderContent}>
                      <Text style={styles.modalTitle}>
                        {mode === "create"
                          ? "Nouvelle recette"
                          : "Modifier la recette"}
                      </Text>

                      <Text style={styles.modalSubtitle}>
                        {mode === "create"
                          ? "Définissez un volume de référence et les matières nécessaires."
                          : "Modifiez le volume de référence ou les matières utilisées."}
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.closeButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={closeModal}
                      disabled={isSubmitting}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="close"
                        size={21}
                        color={COLORS.darkGray}
                      />
                    </Pressable>
                  </View>

                  {/* ======================================== */}
                  {/* CONTENU SCROLLABLE                       */}
                  {/* ======================================== */}

                  <ScrollView
                    ref={contentScrollRef}
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={
                      Platform.OS === "ios" ? "interactive" : "on-drag"
                    }
                    nestedScrollEnabled
                  >
                    {/* ====================================== */}
                    {/* INFORMATIONS                            */}
                    {/* ====================================== */}

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderIcon}>
                          <Ionicons
                            name="information-circle-outline"
                            size={17}
                            color={COLORS.primary}
                          />
                        </View>

                        <View>
                          <Text style={styles.sectionTitle}>Informations</Text>

                          <Text style={styles.sectionSubtitle}>
                            Identifiez votre recette
                          </Text>
                        </View>
                      </View>

                      {/* ==================================== */}
                      {/* NOM                                   */}
                      {/* ==================================== */}

                      <Text style={styles.inputLabel}>Nom de la recette</Text>

                      <TextInput
                        value={recipeName}
                        onChangeText={(value) => {
                          setRecipeName(value);

                          setLocalError(null);
                        }}
                        placeholder="Ex. Jus Ananas Gingembre"
                        placeholderTextColor={COLORS.Gray}
                        style={styles.textInput}
                        maxLength={80}
                        editable={!isBusy}
                        autoCapitalize="sentences"
                      />

                      {/* ==================================== */}
                      {/* VOLUME DE RÉFÉRENCE                   */}
                      {/* ==================================== */}

                      <Text style={styles.inputLabel}>
                        Volume de production de référence
                      </Text>

                      <View style={styles.volumeInputContainer}>
                        <View style={styles.volumeIcon}>
                          <MaterialCommunityIcons
                            name="cup-water"
                            size={17}
                            color={COLORS.primary}
                          />
                        </View>

                        <TextInput
                          value={productionVolumeMl}
                          onChangeText={(value) => {
                            setProductionVolumeMl(value.replace(/[^0-9]/g, ""));

                            setLocalError(null);
                          }}
                          placeholder="Ex. 2000"
                          placeholderTextColor={COLORS.Gray}
                          style={styles.volumeInput}
                          keyboardType="number-pad"
                          maxLength={7}
                          editable={!isBusy}
                        />

                        <View style={styles.volumeUnit}>
                          <Text style={styles.volumeUnitText}>ml</Text>
                        </View>
                      </View>

                      <View style={styles.referenceHint}>
                        <Ionicons
                          name="information-circle-outline"
                          size={14}
                          color={COLORS.info}
                        />

                        <Text style={styles.referenceHintText}>
                          Ce volume représente le lot de référence de la
                          recette. Les quantités ci-dessous correspondent à ce
                          volume.
                        </Text>
                      </View>

                      {/* ==================================== */}
                      {/* DESCRIPTION                           */}
                      {/* ==================================== */}

                      <Text style={styles.inputLabel}>Description</Text>

                      <TextInput
                        value={recipeDescription}
                        onChangeText={(value) => {
                          setRecipeDescription(value);

                          setLocalError(null);
                        }}
                        placeholder="Décrivez brièvement la composition de cette recette..."
                        placeholderTextColor={COLORS.Gray}
                        style={[styles.textInput, styles.descriptionInput]}
                        maxLength={500}
                        multiline
                        textAlignVertical="top"
                        editable={!isBusy}
                      />

                      <View style={styles.characterCount}>
                        <Text style={styles.characterCountText}>
                          {recipeDescription.length}
                          /500
                        </Text>
                      </View>
                    </View>

                    {/* ====================================== */}
                    {/* INGREDIENTS                             */}
                    {/* ====================================== */}

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View
                          style={[
                            styles.sectionHeaderIcon,
                            styles.ingredientsHeaderIcon,
                          ]}
                        >
                          <Ionicons
                            name="leaf-outline"
                            size={17}
                            color="#5F8E4E"
                          />
                        </View>

                        <View style={styles.sectionHeaderContent}>
                          <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Composition</Text>

                            <View style={styles.countBadge}>
                              <Text style={styles.countBadgeText}>
                                {items.length}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.sectionSubtitle}>
                            Quantités nécessaires pour le volume de référence.
                          </Text>
                        </View>
                      </View>

                      {/* ==================================== */}
                      {/* REFERENCE SUMMARY                     */}
                      {/* ==================================== */}

                      {productionVolumeMl.trim() !== "" && (
                        <View style={styles.referenceVolumeBox}>
                          <View style={styles.referenceVolumeIcon}>
                            <MaterialCommunityIcons
                              name="flask-outline"
                              size={17}
                              color={COLORS.primary}
                            />
                          </View>

                          <View style={styles.referenceVolumeContent}>
                            <Text style={styles.referenceVolumeLabel}>
                              Lot de référence
                            </Text>

                            <Text style={styles.referenceVolumeValue}>
                              {formatVolume(Number(productionVolumeMl))}
                            </Text>
                          </View>

                          <View style={styles.referenceVolumeBadge}>
                            <Text style={styles.referenceVolumeBadgeText}>
                              Référence
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* ==================================== */}
                      {/* CURRENT ITEMS                        */}
                      {/* ==================================== */}

                      {items.length > 0 ? (
                        <View style={styles.itemsList}>
                          {items.map((item, index) =>
                            renderDraftItem(item, index),
                          )}
                        </View>
                      ) : (
                        <View style={styles.emptyItems}>
                          <View style={styles.emptyItemsIcon}>
                            <Ionicons
                              name="flask-outline"
                              size={24}
                              color={COLORS.Gray}
                            />
                          </View>

                          <Text style={styles.emptyItemsTitle}>
                            Aucun ingrédient ajouté
                          </Text>

                          <Text style={styles.emptyItemsText}>
                            Ajoutez une ou plusieurs matières premières
                            ci-dessous.
                          </Text>
                        </View>
                      )}

                      {/* ==================================== */}
                      {/* ADD ITEM                             */}
                      {/* ==================================== */}

                      <View style={styles.addBox}>
                        <View style={styles.addBoxHeader}>
                          <View>
                            <Text style={styles.addBoxTitle}>
                              Ajouter un ingrédient
                            </Text>

                            <Text style={styles.addBoxSubtitle}>
                              Indiquez la quantité nécessaire pour le volume de
                              référence.
                            </Text>
                          </View>

                          <View style={styles.limitBadge}>
                            <Text style={styles.limitBadgeText}>
                              {items.length}
                              /50
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.inputLabel}>Matière première</Text>

                        <Pressable
                          style={({ pressed }) => [
                            styles.selectButton,

                            pressed && styles.pressed,

                            isBusy && styles.disabledInput,
                          ]}
                          onPress={() => {
                            Keyboard.dismiss();

                            setLocalError(null);

                            setIsIngredientPickerVisible((current) => !current);
                          }}
                          disabled={isBusy || activeIngredients.length === 0}
                        >
                          <View style={styles.selectLeft}>
                            <View style={styles.selectIcon}>
                              <Ionicons
                                name="leaf-outline"
                                size={16}
                                color={COLORS.primary}
                              />
                            </View>

                            <Text
                              style={[
                                styles.selectText,

                                !selectedIngredientId &&
                                  styles.selectPlaceholder,
                              ]}
                              numberOfLines={1}
                            >
                              {selectedIngredientId
                                ? getIngredientName(selectedIngredientId)
                                : "Sélectionner une matière première"}
                            </Text>
                          </View>

                          <Ionicons
                            name={
                              isIngredientPickerVisible
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={18}
                            color={COLORS.Gray}
                          />
                        </Pressable>

                        {renderIngredientPicker()}

                        <View style={styles.quantityAddRow}>
                          <View style={styles.quantityAddField}>
                            <Text style={styles.inputLabel}>
                              Quantité de référence
                            </Text>

                            <View style={styles.quantityAddInputContainer}>
                              <TextInput
                                value={quantity}
                                onChangeText={(value) => {
                                  setQuantity(value.replace(/[^0-9,.]/g, ""));

                                  setLocalError(null);
                                }}
                                placeholder="Ex. 2"
                                placeholderTextColor={COLORS.Gray}
                                keyboardType="decimal-pad"
                                style={styles.quantityAddInput}
                                editable={!isBusy}
                              />

                              <Text style={styles.quantityAddUnit}>
                                {selectedIngredientId
                                  ? getIngredientUnit(selectedIngredientId)
                                  : "unité"}
                              </Text>
                            </View>
                          </View>

                          <Pressable
                            style={({ pressed }) => [
                              styles.addButton,

                              (isBusy ||
                                !selectedIngredientId ||
                                !quantity.trim()) &&
                                styles.addButtonDisabled,

                              pressed && styles.addButtonPressed,
                            ]}
                            onPress={handleAddItem}
                            disabled={
                              isBusy ||
                              !selectedIngredientId ||
                              !quantity.trim()
                            }
                          >
                            <Ionicons
                              name="add"
                              size={21}
                              color={
                                isBusy ||
                                !selectedIngredientId ||
                                !quantity.trim()
                                  ? COLORS.Gray
                                  : COLORS.white
                              }
                            />

                            <Text
                              style={[
                                styles.addButtonText,

                                (isBusy ||
                                  !selectedIngredientId ||
                                  !quantity.trim()) &&
                                  styles.addButtonTextDisabled,
                              ]}
                            >
                              Ajouter
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* ==================================== */}
                      {/* HELPER                               */}
                      {/* ==================================== */}

                      <View style={styles.helperBox}>
                        <Ionicons
                          name="information-circle-outline"
                          size={16}
                          color={COLORS.info}
                        />

                        <Text style={styles.helperText}>
                          Les quantités sont enregistrées dans l'unité de chaque
                          matière première. Elles serviront de référence lors de
                          la préparation d'une production.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalBottomSpacer} />
                  </ScrollView>

                  {/* ======================================== */}
                  {/* ERROR FIXE                               */}
                  {/* ======================================== */}

                  {(localError || recipeError) && (
                    <View style={styles.errorArea}>
                      <View style={styles.errorIcon}>
                        <Ionicons
                          name="alert-circle"
                          size={18}
                          color={COLORS.error}
                        />
                      </View>

                      <Text style={styles.errorText}>
                        {localError ?? recipeError}
                      </Text>

                      <Pressable
                        onPress={() => setLocalError(null)}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={18} color={COLORS.Gray} />
                      </Pressable>
                    </View>
                  )}

                  {/* ======================================== */}
                  {/* FOOTER FIXE                              */}
                  {/* ======================================== */}

                  <View style={styles.modalFooter}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cancelButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={closeModal}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.submitButton,

                        isBusy && styles.submitButtonDisabled,

                        pressed && !isBusy && styles.submitButtonPressed,
                      ]}
                      onPress={handleSubmit}
                      disabled={isBusy}
                    >
                      {isSubmitting ||
                      isCreatingRecipe ||
                      isUpdatingRecipe ||
                      isUpdatingProduct ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Ionicons
                          name={
                            mode === "create"
                              ? "checkmark-circle-outline"
                              : "save-outline"
                          }
                          size={19}
                          color={COLORS.white}
                        />
                      )}

                      <Text style={styles.submitButtonText}>
                        {isSubmitting
                          ? "Enregistrement..."
                          : mode === "create"
                            ? "Créer la recette"
                            : "Enregistrer"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ==========================================================
  // MAIN CARD
  // ==========================================================

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text style={styles.loadingText}>Chargement de la recette...</Text>
        </View>
      </View>
    );
  }

  // ==========================================================
  // NO RECIPE
  // ==========================================================

  if (!product.recipeId) {
    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <MaterialCommunityIcons
                name="flask-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.cardHeaderContent}>
              <Text style={styles.cardTitle}>Recette</Text>

              <Text style={styles.cardSubtitle}>
                Définissez la composition de ce produit
              </Text>
            </View>
          </View>

          <View style={styles.noRecipeContent}>
            <View style={styles.noRecipeIcon}>
              <Ionicons name="flask-outline" size={28} color={COLORS.Gray} />
            </View>

            <Text style={styles.noRecipeTitle}>Aucune recette associée</Text>

            <Text style={styles.noRecipeText}>
              Ajoutez une recette avec un volume de référence et une ou
              plusieurs matières premières.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={openCreateModal}
              disabled={disabled}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />

              <Text style={styles.primaryButtonText}>Ajouter une recette</Text>
            </Pressable>
          </View>
        </View>

        {renderModal()}
      </>
    );
  }

  // ==========================================================
  // RECIPE NOT LOADED
  // ==========================================================

  if (!recipe) {
    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <MaterialCommunityIcons
                name="flask-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.cardHeaderContent}>
              <Text style={styles.cardTitle}>Recette</Text>

              <Text style={styles.cardSubtitle}>
                La recette associée n'est pas disponible
              </Text>
            </View>
          </View>

          <View style={styles.warningContent}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={COLORS.warning}
            />

            <Text style={styles.warningText}>
              La recette associée à ce produit n'a pas pu être chargée.
            </Text>
          </View>
        </View>

        {renderModal()}
      </>
    );
  }

  // ==========================================================
  // EXISTING RECIPE
  // ==========================================================

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <MaterialCommunityIcons
              name="flask-outline"
              size={20}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.cardHeaderContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{recipe.name}</Text>

              <View style={styles.recipeCountBadge}>
                <Text style={styles.recipeCountText}>
                  {recipe.items.length} ingrédient
                  {recipe.items.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>Composition du produit</Text>
          </View>
        </View>

        {/* ================================================ */}
        {/* REFERENCE VOLUME                               */}
        {/* ================================================ */}

        <View style={styles.mainReferenceBox}>
          <View style={styles.mainReferenceIcon}>
            <MaterialCommunityIcons
              name="cup-water"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.mainReferenceContent}>
            <Text style={styles.mainReferenceLabel}>Volume de référence</Text>

            <Text style={styles.mainReferenceValue}>
              {formatVolume(recipe.productionVolumeMl)}
            </Text>
          </View>

          <View style={styles.mainReferenceBadge}>
            <Text style={styles.mainReferenceBadgeText}>Lot de référence</Text>
          </View>
        </View>

        {/* ================================================ */}
        {/* DESCRIPTION                                    */}
        {/* ================================================ */}

        {recipe.description && (
          <View style={styles.descriptionBox}>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={COLORS.Gray}
            />

            <Text style={styles.descriptionText}>{recipe.description}</Text>
          </View>
        )}

        {/* ================================================ */}
        {/* INGREDIENTS                                    */}
        {/* ================================================ */}

        <View style={styles.recipeItems}>
          {recipe.items.map((item, index) => (
            <View key={item.id} style={styles.recipeItem}>
              <View style={styles.recipeItemNumber}>
                <Text style={styles.recipeItemNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.recipeItemContent}>
                <Text style={styles.recipeItemName}>
                  {getIngredientName(item.ingredientId)}
                </Text>

                <Text style={styles.recipeItemUnit}>
                  Unité de stock : {getIngredientUnit(item.ingredientId)}
                </Text>
              </View>

              <View style={styles.recipeItemQuantity}>
                <Text style={styles.recipeItemQuantityValue}>
                  {item.quantity}
                </Text>

                <Text style={styles.recipeItemQuantityUnit}>
                  {getIngredientUnit(item.ingredientId)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ================================================ */}
        {/* HELPER                                          */}
        {/* ================================================ */}

        <View style={styles.recipeReferenceHint}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={COLORS.info}
          />

          <Text style={styles.recipeReferenceHintText}>
            Ces quantités correspondent à un lot de{" "}
            {formatVolume(recipe.productionVolumeMl)}. Lors d'une production,
            elles seront automatiquement mises à l'échelle selon le volume
            souhaité.
          </Text>
        </View>

        {/* ================================================ */}
        {/* ACTIONS                                         */}
        {/* ================================================ */}

        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
            onPress={openEditModal}
            disabled={disabled}
          >
            <Ionicons name="create-outline" size={17} color={COLORS.primary} />

            <Text style={styles.editButtonText}>Modifier</Text>
          </Pressable>

          <View style={styles.actionDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
            onPress={handleDeleteRecipe}
            disabled={disabled || isDeletingRecipe || isUpdatingProduct}
          >
            {isDeletingRecipe || isUpdatingProduct ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Ionicons name="trash-outline" size={17} color={COLORS.error} />
            )}

            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </Pressable>
        </View>
      </View>

      {renderModal()}
    </>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ========================================================
  // MAIN CARD
  // ========================================================

  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  cardHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  cardHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardTitle: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  cardSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  recipeCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5EF",
  },

  recipeCountText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: COLORS.primary,
  },

  // ========================================================
  // REFERENCE VOLUME MAIN
  // ========================================================

  mainReferenceBox: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#F6F8F4",
    borderWidth: 1,
    borderColor: "#E2E9DF",
    flexDirection: "row",
    alignItems: "center",
  },

  mainReferenceIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  mainReferenceContent: {
    flex: 1,
    marginLeft: 9,
  },

  mainReferenceLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  mainReferenceValue: {
    marginTop: 1,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.primary,
  },

  mainReferenceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "#EAF2E7",
  },

  mainReferenceBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: COLORS.primary,
  },

  // ========================================================
  // NO RECIPE
  // ========================================================

  noRecipeContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  noRecipeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F0",
  },

  noRecipeTitle: {
    marginTop: 12,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  noRecipeText: {
    marginTop: 5,
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.Gray,
    textAlign: "center",
  },

  primaryButton: {
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  primaryButtonPressed: {
    opacity: 0.8,
  },

  primaryButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.white,
  },

  // ========================================================
  // WARNING
  // ========================================================

  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F3E3B7",
  },

  warningText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
    color: "#80691D",
  },

  // ========================================================
  // DESCRIPTION
  // ========================================================

  descriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
  },

  descriptionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.darkGray,
  },

  // ========================================================
  // RECIPE ITEMS
  // ========================================================

  recipeItems: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  recipeItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  recipeItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5EF",
  },

  recipeItemNumberText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: COLORS.primary,
  },

  recipeItemContent: {
    flex: 1,
    marginLeft: 10,
  },

  recipeItemName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  recipeItemUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  recipeItemQuantity: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 10,
  },

  recipeItemQuantityValue: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.primary,
  },

  recipeItemQuantityUnit: {
    marginLeft: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  // ========================================================
  // RECIPE REFERENCE HINT
  // ========================================================

  recipeReferenceHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginHorizontal: 16,
    marginTop: 11,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "#F4F8FC",
  },

  recipeReferenceHintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.darkGray,
  },

  // ========================================================
  // CARD ACTIONS
  // ========================================================

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F0ED",
  },

  editButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
  },

  editButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  deleteButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
  },

  deleteButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.error,
  },

  actionDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },

  // ========================================================
  // LOADING
  // ========================================================

  loadingRow: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  // ========================================================
  // MODAL ROOT
  // ========================================================

  modalRoot: {
    flex: 1,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },

  // ========================================================
  // MODAL CONTAINER
  // ========================================================

  modalContainer: {
    width: "100%",
    height: "91%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  // ========================================================
  // MODAL HEADER
  // ========================================================

  modalHeader: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAE7",
  },

  modalHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  modalHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,
    paddingRight: 5,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 36,
    height: 36,
    marginLeft: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F1",
  },

  // ========================================================
  // MODAL SCROLL
  // ========================================================

  modalScroll: {
    flex: 1,
  },

  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  modalBottomSpacer: {
    height: 20,
  },

  // ========================================================
  // SECTIONS
  // ========================================================

  section: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  ingredientsHeaderIcon: {
    backgroundColor: "#EEF5EA",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  countBadge: {
    minWidth: 22,
    height: 21,
    paddingHorizontal: 6,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5EF",
  },

  countBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: COLORS.primary,
  },

  // ========================================================
  // INPUTS
  // ========================================================

  inputLabel: {
    marginBottom: 6,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  textInput: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E1",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: COLORS.text,
  },

  descriptionInput: {
    minHeight: 82,
    marginBottom: 0,
    lineHeight: 17,
  },

  characterCount: {
    alignItems: "flex-end",
    marginTop: 4,
  },

  characterCountText: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ========================================================
  // REFERENCE VOLUME INPUT
  // ========================================================

  volumeInputContainer: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DFE3DC",
    backgroundColor: COLORS.white,
    overflow: "hidden",
    marginBottom: 8,
  },

  volumeIcon: {
    width: 32,
    height: 32,
    marginLeft: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  volumeInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  volumeUnit: {
    height: "100%",
    minWidth: 45,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#E8E8E5",
    backgroundColor: "#F7F8F5",
  },

  volumeUnitText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.primary,
  },

  referenceHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  referenceHintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  // ========================================================
  // REFERENCE SUMMARY MODAL
  // ========================================================

  referenceVolumeBox: {
    marginBottom: 12,
    padding: 11,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F8F4",
    borderWidth: 1,
    borderColor: "#E2E9DF",
  },

  referenceVolumeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  referenceVolumeContent: {
    flex: 1,
    marginLeft: 9,
  },

  referenceVolumeLabel: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  referenceVolumeValue: {
    marginTop: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  referenceVolumeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#EAF2E7",
  },

  referenceVolumeBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 7.5,
    color: COLORS.primary,
  },

  // ========================================================
  // ITEMS
  // ========================================================

  itemsList: {
    gap: 9,
  },

  itemCard: {
    flexDirection: "row",
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#ECECE8",
  },

  itemNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  itemNumberText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: COLORS.primary,
  },

  itemContent: {
    flex: 1,
    marginLeft: 9,
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  itemNameContainer: {
    flex: 1,
    paddingRight: 7,
  },

  itemName: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  itemUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  removeItemButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEEEE",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },

  quantityLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  quantityLabel: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.darkGray,
  },

  quantityInputContainer: {
    width: 110,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DFE3DC",
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },

  quantityInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
    textAlign: "right",
  },

  quantityUnit: {
    paddingRight: 8,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ========================================================
  // EMPTY ITEMS
  // ========================================================

  emptyItems: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DCDDD8",
  },

  emptyItemsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F1ED",
  },

  emptyItemsTitle: {
    marginTop: 8,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  emptyItemsText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ========================================================
  // ADD BOX
  // ========================================================

  addBox: {
    marginTop: 12,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#F6F8F4",
    borderWidth: 1,
    borderColor: "#E2E9DF",
  },

  addBoxHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  addBoxTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  addBoxSubtitle: {
    maxWidth: 250,
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  limitBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#EAF2E7",
  },

  limitBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: COLORS.primary,
  },

  // ========================================================
  // SELECT
  // ========================================================

  selectButton: {
    minHeight: 45,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DFE3DC",
    backgroundColor: COLORS.white,
  },

  selectLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  selectIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  selectText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.text,
  },

  selectPlaceholder: {
    color: COLORS.Gray,
  },

  disabledInput: {
    opacity: 0.55,
  },

  // ========================================================
  // PICKER
  // ========================================================

  pickerContainer: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    overflow: "hidden",
  },

  pickerHeader: {
    minHeight: 54,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1ED",
  },

  pickerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  pickerSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  pickerList: {
    maxHeight: 190,
  },

  pickerListContent: {
    padding: 5,
  },

  ingredientOption: {
    minHeight: 52,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  ingredientOptionSelected: {
    backgroundColor: "#F1F5EF",
  },

  ingredientIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  ingredientOptionContent: {
    flex: 1,
    marginLeft: 8,
  },

  ingredientOptionName: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.text,
  },

  ingredientOptionUnit: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
  },

  alreadyAddedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#F0F0EE",
  },

  alreadyAddedText: {
    fontFamily: fonts.medium,
    fontSize: 7.5,
    color: COLORS.Gray,
  },

  disabledText: {
    color: COLORS.Gray,
  },

  emptyPicker: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
  },

  emptyPickerTitle: {
    marginTop: 7,
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  emptyPickerText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
    textAlign: "center",
  },

  // ========================================================
  // ADD QUANTITY
  // ========================================================

  quantityAddRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  quantityAddField: {
    flex: 1,
  },

  quantityAddInputContainer: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DFE3DC",
    backgroundColor: COLORS.white,
  },

  quantityAddInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  quantityAddUnit: {
    paddingRight: 10,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  addButton: {
    height: 45,
    minWidth: 86,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: COLORS.primary,
  },

  addButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  addButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  addButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.white,
  },

  addButtonTextDisabled: {
    color: COLORS.Gray,
  },

  // ========================================================
  // HELPER
  // ========================================================

  helperBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 11,
    paddingHorizontal: 2,
  },

  helperText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  // ========================================================
  // ERROR FIXE
  // ========================================================

  errorArea: {
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFF4F3",
    borderTopWidth: 1,
    borderTopColor: "#F4D8D5",
  },

  errorIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDE5E3",
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.error,
  },

  // ========================================================
  // FOOTER FIXE
  // ========================================================

  modalFooter: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E5",
  },

  cancelButton: {
    width: 90,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2EF",
  },

  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  submitButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  submitButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  // ========================================================
  // GENERAL
  // ========================================================

  pressed: {
    opacity: 0.55,
  },
});
