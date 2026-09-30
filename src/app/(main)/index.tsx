import { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DashboardAction } from "@/components/dashboard/DashboardAction";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { useDashboardStore } from "@/store/dashboard.store";
import { useUserStore } from "@/store/user.store";
import { COLORS, fonts, fontSizes } from "@/utils/styles";

export default function Index() {
  const user = useUserStore((state) => state.user);

  const dashboard = useDashboardStore((state) => state.dashboard);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const isRefreshing = useDashboardStore((state) => state.isRefreshing);
  const error = useDashboardStore((state) => state.error);
  const initializeDashboard = useDashboardStore((state) => state.initialize);
  const refreshDashboard = useDashboardStore((state) => state.refreshDashboard);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    initializeDashboard(user.id);
  }, [user?.id, initializeDashboard]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      await refreshDashboard(user.id);
    } catch {
      // Le store conserve le cache existant en cas d'erreur réseau.
    }
  }, [user?.id, refreshDashboard]);

  /*
   * Pour l'instant, la commande locale n'est pas encore branchée ici.
   *
   * Lorsque le store de commande sera intégré, cette valeur viendra
   * directement du store local.
   */
  const currentOrder = useMemo(() => {
    return null;
  }, []);

  if (!user) {
    return null;
  }

  const firstName = user.name.trim().split(" ")[0] || "Utilisateur";

  const showInitialLoader = isLoading && !dashboard;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        <DashboardHeader userName={user.name} userImage={user.image} />

        <DashboardAction />

        {showInitialLoader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />

            <Text style={styles.loaderText}>
              Chargement du tableau de bord...
            </Text>
          </View>
        ) : dashboard ? (
          <>
            {dashboard.role === "MANAGER" ? (
              <ManagerDashboard dashboard={dashboard} />
            ) : (
              <EmployeeDashboard
                dashboard={dashboard}
                currentOrder={currentOrder}
              />
            )}
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              Impossible de charger le tableau de bord
            </Text>

            <Text style={styles.errorText}>
              {error ||
                "Une erreur est survenue. Faites glisser vers le bas pour réessayer."}
            </Text>
          </View>
        )}

        {dashboard && error && !isRefreshing && (
          <Text style={styles.offlineText}>
            Données affichées depuis le dernier chargement.
          </Text>
        )}

        <Text style={styles.greetingHidden}>{firstName}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.neutral,
    paddingBottom: 60,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  loaderText: {
    marginTop: 10,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: COLORS.Gray,
  },

  errorContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  errorTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.medium,
    color: COLORS.text,
    textAlign: "center",
  },

  errorText: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    lineHeight: 20,
    color: COLORS.Gray,
    textAlign: "center",
  },

  offlineText: {
    marginTop: 4,
    paddingHorizontal: 20,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 1,
    color: COLORS.Gray,
    textAlign: "center",
  },

  greetingHidden: {
    display: "none",
  },
});
