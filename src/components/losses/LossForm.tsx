import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LossCategory, LossReason, PendingLossItem } from "@/types/loss";
import { COLORS, fonts } from "@/utils/styles";

interface LossFormIngredient {
  id: string;
  name: string;
  unit: string;
  stockQty?: number;
}

interface LossFormPackaging {
  id: string;
  name: string;
  size: string;
  capacityMl: number;
  stockQty?: number;
}

interface LossFormVariant {
  id: string;
  sku: string;
  product: {
    id: string;
    name: string;
  };
  packaging: {
    id: string;
    name: string;
    size: string;
    capacityMl: number;
  };
}

interface LossFormPointOfSale {
  id: string;
  name: string;
  code: string;
}

interface LossFormProps {
  category: LossCategory | null;

  ingredientId: string;
  packagingId: string;
  variantId: string;
  pointOfSaleId: string;
  finishedStockLotId: string;

  quantity: string;
  reason: LossReason | "";
  note: string;

  ingredients: LossFormIngredient[];
  packagings: LossFormPackaging[];
  variants: LossFormVariant[];
  pointOfSales: LossFormPointOfSale[];

  pendingItem?: PendingLossItem | null;

  availableQuantity?: number;

  onIngredientChange: (value: string) => void;
  onPackagingChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onPointOfSaleChange: (value: string) => void;
  onLotChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onReasonChange: (value: LossReason) => void;
  onNoteChange: (value: string) => void;

  disabled?: boolean;
}

const LOSS_REASONS: {
  value: LossReason;
  label: string;
}[] = [
  {
    value: "EXPIRED",
    label: "Expiré",
  },
  {
    value: "DAMAGED",
    label: "Endommagé",
  },
  {
    value: "STOLEN",
    label: "Volé",
  },
  {
    value: "QUAL_REJECT",
    label: "Rejet qualité",
  },
  {
    value: "OTHER",
    label: "Autre",
  },
];

export function LossForm({
  category,

  ingredientId,
  packagingId,
  variantId,
  pointOfSaleId,
  finishedStockLotId,

  quantity,
  reason,
  note,

  ingredients,
  packagings,
  variants,
  pointOfSales,

  pendingItem,
  availableQuantity,

  onIngredientChange,
  onPackagingChange,
  onVariantChange,
  onPointOfSaleChange,
  onLotChange,
  onQuantityChange,
  onReasonChange,
  onNoteChange,

  disabled = false,
}: LossFormProps) {
  const isFinishedProduct = category === "FINISHED_PRODUCT";

  const effectiveAvailableQuantity =
    availableQuantity ?? pendingItem?.remainingQuantity ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Détails de la perte</Text>

          <Text style={styles.subtitle}>
            Renseignez les informations nécessaires avant l'enregistrement.
          </Text>
        </View>
      </View>

      {!category ? (
        <View style={styles.emptyCategory}>
          <View style={styles.emptyCategoryIcon}>
            <Ionicons name="arrow-up-outline" size={20} color={COLORS.Gray} />
          </View>

          <Text style={styles.emptyCategoryText}>
            Sélectionnez d'abord le type de perte.
          </Text>
        </View>
      ) : (
        <View style={styles.fields}>
          {category === "RAW_INGREDIENT" && (
            <IngredientField
              value={ingredientId}
              options={ingredients}
              onChange={onIngredientChange}
              disabled={disabled}
            />
          )}

          {category === "PACKAGING" && (
            <PackagingField
              value={packagingId}
              options={packagings}
              onChange={onPackagingChange}
              disabled={disabled}
            />
          )}

          {isFinishedProduct && (
            <>
              <VariantField
                value={variantId}
                options={variants}
                onChange={onVariantChange}
                disabled={disabled || !!pendingItem}
              />

              <PointOfSaleField
                value={pointOfSaleId}
                options={pointOfSales}
                onChange={onPointOfSaleChange}
                disabled={disabled || !!pendingItem}
                allowMainShop
              />

              {pendingItem ? (
                <PendingLotField item={pendingItem} disabled={disabled} />
              ) : (
                <LotField
                  value={finishedStockLotId}
                  disabled={disabled}
                  onChange={onLotChange}
                />
              )}

              <AvailableQuantity quantity={effectiveAvailableQuantity} />
            </>
          )}

          <QuantityField
            value={quantity}
            onChange={onQuantityChange}
            disabled={disabled}
            availableQuantity={
              isFinishedProduct ? effectiveAvailableQuantity : undefined
            }
          />

          <ReasonField
            value={reason}
            onChange={onReasonChange}
            disabled={disabled}
          />

          <NoteField value={note} onChange={onNoteChange} disabled={disabled} />
        </View>
      )}
    </View>
  );
}

