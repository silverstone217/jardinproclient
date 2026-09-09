import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

import { ENDPOINT_URL } from "./env.variables";

export const api = axios.create({
  baseURL: ENDPOINT_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const storage = await AsyncStorage.getItem("jardin-user-storage");

    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        const token = parsed?.state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignore invalid storage
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    const requestUrl = error.config?.url ?? "";

    /**
     * Le 401 du login est une erreur métier normale :
     * mauvais numéro ou mauvais mot de passe.
     *
     * On ne doit surtout pas rediriger vers /auth ici.
     */
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      console.warn("Session expirée ou token invalide.");

      await AsyncStorage.removeItem("jardin-user-storage");

      router.replace("/auth");
    }

    return Promise.reject(error);
  },
);

export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get("/health");

    return response.status === 200 && response.data?.status === "ok";
  } catch (error) {
    console.error("Server connection error:", error);

    return false;
  }
};
