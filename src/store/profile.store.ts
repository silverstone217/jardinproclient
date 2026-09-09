import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { useUserStore } from "@/store/user.store";
import { api } from "@/utils/api";

import type { ProfileResponse, UpdateProfilePayload } from "@/types/profile";

const PROFILE_STORAGE_KEY = "jardin-profile-storage";

interface ProfileState {
  /**
   * Données du profil disponibles localement.
   */
  profile: ProfileResponse["user"] | null;

  /**
   * Chargement initial depuis le serveur ou le cache local.
   */
  isLoading: boolean;

  /**
   * Actualisation depuis le serveur.
   */
  isRefreshing: boolean;

  /**
   * Modification des informations.
   */
  isSaving: boolean;

  /**
   * Upload/suppression de la photo.
   */
  isUploadingImage: boolean;

  /**
   * Indique si les données affichées viennent du cache local.
   */
  isOffline: boolean;

  /**
   * Erreur courante.
   */
  error: string | null;

  /**
   * Récupérer le profil.
   *
   * Stratégie :
   * 1. Lire immédiatement le cache local.
   * 2. Afficher le cache s'il existe.
   * 3. Essayer ensuite de récupérer les données du serveur.
   * 4. Mettre à jour le cache local avec la réponse serveur.
   */
  fetchProfile: () => Promise<void>;

  /**
   * Actualiser explicitement depuis le serveur.
   */
  refreshProfile: () => Promise<void>;

  /**
   * Modifier les informations du profil.
   */
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;

  /**
   * Modifier la photo de profil.
   */
  updateProfileImage: (imageUri: string) => Promise<void>;

  /**
   * Supprimer la photo de profil.
   */
  removeProfileImage: () => Promise<void>;

  /**
   * Effacer l'erreur.
   */
  clearError: () => void;

  /**
   * Réinitialiser le store.
   */
  reset: () => Promise<void>;
}

/**
 * Récupérer le message d'erreur retourné par l'API.
 */
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    const message = axiosError.response?.data?.message;

    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

/**
 * Synchroniser le profil avec useUserStore.
 *
 * Le profil et l'utilisateur connecté doivent toujours
 * représenter la même donnée.
 */
const syncUserStore = (user: ProfileResponse["user"]) => {
  useUserStore.getState().setUser(user);
};

/**
 * Sauvegarder le profil dans AsyncStorage.
 */
const saveProfileToStorage = async (user: ProfileResponse["user"]) => {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Erreur sauvegarde profil local:", error);
  }
};

/**
 * Lire le profil depuis AsyncStorage.
 */
const getProfileFromStorage = async (): Promise<
  ProfileResponse["user"] | null
> => {
  try {
    const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

    if (!storedProfile) {
      return null;
    }

    return JSON.parse(storedProfile) as ProfileResponse["user"];
  } catch (error) {
    console.error("Erreur lecture profil local:", error);

    return null;
  }
};

/**
 * Supprimer le profil du cache local.
 */
const removeProfileFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error("Erreur suppression profil local:", error);
  }
};

