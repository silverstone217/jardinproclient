import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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

import { usePackagingStore } from "@/store/packaging.store";
import { useProductStore } from "@/store/product.store";

import type {
  Product,
  ProductVariant,
  UpdateProductPayload,
  UpdateProductVariantPayload,
} from "@/types/product";

import type { Packaging } from "@/types/packaging";

import { COLORS, fonts } from "@/utils/styles";

interface ProductVariantsProps {
  product: Product;
  disabled?: boolean;
}

interface VariantForm {
  id?: string;
  packagingId: string;
  sku: string;
  price: string;
  shelfLifeDays: string;
  isActive: boolean;
}

const MAX_VARIANTS = 2;

const EMPTY_FORM: VariantForm = {
  packagingId: "",
  sku: "",
  price: "",
  shelfLifeDays: "2",
  isActive: true,
};

export function ProductVariants({
  product,
  disabled = false,
}: ProductVariantsProps) {
  const { updateProduct, isUpdating } = useProductStore();

  const {
    packagings,
    initialize: initializePackagings,
    isLoading: isLoadingPackagings,
  } = usePackagingStore();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const [form, setForm] = useState<VariantForm>(EMPTY_FORM);

  const [isSaving, setIsSaving] = useState(false);

  // ==========================================================
  // INITIALISATION DES PACKAGINGS
  // ==========================================================

  useEffect(() => {
    initializePackagings().catch((error) => {
      console.error("Erreur chargement packagings :", error);
    });
  }, [initializePackagings]);

  // ==========================================================
  // PACKAGINGS ACTIFS
  // ==========================================================

  const activePackagings = useMemo(
    () => packagings.filter((packaging) => packaging.isActive),
    [packagings],
  );

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getPackaging = (packagingId: string): Packaging | undefined => {
    return packagings.find((packaging) => packaging.id === packagingId);
  };

  const getPackagingName = (packagingId: string): string => {
    const packaging = getPackaging(packagingId);

    if (!packaging) {
      return "Emballage inconnu";
    }

    return packaging.name;
  };

  const getPackagingSize = (packagingId: string): string => {
    const packaging = getPackaging(packagingId);

    if (!packaging) {
      return "";
    }

    return `${packaging.capacityMl} ml`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return date;
    }
  };

  // ==========================================================
  // OUVRIR AJOUT
  // ==========================================================

  const handleAddVariant = () => {
    if (disabled || isUpdating) {
      return;
    }

    if (product.variants.length >= MAX_VARIANTS) {
      Alert.alert(
        "Limite atteinte",
        "Un produit ne peut avoir que deux variantes.",
      );

      return;
    }

    Keyboard.dismiss();

    setEditingVariantId(null);

    setForm({
      ...EMPTY_FORM,
      packagingId: activePackagings.length === 1 ? activePackagings[0].id : "",
    });

    setIsModalVisible(true);
  };

  // ==========================================================
  // OUVRIR MODIFICATION
  // ==========================================================

  const handleEditVariant = (variant: ProductVariant) => {
    if (disabled || isUpdating) {
      return;
    }

    Keyboard.dismiss();

    setEditingVariantId(variant.id);

    setForm({
      id: variant.id,
      packagingId: variant.packagingId,
      sku: variant.sku,
      price: String(Number(variant.price)),
      shelfLifeDays: String(Number(variant.shelfLifeDays)),
      isActive: variant.isActive,
    });

    setIsModalVisible(true);
  };

  // ==========================================================
  // FERMER MODAL
  // ==========================================================

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    Keyboard.dismiss();

    setIsModalVisible(false);

    setEditingVariantId(null);

    setForm(EMPTY_FORM);
  };

  // ==========================================================
  // CONSTRUIRE LES VARIANTES
  // ==========================================================

  const buildVariantsPayload = (
    variants: ProductVariant[],
  ): UpdateProductVariantPayload[] => {
    return variants.map((variant) => ({
      id: variant.id,
      packagingId: variant.packagingId,
      sku: variant.sku.trim(),
      price: Number(variant.price),
      shelfLifeDays: Number(variant.shelfLifeDays),
      isActive: variant.isActive,
    }));
  };

  // ==========================================================
  // CONSTRUIRE PAYLOAD PRODUIT
  // ==========================================================

  const buildProductPayload = (
    variants: UpdateProductVariantPayload[],
  ): UpdateProductPayload => {
    return {
      name: product.name,
      description: product.description ?? undefined,
      isActive: product.isActive,
      variants,
    };
  };

  // ==========================================================
  // VALIDATION FORMULAIRE
  // ==========================================================

  const validateForm = (): boolean => {
    if (!form.packagingId) {
      Alert.alert(
        "Emballage requis",
        "Sélectionnez un emballage pour cette variante.",
      );

      return false;
    }

    if (!form.sku.trim()) {
      Alert.alert("SKU requis", "Veuillez renseigner le SKU de la variante.");

      return false;
    }

    if (form.sku.trim().length > 50) {
      Alert.alert(
        "SKU trop long",
        "Le SKU ne peut pas dépasser 50 caractères.",
      );

      return false;
    }

    const price = Number(form.price.replace(",", "."));

    if (!form.price.trim() || !Number.isFinite(price) || price < 0) {
      Alert.alert("Prix invalide", "Veuillez saisir un prix valide.");

      return false;
    }

    const shelfLifeDays = Number(form.shelfLifeDays);

    if (
      !form.shelfLifeDays.trim() ||
      !Number.isInteger(shelfLifeDays) ||
      shelfLifeDays < 1
    ) {
      Alert.alert(
        "Durée invalide",
        "La durée de conservation doit être un nombre entier d'au moins 1 jour.",
      );

      return false;
    }

    if (shelfLifeDays > 365) {
      Alert.alert(
        "Durée invalide",
        "La durée de conservation ne peut pas dépasser 365 jours.",
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // SAUVEGARDER AJOUT / MODIFICATION
  // ==========================================================

  const handleSaveVariant = async () => {
    if (disabled || isSaving || isUpdating) {
      return;
    }

    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const price = Number(form.price.replace(",", "."));

      const shelfLifeDays = Number(form.shelfLifeDays);

      const newVariant: UpdateProductVariantPayload = {
        ...(editingVariantId
          ? {
              id: editingVariantId,
            }
          : {}),
        packagingId: form.packagingId,
        sku: form.sku.trim().toUpperCase(),
        price,
        shelfLifeDays,
        isActive: form.isActive,
      };

      let variants: UpdateProductVariantPayload[];

      if (editingVariantId) {
        variants = product.variants.map((variant) =>
          variant.id === editingVariantId
            ? newVariant
            : {
                id: variant.id,
                packagingId: variant.packagingId,
                sku: variant.sku,
                price: Number(variant.price),
                shelfLifeDays: Number(variant.shelfLifeDays),
                isActive: variant.isActive,
              },
        );
      } else {
        variants = [...buildVariantsPayload(product.variants), newVariant];
      }

      if (variants.length === 0) {
        throw new Error("Le produit doit avoir au moins une variante.");
      }

      if (variants.length > MAX_VARIANTS) {
        throw new Error("Un produit ne peut avoir que deux variantes.");
      }

      const payload = buildProductPayload(variants);

      await updateProduct(product.id, payload);

      Keyboard.dismiss();

      setIsModalVisible(false);
      setEditingVariantId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error("Erreur sauvegarde variante :", error);

      Alert.alert(
        "Impossible d'enregistrer",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement de la variante.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================
  // DÉSACTIVER / ACTIVER
  // ==========================================================

  const handleToggleVariant = (variant: ProductVariant) => {
    if (disabled || isUpdating) {
      return;
    }

    const nextStatus = !variant.isActive;

    const action = nextStatus ? "activer" : "désactiver";

    Alert.alert(
      nextStatus ? "Activer la variante" : "Désactiver la variante",
      `Voulez-vous vraiment ${action} la variante « ${getPackagingName(
        variant.packagingId,
      )} » ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: nextStatus ? "Activer" : "Désactiver",
          style: nextStatus ? "default" : "destructive",
          onPress: async () => {
            try {
              const variants = product.variants.map((item) => ({
                id: item.id,
                packagingId: item.packagingId,
                sku: item.sku,
                price: Number(item.price),
                shelfLifeDays: Number(item.shelfLifeDays),
                isActive: item.id === variant.id ? nextStatus : item.isActive,
              }));

              await updateProduct(product.id, buildProductPayload(variants));
            } catch (error) {
              console.error("Erreur changement statut variante :", error);

              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : `Impossible de ${action} cette variante.`,
              );
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // SUPPRIMER VARIANTE
  // ==========================================================

  const handleDeleteVariant = (variant: ProductVariant) => {
    if (disabled || isUpdating) {
      return;
    }

    if (product.variants.length <= 1) {
      Alert.alert(
        "Suppression impossible",
        "Un produit doit toujours conserver au moins une variante.",
      );

      return;
    }

    const packagingName = getPackagingName(variant.packagingId);

    Alert.alert(
      "Supprimer la variante",
      `Voulez-vous vraiment supprimer la variante « ${packagingName} » ?`,
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
              const variants = product.variants
                .filter((item) => item.id !== variant.id)
                .map((item) => ({
                  id: item.id,
                  packagingId: item.packagingId,
                  sku: item.sku,
                  price: Number(item.price),
                  shelfLifeDays: Number(item.shelfLifeDays),
                  isActive: item.isActive,
                }));

              if (variants.length === 0) {
                Alert.alert(
                  "Action impossible",
                  "Le produit doit conserver au moins une variante.",
                );

                return;
              }

              await updateProduct(product.id, buildProductPayload(variants));
            } catch (error) {
              console.error("Erreur suppression variante :", error);

              Alert.alert(
                "Impossible de supprimer",
                error instanceof Error
                  ? error.message
                  : "Cette variante ne peut pas être supprimée.",
              );
            }
          },
        },
      ],
    );
  };

  // ==========================================================
  // SÉLECTION PACKAGING
  // ==========================================================

  const handleSelectPackaging = (packagingId: string) => {
    if (isSaving) {
      return;
    }

    setForm((current) => ({
      ...current,
      packagingId,
    }));
  };

  // ==========================================================
  // RENDU VARIANTE
  // ==========================================================

  const renderVariant = (variant: ProductVariant, index: number) => {
    const packaging = getPackaging(variant.packagingId);

    const packagingName = packaging?.name ?? "Emballage inconnu";

    const packagingSize = packaging?.capacityMl
      ? `${packaging.capacityMl} ml`
      : "";

    return (
      <View
        key={variant.id}
        style={[
          styles.variantCard,
          !variant.isActive && styles.variantCardInactive,
        ]}
      >
        {/* HEADER */}

        <View style={styles.variantHeader}>
          <View style={styles.variantNumber}>
            <Text style={styles.variantNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.variantHeaderContent}>
            <View style={styles.variantTitleRow}>
              <Text style={styles.variantTitle} numberOfLines={1}>
                {packagingName}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  variant.isActive
                    ? styles.statusBadgeActive
                    : styles.statusBadgeInactive,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    variant.isActive
                      ? styles.statusDotActive
                      : styles.statusDotInactive,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    variant.isActive
                      ? styles.statusTextActive
                      : styles.statusTextInactive,
                  ]}
                >
                  {variant.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            <Text style={styles.variantPackaging}>
              {packagingSize || "Format non renseigné"}
            </Text>
          </View>
        </View>

        {/* DETAILS */}

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, styles.priceIcon]}>
              <Ionicons
                name="pricetag-outline"
                size={15}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.detailLabel}>PRIX</Text>

              <Text style={styles.detailValue}>
                {formatPrice(Number(variant.price))} CDF
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, styles.skuIcon]}>
              <Ionicons name="barcode-outline" size={15} color="#7952A8" />
            </View>

            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>SKU</Text>

              <Text style={styles.detailValueSmall} numberOfLines={1}>
                {variant.sku}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={[styles.detailIcon, styles.shelfLifeIcon]}>
              <Ionicons name="time-outline" size={15} color="#C27B00" />
            </View>

            <View>
              <Text style={styles.detailLabel}>CONSERVATION</Text>

              <Text style={styles.detailValue}>
                {variant.shelfLifeDays} jour
                {variant.shelfLifeDays > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}

        <View style={styles.variantFooter}>
          <View style={styles.updatedInfo}>
            <Ionicons name="sync-outline" size={13} color={COLORS.Gray} />

            <Text style={styles.updatedText}>
              Mise à jour le {formatDate(variant.updatedAt)}
            </Text>
          </View>

          <View style={styles.variantActions}>
            <Pressable
              style={({ pressed }) => [
                styles.smallAction,
                pressed && styles.actionPressed,
              ]}
              onPress={() => handleEditVariant(variant)}
              disabled={disabled || isUpdating}
              hitSlop={5}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.primary}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.smallAction,
                pressed && styles.actionPressed,
              ]}
              onPress={() => handleToggleVariant(variant)}
              disabled={disabled || isUpdating}
              hitSlop={5}
            >
              <Ionicons
                name={variant.isActive ? "eye-off-outline" : "eye-outline"}
                size={16}
                color={variant.isActive ? COLORS.warning : COLORS.success}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.smallAction,
                styles.deleteAction,
                pressed && styles.actionPressed,
              ]}
              onPress={() => handleDeleteVariant(variant)}
              disabled={disabled || isUpdating}
              hitSlop={5}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <>
      <View style={styles.card}>
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="layers-outline" size={19} color={COLORS.primary} />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Variantes</Text>

            <Text style={styles.subtitle}>
              Gérez les formats, prix et informations de chaque variante.
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{product.variants.length}</Text>

            <Text style={styles.countBadgeTotal}>/{MAX_VARIANTS}</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* LISTE                                             */}
        {/* ================================================== */}

        <View style={styles.variantsList}>
          {product.variants.map(renderVariant)}
        </View>

        {/* ================================================== */}
        {/* ADD BUTTON                                         */}
        {/* ================================================== */}

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            (disabled ||
              isUpdating ||
              product.variants.length >= MAX_VARIANTS) &&
              styles.addButtonDisabled,
            pressed &&
              product.variants.length < MAX_VARIANTS &&
              !disabled &&
              !isUpdating &&
              styles.addButtonPressed,
          ]}
          onPress={handleAddVariant}
          disabled={
            disabled || isUpdating || product.variants.length >= MAX_VARIANTS
          }
        >
          <View style={styles.addIcon}>
            <Ionicons
              name="add"
              size={19}
              color={
                product.variants.length >= MAX_VARIANTS
                  ? COLORS.Gray
                  : COLORS.primary
              }
            />
          </View>

          <View style={styles.addButtonContent}>
            <Text
              style={[
                styles.addButtonTitle,
                product.variants.length >= MAX_VARIANTS &&
                  styles.addButtonTextDisabled,
              ]}
            >
              Ajouter une variante
            </Text>

            <Text
              style={[
                styles.addButtonSubtitle,
                product.variants.length >= MAX_VARIANTS &&
                  styles.addButtonTextDisabled,
              ]}
            >
              {product.variants.length >= MAX_VARIANTS
                ? "Limite de deux variantes atteinte"
                : "Ajouter un nouveau format de vente"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={
              product.variants.length >= MAX_VARIANTS
                ? COLORS.Gray
                : COLORS.primary
            }
          />
        </Pressable>

        {/* ================================================== */}
        {/* INFO                                              */}
        {/* ================================================== */}

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color={COLORS.info}
          />

          <Text style={styles.infoText}>
            Un produit peut avoir jusqu'à deux variantes, par exemple 200 ml et
            500 ml.
          </Text>
        </View>
      </View>

      {/* ==================================================== */}
      {/* MODAL                                               */}
      {/* ==================================================== */}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={styles.keyboardContainer}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modal}>
                  {/* MODAL HEADER */}

                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderIcon}>
                      <Ionicons
                        name={
                          editingVariantId
                            ? "create-outline"
                            : "add-circle-outline"
                        }
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.modalHeaderContent}>
                      <Text style={styles.modalTitle}>
                        {editingVariantId
                          ? "Modifier la variante"
                          : "Nouvelle variante"}
                      </Text>

                      <Text style={styles.modalSubtitle}>
                        Configurez le format et les détails de vente.
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.closeButton,
                        pressed && styles.actionPressed,
                      ]}
                      onPress={handleCloseModal}
                      disabled={isSaving}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="close"
                        size={21}
                        color={COLORS.darkGray}
                      />
                    </Pressable>
                  </View>

                  {/* FORM */}

                  <ScrollView
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={
                      Platform.OS === "ios" ? "interactive" : "on-drag"
                    }
                    showsVerticalScrollIndicator={false}
                  >
                    {/* ====================================== */}
                    {/* PACKAGING                              */}
                    {/* ====================================== */}

                    <View style={styles.formSection}>
                      <View style={styles.formSectionHeader}>
                        <View style={[styles.formIcon, styles.packagingIcon]}>
                          <Ionicons
                            name="cube-outline"
                            size={16}
                            color={COLORS.primary}
                          />
                        </View>

                        <View style={styles.formHeaderText}>
                          <Text style={styles.formLabel}>Emballage</Text>

                          <Text style={styles.formHint}>
                            Choisissez le format vendu au client.
                          </Text>
                        </View>

                        <Text style={styles.requiredText}>Requis</Text>
                      </View>

                      {isLoadingPackagings ? (
                        <View style={styles.packagingLoading}>
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                          />

                          <Text style={styles.packagingLoadingText}>
                            Chargement des emballages...
                          </Text>
                        </View>
                      ) : activePackagings.length === 0 ? (
                        <View style={styles.noPackaging}>
                          <Ionicons
                            name="alert-circle-outline"
                            size={19}
                            color={COLORS.warning}
                          />

                          <Text style={styles.noPackagingText}>
                            Aucun emballage actif disponible.
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.packagingList}>
                          {activePackagings.map((packaging) => {
                            const selected = form.packagingId === packaging.id;

                            const usedByOtherVariant = product.variants.some(
                              (variant) =>
                                variant.id !== editingVariantId &&
                                variant.packagingId === packaging.id,
                            );

                            return (
                              <Pressable
                                key={packaging.id}
                                style={[
                                  styles.packagingOption,
                                  selected && styles.packagingOptionSelected,
                                  usedByOtherVariant &&
                                    styles.packagingOptionUsed,
                                ]}
                                onPress={() =>
                                  !usedByOtherVariant &&
                                  handleSelectPackaging(packaging.id)
                                }
                                disabled={isSaving || usedByOtherVariant}
                              >
                                <View
                                  style={[
                                    styles.packagingOptionIcon,
                                    selected &&
                                      styles.packagingOptionIconSelected,
                                  ]}
                                >
                                  <Ionicons
                                    name="flask-outline"
                                    size={17}
                                    color={
                                      selected ? COLORS.white : COLORS.primary
                                    }
                                  />
                                </View>

                                <View style={styles.packagingOptionContent}>
                                  <Text
                                    style={[
                                      styles.packagingOptionName,
                                      selected &&
                                        styles.packagingOptionNameSelected,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {packaging.name}
                                  </Text>

                                  <Text style={styles.packagingOptionSize}>
                                    {packaging.capacityMl} ml
                                  </Text>
                                </View>

                                {usedByOtherVariant ? (
                                  <Text style={styles.usedText}>Utilisé</Text>
                                ) : selected ? (
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={COLORS.primary}
                                  />
                                ) : (
                                  <View style={styles.emptyRadio} />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    {/* ====================================== */}
                    {/* SKU                                    */}
                    {/* ====================================== */}

                    <View style={styles.formSection}>
                      <View style={styles.formSectionHeader}>
                        <View style={[styles.formIcon, styles.skuFormIcon]}>
                          <Ionicons
                            name="barcode-outline"
                            size={16}
                            color="#7952A8"
                          />
                        </View>

                        <View style={styles.formHeaderText}>
                          <Text style={styles.formLabel}>SKU</Text>

                          <Text style={styles.formHint}>
                            Identifiant unique de la variante.
                          </Text>
                        </View>

                        <Text style={styles.requiredText}>Requis</Text>
                      </View>

                      <TextInput
                        value={form.sku}
                        onChangeText={(value) =>
                          setForm((current) => ({
                            ...current,
                            sku: value.toUpperCase(),
                          }))
                        }
                        placeholder="Ex. JUS-ANA-500"
                        placeholderTextColor={COLORS.Gray}
                        style={styles.input}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={50}
                        editable={!isSaving}
                        returnKeyType="next"
                      />
                    </View>

                    {/* ====================================== */}
                    {/* PRIX + CONSERVATION                   */}
                    {/* ====================================== */}

                    <View style={styles.rowFields}>
                      <View style={styles.halfField}>
                        <View style={styles.compactFieldHeader}>
                          <View
                            style={[styles.formIconSmall, styles.priceFormIcon]}
                          >
                            <Ionicons
                              name="cash-outline"
                              size={15}
                              color={COLORS.primary}
                            />
                          </View>

                          <Text style={styles.compactLabel}>Prix</Text>
                        </View>

                        <View style={styles.inputWithSuffix}>
                          <TextInput
                            value={form.price}
                            onChangeText={(value) =>
                              setForm((current) => ({
                                ...current,
                                price: value.replace(/[^0-9,.]/g, ""),
                              }))
                            }
                            placeholder="2500"
                            placeholderTextColor={COLORS.Gray}
                            style={styles.suffixInput}
                            keyboardType="decimal-pad"
                            editable={!isSaving}
                            returnKeyType="next"
                          />

                          <Text style={styles.suffix}>CDF</Text>
                        </View>
                      </View>

                      <View style={styles.halfField}>
                        <View style={styles.compactFieldHeader}>
                          <View
                            style={[styles.formIconSmall, styles.timeFormIcon]}
                          >
                            <Ionicons
                              name="time-outline"
                              size={15}
                              color="#C27B00"
                            />
                          </View>

                          <Text style={styles.compactLabel}>Conservation</Text>
                        </View>

                        <View style={styles.inputWithSuffix}>
                          <TextInput
                            value={form.shelfLifeDays}
                            onChangeText={(value) =>
                              setForm((current) => ({
                                ...current,
                                shelfLifeDays: value.replace(/\D/g, ""),
                              }))
                            }
                            placeholder="2"
                            placeholderTextColor={COLORS.Gray}
                            style={styles.suffixInput}
                            keyboardType="number-pad"
                            editable={!isSaving}
                            returnKeyType="done"
                            onSubmitEditing={handleSaveVariant}
                          />

                          <Text style={styles.suffix}>jour(s)</Text>
                        </View>
                      </View>
                    </View>

                    {/* ====================================== */}
                    {/* STATUT                                */}
                    {/* ====================================== */}

                    <View style={styles.statusSection}>
                      <View style={styles.statusSectionContent}>
                        <View style={styles.statusFormIcon}>
                          <Ionicons
                            name="power-outline"
                            size={16}
                            color={form.isActive ? COLORS.success : COLORS.Gray}
                          />
                        </View>

                        <View style={styles.statusFormText}>
                          <Text style={styles.statusFormTitle}>
                            Variante active
                          </Text>

                          <Text style={styles.statusFormDescription}>
                            Une variante inactive ne devrait plus être proposée
                            à la vente.
                          </Text>
                        </View>

                        <Pressable
                          style={[
                            styles.switch,
                            form.isActive && styles.switchActive,
                          ]}
                          onPress={() =>
                            setForm((current) => ({
                              ...current,
                              isActive: !current.isActive,
                            }))
                          }
                          disabled={isSaving}
                        >
                          <View
                            style={[
                              styles.switchThumb,
                              form.isActive && styles.switchThumbActive,
                            ]}
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* ====================================== */}
                    {/* NOTE                                   */}
                    {/* ====================================== */}

                    <View style={styles.modalInfo}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={16}
                        color={COLORS.info}
                      />

                      <Text style={styles.modalInfoText}>
                        Les modifications sont enregistrées directement sur le
                        produit.
                      </Text>
                    </View>
                  </ScrollView>

                  {/* MODAL ACTIONS */}

                  <View style={styles.modalActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.modalCancelButton,
                        pressed && styles.actionPressed,
                      ]}
                      onPress={handleCloseModal}
                      disabled={isSaving}
                    >
                      <Text style={styles.modalCancelText}>Annuler</Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.modalSaveButton,
                        isSaving && styles.modalSaveButtonDisabled,
                        pressed && !isSaving && styles.modalSaveButtonPressed,
                      ]}
                      onPress={handleSaveVariant}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color={COLORS.white}
                        />
                      )}

                      <Text style={styles.modalSaveText}>
                        {isSaving
                          ? "Enregistrement..."
                          : editingVariantId
                            ? "Enregistrer"
                            : "Ajouter la variante"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    marginRight: 8,
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

  countBadge: {
    minWidth: 44,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F0",
  },

  countBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.primary,
  },

  countBadgeTotal: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
  },

  // ==========================================================
  // VARIANTS LIST
  // ==========================================================

  variantsList: {
    marginTop: 17,
    gap: 10,
  },

  variantCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E9E9E5",
  },

  variantCardInactive: {
    opacity: 0.72,
    backgroundColor: "#F5F5F3",
  },

  variantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  variantNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  variantNumberText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: COLORS.primary,
  },

  variantHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  variantTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  variantTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: COLORS.text,
  },

  variantPackaging: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusBadgeActive: {
    backgroundColor: "#EAF6EA",
  },

  statusBadgeInactive: {
    backgroundColor: "#EEEEEC",
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  statusDotActive: {
    backgroundColor: COLORS.success,
  },

  statusDotInactive: {
    backgroundColor: COLORS.Gray,
  },

  statusText: {
    fontFamily: fonts.semibold,
    fontSize: 8,
  },

  statusTextActive: {
    color: COLORS.success,
  },

  statusTextInactive: {
    color: COLORS.Gray,
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  detailsGrid: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ECECE8",
    gap: 11,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  priceIcon: {
    backgroundColor: "#EAF2E7",
  },

  skuIcon: {
    backgroundColor: "#F3EAF8",
  },

  shelfLifeIcon: {
    backgroundColor: "#FFF4D9",
  },

  detailLabel: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 0.7,
    color: COLORS.Gray,
  },

  detailValue: {
    marginTop: 2,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.text,
  },

  detailValueSmall: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: COLORS.text,
  },

  detailTextContainer: {
    flex: 1,
  },

  // ==========================================================
  // VARIANT FOOTER
  // ==========================================================

  variantFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#ECECE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  updatedInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  updatedText: {
    marginLeft: 5,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  variantActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 8,
  },

  smallAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  deleteAction: {
    backgroundColor: "#FDECEC",
  },

  actionPressed: {
    opacity: 0.55,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  // ==========================================================
  // ADD
  // ==========================================================

  addButton: {
    marginTop: 12,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F7F1",
    borderWidth: 1,
    borderColor: "#DDE9D9",
  },

  addButtonDisabled: {
    backgroundColor: "#F4F4F2",
    borderColor: "#E6E6E3",
  },

  addIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  addButtonContent: {
    flex: 1,
    marginLeft: 10,
  },

  addButtonTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.primary,
  },

  addButtonSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  addButtonTextDisabled: {
    color: COLORS.Gray,
  },

  addButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  // ==========================================================
  // INFO
  // ==========================================================

  infoBanner: {
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF6FC",
    borderWidth: 1,
    borderColor: "#DCECF8",
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    color: "#47708F",
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },

  keyboardContainer: {
    width: "100%",
    maxHeight: "94%",
  },

  modal: {
    width: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: COLORS.white,
  },

  modalHeader: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEA",
  },

  modalHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  modalHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F2",
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 18,
  },

  // ==========================================================
  // FORM SECTIONS
  // ==========================================================

  formSection: {
    marginBottom: 17,
  },

  formSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  formIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  packagingIcon: {
    backgroundColor: "#EAF2E7",
  },

  skuFormIcon: {
    backgroundColor: "#F3EAF8",
  },

  priceFormIcon: {
    backgroundColor: "#EAF2E7",
  },

  timeFormIcon: {
    backgroundColor: "#FFF4D9",
  },

  formHeaderText: {
    flex: 1,
    marginLeft: 8,
  },

  formLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  formHint: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  requiredText: {
    fontFamily: fonts.medium,
    fontSize: 8,
    color: COLORS.error,
  },

  // ==========================================================
  // PACKAGING
  // ==========================================================

  packagingLoading: {
    minHeight: 55,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E7E7E3",
  },

  packagingLoadingText: {
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  noPackaging: {
    minHeight: 55,
    paddingHorizontal: 12,
    borderRadius: 13,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F1E1B7",
  },

  noPackagingText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: "#806C29",
  },

  packagingList: {
    gap: 7,
  },

  packagingOption: {
    minHeight: 58,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E6E6E2",
  },

  packagingOptionSelected: {
    backgroundColor: "#F0F6EE",
    borderColor: "#BFD4BA",
  },

  packagingOptionUsed: {
    opacity: 0.45,
  },

  packagingOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  packagingOptionIconSelected: {
    backgroundColor: COLORS.primary,
  },

  packagingOptionContent: {
    flex: 1,
    marginLeft: 9,
  },

  packagingOptionName: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  packagingOptionNameSelected: {
    color: COLORS.primary,
  },

  packagingOptionSize: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  usedText: {
    marginRight: 5,
    fontFamily: fonts.medium,
    fontSize: 8,
    color: COLORS.Gray,
  },

  emptyRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#D7D7D3",
    marginRight: 2,
  },

  // ==========================================================
  // INPUT
  // ==========================================================

  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4E4E0",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  // ==========================================================
  // PRICE + SHELF LIFE
  // ==========================================================

  rowFields: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 17,
  },

  halfField: {
    flex: 1,
  },

  compactFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  formIconSmall: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  compactLabel: {
    marginLeft: 7,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  inputWithSuffix: {
    minHeight: 46,
    paddingLeft: 2,
    paddingRight: 11,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E0",
    backgroundColor: "#FAFAF8",
  },

  suffixInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 10,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: COLORS.text,
  },

  suffix: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusSection: {
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#E8E8E4",
  },

  statusSectionContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusFormIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  statusFormText: {
    flex: 1,
    marginLeft: 9,
    marginRight: 10,
  },

  statusFormTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  statusFormDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  switch: {
    width: 44,
    height: 25,
    padding: 3,
    borderRadius: 13,
    justifyContent: "center",
    backgroundColor: "#D8D8D5",
  },

  switchActive: {
    backgroundColor: COLORS.primary,
  },

  switchThumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  switchThumbActive: {
    alignSelf: "flex-end",
  },

  // ==========================================================
  // MODAL INFO
  // ==========================================================

  modalInfo: {
    marginTop: 14,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF6FC",
    borderWidth: 1,
    borderColor: "#DCECF8",
  },

  modalInfoText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: "#47708F",
  },

  // ==========================================================
  // MODAL ACTIONS
  // ==========================================================

  modalActions: {
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    gap: 9,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEA",
    backgroundColor: COLORS.white,
  },

  modalCancelButton: {
    flex: 0.75,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F2",
    borderWidth: 1,
    borderColor: "#E5E5E1",
  },

  modalCancelText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  modalSaveButton: {
    flex: 1.25,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.primary,
  },

  modalSaveButtonDisabled: {
    opacity: 0.7,
  },

  modalSaveButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  modalSaveText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },
});
