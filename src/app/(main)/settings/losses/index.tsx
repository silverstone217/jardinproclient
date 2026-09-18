import { useCallback, useMemo, useState } from "react";

import { useFocusEffect } from "expo-router";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LossCategorySelector } from "@/components/losses/LossCategorySelector";
import { LossForm } from "@/components/losses/LossForm";
import { LossHeader } from "@/components/losses/LossHeader";
import { LossHistory } from "@/components/losses/LossHistory";
import { LossPendingSection } from "@/components/losses/LossPendingSection";
import { LossSubmit } from "@/components/losses/LossSubmit";

import { LossSummary } from "@/components/losses/LossSummary";

import { useLossStore } from "@/store/loss.store";
import { usePackagingStore } from "@/store/packaging.store";
import { usePointOfSaleStore } from "@/store/pointOfSale.store";
import { useProductStore } from "@/store/product.store";
import { useRawIngredientStore } from "@/store/raw-ingredient.store";

import type {
  CreateLossInput,
  LossCategory,
  LossReason,
  PendingLossItem,
} from "@/types/loss";

import { COLORS, fonts } from "@/utils/styles";

export default function LossesScreen() {
  // ==========================================================
  // LOSS STORE
  // ==========================================================

  const {
    losses,
    pendingLosses,
    pagination,

    isLoading,
    isRefreshing,
    isLoadingMore,
    isCreating,
    isProcessingExpired,
    error,
    fetchLosses,
    refreshLosses,
    loadMoreLosses,
    fetchPendingLosses,
    createLoss,
    createExpiredLosses,
  } = useLossStore();

  // ==========================================================
  // RAW INGREDIENT STORE
  // ==========================================================

  const { rawIngredients, initialize: initializeRawIngredients } =
    useRawIngredientStore();

  // ==========================================================
  // PACKAGING STORE
  // ==========================================================

  const { packagings, initialize: initializePackagings } = usePackagingStore();

  // ==========================================================
  // PRODUCT STORE
  // ==========================================================

  const { products, initialize: initializeProducts } = useProductStore();

  // ==========================================================
  // POINT OF SALE STORE
  // ==========================================================

  const { pointOfSales, fetchPointOfSales } = usePointOfSaleStore();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [category, setCategory] = useState<LossCategory | null>(null);

  const [ingredientId, setIngredientId] = useState("");

  const [packagingId, setPackagingId] = useState("");

  const [variantId, setVariantId] = useState("");

  const [pointOfSaleId, setPointOfSaleId] = useState("");

  const [finishedStockLotId, setFinishedStockLotId] = useState("");

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState<LossReason | "">("");

  const [note, setNote] = useState("");

  const [pendingItem, setPendingItem] = useState<PendingLossItem | null>(null);

  const [showForm, setShowForm] = useState(false);

  // ==========================================================
  // INITIALISATION
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchLosses(),
            fetchPendingLosses(),

            initializeRawIngredients(),
            initializePackagings(),
            initializeProducts(),

            fetchPointOfSales(),
          ]);
        } catch (error) {
          console.error("Erreur chargement pertes :", error);
        }
      };

      loadData();
    }, [
      fetchLosses,
      fetchPendingLosses,
      initializeRawIngredients,
      initializePackagings,
      initializeProducts,
      fetchPointOfSales,
    ]),
  );

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const formIngredients = useMemo(() => {
    return rawIngredients
      .filter((ingredient) => ingredient.isActive)
      .map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
      }));
  }, [rawIngredients]);

  const formPackagings = useMemo(() => {
    return packagings
      .filter((packaging) => packaging.isActive)
      .map((packaging) => ({
        id: packaging.id,
        name: packaging.name,
        size: packaging.size,
        capacityMl: Number(packaging.capacityMl),
      }));
  }, [packagings]);

  const formVariants = useMemo(() => {
    return products
      .filter((product) => product.isActive)
      .flatMap((product) =>
        product.variants
          .filter((variant) => variant.isActive)
          .map((variant) => {
            const packaging = packagings.find(
              (item) => item.id === variant.packagingId,
            );

            if (!packaging) {
              return null;
            }

            return {
              id: variant.id,
              sku: variant.sku,

              product: {
                id: product.id,
                name: product.name,
              },

              packaging: {
                id: packaging.id,
                name: packaging.name,
                size: packaging.size,
                capacityMl: Number(packaging.capacityMl),
              },
            };
          })
          .filter(
            (variant): variant is NonNullable<typeof variant> =>
              variant !== null,
          ),
      );
  }, [products, packagings]);

  const formPointOfSales = useMemo(() => {
    return pointOfSales
      .filter((pointOfSale) => pointOfSale.isActive)
      .map((pointOfSale) => ({
        id: pointOfSale.id,
        name: pointOfSale.name,
        code: pointOfSale.code,
      }));
  }, [pointOfSales]);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setCategory(null);
    setIngredientId("");
    setPackagingId("");
    setVariantId("");
    setPointOfSaleId("");
    setFinishedStockLotId("");
    setQuantity("");
    setReason("");
    setNote("");
    setPendingItem(null);
  };

  // ==========================================================
  // OPEN MANUAL FORM
  // ==========================================================

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  const handleCloseForm = () => {
    if (isCreating) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  // ==========================================================
  // SELECT PENDING EXPIRATION
  // ==========================================================

  const handleSelectPending = (item: PendingLossItem) => {
    setCategory("FINISHED_PRODUCT");

    setIngredientId("");
    setPackagingId("");

    setVariantId(item.variant.id);

    setPointOfSaleId(item.pointOfSale?.id ?? "");

    setFinishedStockLotId(item.id);

    setQuantity(String(item.remainingQuantity));

    setReason("EXPIRED");

    setNote("Produit arrivé à expiration.");

    setPendingItem(item);

    setShowForm(true);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = (): boolean => {
    if (!category) {
      Alert.alert("Catégorie requise", "Sélectionnez le type de perte.");

      return false;
    }

    const parsedQuantity = Number(quantity.replace(",", "."));

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert(
        "Quantité invalide",
        "Veuillez saisir une quantité supérieure à zéro.",
      );

      return false;
    }

    if (!reason) {
      Alert.alert("Motif requis", "Sélectionnez le motif de la perte.");

      return false;
    }

    if (category === "RAW_INGREDIENT" && !ingredientId) {
      Alert.alert(
        "Matière première requise",
        "Sélectionnez la matière première concernée.",
      );

      return false;
    }

    if (category === "PACKAGING" && !packagingId) {
      Alert.alert("Emballage requis", "Sélectionnez l'emballage concerné.");

      return false;
    }

    if (category === "FINISHED_PRODUCT") {
      if (!variantId) {
        Alert.alert("Produit requis", "Sélectionnez le produit fini concerné.");

        return false;
      }

      if (!finishedStockLotId) {
        Alert.alert("Lot requis", "Sélectionnez le lot concerné.");

        return false;
      }
    }

    return true;
  };

  // ==========================================================
  // SUBMIT LOSS
  // ==========================================================

  const handleSubmit = async () => {
    if (isCreating) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const parsedQuantity = Number(quantity.replace(",", "."));

    let input: CreateLossInput;

    if (category === "RAW_INGREDIENT") {
      input = {
        category: "RAW_INGREDIENT",
        ingredientId,
        quantity: parsedQuantity,
        reason: reason as LossReason,
        note: note.trim() || undefined,
      };
    } else if (category === "PACKAGING") {
      input = {
        category: "PACKAGING",
        packagingId,
        quantity: parsedQuantity,
        reason: reason as LossReason,
        note: note.trim() || undefined,
      };
    } else {
      input = {
        category: "FINISHED_PRODUCT",
        variantId,
        finishedStockLotId,
        pointOfSaleId: pointOfSaleId || undefined,
        quantity: parsedQuantity,
        reason: reason as LossReason,
        note: note.trim() || undefined,
      };
    }

    try {
      await createLoss(input);

      Alert.alert(
        "Perte enregistrée",
        "La perte a été enregistrée avec succès.",
      );

      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Erreur création perte :", err);

      Alert.alert(
        "Impossible d'enregistrer la perte",
        error ??
          "Une erreur est survenue lors de l'enregistrement de la perte.",
      );
    }
  };

  // ==========================================================
  // PROCESS ALL EXPIRED
  // ==========================================================

  const handleProcessAll = () => {
    if (isProcessingExpired || pendingLosses.length === 0) {
      return;
    }

    Alert.alert(
      "Traiter les produits expirés",
      `Voulez-vous marquer les ${pendingLosses.length} lot${
        pendingLosses.length > 1 ? "s" : ""
      } expiré${pendingLosses.length > 1 ? "s" : ""} comme pertes ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Tout traiter",
          style: "destructive",
          onPress: async () => {
            try {
              await createExpiredLosses();

              Alert.alert(
                "Pertes enregistrées",
                "Les produits expirés ont été traités.",
              );
            } catch (error) {
              console.error("Erreur traitement expirés :", error);
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      await Promise.all([refreshLosses(), fetchPendingLosses()]);
    } catch (error) {
      console.error("Erreur actualisation pertes :", error);
    }
  };

  // ==========================================================
  // LOAD MORE
  // ==========================================================

  const handleLoadMore = async () => {
    try {
      await loadMoreLosses();
    } catch (error) {
      console.error("Erreur chargement pertes supplémentaires :", error);
    }
  };

  // ==========================================================
  // PAGE HEADER
  // ==========================================================

  const renderPageHeader = () => {
    return (
      <>
        <LossHeader />

        <LossSummary
          pendingCount={pendingLosses.length}
          historyCount={pagination.total}
        />

        <LossPendingSection
          items={pendingLosses}
          isLoading={isLoading}
          isProcessingExpired={isProcessingExpired}
          onProcessAll={handleProcessAll}
          onSelect={handleSelectPending}
        />

        {!showForm && (
          <Pressable
            style={({ pressed }) => [
              styles.openFormButton,
              pressed && styles.pressed,
            ]}
            onPress={handleOpenForm}
          >
            <View style={styles.openFormIcon}>
              <Text style={styles.plus}>+</Text>
            </View>

            <View style={styles.openFormContent}>
              <Text style={styles.openFormTitle}>Enregistrer une perte</Text>

              <Text style={styles.openFormSubtitle}>
                Matière première, emballage ou produit fini
              </Text>
            </View>

            <Text style={styles.openFormArrow}>›</Text>
          </Pressable>
        )}

        {showForm && (
          <View style={styles.formContainer}>
            <LossCategorySelector
              value={category}
              onChange={(value) => {
                if (pendingItem) {
                  return;
                }

                setCategory(value);

                setIngredientId("");
                setPackagingId("");
                setVariantId("");
                setPointOfSaleId("");
                setFinishedStockLotId("");
                setQuantity("");
                setReason("");
                setNote("");
              }}
              disabled={isCreating || !!pendingItem}
            />

            <LossForm
              category={category}
              ingredientId={ingredientId}
              packagingId={packagingId}
              variantId={variantId}
              pointOfSaleId={pointOfSaleId}
              finishedStockLotId={finishedStockLotId}
              quantity={quantity}
              reason={reason}
              note={note}
              ingredients={formIngredients}
              packagings={formPackagings}
              variants={formVariants}
              pointOfSales={formPointOfSales}
              pendingItem={pendingItem}
              availableQuantity={pendingItem?.remainingQuantity}
              onIngredientChange={setIngredientId}
              onPackagingChange={setPackagingId}
              onVariantChange={setVariantId}
              onPointOfSaleChange={setPointOfSaleId}
              onLotChange={setFinishedStockLotId}
              onQuantityChange={setQuantity}
              onReasonChange={setReason}
              onNoteChange={setNote}
              disabled={isCreating}
            />

            <LossSubmit
              onSubmit={handleSubmit}
              disabled={isCreating}
              isSubmitting={isCreating}
            />

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleCloseForm}
              disabled={isCreating}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
          </View>
        )}
      </>
    );
  };

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <LossHistory
          items={losses}
          pagination={pagination}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          isLoadingMore={isLoadingMore}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          header={renderPageHeader()}
        />
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

  openFormButton: {
    minHeight: 70,
    marginTop: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    flexDirection: "row",
    alignItems: "center",
  },

  openFormIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  plus: {
    fontFamily: fonts.bold,
    fontSize: 25,
    lineHeight: 28,
    color: COLORS.primary,
  },

  openFormContent: {
    flex: 1,
    marginLeft: 11,
  },

  openFormTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  openFormSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  openFormArrow: {
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 25,
    color: COLORS.Gray,
  },

  formContainer: {
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  cancelButton: {
    minHeight: 44,
    marginTop: 9,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1EE",
  },

  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.darkGray,
  },

  pressed: {
    opacity: 0.6,
  },
});
