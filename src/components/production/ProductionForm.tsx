import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePackagingStore } from "@/store/packaging.store";
import { useProductStore } from "@/store/product.store";
import { useProductionStore } from "@/store/production.store";
import { useRawIngredientStore } from "@/store/raw-ingredient.store";
import { useRecipeStore } from "@/store/recipe.store";

import { COLORS, fonts } from "@/utils/styles";

import type { CreateProductionPayload } from "@/types/production";

import { ProductionFormFooter } from "./ProductionFormFooter";
import { ProductionIngredientsSection } from "./ProductionIngredientsSection";
import { ProductionProductSelector } from "./ProductionProductSelector";
import { ProductionRecipeSection } from "./ProductionRecipeSection";
import { ProductionVariantsSection } from "./ProductionVariantsSection";

interface ProductionFormProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductionPayload) => Promise<void>;
}

interface IngredientFormItem {
  ingredientId: string;
  quantity: string;
  manuallyEdited: boolean;
}

interface VariantFormItem {
  variantId: string;
  quantityProduced: string;
}

export default function ProductionForm({
  visible,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductionFormProps) {
  const {
    products,
    isLoading: isProductsLoading,
    initialize: initializeProducts,
  } = useProductStore();

  const {
    recipes,
    isLoading: isRecipesLoading,
    initialize: initializeRecipes,
  } = useRecipeStore();

  const {
    rawIngredients,
    isLoading: isIngredientsLoading,
    initialize: initializeIngredients,
  } = useRawIngredientStore();

  const {
    packagings,
    isLoading: isPackagingsLoading,
    initialize: initializePackagings,
  } = usePackagingStore();

  const { error: productionError, clearError } = useProductionStore();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const [totalVolumeMl, setTotalVolumeMl] = useState("");

  const [ingredients, setIngredients] = useState<IngredientFormItem[]>([]);

  const [variants, setVariants] = useState<VariantFormItem[]>([]);

  const [showProductSelector, setShowProductSelector] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId],
  );

  const activeVariants = useMemo(
    () => selectedProduct?.variants.filter((variant) => variant.isActive) ?? [],
    [selectedProduct],
  );

  const isInitialLoading =
    isProductsLoading ||
    isRecipesLoading ||
    isIngredientsLoading ||
    isPackagingsLoading;

  const referenceVolumeMl = selectedRecipe?.productionVolumeMl ?? 0;

  const volumeMl = Number(totalVolumeMl) || 0;

  const volumeMultiplier =
    referenceVolumeMl > 0 ? volumeMl / referenceVolumeMl : 1;

  const roundIngredientQuantity = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }

    return String(Math.ceil(value));
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    let mounted = true;

    const initialize = async () => {
      try {
        await Promise.all([
          initializeProducts(),
          initializeRecipes(),
          initializeIngredients(),
          initializePackagings(),
        ]);

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Erreur initialisation formulaire production :", error);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [
    visible,
    initializeProducts,
    initializeRecipes,
    initializeIngredients,
    initializePackagings,
  ]);

  useEffect(() => {
    if (!selectedProductId) {
      setSelectedRecipeId(null);
      setIngredients([]);
      setVariants([]);
      setTotalVolumeMl("");
      return;
    }

    const product = products.find((item) => item.id === selectedProductId);

    if (!product) {
      return;
    }

    const recipe = recipes.find((item) => item.productId === selectedProductId);

    setSelectedRecipeId(recipe?.id ?? null);

    if (recipe) {
      setTotalVolumeMl(String(recipe.productionVolumeMl));

      setIngredients(
        recipe.items.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: String(item.quantity),
          manuallyEdited: false,
        })),
      );
    } else {
      setTotalVolumeMl("");
      setIngredients([]);
    }

    setVariants(
      product.variants
        .filter((variant) => variant.isActive)
        .map((variant) => ({
          variantId: variant.id,
          quantityProduced: "",
        })),
    );
  }, [selectedProductId, products, recipes]);

  useEffect(() => {
    if (!selectedRecipe) {
      return;
    }

    setIngredients((current) =>
      selectedRecipe.items.map((recipeItem) => {
        const existing = current.find(
          (item) => item.ingredientId === recipeItem.ingredientId,
        );

        if (existing?.manuallyEdited) {
          return existing;
        }

        const calculatedQuantity = recipeItem.quantity * volumeMultiplier;

        return {
          ingredientId: recipeItem.ingredientId,
          quantity:
            calculatedQuantity > 0
              ? roundIngredientQuantity(calculatedQuantity)
              : "",
          manuallyEdited: false,
        };
      }),
    );
  }, [selectedRecipe, volumeMultiplier]);

  const handleSelectProduct = (productId: string) => {
    if (isSubmitting) {
      return;
    }

    setSelectedProductId(productId);
    setShowProductSelector(false);
    clearError();
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (isSubmitting) {
      return;
    }

    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return;
    }

    setSelectedRecipeId(recipe.id);

    setTotalVolumeMl(String(recipe.productionVolumeMl));

    setIngredients(
      recipe.items.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: String(item.quantity),
        manuallyEdited: false,
      })),
    );
  };

  const handleVolumeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    setTotalVolumeMl(cleaned);
  };

  const handleIngredientChange = (ingredientId: string, quantity: string) => {
    const cleaned = quantity.replace(/[^0-9.,]/g, "");

    setIngredients((current) =>
      current.map((item) =>
        item.ingredientId === ingredientId
          ? {
              ...item,
              quantity: cleaned.replace(",", "."),
              manuallyEdited: true,
            }
          : item,
      ),
    );
  };

  const handleResetIngredients = () => {
    if (!selectedRecipe) {
      return;
    }

    setIngredients(
      selectedRecipe.items.map((item) => {
        const calculatedQuantity = item.quantity * volumeMultiplier;

        return {
          ingredientId: item.ingredientId,
          quantity:
            calculatedQuantity > 0
              ? roundIngredientQuantity(calculatedQuantity)
              : "",
          manuallyEdited: false,
        };
      }),
    );
  };

  const handleVariantChange = (variantId: string, quantity: string) => {
    const cleaned = quantity.replace(/[^0-9]/g, "");

    setVariants((current) =>
      current.map((item) =>
        item.variantId === variantId
          ? {
              ...item,
              quantityProduced: cleaned,
            }
          : item,
      ),
    );
  };

  const validate = (): boolean => {
    if (!selectedProduct) {
      Alert.alert("Produit requis", "Sélectionnez le produit à fabriquer.");

      return false;
    }

    if (!selectedRecipe) {
      Alert.alert(
        "Recette requise",
        "Ce produit ne possède pas encore de recette.",
      );

      return false;
    }

    if (!volumeMl || volumeMl <= 0) {
      Alert.alert(
        "Volume invalide",
        "Saisissez un volume de production supérieur à 0.",
      );

      return false;
    }

    if (ingredients.length === 0) {
      Alert.alert(
        "Ingrédients requis",
        "La recette ne contient aucun ingrédient.",
      );

      return false;
    }

    const invalidIngredient = ingredients.find(
      (item) => !Number(item.quantity) || Number(item.quantity) <= 0,
    );

    if (invalidIngredient) {
      Alert.alert(
        "Quantité invalide",
        "Toutes les quantités d'ingrédients doivent être supérieures à 0.",
      );

      return false;
    }

    const selectedVariants = variants.filter(
      (item) => Number(item.quantityProduced) > 0,
    );

    if (selectedVariants.length === 0) {
      Alert.alert(
        "Formats requis",
        "Indiquez au moins une quantité de bouteilles à produire.",
      );

      return false;
    }

    for (const item of selectedVariants) {
      const variant = activeVariants.find(
        (current) => current.id === item.variantId,
      );

      if (!variant) {
        Alert.alert(
          "Format invalide",
          "Un des formats sélectionnés n'est plus disponible.",
        );

        return false;
      }

      const packaging = packagings.find(
        (current) => current.id === variant.packagingId,
      );

      if (!packaging) {
        Alert.alert(
          "Emballage introuvable",
          "Un des emballages associés aux formats sélectionnés est introuvable.",
        );

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validate()) {
      return;
    }

    const selectedVariants = variants.filter(
      (item) => Number(item.quantityProduced) > 0,
    );

    const payload: CreateProductionPayload = {
      totalVolumeMl: volumeMl,

      ingredients: ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantityUsed: Math.ceil(Number(item.quantity)),
      })),

      packagings: selectedVariants.map((item) => {
        const variant = activeVariants.find(
          (current) => current.id === item.variantId,
        );

        return {
          packagingId: variant!.packagingId,
          quantityUsed: Number(item.quantityProduced),
        };
      }),

      items: selectedVariants.map((item) => ({
        variantId: item.variantId,
        quantityProduced: Number(item.quantityProduced),
      })),
    };

    try {
      clearError();
      await onSubmit(payload);
    } catch (error) {
      console.error("Erreur création production :", error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    clearError();
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modal}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleClose}
                disabled={isSubmitting}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </Pressable>

              <View style={styles.headerContent}>
                <Text style={styles.eyebrow}>PRODUCTION</Text>

                <Text style={styles.title}>Nouvelle production</Text>

                <Text style={styles.subtitle}>
                  Préparez une nouvelle production de jus.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerDivider} />

          {isInitialLoading && !isInitialized ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />

              <Text style={styles.loadingText}>
                Préparation du formulaire...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <ProductionProductSelector
                  selectedProduct={selectedProduct}
                  products={products}
                  visible={showProductSelector}
                  onOpen={() => setShowProductSelector((current) => !current)}
                  onSelect={handleSelectProduct}
                  disabled={isSubmitting}
                />

                <ProductionRecipeSection
                  recipe={selectedRecipe}
                  recipes={recipes.filter(
                    (recipe) => recipe.productId === selectedProductId,
                  )}
                  selectedRecipeId={selectedRecipeId}
                  totalVolumeMl={totalVolumeMl}
                  referenceVolumeMl={referenceVolumeMl}
                  onSelectRecipe={handleSelectRecipe}
                  onVolumeChange={handleVolumeChange}
                  disabled={isSubmitting || !selectedProduct}
                />

                <ProductionIngredientsSection
                  ingredients={ingredients}
                  rawIngredients={rawIngredients}
                  hasRecipe={Boolean(selectedRecipe)}
                  onIngredientChange={handleIngredientChange}
                  onReset={handleResetIngredients}
                  disabled={isSubmitting}
                />

                <ProductionVariantsSection
                  variants={activeVariants}
                  formVariants={variants}
                  packagings={packagings}
                  onVariantChange={handleVariantChange}
                  disabled={isSubmitting}
                />

                {productionError && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color={COLORS.error}
                    />

                    <Text style={styles.errorText}>{productionError}</Text>
                  </View>
                )}

                <View style={styles.bottomSpacer} />
              </ScrollView>

              <ProductionFormFooter
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.3,
    color: COLORS.primary,
  },

  title: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: COLORS.Gray,
  },

  headerDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 18,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.Gray,
  },

  errorBox: {
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4D1D1",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.error,
  },

  bottomSpacer: {
    height: 20,
  },

  pressed: {
    opacity: 0.55,
  },
});
