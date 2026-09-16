import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, fonts } from "@/utils/styles";

import type { Product } from "@/types/product";

interface ProductionProductSelectorProps {
  selectedProduct: Product | null;
  products: Product[];
  visible: boolean;
  disabled?: boolean;
  onOpen: () => void;
  onSelect: (productId: string) => void;
}

export function ProductionProductSelector({
  selectedProduct,
  products,
  visible,
  disabled = false,
  onOpen,
  onSelect,
}: ProductionProductSelectorProps) {
  const activeProducts = products.filter((product) => product.isActive);

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialCommunityIcons
            name="bottle-tonic-outline"
            size={19}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>Produit à fabriquer</Text>

          <Text style={styles.sectionDescription}>
            Sélectionnez le jus que vous souhaitez produire.
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.selectButton,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
        onPress={onOpen}
        disabled={disabled}
      >
        <View style={styles.selectIcon}>
          <MaterialCommunityIcons
            name={selectedProduct ? "fruit-watermelon" : "plus-circle-outline"}
            size={21}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.selectContent}>
          <Text
            style={[styles.selectValue, !selectedProduct && styles.placeholder]}
          >
            {selectedProduct ? selectedProduct.name : "Choisir un produit"}
          </Text>

          {selectedProduct ? (
            <Text style={styles.selectMeta}>
              {
                selectedProduct.variants.filter((variant) => variant.isActive)
                  .length
              }{" "}
              format
              {selectedProduct.variants.filter((variant) => variant.isActive)
                .length > 1
                ? "s"
                : ""}{" "}
              disponible
              {selectedProduct.variants.filter((variant) => variant.isActive)
                .length > 1
                ? "s"
                : ""}
            </Text>
          ) : (
            <Text style={styles.selectMeta}>
              {activeProducts.length} produit
              {activeProducts.length > 1 ? "s" : ""} disponible
              {activeProducts.length > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <MaterialCommunityIcons
          name={visible ? "chevron-up" : "chevron-down"}
          size={21}
          color={COLORS.Gray}
        />
      </Pressable>

      {visible && (
        <View style={styles.productList}>
          {activeProducts.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={24}
                color={COLORS.Gray}
              />

              <Text style={styles.emptyText}>
                Aucun produit actif disponible.
              </Text>
            </View>
          ) : (
            activeProducts.map((product) => {
              const isSelected = product.id === selectedProduct?.id;

              const variantCount = product.variants.filter(
                (variant) => variant.isActive,
              ).length;

              return (
                <Pressable
                  key={product.id}
                  style={({ pressed }) => [
                    styles.productOption,
                    isSelected && styles.productOptionSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onSelect(product.id)}
                >
                  <View
                    style={[
                      styles.productOptionIcon,
                      isSelected && styles.productOptionIconSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="bottle-tonic-outline"
                      size={19}
                      color={isSelected ? COLORS.white : COLORS.primary}
                    />
                  </View>

                  <View style={styles.productOptionContent}>
                    <Text style={styles.productOptionName}>{product.name}</Text>

                    <Text style={styles.productOptionMeta}>
                      {variantCount} format
                      {variantCount > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={21}
                      color={COLORS.primary}
                    />
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {selectedProduct && !selectedProduct.recipe && (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert-outline"
            size={18}
            color={COLORS.warning}
          />

          <Text style={styles.warningText}>
            Ce produit ne possède pas encore de recette.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: COLORS.text,
  },

  sectionDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  selectButton: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E8E3",
    backgroundColor: "#FAFBF9",
    flexDirection: "row",
    alignItems: "center",
  },

  selectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4EB",
  },

  selectContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  selectValue: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.Gray,
  },

  selectMeta: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: COLORS.Gray,
  },

  productList: {
    marginTop: 8,
    gap: 6,
  },

  productOption: {
    minHeight: 57,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
    flexDirection: "row",
    alignItems: "center",
  },

  productOptionSelected: {
    borderColor: "#C9DDC5",
    backgroundColor: "#F2F7F0",
  },

  productOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2E7",
  },

  productOptionIconSelected: {
    backgroundColor: COLORS.primary,
  },

  productOptionContent: {
    flex: 1,
    marginLeft: 10,
  },

  productOptionName: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: COLORS.text,
  },

  productOptionMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  warningBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F2E2B8",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  warningText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#80691D",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  emptyText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: COLORS.Gray,
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.65,
  },
});
