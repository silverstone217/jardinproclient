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

const formatVolume = (volumeMl: number) => {
  if (!Number.isFinite(volumeMl)) {
    return "0 ml";
  }

  if (volumeMl >= 1000) {
    return `${(volumeMl / 1000).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} L`;
  }

  return `${volumeMl.toLocaleString("fr-FR")} ml`;
};

export function ProductRecipe({
  product,
  disabled = false,
}: ProductRecipeProps) {
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

  const itemsRef = useRef<DraftItem[]>([]);
  const contentScrollRef = useRef<ScrollView>(null);
  const errorScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    initializeRecipes();
    initializeIngredients();
  }, [initializeRecipes, initializeIngredients]);

  // ============================================================
  // RECIPE
  // ============================================================

  const recipe = useMemo<Recipe | undefined>(() => {
    if (product.recipe) {
      return product.recipe;
    }

    return recipes.find((item) => item.productId === product.id);
  }, [product.recipe, product.id, recipes]);

  // ============================================================
  // INGREDIENTS
  // ============================================================

  const activeIngredients = useMemo(() => {
    return [...rawIngredients]
      .filter((ingredient) => ingredient.isActive)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [rawIngredients]);

  const getIngredient = (ingredientId: string) => {
    return rawIngredients.find((ingredient) => ingredient.id === ingredientId);
  };

  const getIngredientName = (ingredientId: string) => {
    return getIngredient(ingredientId)?.name ?? "Matière inconnue";
  };

  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = getIngredient(ingredientId);

    if (!ingredient) {
      return "";
    }

    return UNIT_LABELS[ingredient.unit] ?? ingredient.unit.toLowerCase();
  };

  // ============================================================
  // DRAFT SOURCE OF TRUTH
  // ============================================================

  const updateDraftItems = (
    updater: DraftItem[] | ((current: DraftItem[]) => DraftItem[]),
  ) => {
    setItems((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;

      itemsRef.current = next;

      return next;
    });
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetForm = () => {
    setRecipeName("");
    setRecipeDescription("");
    setProductionVolumeMl("");
    setSelectedIngredientId(null);
    setQuantity("");
    setItems([]);

    itemsRef.current = [];

    setLocalError(null);
    setIsIngredientPickerVisible(false);
  };

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const openCreateModal = () => {
    if (disabled) {
      return;
    }

    resetForm();

    setMode("create");
    setIsModalVisible(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEditModal = () => {
    if (disabled || !recipe) {
      return;
    }

    const draftItems: DraftItem[] = recipe.items.map((item) => ({
      id: item.id,
      ingredientId: item.ingredientId,
      quantity: String(item.quantity),
    }));

    setRecipeName(recipe.name);
    setRecipeDescription(recipe.description ?? "");
    setProductionVolumeMl(String(recipe.productionVolumeMl));

    setSelectedIngredientId(null);
    setQuantity("");

    setItems(draftItems);
    itemsRef.current = draftItems;

    setLocalError(null);
    setIsIngredientPickerVisible(false);

    setMode("edit");
    setIsModalVisible(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    Keyboard.dismiss();

    setIsIngredientPickerVisible(false);
    setIsModalVisible(false);
    setLocalError(null);
  };

  // ============================================================
  // ERROR
  // ============================================================

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

  // ============================================================
  // ADD ITEM
  // ============================================================

  const handleAddItem = () => {
    if (!selectedIngredientId) {
      showError("Sélectionnez une matière première.");
      return;
    }

    if (itemsRef.current.length >= MAX_ITEMS) {
      showError(
        `Une recette ne peut pas contenir plus de ${MAX_ITEMS} ingrédients.`,
      );
      return;
    }

    const alreadyExists = itemsRef.current.some(
      (item) => item.ingredientId === selectedIngredientId,
    );

    if (alreadyExists) {
      showError("Cette matière première est déjà présente dans la recette.");
      return;
    }

    const normalizedQuantity = Number(quantity.replace(",", ".").trim());

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      showError("La quantité doit être supérieure à 0.");
      return;
    }

    const nextItems = [
      ...itemsRef.current,
      {
        ingredientId: selectedIngredientId,
        quantity: String(normalizedQuantity),
      },
    ];

    updateDraftItems(nextItems);

    setSelectedIngredientId(null);
    setQuantity("");
    setIsIngredientPickerVisible(false);
    setLocalError(null);

    requestAnimationFrame(() => {
      contentScrollRef.current?.scrollToEnd({
        animated: true,
      });
    });
  };

  // ============================================================
  // QUANTITY CHANGE
  // ============================================================

  const handleQuantityChange = (index: number, value: string) => {
    const sanitized = value.replace(",", ".").replace(/[^0-9.]/g, "");

    const parts = sanitized.split(".");

    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;

    updateDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              quantity: normalized,
            }
          : item,
      ),
    );
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const handleRemoveItem = (index: number) => {
    updateDraftItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // ============================================================
  // SELECT INGREDIENT
  // ============================================================

  const handleSelectIngredient = (ingredientId: string) => {
    const alreadyExists = itemsRef.current.some(
      (item) => item.ingredientId === ingredientId,
    );

    if (alreadyExists) {
      return;
    }

    setSelectedIngredientId(ingredientId);
    setIsIngredientPickerVisible(false);
    setLocalError(null);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
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

    const volumeMl = Number(productionVolumeMl.replace(",", ".").trim());

    if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
      showError("Le volume de référence doit être supérieur à 0.");
      return false;
    }

    if (!Number.isInteger(volumeMl)) {
      showError("Le volume de référence doit être un nombre entier en ml.");
      return false;
    }

    if (itemsRef.current.length === 0) {
      showError("Ajoutez au moins une matière première à la recette.");
      return false;
    }

    if (itemsRef.current.length > MAX_ITEMS) {
      showError(
        `Une recette ne peut pas contenir plus de ${MAX_ITEMS} ingrédients.`,
      );
      return false;
    }

    const ingredientIds = new Set<string>();

    for (const item of itemsRef.current) {
      if (ingredientIds.has(item.ingredientId)) {
        showError(
          "Une même matière première ne peut apparaître qu'une seule fois dans la recette.",
        );
        return false;
      }

      ingredientIds.add(item.ingredientId);

      const itemQuantity = Number(item.quantity.replace(",", ".").trim());

      if (!Number.isFinite(itemQuantity) || itemQuantity <= 0) {
        showError(
          `La quantité de « ${getIngredientName(
            item.ingredientId,
          )} » doit être supérieure à 0.`,
        );
        return false;
      }
    }

    return true;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (disabled || isSubmitting || isCreatingRecipe || isUpdatingRecipe) {
      return;
    }

    Keyboard.dismiss();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    const volumeMl = Number(productionVolumeMl.replace(",", ".").trim());

    const normalizedItems = itemsRef.current.map((item) => ({
      ...item,
      quantity: Number(item.quantity.replace(",", ".").trim()),
    }));

    setIsSubmitting(true);

    try {
      // ======================================================
      // CRÉATION
      // ======================================================

      if (mode === "create") {
        const payload: CreateRecipePayload = {
          productId: product.id,

          name: recipeName.trim(),

          description: recipeDescription.trim(),

          productionVolumeMl: volumeMl,

          items: normalizedItems.map((item) => ({
            ingredientId: item.ingredientId,

            quantity: item.quantity,
          })),
        };

        await useRecipeStore.getState().createRecipe(payload);

        Alert.alert(
          "Recette créée",
          "La recette du produit a été créée avec succès.",
        );
      }

      // ======================================================
      // MODIFICATION
      // ======================================================
      else {
        if (!recipe) {
          throw new Error("La recette à modifier est introuvable.");
        }

        const payload: UpdateRecipePayload = {
          name: recipeName.trim(),

          description: recipeDescription.trim(),

          productionVolumeMl: volumeMl,

          items: normalizedItems.map(
            (item): UpdateRecipeItemPayload => ({
              ...(item.id ? { id: item.id } : {}),

              ingredientId: item.ingredientId,

              quantity: item.quantity,
            }),
          ),
        };

        await useRecipeStore.getState().updateRecipe(recipe.id, payload);

        Alert.alert(
          "Recette mise à jour",
          "La recette du produit a été mise à jour avec succès.",
        );
      }

      setIsModalVisible(false);
      setIsIngredientPickerVisible(false);
      setLocalError(null);
    } catch (error) {
      console.error("Erreur sauvegarde recette :", error);

      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la recette.";

      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDeleteRecipe = () => {
    if (disabled || !recipe || isDeletingRecipe) {
      return;
    }

    Alert.alert(
      "Supprimer la recette",
      `Voulez-vous vraiment supprimer la recette « ${recipe.name} » ?\n\nCette action supprimera également sa composition.`,
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
              await useRecipeStore.getState().deleteRecipe(recipe.id);

              Alert.alert(
                "Recette supprimée",
                "La recette du produit a été supprimée avec succès.",
              );
            } catch (error) {
              console.error("Erreur suppression recette :", error);

              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Impossible de supprimer la recette.",
              );
            }
          },
        },
      ],
    );
  };

  // ============================================================
  // LOADING / BUSY
  // ============================================================

  const isLoading = isLoadingRecipes || isLoadingIngredients;

  const isBusy =
    disabled ||
    isSubmitting ||
    isCreatingRecipe ||
    isUpdatingRecipe ||
    isDeletingRecipe;

  // ============================================================
  // DRAFT ITEM
  // ============================================================

  const renderDraftItem = (item: DraftItem, index: number) => {
    const ingredient = getIngredient(item.ingredientId);

    const unit = getIngredientUnit(item.ingredientId);

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
                {ingredient?.name ?? "Matière inconnue"}
              </Text>

              <Text style={styles.itemUnit}>Unité de stock : {unit}</Text>
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
              <Ionicons name="trash-outline" size={15} color={COLORS.error} />
            </Pressable>
          </View>

          <View style={styles.quantityRow}>
            <View style={styles.quantityLabelContainer}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={13}
                color={COLORS.Gray}
              />

              <Text style={styles.quantityLabel}>Quantité</Text>
            </View>

            <View style={styles.quantityInputContainer}>
              <TextInput
                value={item.quantity}
                onChangeText={(value) => handleQuantityChange(index, value)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={COLORS.Gray}
                editable={!isBusy}
                style={styles.quantityInput}
              />

              <Text style={styles.quantityUnit}>{unit}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // INGREDIENT PICKER
  // ============================================================

  const renderIngredientPicker = () => {
    const addedIngredientIds = new Set(
      itemsRef.current.map((item) => item.ingredientId),
    );

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <View>
            <Text style={styles.pickerTitle}>Choisir une matière première</Text>

            <Text style={styles.pickerSubtitle}>
              Seules les matières actives sont affichées
            </Text>
          </View>

          <Pressable
            onPress={() => setIsIngredientPickerVisible(false)}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={COLORS.Gray} />
          </Pressable>
        </View>

        {activeIngredients.length === 0 ? (
          <View style={styles.emptyPicker}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={27}
              color={COLORS.Gray}
            />

            <Text style={styles.emptyPickerTitle}>Aucune matière première</Text>

            <Text style={styles.emptyPickerText}>
              Ajoutez d'abord des matières premières dans la section
              correspondante.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.pickerList}
            contentContainerStyle={styles.pickerListContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {activeIngredients.map((ingredient) => {
              const alreadyAdded = addedIngredientIds.has(ingredient.id);

              const selected = selectedIngredientId === ingredient.id;

              return (
                <Pressable
                  key={ingredient.id}
                  style={({ pressed }) => [
                    styles.ingredientOption,
                    selected && styles.ingredientOptionSelected,
                    pressed && !alreadyAdded && styles.pressed,
                  ]}
                  onPress={() => handleSelectIngredient(ingredient.id)}
                  disabled={alreadyAdded || isBusy}
                >
                  <View style={styles.ingredientIcon}>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={15}
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
                      Unité : {UNIT_LABELS[ingredient.unit] ?? ingredient.unit}
                    </Text>
                  </View>

                  {alreadyAdded ? (
                    <View style={styles.alreadyAddedBadge}>
                      <Text style={styles.alreadyAddedText}>Déjà ajouté</Text>
                    </View>
                  ) : selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={COLORS.lightGray}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // ============================================================
  // MODAL
  // ============================================================

  const renderModal = () => {
    if (!isModalVisible) {
      return null;
    }

    const selectedIngredient = selectedIngredientId
      ? getIngredient(selectedIngredientId)
      : undefined;

    const selectedUnit = selectedIngredient
      ? (UNIT_LABELS[selectedIngredient.unit] ?? selectedIngredient.unit)
      : "";

    return (
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  {/* HEADER */}
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
                          ? "Ajouter une recette"
                          : "Modifier la recette"}
                      </Text>

                      <Text style={styles.modalSubtitle} numberOfLines={2}>
                        {mode === "create"
                          ? `Définissez la recette de « ${product.name} ».`
                          : `Modifiez la composition de « ${product.name} ».`}
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.closeButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={closeModal}
                      disabled={isSubmitting}
                      hitSlop={5}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={COLORS.darkGray}
                      />
                    </Pressable>
                  </View>

                  {/* CONTENT */}
                  <ScrollView
                    ref={contentScrollRef}
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                  >
                    {/* RECIPE INFORMATION */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderIcon}>
                          <MaterialCommunityIcons
                            name="text-box-edit-outline"
                            size={18}
                            color={COLORS.primary}
                          />
                        </View>

                        <View style={styles.sectionHeaderContent}>
                          <Text style={styles.sectionTitle}>Informations</Text>

                          <Text style={styles.sectionSubtitle}>
                            Identifiez clairement cette recette
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.inputLabel}>Nom de la recette</Text>

                      <TextInput
                        value={recipeName}
                        onChangeText={setRecipeName}
                        placeholder="Ex. Jus Ananas Gingembre"
                        placeholderTextColor={COLORS.Gray}
                        style={styles.textInput}
                        maxLength={80}
                        editable={!isBusy}
                        autoCapitalize="sentences"
                        autoCorrect={false}
                      />

                      <Text style={styles.inputLabel}>Description</Text>

                      <TextInput
                        value={recipeDescription}
                        onChangeText={setRecipeDescription}
                        placeholder="Décrivez brièvement cette recette..."
                        placeholderTextColor={COLORS.Gray}
                        style={[styles.textInput, styles.descriptionInput]}
                        maxLength={500}
                        editable={!isBusy}
                        multiline
                        textAlignVertical="top"
                      />

                      <View style={styles.characterCount}>
                        <Text style={styles.characterCountText}>
                          {recipeDescription.length}
                          /500
                        </Text>
                      </View>
                    </View>

                    {/* REFERENCE VOLUME */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderIcon}>
                          <MaterialCommunityIcons
                            name="cup-water"
                            size={18}
                            color={COLORS.primary}
                          />
                        </View>

                        <View style={styles.sectionHeaderContent}>
                          <Text style={styles.sectionTitle}>
                            Volume de référence
                          </Text>

                          <Text style={styles.sectionSubtitle}>
                            Le volume correspondant aux quantités de la recette
                          </Text>
                        </View>
                      </View>

                      <View style={styles.volumeInputContainer}>
                        <View style={styles.volumeIcon}>
                          <MaterialCommunityIcons
                            name="beaker-outline"
                            size={16}
                            color={COLORS.primary}
                          />
                        </View>

                        <TextInput
                          value={productionVolumeMl}
                          onChangeText={(value) =>
                            setProductionVolumeMl(value.replace(/[^0-9]/g, ""))
                          }
                          placeholder="2000"
                          placeholderTextColor={COLORS.Gray}
                          keyboardType="number-pad"
                          style={styles.volumeInput}
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
                          Exemple : si la recette est prévue pour 2 L et que
                          vous produisez 10 L, les quantités seront multipliées
                          par 5.
                        </Text>
                      </View>

                      {Number(productionVolumeMl) > 0 && (
                        <View style={styles.referenceVolumeBox}>
                          <View style={styles.referenceVolumeIcon}>
                            <MaterialCommunityIcons
                              name="flask-outline"
                              size={16}
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
                    </View>

                    {/* INGREDIENTS */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View
                          style={[
                            styles.sectionHeaderIcon,
                            styles.ingredientsHeaderIcon,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="food-apple-outline"
                            size={18}
                            color={COLORS.primary}
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
                            Matières premières utilisées pour le lot de
                            référence
                          </Text>
                        </View>
                      </View>

                      {items.length === 0 ? (
                        <View style={styles.emptyItems}>
                          <View style={styles.emptyItemsIcon}>
                            <MaterialCommunityIcons
                              name="basket-outline"
                              size={21}
                              color={COLORS.Gray}
                            />
                          </View>

                          <Text style={styles.emptyItemsTitle}>
                            Aucune matière première
                          </Text>

                          <Text style={styles.emptyItemsText}>
                            Ajoutez les ingrédients qui composent cette recette.
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.itemsList}>
                          {items.map(renderDraftItem)}
                        </View>
                      )}

                      {/* ADD BOX */}
                      <View style={styles.addBox}>
                        <View style={styles.addBoxHeader}>
                          <View>
                            <Text style={styles.addBoxTitle}>
                              Ajouter une matière
                            </Text>

                            <Text style={styles.addBoxSubtitle}>
                              Sélectionnez une matière première puis indiquez sa
                              quantité.
                            </Text>
                          </View>

                          <View style={styles.limitBadge}>
                            <Text style={styles.limitBadgeText}>
                              {items.length}/{MAX_ITEMS}
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          style={({ pressed }) => [
                            styles.selectButton,
                            isBusy && styles.disabledInput,
                            pressed && !isBusy && styles.pressed,
                          ]}
                          onPress={() => {
                            Keyboard.dismiss();

                            setIsIngredientPickerVisible((visible) => !visible);
                          }}
                          disabled={isBusy || items.length >= MAX_ITEMS}
                        >
                          <View style={styles.selectLeft}>
                            <View style={styles.selectIcon}>
                              <MaterialCommunityIcons
                                name="leaf"
                                size={15}
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
                              {selectedIngredient
                                ? selectedIngredient.name
                                : "Sélectionner une matière première"}
                            </Text>
                          </View>

                          <Ionicons
                            name={
                              isIngredientPickerVisible
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={17}
                            color={COLORS.Gray}
                          />
                        </Pressable>

                        {isIngredientPickerVisible && renderIngredientPicker()}

                        <View style={styles.quantityAddRow}>
                          <View style={styles.quantityAddField}>
                            <Text style={styles.inputLabel}>Quantité</Text>

                            <View style={styles.quantityAddInputContainer}>
                              <TextInput
                                value={quantity}
                                onChangeText={(value) =>
                                  setQuantity(
                                    value
                                      .replace(",", ".")
                                      .replace(/[^0-9.]/g, ""),
                                  )
                                }
                                placeholder="0"
                                placeholderTextColor={COLORS.Gray}
                                keyboardType="decimal-pad"
                                style={styles.quantityAddInput}
                                editable={!isBusy}
                              />

                              <Text style={styles.quantityAddUnit}>
                                {selectedUnit || "unité"}
                              </Text>
                            </View>
                          </View>

                          <Pressable
                            style={({ pressed }) => [
                              styles.addButton,
                              (!selectedIngredientId || !quantity || isBusy) &&
                                styles.addButtonDisabled,
                              pressed &&
                                selectedIngredientId &&
                                quantity &&
                                !isBusy &&
                                styles.addButtonPressed,
                            ]}
                            onPress={handleAddItem}
                            disabled={
                              !selectedIngredientId || !quantity || isBusy
                            }
                          >
                            <Ionicons
                              name="add"
                              size={17}
                              color={
                                !selectedIngredientId || !quantity || isBusy
                                  ? COLORS.Gray
                                  : COLORS.white
                              }
                            />

                            <Text
                              style={[
                                styles.addButtonText,
                                (!selectedIngredientId ||
                                  !quantity ||
                                  isBusy) &&
                                  styles.addButtonTextDisabled,
                              ]}
                            >
                              Ajouter
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.helperBox}>
                        <Ionicons
                          name="information-circle-outline"
                          size={14}
                          color={COLORS.info}
                        />

                        <Text style={styles.helperText}>
                          Les quantités indiquées correspondent uniquement au
                          lot de référence. Pendant une production, elles
                          pourront être ajustées selon les besoins réels.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalBottomSpacer} />
                  </ScrollView>

                  {/* ERROR */}
                  {(localError || recipeError) && (
                    <View style={styles.errorArea}>
                      <View style={styles.errorIcon}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={17}
                          color={COLORS.error}
                        />
                      </View>

                      <Text style={styles.errorText}>
                        {localError ?? recipeError}
                      </Text>
                    </View>
                  )}

                  {/* FOOTER */}
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
                      {isSubmitting || isCreatingRecipe || isUpdatingRecipe ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Ionicons
                          name={
                            mode === "create"
                              ? "add-circle-outline"
                              : "checkmark-circle-outline"
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

  // ============================================================
  // MAIN CARD
  // ============================================================

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

  // ============================================================
  // NO RECIPE
  // ============================================================

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

  // ============================================================
  // EXISTING RECIPE
  // ============================================================

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
              <Text style={styles.cardTitle} numberOfLines={1}>
                {recipe.name}
              </Text>

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

        {/* REFERENCE VOLUME */}

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

        {/* DESCRIPTION */}

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

        {/* INGREDIENTS */}

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

        {/* HELPER */}

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

        {/* ACTIONS */}

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
            disabled={disabled || isDeletingRecipe}
          >
            {isDeletingRecipe ? (
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
  // ==========================================================
  // MAIN CARD
  // ==========================================================

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

  // ==========================================================
  // REFERENCE VOLUME MAIN
  // ==========================================================

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

  // ==========================================================
  // NO RECIPE
  // ==========================================================

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

  // ==========================================================
  // DESCRIPTION
  // ==========================================================

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

  // ==========================================================
  // RECIPE ITEMS
  // ==========================================================

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

  // ==========================================================
  // RECIPE REFERENCE HINT
  // ==========================================================

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

  // ==========================================================
  // CARD ACTIONS
  // ==========================================================

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

  // ==========================================================
  // LOADING
  // ==========================================================

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

  // ==========================================================
  // MODAL ROOT
  // ==========================================================

  modalRoot: {
    flex: 1,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },

  modalContainer: {
    width: "100%",
    height: "91%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  // ==========================================================
  // MODAL HEADER
  // ==========================================================

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

  // ==========================================================
  // MODAL SCROLL
  // ==========================================================

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

  // ==========================================================
  // SECTIONS
  // ==========================================================

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

  // ==========================================================
  // INPUTS
  // ==========================================================

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

  // ==========================================================
  // REFERENCE VOLUME INPUT
  // ==========================================================

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

  // ==========================================================
  // REFERENCE SUMMARY MODAL
  // ==========================================================

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

  // ==========================================================
  // ITEMS
  // ==========================================================

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

  // ==========================================================
  // EMPTY ITEMS
  // ==========================================================

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

  // ==========================================================
  // ADD BOX
  // ==========================================================

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

  // ==========================================================
  // SELECT
  // ==========================================================

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

  // ==========================================================
  // PICKER
  // ==========================================================

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

  // ==========================================================
  // ADD QUANTITY
  // ==========================================================

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

  // ==========================================================
  // HELPER
  // ==========================================================

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

  // ==========================================================
  // ERROR FIXE
  // ==========================================================

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

  // ==========================================================
  // FOOTER FIXE
  // ==========================================================

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

  // ==========================================================
  // GENERAL
  // ==========================================================

  pressed: {
    opacity: 0.55,
  },
});
