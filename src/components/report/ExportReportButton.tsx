import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as XLSX from "xlsx-js-style";

import type { ReportData, ReportFilters } from "@/types/report";

import { ReportExcelService } from "@/services/ReportExcelService";

import { COLORS, fonts, fontSizes } from "@/utils/styles";

interface ExportReportButtonProps {
  report: ReportData;
  filters: ReportFilters;
}

export function ExportReportButton({
  report,
  filters,
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      const { workbook, fileName } = ReportExcelService.createWorkbook(
        report,
        filters,
      );

      const base64 = XLSX.write(workbook as XLSX.WorkBook, {
        type: "base64",
        bookType: "xlsx",
      });

      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "Partage indisponible",
          "Le partage de fichiers n'est pas disponible sur cet appareil.",
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Partager le rapport Excel",
        UTI: "com.microsoft.excel.xlsx",
      });
    } catch (error) {
      console.error("Erreur export Excel :", error);

      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'exporter le rapport Excel.";

      Alert.alert("Erreur d'export", message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleExport}
        disabled={isExporting}
        style={({ pressed }) => [
          styles.button,
          pressed && !isExporting && styles.buttonPressed,
          isExporting && styles.buttonDisabled,
        ]}
      >
        {isExporting ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <MaterialCommunityIcons
            name="file-excel-outline"
            size={22}
            color={COLORS.white}
          />
        )}

        <Text style={styles.buttonText}>
          {isExporting ? "Préparation..." : "Exporter en Excel"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },

  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
  },
});
