import type { WorkSheet } from "xlsx-js-style";

export const EXCEL_COLORS = {
  primary: "2D5A27",
  secondary: "FF9F1C",
  tertiary: "FFBF00",

  white: "FFFFFF",
  black: "000000",
  darkText: "333333",

  lightGreen: "EAF3E8",
  lightOrange: "FFF1DC",
  lightYellow: "FFF8D6",
  lightGray: "F2F2F2",
  border: "D9D9D9",

  success: "2E7D32",
  danger: "C62828",
} as const;

export const EXCEL_FONTS = {
  title: {
    name: "Arial",
    sz: 18,
    bold: true,
    color: EXCEL_COLORS.primary,
  },

  subtitle: {
    name: "Arial",
    sz: 11,
    color: EXCEL_COLORS.darkText,
  },

  section: {
    name: "Arial",
    sz: 12,
    bold: true,
    color: EXCEL_COLORS.white,
  },

  header: {
    name: "Arial",
    sz: 10,
    bold: true,
    color: EXCEL_COLORS.white,
  },

  body: {
    name: "Arial",
    sz: 10,
    color: EXCEL_COLORS.darkText,
  },
} as const;

export const EXCEL_BORDERS = {
  thin: {
    top: {
      style: "thin",
      color: {
        rgb: EXCEL_COLORS.border,
      },
    },
    bottom: {
      style: "thin",
      color: {
        rgb: EXCEL_COLORS.border,
      },
    },
    left: {
      style: "thin",
      color: {
        rgb: EXCEL_COLORS.border,
      },
    },
    right: {
      style: "thin",
      color: {
        rgb: EXCEL_COLORS.border,
      },
    },
  },
} as const;

export const EXCEL_ALIGNMENT = {
  left: {
    horizontal: "left",
    vertical: "center",
  },

  center: {
    horizontal: "center",
    vertical: "center",
  },

  right: {
    horizontal: "right",
    vertical: "center",
  },
} as const;

export const EXCEL_NUMBER_FORMATS = {
  integer: "#,##0",
  decimal: "#,##0.00",
  currency: '#,##0.00 "CDF"',
  date: "dd/mm/yyyy",
  dateTime: "dd/mm/yyyy hh:mm",
} as const;

/**
 * Style d'un titre principal.
 */
export function styleTitle(worksheet: WorkSheet, cellAddress: string): void {
  if (!worksheet[cellAddress]) {
    return;
  }

  worksheet[cellAddress].s = {
    font: EXCEL_FONTS.title,
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  };
}

/**
 * Style d'une information secondaire :
 * période, POS, date de génération, etc.
 */
export function styleSubtitle(worksheet: WorkSheet, cellAddress: string): void {
  if (!worksheet[cellAddress]) {
    return;
  }

  worksheet[cellAddress].s = {
    font: EXCEL_FONTS.subtitle,
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  };
}

/**
 * Style d'un titre de section.
 */
export function styleSectionTitle(
  worksheet: WorkSheet,
  cellAddress: string,
): void {
  if (!worksheet[cellAddress]) {
    return;
  }

  worksheet[cellAddress].s = {
    font: EXCEL_FONTS.section,
    fill: {
      fgColor: {
        rgb: EXCEL_COLORS.primary,
      },
    },
    alignment: EXCEL_ALIGNMENT.left,
    border: EXCEL_BORDERS.thin,
  };
}

/**
 * Style d'une ligne d'en-tête de tableau.
 */
export function styleTableHeader(
  worksheet: WorkSheet,
  startColumn: number,
  endColumn: number,
  row: number,
): void {
  for (let column = startColumn; column <= endColumn; column++) {
    const address = `${columnToLetter(column)}${row + 1}`;
    const cell = worksheet[address];

    if (!cell) {
      continue;
    }

    cell.s = {
      font: EXCEL_FONTS.header,
      fill: {
        fgColor: {
          rgb: EXCEL_COLORS.primary,
        },
      },
      alignment: EXCEL_ALIGNMENT.center,
      border: EXCEL_BORDERS.thin,
    };
  }
}

/**
 * Style les cellules d'un tableau.
 */
export function styleTableBody(
  worksheet: WorkSheet,
  startColumn: number,
  endColumn: number,
  startRow: number,
  endRow: number,
): void {
  for (let row = startRow; row <= endRow; row++) {
    for (let column = startColumn; column <= endColumn; column++) {
      const address = `${columnToLetter(column)}${row + 1}`;
      const cell = worksheet[address];

      if (!cell) {
        continue;
      }

      cell.s = {
        font: EXCEL_FONTS.body,
        alignment: EXCEL_ALIGNMENT.left,
        border: EXCEL_BORDERS.thin,
      };
    }
  }
}

/**
 * Style une cellule monétaire.
 */
export function styleCurrencyCell(
  worksheet: WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.t = "n";
  cell.z = EXCEL_NUMBER_FORMATS.currency;

  cell.s = {
    font: EXCEL_FONTS.body,
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

/**
 * Style une cellule numérique entière.
 */
export function styleIntegerCell(
  worksheet: WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.t = "n";
  cell.z = EXCEL_NUMBER_FORMATS.integer;

  cell.s = {
    font: EXCEL_FONTS.body,
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

/**
 * Style une cellule numérique décimale.
 */
export function styleDecimalCell(
  worksheet: WorkSheet,
  cellAddress: string,
): void {
  const cell = worksheet[cellAddress];

  if (!cell) {
    return;
  }

  cell.t = "n";
  cell.z = EXCEL_NUMBER_FORMATS.decimal;

  cell.s = {
    font: EXCEL_FONTS.body,
    alignment: EXCEL_ALIGNMENT.right,
    border: EXCEL_BORDERS.thin,
  };
}

/**
 * Convertit un index de colonne Excel en lettre.
 *
 * 0 -> A
 * 1 -> B
 * 25 -> Z
 * 26 -> AA
 */
export function columnToLetter(column: number): string {
  let result = "";
  let current = column + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;

    result = String.fromCharCode(65 + remainder) + result;

    current = Math.floor((current - 1) / 26);
  }

  return result;
}
