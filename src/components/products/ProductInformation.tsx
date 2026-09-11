import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useProductStore } from "@/store/product.store";
import type {
  Product,
  UpdateProductPayload,
  UpdateProductVariantPayload,
} from "@/types/product";

import { COLORS, fonts } from "@/utils/styles";

interface ProductInformationProps {
  product: Product;
  disabled?: boolean;
}

export function ProductInformation({
  product,
  disabled = false,
}: ProductInformationProps) {
  const { updateProduct, isUpdating } = useProductStore();

  const [name, setName] = useState(product.name);

  const [description, setDescription] = useState(product.description ?? "");

  const [isEditing, setIsEditing] = useState(false);

  // ==========================================================
  // SYNCHRONISATION
  // ==========================================================

  useEffect(() => {
    setName(product.name);
    setDescription(product.description ?? "");
  }, [product.name, product.description]);

  // ==========================================================
  // ÉTAT
  // ==========================================================

  const cleanName = name.trim();
  const cleanDescription = description.trim();

  const hasChanges =
    cleanName !== product.name ||
    cleanDescription !== (product.description ?? "");

  const isBusy = disabled || isUpdating;

  // ==========================================================
  // ANNULER
  // ==========================================================

  const handleCancel = () => {
    setName(product.name);
    setDescription(product.description ?? "");

    setIsEditing(false);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = (): boolean => {
    if (cleanName.length < 2) {
      Alert.alert(
        "Nom invalide",
        "Le nom du produit doit contenir au moins 2 caractères.",
      );

      return false;
    }

    if (cleanName.length > 100) {
      Alert.alert(
        "Nom trop long",
        "Le nom du produit ne peut pas dépasser 100 caractères.",
      );

      return false;
    }

    if (cleanDescription.length > 500) {
      Alert.alert(
        "Description trop longue",
        "La description ne peut pas dépasser 500 caractères.",
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // SAUVEGARDER
  // ==========================================================

  const handleSave = async () => {
    if (isBusy || !hasChanges) {
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const variants: UpdateProductVariantPayload[] = product.variants.map(
        (variant) => ({
          id: variant.id,
          packagingId: variant.packagingId,
          sku: variant.sku,
          price: Number(variant.price),
          shelfLifeDays: Number(variant.shelfLifeDays),
          isActive: variant.isActive,
        }),
      );

      const payload: UpdateProductPayload = {
        name: cleanName,
        description: cleanDescription || undefined,
        isActive: product.isActive,
        variants,
      };

      await updateProduct(product.id, payload);

      setIsEditing(false);

      Alert.alert(
        "Produit mis à jour",
        "Les informations du produit ont été enregistrées.",
      );
    } catch (error) {
      console.error("Erreur modification informations produit :", error);

      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible de modifier les informations du produit.",
      );
    }
  };

  // ==========================================================
  // MODE LECTURE
  // ==========================================================

  if (!isEditing) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="information-outline"
              size={19}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Informations clés</Text>

            <Text style={styles.subtitle}>
              Les informations principales de votre produit.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setIsEditing(true)}
            disabled={disabled}
            hitSlop={6}
          >
            <Ionicons name="create-outline" size={17} color={COLORS.primary} />

            <Text style={styles.editButtonText}>Modifier</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* NOM */}

          <View style={styles.infoBlock}>
            <View style={[styles.infoIcon, styles.nameIcon]}>
              <Ionicons
                name="pricetag-outline"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>NOM DU PRODUIT</Text>

              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* DESCRIPTION */}

          <View style={styles.infoBlock}>
            <View style={[styles.infoIcon, styles.descriptionIcon]}>
              <Ionicons
                name="document-text-outline"
                size={17}
                color="#7952A8"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>DESCRIPTION</Text>

              <Text
                style={[
                  styles.description,
                  !product.description && styles.emptyDescription,
                ]}
              >
                {product.description || "Aucune description renseignée."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================================
  // MODE ÉDITION
  // ==========================================================

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, styles.headerIconEditing]}>
          <Ionicons name="create-outline" size={19} color={COLORS.secondary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Modifier les informations</Text>

          <Text style={styles.subtitle}>
            Mettez à jour le nom ou la description du produit.
          </Text>
        </View>

        <View style={styles.editingBadge}>
          <View style={styles.editingDot} />

          <Text style={styles.editingBadgeText}>Modification</Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* NOM */}

        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <View style={[styles.fieldIcon, styles.nameIcon]}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.fieldLabel}>Nom du produit</Text>

            <Text style={styles.required}>Requis</Text>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Jus d'ananas"
            placeholderTextColor={COLORS.Gray}
            style={[styles.input, !name.trim() && styles.inputError]}
            autoCapitalize="sentences"
            autoCorrect
            maxLength={100}
            editable={!isBusy}
            returnKeyType="next"
          />

          <View style={styles.fieldFooter}>
            <Text style={styles.fieldHint}>
              Le nom doit être facilement identifiable.
            </Text>

            <Text style={styles.counter}>{name.length}/100</Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <View style={[styles.fieldIcon, styles.descriptionIcon]}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#7952A8"
              />
            </View>

            <Text style={styles.fieldLabel}>Description</Text>

            <Text style={styles.optional}>Optionnel</Text>
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez brièvement ce produit..."
            placeholderTextColor={COLORS.Gray}
            style={[styles.input, styles.descriptionInput]}
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!isBusy}
          />

          <View style={styles.fieldFooter}>
            <Text style={styles.fieldHint}>
              Une courte description peut aider à présenter le produit.
            </Text>

            <Text style={styles.counter}>{description.length}/500</Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleCancel}
          disabled={isBusy}
        >
          <Ionicons name="close-outline" size={18} color={COLORS.darkGray} />

          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (!hasChanges || isBusy || !cleanName) && styles.saveButtonDisabled,
            pressed &&
              hasChanges &&
              !isBusy &&
              cleanName &&
              styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isBusy || !cleanName}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={!hasChanges || !cleanName ? COLORS.Gray : COLORS.white}
            />
          )}

          <Text
            style={[
              styles.saveButtonText,
              (!hasChanges || !cleanName) && styles.saveButtonTextDisabled,
            ]}
          >
            {isUpdating ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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

  headerIconEditing: {
    backgroundColor: "#FFF1E2",
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

  // ==========================================================
  // HEADER — ACTION
  // ==========================================================

  editButton: {
    minHeight: 35,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#EDF4EB",
    borderWidth: 1,
    borderColor: "#DFEBDD",
  },

  editButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.primary,
  },

  editingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FFF5E9",
  },

  editingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
    backgroundColor: COLORS.secondary,
  },

  editingBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    color: "#B56A00",
  },

  // ==========================================================
  // LECTURE
  // ==========================================================

  content: {
    marginTop: 17,
    borderRadius: 16,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
    paddingHorizontal: 14,
  },

  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  nameIcon: {
    backgroundColor: "#EAF2E7",
  },

  descriptionIcon: {
    backgroundColor: "#F3EAF8",
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: COLORS.Gray,
  },

  productName: {
    marginTop: 4,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
    color: COLORS.text,
  },

  description: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.darkGray,
  },

  emptyDescription: {
    fontFamily: fonts.medium,
    color: COLORS.Gray,
    fontStyle: "italic",
  },

  separator: {
    height: 1,
    backgroundColor: "#EAEAE6",
  },

  // ==========================================================
  // FORM
  // ==========================================================

  form: {
    marginTop: 17,
  },

  field: {
    marginBottom: 17,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  fieldIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldLabel: {
    marginLeft: 8,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: COLORS.darkGray,
  },

  required: {
    marginLeft: "auto",
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.error,
  },

  optional: {
    marginLeft: "auto",
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E1",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: COLORS.text,
  },

  inputError: {
    borderColor: "#F1CACA",
  },

  descriptionInput: {
    minHeight: 105,
    paddingTop: 12,
  },

  fieldFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 2,
  },

  fieldHint: {
    flex: 1,
    marginRight: 8,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  counter: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  // ==========================================================
  // ACTIONS
  // ==========================================================

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 2,
  },

  cancelButton: {
    flex: 0.8,
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F5F5F3",
    borderWidth: 1,
    borderColor: "#E5E5E1",
  },

  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  saveButton: {
    flex: 1.2,
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
  },

  saveButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.white,
  },

  saveButtonTextDisabled: {
    color: COLORS.Gray,
  },

  saveButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  buttonPressed: {
    opacity: 0.65,
  },
});
