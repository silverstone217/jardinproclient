/**
 * ============================================================
 * FORMATAGE DES VALEURS TECHNIQUES POUR L'UTILISATEUR
 * ============================================================
 *
 */

/**
 * ------------------------------------------------------------
 * BottleSize / formats de bouteilles
 * ------------------------------------------------------------
 *
 * Exemples :
 * ML_200 -> 200 ml
 * ML_500 -> 500 ml
 * ML200  -> 200 ml
 * 200ML  -> 200 ml
 */
export function formatBottleSize(value?: string | null): string {
  if (!value) return "-";

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");

  const match =
    normalized.match(/^ML[_-]?(\d+)$/) ?? normalized.match(/^(\d+)ML$/);

  if (match) {
    return `${match[1]} ml`;
  }

  return value;
}

/**
 * ------------------------------------------------------------
 * Unit
 * ------------------------------------------------------------
 *
 * Exemples :
 * PIECE       -> pièce
 * GRAM        -> g
 * KILOGRAM    -> kg
 * MILLILITER  -> ml
 * LITER       -> L
 */
export function formatUnit(value?: string | null): string {
  if (!value) return "-";

  switch (value.toUpperCase()) {
    case "PIECE":
      return "pièce";

    case "GRAM":
      return "g";

    case "KILOGRAM":
      return "kg";

    case "MILLILITER":
      return "ml";

    case "LITER":
      return "L";

    default:
      return value;
  }
}

/**
 * ------------------------------------------------------------
 * Currency
 * ------------------------------------------------------------
 *
 * Les valeurs techniques restent :
 *
 * CDF
 * USD
 * EUR
 *
 * Pour l'affichage utilisateur :
 *
 * CDF -> FC
 * USD -> $
 * EUR -> €
 */
export function formatCurrencyCode(value?: string | null): string {
  if (!value) return "-";

  switch (value.trim().toUpperCase()) {
    case "CDF":
      return "FC";

    case "USD":
      return "$";

    case "EUR":
      return "€";

    default:
      return value;
  }
}

/**
 * ------------------------------------------------------------
 * Point de vente
 * ------------------------------------------------------------
 *
 * On ne montre jamais "POS" au manager.
 *
 * Exemples :
 * POS -> PDV
 * Point of Sale -> Point de vente
 * Tous les POS -> Tous les points de vente
 */
export function formatPointOfSaleLabel(value?: string | null): string {
  if (!value) {
    return "Tous les points de vente";
  }

  return value
    .replace(/\bPOINT OF SALE\b/gi, "Point de vente")
    .replace(/\bPOS\b/gi, "PDV");
}

/**
 * ------------------------------------------------------------
 * Nom d'un point de vente
 * ------------------------------------------------------------
 *
 * Cette fonction ne modifie pas le nom commercial du PDV.
 *
 * Exemple :
 * "POS Limete" -> "PDV Limete"
 * "Limete"     -> "Limete"
 *
 * Si aucune valeur n'est fournie, on utilise "Reste"
 * pour représenter le stock central.
 */
export function formatPointOfSaleName(value?: string | null): string {
  if (!value) {
    return "Reste";
  }

  return value
    .replace(/\bPOINT OF SALE\b/gi, "Point de vente")
    .replace(/\bPOS\b/gi, "PDV");
}

/**
 * ------------------------------------------------------------
 * Format générique
 * ------------------------------------------------------------
 *
 * Utile lorsque la valeur peut être un format de bouteille
 * ou une unité.
 */
export function formatUnitOrSize(value?: string | null): string {
  if (!value) return "-";

  const bottleSize = formatBottleSize(value);

  if (bottleSize !== value) {
    return bottleSize;
  }

  return formatUnit(value);
}