interface IngredientFieldProps {
  value: string;
  options: LossFormIngredient[];
  onChange: (value: string) => void;
  disabled: boolean;
}

function IngredientField({
  value,
  options,
  onChange,
  disabled,
}: IngredientFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="leaf-outline" label="Matière première" />

      <View style={styles.options}>
        {options.map((item) => {
          const selected = item.id === value;

          return (
            <SelectOption
              key={item.id}
              label={item.name}
              description={
                item.stockQty !== undefined
                  ? `${item.stockQty} ${item.unit} disponibles`
                  : item.unit
              }
              selected={selected}
              color={COLORS.primary}
              backgroundColor="#E8F2E5"
              onPress={() => onChange(item.id)}
              disabled={disabled}
            />
          );
        })}
      </View>

      {options.length === 0 && (
        <EmptyFieldText>Aucune matière première disponible.</EmptyFieldText>
      )}
    </View>
  );
}

interface PackagingFieldProps {
  value: string;
  options: LossFormPackaging[];
  onChange: (value: string) => void;
  disabled: boolean;
}

function PackagingField({
  value,
  options,
  onChange,
  disabled,
}: PackagingFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="cube-outline" label="Emballage" />

      <View style={styles.options}>
        {options.map((item) => {
          const selected = item.id === value;

          return (
            <SelectOption
              key={item.id}
              label={item.name}
              description={`${item.size} · ${item.capacityMl} ml${
                item.stockQty !== undefined
                  ? ` · ${item.stockQty} disponibles`
                  : ""
              }`}
              selected={selected}
              color={COLORS.secondary}
              backgroundColor="#FFF3DF"
              onPress={() => onChange(item.id)}
              disabled={disabled}
            />
          );
        })}
      </View>

      {options.length === 0 && (
        <EmptyFieldText>Aucun emballage disponible.</EmptyFieldText>
      )}
    </View>
  );
}

interface VariantFieldProps {
  value: string;
  options: LossFormVariant[];
  onChange: (value: string) => void;
  disabled: boolean;
}

function VariantField({
  value,
  options,
  onChange,
  disabled,
}: VariantFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="flask-outline" label="Produit fini" />

      <View style={styles.options}>
        {options.map((item) => {
          const selected = item.id === value;

          return (
            <SelectOption
              key={item.id}
              label={item.product.name}
              description={`${item.packaging.name} · ${item.packaging.size} · ${item.sku}`}
              selected={selected}
              color="#7952A8"
              backgroundColor="#F3EAF8"
              onPress={() => onChange(item.id)}
              disabled={disabled}
            />
          );
        })}
      </View>

      {options.length === 0 && (
        <EmptyFieldText>Aucun produit fini disponible.</EmptyFieldText>
      )}
    </View>
  );
}

interface PointOfSaleFieldProps {
  value: string;
  options: LossFormPointOfSale[];
  onChange: (value: string) => void;
  disabled: boolean;
  allowMainShop?: boolean;
}

function PointOfSaleField({
  value,
  options,
  onChange,
  disabled,
  allowMainShop = false,
}: PointOfSaleFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="location-outline" label="Emplacement" />

      <View style={styles.options}>
        {allowMainShop && (
          <SelectOption
            label="Boutique principale"
            description="Stock principal"
            selected={value === ""}
            color={COLORS.primary}
            backgroundColor="#E8F2E5"
            onPress={() => onChange("")}
            disabled={disabled}
          />
        )}

        {options.map((item) => {
          const selected = item.id === value;

          return (
            <SelectOption
              key={item.id}
              label={item.name}
              description={item.code}
              selected={selected}
              color={COLORS.info}
              backgroundColor="#E8F1FB"
              onPress={() => onChange(item.id)}
              disabled={disabled}
            />
          );
        })}
      </View>

      {options.length === 0 && !allowMainShop && (
        <EmptyFieldText>Aucun point de vente disponible.</EmptyFieldText>
      )}
    </View>
  );
}