export const useProfileStore = create<ProfileState>((set) => ({
  // ============================================================
  // STATE
  // ============================================================

  profile: null,

  isLoading: false,

  isRefreshing: false,

  isSaving: false,

  isUploadingImage: false,

  isOffline: false,

  error: null,

  // ============================================================
  // FETCH PROFILE
  // ============================================================

  fetchProfile: async () => {
    try {
      /**
       * --------------------------------------------------------
       * 1. Charger immédiatement le cache local.
       * --------------------------------------------------------
       */
      const cachedProfile = await getProfileFromStorage();

      if (cachedProfile) {
        set({
          profile: cachedProfile,
          isOffline: true,
          error: null,
        });

        /**
         * Synchroniser également le UserStore.
         */
        syncUserStore(cachedProfile);
      }

      /**
       * --------------------------------------------------------
       * 2. Essayer de récupérer les données du serveur.
       * --------------------------------------------------------
       */
      set({
        isLoading: true,
        error: null,
      });

      const response = await api.get<ProfileResponse>("/profile");

      const user = response.data.user;

      /**
       * --------------------------------------------------------
       * 3. Le serveur est la source de vérité.
       * --------------------------------------------------------
       *
       * On remplace le cache local par les données
       * fraîchement récupérées.
       */
      set({
        profile: user,
        isLoading: false,
        isOffline: false,
        error: null,
      });

      /**
       * Sauvegarder localement.
       */
      await saveProfileToStorage(user);

      /**
       * Synchroniser UserStore.
       */
      syncUserStore(user);
    } catch (error) {
      /**
       * --------------------------------------------------------
       * Le serveur est inaccessible.
       * --------------------------------------------------------
       *
       * Si un profil local existe, on continue de fonctionner
       * avec celui-ci.
       */
      const cachedProfile = await getProfileFromStorage();

      if (cachedProfile) {
        set({
          profile: cachedProfile,
          isLoading: false,
          isOffline: true,
          error: null,
        });

        syncUserStore(cachedProfile);

        return;
      }

      /**
       * Aucun cache disponible.
       */
      const message = getErrorMessage(
        error,
        "Impossible de récupérer votre profil.",
      );

      set({
        isLoading: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ============================================================
  // REFRESH PROFILE
  // ============================================================

  refreshProfile: async () => {
    try {
      set({
        isRefreshing: true,
        error: null,
      });

      /**
       * Toujours demander les données au serveur
       * lors d'un refresh.
       */
      const response = await api.get<ProfileResponse>("/profile");

      const user = response.data.user;

      /**
       * Mettre à jour le store.
       */
      set({
        profile: user,
        isRefreshing: false,
        isOffline: false,
        error: null,
      });

      /**
       * Mettre à jour le cache local.
       */
      await saveProfileToStorage(user);

      /**
       * Synchroniser UserStore.
       */
      syncUserStore(user);
    } catch (error) {
      /**
       * Si le serveur est inaccessible,
       * conserver les données locales.
       */
      const cachedProfile = await getProfileFromStorage();

      if (cachedProfile) {
        set({
          profile: cachedProfile,
          isRefreshing: false,
          isOffline: true,
          error: null,
        });

        syncUserStore(cachedProfile);

        return;
      }

      const message = getErrorMessage(
        error,
        "Impossible d’actualiser votre profil.",
      );

      set({
        isRefreshing: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  updateProfile: async (data) => {
    try {
      set({
        isSaving: true,
        error: null,
      });

      /**
       * La modification nécessite actuellement
       * une connexion au serveur.
       */
      const response = await api.patch<ProfileResponse>("/profile", data);

      /**
       * Le serveur renvoie le profil à jour.
       */
      const user = response.data.user;

      /**
       * Mettre à jour Zustand.
       */
      set({
        profile: user,
        isSaving: false,
        isOffline: false,
        error: null,
      });

      /**
       * IMPORTANT :
       * le cache local est actualisé seulement
       * après confirmation du serveur.
       */
      await saveProfileToStorage(user);

      /**
       * Synchroniser UserStore.
       */
      syncUserStore(user);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier votre profil. Vérifiez votre connexion Internet.",
      );

      set({
        isSaving: false,
        error: message,
      });

      throw error;
    }
  },

  // ============================================================
  // UPDATE PROFILE IMAGE
  // ============================================================

  updateProfileImage: async (imageUri) => {
    try {
      set({
        isUploadingImage: true,
        error: null,
      });

      /**
       * Préparer le fichier.
       */
      const formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      /**
       * Ne pas définir manuellement
       * Content-Type.
       *
       * api.ts s'en charge pour FormData.
       */
      const response = await api.post<ProfileResponse>(
        "/profile/image",
        formData,
      );

      /**
       * Le serveur renvoie le User actualisé
       * avec la nouvelle URL Cloudinary.
       */
      const user = response.data.user;

      /**
       * Mettre à jour Zustand.
       */
      set({
        profile: user,
        isUploadingImage: false,
        isOffline: false,
        error: null,
      });

      /**
       * Sauvegarder la nouvelle URL localement.
       */
      await saveProfileToStorage(user);

      /**
       * Synchroniser UserStore.
       */
      syncUserStore(user);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier votre photo de profil.",
      );

      set({
        isUploadingImage: false,
        error: message,
      });

      throw error;
    }
  },

  // ============================================================
  // REMOVE PROFILE IMAGE
  // ============================================================

  removeProfileImage: async () => {
    try {
      set({
        isUploadingImage: true,
        error: null,
      });

      /**
       * Suppression côté serveur.
       */
      const response = await api.delete<ProfileResponse>("/profile/image");

      /**
       * Le serveur renvoie le User actualisé.
       */
      const user = response.data.user;

      /**
       * Mettre à jour Zustand.
       */
      set({
        profile: user,
        isUploadingImage: false,
        isOffline: false,
        error: null,
      });

      /**
       * Mettre à jour le cache local.
       */
      await saveProfileToStorage(user);

      /**
       * Synchroniser UserStore.
       */
      syncUserStore(user);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de supprimer votre photo de profil.",
      );

      set({
        isUploadingImage: false,
        error: message,
      });

      throw error;
    }
  },

  // ============================================================
  // CLEAR ERROR
  // ============================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ============================================================
  // RESET
  // ============================================================

  reset: async () => {
    await removeProfileFromStorage();

    set({
      profile: null,
      isLoading: false,
      isRefreshing: false,
      isSaving: false,
      isUploadingImage: false,
      isOffline: false,
      error: null,
    });
  },
}));
