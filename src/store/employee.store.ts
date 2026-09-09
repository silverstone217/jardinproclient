import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeResponse,
  EmployeesResponse,
  UpdateEmployeePayload,
} from "@/types/employee";
import { api } from "@/utils/api";

const STORAGE_KEY = "jardin-employee-storage";

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;

  isLoading: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  isOffline: boolean;
  error: string | null;

  fetchEmployees: () => Promise<void>;
  refreshEmployees: () => Promise<void>;

  getEmployee: (id: string) => Promise<Employee | null>;

  createEmployee: (data: CreateEmployeePayload) => Promise<Employee>;

  updateEmployee: (
    id: string,
    data: UpdateEmployeePayload,
  ) => Promise<Employee>;

  deleteEmployee: (id: string) => Promise<void>;

  setSelectedEmployee: (employee: Employee | null) => void;

  clearError: () => void;
  reset: () => Promise<void>;
}

// ============================================================
// CACHE
// ============================================================

const saveCache = async (employees: Employee[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error("Erreur sauvegarde cache employés:", error);
  }
};

const loadCache = async (): Promise<Employee[]> => {
  try {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Employee[];
  } catch (error) {
    console.error("Erreur lecture cache employés:", error);

    return [];
  }
};

// ============================================================
// ERROR
// ============================================================

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

