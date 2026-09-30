import * as XLSX from "xlsx-js-style";

export interface ExcelReportInfo {
  title: string;
  period?: string;
  pointOfSale?: string;
  generatedAt?: string;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Convertit une valeur en nombre Excel.
 */
export function toExcelNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : 0;
}

/**
 * Formate une date ISO pour un affichage lisible.
 */
export function formatExcelDate(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formate une date et une heure.
 */
export function formatExcelDateTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formate un montant pour un affichage humain.
 *
 * Exemple :
 * 1250000 -> "1 250 000 CDF"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency = "CDF",
): string {
  const amount = toExcelNumber(value);

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(amount)} ${currency}`;
}

/**
 * Crée une feuille Excel à partir d'un tableau d'objets.
 */
export function createWorksheetFromRows<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExcelColumn[],
): XLSX.WorkSheet {
  const data = rows.map((row) => columns.map((column) => row[column.key]));

  const worksheet = XLSX.utils.aoa_to_sheet([
    columns.map((column) => column.header),
    ...data,
  ]);

  applyColumnWidths(worksheet, columns);

  return worksheet;
}

/**
 * Ajoute un titre et les informations générales
 * du rapport au-dessus d'une feuille existante.
 */
export function addReportHeader(
  worksheet: XLSX.WorkSheet,
  info: ExcelReportInfo,
): void {
  const existingRange = worksheet["!ref"];

  if (!existingRange) {
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [info.title],
        [info.period ? `Période : ${info.period}` : ""],
        [info.pointOfSale ? `Point de vente : ${info.pointOfSale}` : ""],
        [info.generatedAt ? `Généré le : ${info.generatedAt}` : ""],
        [],
      ],
      {
        origin: "A1",
      },
    );

    return;
  }

  const range = XLSX.utils.decode_range(existingRange);

  const existingData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
  });

  const headerRows = [
    [info.title],
    [info.period ? `Période : ${info.period}` : ""],
    [info.pointOfSale ? `Point de vente : ${info.pointOfSale}` : ""],
    [info.generatedAt ? `Généré le : ${info.generatedAt}` : ""],
    [],
  ];

  const newData = [...headerRows, ...existingData];

  const newWorksheet = XLSX.utils.aoa_to_sheet(newData);

  worksheet["!ref"] = newWorksheet["!ref"];

  Object.keys(newWorksheet).forEach((key) => {
    if (key !== "!ref") {
      worksheet[key] = newWorksheet[key];
    }
  });

  if (range.e.c >= 0) {
    const maxColumn = range.e.c;

    for (let row = 0; row < 4; row++) {
      for (let column = 0; column <= maxColumn; column++) {
        const address = XLSX.utils.encode_cell({
          r: row,
          c: column,
        });

        if (!worksheet[address]) {
          worksheet[address] = {
            t: "s",
            v: "",
          };
        }
      }
    }
  }
}

/**
 * Ajoute une section avec un titre
 * avant des données.
 */
export function addSectionTitle(
  worksheet: XLSX.WorkSheet,
  title: string,
  startRow: number,
): number {
  XLSX.utils.sheet_add_aoa(worksheet, [[title]], {
    origin: {
      r: startRow,
      c: 0,
    },
  });

  return startRow + 1;
}

/**
 * Applique les largeurs de colonnes.
 */
export function applyColumnWidths(
  worksheet: XLSX.WorkSheet,
  columns: ExcelColumn[],
): void {
  worksheet["!cols"] = columns.map((column) => ({
    wch: column.width ?? 18,
  }));
}

/**
 * Calcule automatiquement une largeur
 * raisonnable à partir du contenu.
 */
export function autoFitColumns(
  worksheet: XLSX.WorkSheet,
  minimumWidth = 12,
  maximumWidth = 40,
): void {
  if (!worksheet["!ref"]) {
    return;
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  const widths: number[] = [];

  for (let column = range.s.c; column <= range.e.c; column++) {
    let maxLength = minimumWidth;

    for (let row = range.s.r; row <= range.e.r; row++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: column,
      });

      const cell = worksheet[address];

      if (!cell || cell.v === undefined || cell.v === null) {
        continue;
      }

      const value = String(cell.v);

      maxLength = Math.max(maxLength, value.length + 2);
    }

    widths.push(Math.min(maxLength, maximumWidth));
  }

  worksheet["!cols"] = widths.map((width) => ({
    wch: width,
  }));
}

/**
 * Ajoute un filtre automatique
 * sur la ligne d'en-tête.
 */
export function addAutoFilter(worksheet: XLSX.WorkSheet, headerRow = 0): void {
  if (!worksheet["!ref"]) {
    return;
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: {
        r: headerRow,
        c: range.s.c,
      },
      e: {
        r: range.e.r,
        c: range.e.c,
      },
    }),
  };
}

/**
 * Fige les lignes situées au-dessus
 * d'une certaine ligne.
 */
export function freezeRows(worksheet: XLSX.WorkSheet, rows: number): void {
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: rows,
    topLeftCell: `A${rows + 1}`,
    activePane: "bottomRight",
    state: "frozen",
  };
}

/**
 * Ajoute une feuille au classeur
 * avec un nom sécurisé.
 */
export function appendWorksheet(
  workbook: XLSX.WorkBook,
  worksheet: XLSX.WorkSheet,
  name: string,
): void {
  const safeName = sanitizeSheetName(name);

  XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
}

/**
 * Excel limite les noms de feuilles
 * à 31 caractères et interdit certains caractères.
 */
export function sanitizeSheetName(name: string): string {
  const sanitized = name.replace(/[\\/?*[\]:]/g, " ").trim();

  return (sanitized || "Feuille").slice(0, 31);
}

/**
 * Génère une date/heure lisible
 * pour le fichier ou ses métadonnées.
 */
export function getExcelGenerationDate(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

/**
 * Nettoie un texte pour l'utiliser
 * dans un nom de fichier.
 */
export function sanitizeFileName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}