interface LotFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

function LotField({ value, onChange, disabled }: LotFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="layers-outline" label="Lot de stock" />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Identifiant du lot"
        placeholderTextColor={COLORS.Gray}
        editable={!disabled}
        style={[styles.input, disabled && styles.inputDisabled]}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.helperText}>
        Pour un produit fini, la perte doit être rattachée à un lot précis.
      </Text>
    </View>
  );
}

interface PendingLotFieldProps {
  item: PendingLossItem;
  disabled: boolean;
}

function PendingLotField({ item, disabled }: PendingLotFieldProps) {
  const expiration = item.expiresAt
    ? new Date(item.expiresAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date inconnue";

  return (
    <View style={styles.field}>
      <FieldLabel icon="layers-outline" label="Lot concerné" />

      <View style={[styles.lockedField, disabled && styles.inputDisabled]}>
        <View style={styles.lockedIcon}>
          <Ionicons name="lock-closed-outline" size={15} color={COLORS.Gray} />
        </View>

        <View style={styles.lockedContent}>
          <Text style={styles.lockedTitle}>Lot expiré sélectionné</Text>

          <Text style={styles.lockedText}>
            {item.remainingQuantity} unité
            {item.remainingQuantity > 1 ? "s" : ""} restante
            {item.remainingQuantity > 1 ? "s" : ""} · expiration {expiration}
          </Text>
        </View>
      </View>

      <Text style={styles.helperText}>
        Ce lot est automatiquement utilisé pour cette déclaration.
      </Text>
    </View>
  );
}

interface AvailableQuantityProps {
  quantity: number;
}

function AvailableQuantity({ quantity }: AvailableQuantityProps) {
  return (
    <View style={styles.availableContainer}>
      <View style={styles.availableIcon}>
        <Ionicons name="cube-outline" size={15} color={COLORS.primary} />
      </View>

      <View style={styles.availableContent}>
        <Text style={styles.availableLabel}>Stock disponible</Text>

        <Text style={styles.availableValue}>
          {quantity} unité
          {quantity > 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}

interface QuantityFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  availableQuantity?: number;
}

function QuantityField({
  value,
  onChange,
  disabled,
  availableQuantity,
}: QuantityFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="remove-circle-outline" label="Quantité perdue" />

      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(",", "."))}
        placeholder="0"
        placeholderTextColor={COLORS.Gray}
        editable={!disabled}
        keyboardType="decimal-pad"
        style={[styles.quantityInput, disabled && styles.inputDisabled]}
      />

      {availableQuantity !== undefined && (
        <Text style={styles.helperText}>
          Maximum : {availableQuantity} unité
          {availableQuantity > 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );
}

interface ReasonFieldProps {
  value: LossReason | "";
  onChange: (value: LossReason) => void;
  disabled: boolean;
}

function ReasonField({ value, onChange, disabled }: ReasonFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="help-circle-outline" label="Motif" />

      <View style={styles.reasonGrid}>
        {LOSS_REASONS.map((reason) => {
          const selected = value === reason.value;

          return (
            <Pressable
              key={reason.value}
              style={({ pressed }) => [
                styles.reasonOption,
                selected && styles.reasonOptionSelected,
                disabled && styles.optionDisabled,
                pressed && !disabled && styles.pressed,
              ]}
              onPress={() => onChange(reason.value)}
              disabled={disabled}
            >
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.primary}
                />
              )}

              <Text
                style={[
                  styles.reasonText,
                  selected && styles.reasonTextSelected,
                ]}
              >
                {reason.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

function NoteField({ value, onChange, disabled }: NoteFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel icon="document-text-outline" label="Note" optional />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Ajoutez une précision si nécessaire..."
        placeholderTextColor={COLORS.Gray}
        editable={!disabled}
        multiline
        numberOfLines={4}
        maxLength={300}
        textAlignVertical="top"
        style={[styles.noteInput, disabled && styles.inputDisabled]}
      />

      <Text style={styles.characterCount}>{value.length}/300</Text>
    </View>
  );
}

interface FieldLabelProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  optional?: boolean;
}

function FieldLabel({ icon, label, optional = false }: FieldLabelProps) {
  return (
    <View style={styles.fieldLabel}>
      <View style={styles.fieldLabelIcon}>
        <Ionicons name={icon} size={15} color={COLORS.primary} />
      </View>

      <Text style={styles.fieldLabelText}>{label}</Text>

      {optional && <Text style={styles.optionalText}>Facultatif</Text>}
    </View>
  );
}

interface SelectOptionProps {
  label: string;
  description: string;
  selected: boolean;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  disabled: boolean;
}

function SelectOption({
  label,
  description,
  selected,
  color,
  backgroundColor,
  onPress,
  disabled,
}: SelectOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.selectOption,
        selected && {
          borderColor: color,
          backgroundColor,
        },
        disabled && styles.optionDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.selectContent}>
        <Text
          style={[
            styles.selectLabel,
            selected && {
              color,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        <Text style={styles.selectDescription} numberOfLines={1}>
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selected && {
            borderColor: color,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.radioSelected,
              {
                backgroundColor: color,
              },
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

function EmptyFieldText({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.emptyField}>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={COLORS.Gray}
      />

      <Text style={styles.emptyFieldText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.Gray,
  },

  emptyCategory: {
    minHeight: 100,
    marginTop: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF8",
    borderWidth: 1,
    borderColor: "#EEEEEA",
  },

  emptyCategoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0ED",
  },

  emptyCategoryText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: COLORS.Gray,
  },

  fields: {
    paddingTop: 4,
  },

  field: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1EE",
  },

  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  fieldLabelIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F6F0",
  },

  fieldLabelText: {
    marginLeft: 8,
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.darkGray,
  },

  optionalText: {
    marginLeft: 6,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  options: {
    gap: 7,
  },

  selectOption: {
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
  },

  selectContent: {
    flex: 1,
    paddingRight: 8,
  },

  selectLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: COLORS.text,
  },

  selectDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D7D7D3",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  lockedField: {
    minHeight: 58,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#F5F5F3",
    flexDirection: "row",
    alignItems: "center",
  },

  lockedIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAEAE7",
  },

  lockedContent: {
    flex: 1,
    marginLeft: 9,
  },

  lockedTitle: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: COLORS.darkGray,
  },

  lockedText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  availableContainer: {
    marginTop: 9,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F5F8F3",
    flexDirection: "row",
    alignItems: "center",
  },

  availableIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F2E5",
  },

  availableContent: {
    flex: 1,
    marginLeft: 8,
  },

  availableLabel: {
    fontFamily: fonts.regular,
    fontSize: 8.5,
    color: COLORS.Gray,
  },

  availableValue: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: COLORS.primary,
  },

  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.medium,
    fontSize: 11,
    color: COLORS.text,
  },

  quantityInput: {
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.bold,
    fontSize: 15,
    color: COLORS.text,
  },

  noteInput: {
    minHeight: 88,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.text,
  },

  inputDisabled: {
    backgroundColor: "#F3F3F1",
    color: COLORS.Gray,
  },

  helperText: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 13,
    color: COLORS.Gray,
  },

  characterCount: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: COLORS.Gray,
    textAlign: "right",
  },

  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  reasonOption: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E5",
    backgroundColor: "#FAFAF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  reasonOptionSelected: {
    borderColor: "#CFE0CA",
    backgroundColor: "#E8F2E5",
  },

  reasonText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: COLORS.darkGray,
  },

  reasonTextSelected: {
    color: COLORS.primary,
  },

  emptyField: {
    minHeight: 45,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: "#F7F7F5",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  emptyFieldText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9,
    color: COLORS.Gray,
  },

  optionDisabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.65,
  },
});