// ============================================================
// STORE
// ============================================================

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  selectedEmployee: null,

  isLoading: false,
  isRefreshing: false,
  isSaving: false,
  isDeleting: false,

  isOffline: false,
  error: null,

  // ========================================================
  // FETCH EMPLOYEES
  // ========================================================

  fetchEmployees: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      // ------------------------------------------------------
      // 1. Charger immédiatement le cache
      // ------------------------------------------------------

      const cachedEmployees = await loadCache();

      if (cachedEmployees.length > 0) {
        set({
          employees: cachedEmployees,
          isOffline: true,
        });
      }

      // ------------------------------------------------------
      // 2. Synchroniser avec le serveur
      // ------------------------------------------------------

      const response = await api.get<EmployeesResponse>("/employee");

      const result = response.data;

      if (!result.success || !result.employees) {
        throw new Error(
          result.message || "Impossible de récupérer les employés.",
        );
      }

      // ------------------------------------------------------
      // 3. Mettre à jour le cache
      // ------------------------------------------------------

      await saveCache(result.employees);

      set({
        employees: result.employees,
        isLoading: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      // ------------------------------------------------------
      // Serveur inaccessible → utiliser le cache
      // ------------------------------------------------------

      const cachedEmployees = await loadCache();

      if (cachedEmployees.length > 0) {
        set({
          employees: cachedEmployees,
          isLoading: false,
          isOffline: true,
          error: null,
        });

        return;
      }

      // ------------------------------------------------------
      // Aucun cache disponible
      // ------------------------------------------------------

      const message = getErrorMessage(
        error,
        "Impossible de récupérer les employés.",
      );

      set({
        isLoading: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // REFRESH
  // ========================================================

  refreshEmployees: async () => {
    try {
      set({
        isRefreshing: true,
        error: null,
      });

      const response = await api.get<EmployeesResponse>("/employee");

      const result = response.data;

      if (!result.success || !result.employees) {
        throw new Error(
          result.message || "Impossible de synchroniser les employés.",
        );
      }

      await saveCache(result.employees);

      set({
        employees: result.employees,
        isRefreshing: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de synchroniser les employés.",
      );

      set({
        isRefreshing: false,
        isOffline: true,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // GET ONE EMPLOYEE
  // ========================================================

  getEmployee: async (id) => {
    // ------------------------------------------------------
    // Cache local
    // ------------------------------------------------------

    const localEmployee = get().employees.find(
      (employee) => employee.id === id,
    );

    try {
      // ----------------------------------------------------
      // Serveur
      // ----------------------------------------------------

      const response = await api.get<EmployeeResponse>(`/employee/${id}`);

      const result = response.data;

      if (!result.success || !result.employee) {
        throw new Error(result.message || "Employé introuvable.");
      }

      const updatedEmployee = result.employee;

      // ----------------------------------------------------
      // Mise à jour de la liste locale
      // ----------------------------------------------------

      const updatedEmployees = get().employees.map((employee) =>
        employee.id === id ? updatedEmployee : employee,
      );

      // Si l'employé n'était pas encore
      // dans le cache, on l'ajoute.
      const employeeExists = get().employees.some(
        (employee) => employee.id === id,
      );

      const finalEmployees = employeeExists
        ? updatedEmployees
        : [...get().employees, updatedEmployee];

      await saveCache(finalEmployees);

      set({
        employees: finalEmployees,
        selectedEmployee: updatedEmployee,
        isOffline: false,
        error: null,
      });

      return updatedEmployee;
    } catch (error) {
      // ----------------------------------------------------
      // Serveur indisponible → cache
      // ----------------------------------------------------

      if (localEmployee) {
        set({
          selectedEmployee: localEmployee,
          isOffline: true,
        });

        return localEmployee;
      }

      throw error;
    }
  },

  // ========================================================
  // CREATE
  // ========================================================

  createEmployee: async (data) => {
    try {
      set({
        isSaving: true,
        error: null,
      });

      // ----------------------------------------------------
      // Une création nécessite le serveur.
      // ----------------------------------------------------

      const response = await api.post<EmployeeResponse>("/employee", data);

      const result = response.data;

      if (!result.success || !result.employee) {
        throw new Error(result.message || "Impossible de créer l'employé.");
      }

      const employee = result.employee;

      // ----------------------------------------------------
      // Ajouter au cache
      // ----------------------------------------------------

      const updatedEmployees = [...get().employees, employee];

      await saveCache(updatedEmployees);

      set({
        employees: updatedEmployees,
        selectedEmployee: employee,
        isSaving: false,
        isOffline: false,
        error: null,
      });

      return employee;
    } catch (error) {
      const message = getErrorMessage(error, "Impossible de créer l'employé.");

      set({
        isSaving: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // UPDATE
  // ========================================================

  updateEmployee: async (id, data) => {
    try {
      set({
        isSaving: true,
        error: null,
      });

      // ----------------------------------------------------
      // Une modification nécessite le serveur.
      // ----------------------------------------------------

      const response = await api.patch<EmployeeResponse>(
        `/employee/${id}`,
        data,
      );

      const result = response.data;

      if (!result.success || !result.employee) {
        throw new Error(result.message || "Impossible de modifier l'employé.");
      }

      const employee = result.employee;

      // ----------------------------------------------------
      // Mise à jour du cache
      // ----------------------------------------------------

      const updatedEmployees = get().employees.map((item) =>
        item.id === id ? employee : item,
      );

      await saveCache(updatedEmployees);

      set({
        employees: updatedEmployees,
        selectedEmployee: employee,
        isSaving: false,
        isOffline: false,
        error: null,
      });

      return employee;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de modifier l'employé.",
      );

      set({
        isSaving: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // DELETE
  // ========================================================

  deleteEmployee: async (id) => {
    try {
      set({
        isDeleting: true,
        error: null,
      });

      // ----------------------------------------------------
      // Une suppression nécessite le serveur.
      // ----------------------------------------------------

      const response = await api.delete<EmployeeResponse>(`/employee/${id}`);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Impossible de supprimer l'employé.");
      }

      // ----------------------------------------------------
      // Supprimer du cache
      // ----------------------------------------------------

      const updatedEmployees = get().employees.filter(
        (employee) => employee.id !== id,
      );

      const selectedEmployee = get().selectedEmployee;

      await saveCache(updatedEmployees);

      set({
        employees: updatedEmployees,
        selectedEmployee: selectedEmployee?.id === id ? null : selectedEmployee,
        isDeleting: false,
        isOffline: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de supprimer l'employé.",
      );

      set({
        isDeleting: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // SELECTED EMPLOYEE
  // ========================================================

  setSelectedEmployee: (employee) => {
    set({
      selectedEmployee: employee,
    });
  },

  // ========================================================
  // ERROR
  // ========================================================

  clearError: () => {
    set({
      error: null,
    });
  },

  // ========================================================
  // RESET
  // ========================================================

  reset: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);

    set({
      employees: [],
      selectedEmployee: null,

      isLoading: false,
      isRefreshing: false,
      isSaving: false,
      isDeleting: false,

      isOffline: false,
      error: null,
    });
  },
}));
