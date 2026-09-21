import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { api } from "@/utils/api";

import type {
  ActiveOrder,
  AssignOrderPosPayload,
  AssignOrderPosResponse,
  CreateOrderCustomerPayload,
  CreateOrderCustomerResponse,
  GetOrderLoyaltyResponse,
  GetOrderPosResponse,
  GetOrderProductsResponse,
  OrderCartItem,
  OrderCustomer,
  OrderPaymentMethod,
  OrderPointOfSale,
  OrderProduct,
  OrderStep,
  SearchOrderCustomerResponse,
  ValidateOrderPayload,
  ValidateOrderResponse,
} from "@/types/order";

// ============================================================
// CONSTANTES
// ============================================================

const ACTIVE_ORDER_STORAGE_KEY = "jardin-active-order";

// ============================================================
// ÉTAT DU STORE
// ============================================================

interface OrderState {
  // ==========================================================
  // POS
  // ==========================================================

  pointOfSales: OrderPointOfSale[];
  selectedPointOfSale: OrderPointOfSale | null;
  isLoadingPos: boolean;
  isAssigningPos: boolean;

  // ==========================================================
  // PRODUITS
  // ==========================================================

  products: OrderProduct[];

  isLoadingProducts: boolean;

  // ==========================================================
  // PANIER
  // ==========================================================

  cart: OrderCartItem[];

  // ==========================================================
  // CLIENT
  // ==========================================================

  customer: OrderCustomer | null;
  isSearchingCustomer: boolean;
  isCreatingCustomer: boolean;

  // ==========================================================
  // FIDÉLITÉ
  // ==========================================================

  loyalty: GetOrderLoyaltyResponse | null;
  isLoadingLoyalty: boolean;
  pointsUsed: number;

  // ==========================================================
  // PAIEMENT
  // ==========================================================

  paymentMethod: OrderPaymentMethod;

  // ==========================================================
  // ÉTAPE
  // ==========================================================

  currentStep: OrderStep;

  // ==========================================================
  // PERSISTANCE
  // ==========================================================

  hasActiveOrder: boolean;
  isHydrating: boolean;

  // ==========================================================
  // VALIDATION
  // ==========================================================

  isValidating: boolean;

  // ==========================================================
  // ERREUR
  // ==========================================================

  error: string | null;

  // ==========================================================
  // POS
  // ==========================================================

  fetchPointOfSales: () => Promise<void>;
  selectPointOfSale: (pointOfSaleId: string) => void;
  assignPointOfSale: (pointOfSaleId: string) => Promise<void>;

  // ==========================================================
  // PRODUITS
  // ==========================================================

  fetchProducts: (pointOfSaleId?: string) => Promise<void>;

  // ==========================================================
  // PANIER
  // ==========================================================

  addProduct: (product: OrderProduct) => void;
  removeProduct: (variantId: string) => void;
  updateProductQuantity: (variantId: string, quantity: number) => void;

  clearCart: () => void;

  // ==========================================================
  // CLIENT
  // ==========================================================

  searchCustomer: (phone: string) => Promise<OrderCustomer | null>;
  createCustomer: (name: string, phone: string) => Promise<OrderCustomer>;
  setCustomer: (customer: OrderCustomer | null) => void;

  // ==========================================================
  // FIDÉLITÉ
  // ==========================================================

  fetchLoyalty: () => Promise<void>;
  setPointsUsed: (points: number) => void;

  // ==========================================================
  // PAIEMENT
  // ==========================================================

  setPaymentMethod: (paymentMethod: OrderPaymentMethod) => void;

  // ==========================================================
  // ÉTAPE
  // ==========================================================

  setCurrentStep: (step: OrderStep) => void;

  // ==========================================================
  // PERSISTANCE
  // ==========================================================

  persistOrder: () => Promise<void>;
  hydrateOrder: () => Promise<void>;
  clearOrder: () => Promise<void>;

  // ==========================================================
  // VALIDATION
  // ==========================================================

  validateOrder: () => Promise<ValidateOrderResponse>;

  // ==========================================================
  // ERREUR
  // ==========================================================

  clearError: () => void;
}

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      }
    ).response;

    return response?.data?.message ?? response?.data?.error ?? fallback;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (
      error as {
        message?: string;
      }
    ).message;

    if (message) {
      return message;
    }
  }

  return fallback;
}

// ============================================================
// STORE
// ============================================================

export const useOrderStore = create<OrderState>((set, get) => ({
  // ========================================================
  // POS
  // ========================================================

  pointOfSales: [],
  selectedPointOfSale: null,
  isLoadingPos: false,
  isAssigningPos: false,

  // ========================================================
  // PRODUITS
  // ========================================================

  products: [],

  isLoadingProducts: false,

  // ========================================================
  // PANIER
  // ========================================================

  cart: [],

  // ========================================================
  // CLIENT
  // ========================================================

  customer: null,
  isSearchingCustomer: false,
  isCreatingCustomer: false,

  // ========================================================
  // FIDÉLITÉ
  // ========================================================

  loyalty: null,
  isLoadingLoyalty: false,
  pointsUsed: 0,

  // ========================================================
  // PAIEMENT
  // ========================================================

  paymentMethod: "CASH",

  // ========================================================
  // ÉTAPE
  // ========================================================

  currentStep: "PRODUCTS",

  // ========================================================
  // PERSISTANCE
  // ========================================================

  hasActiveOrder: false,
  isHydrating: false,

  // ========================================================
  // VALIDATION
  // ========================================================

  isValidating: false,

  // ========================================================
  // ERREUR
  // ========================================================

  error: null,

  // ========================================================
  // POS : RÉCUPÉRER LES POS
  // ========================================================

  fetchPointOfSales: async () => {
    set({
      isLoadingPos: true,
      error: null,
    });

    try {
      const response = await api.get<GetOrderPosResponse>("/orders/pos");

      const pointOfSales = response.data.pointOfSales;

      const currentSelected = get().selectedPointOfSale;

      // ======================================================
      // POS ASSIGNÉ
      // ======================================================

      const assignedPointOfSale =
        pointOfSales.find((pos) => pos.isAssigned) ?? null;

      let selectedPointOfSale = currentSelected;

      // ======================================================
      // VÉRIFIER QUE LE POS ACTUEL EXISTE
      // ======================================================

      const currentSelectedId = selectedPointOfSale?.id;

      if (
        currentSelectedId &&
        !pointOfSales.some((pos) => pos.id === currentSelectedId)
      ) {
        selectedPointOfSale = null;
      }

      // ======================================================
      // LE POS ASSIGNÉ EST TOUJOURS PRIORITAIRE
      // ======================================================

      if (assignedPointOfSale) {
        selectedPointOfSale = assignedPointOfSale;
      }

      // IMPORTANT :
      // Pas de sélection automatique du premier POS
      // si l'utilisateur n'est pas encore assigné.

      set({
        pointOfSales,
        selectedPointOfSale,
        isLoadingPos: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de récupérer les points de vente.",
      );

      set({
        isLoadingPos: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // POS : SÉLECTIONNER POUR LA COMMANDE
  // ========================================================

  selectPointOfSale: (pointOfSaleId) => {
    const pointOfSales = get().pointOfSales;

    const pointOfSale = pointOfSales.find((pos) => pos.id === pointOfSaleId);

    if (!pointOfSale) {
      set({
        error: "Point de vente introuvable.",
      });

      return;
    }

    if (!pointOfSale.canSelect) {
      set({
        error: "Vous ne pouvez pas sélectionner ce point de vente.",
      });

      return;
    }

    set({
      selectedPointOfSale: pointOfSale,
      products: [],
      cart: [],
      error: null,
    });
  },

  // ========================================================
  // POS : ASSIGNER
  // ========================================================

  assignPointOfSale: async (pointOfSaleId) => {
    set({
      isAssigningPos: true,
      error: null,
    });

    try {
      const payload: AssignOrderPosPayload = {
        pointOfSaleId,
      };

      const response = await api.post<AssignOrderPosResponse>(
        "/orders/pos",
        payload,
      );

      const responsePointOfSale = response.data.pointOfSale;

      if (responsePointOfSale) {
        const selectedPointOfSale: OrderPointOfSale = {
          ...responsePointOfSale,
          isAssigned: true,
          canSelect: true,
        };

        set({
          selectedPointOfSale,
          isAssigningPos: false,
        });

        return;
      }

      const pointOfSale = get().pointOfSales.find(
        (pos) => pos.id === pointOfSaleId,
      );

      set({
        selectedPointOfSale: pointOfSale ?? null,
        isAssigningPos: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible d'assigner ce point de vente.",
      );

      set({
        isAssigningPos: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // PRODUITS : RÉCUPÉRER LES PRODUITS DU POS
  // ========================================================

  fetchProducts: async (pointOfSaleId) => {
    const selected = get().selectedPointOfSale;

    const id = pointOfSaleId ?? selected?.id;

    if (!id) {
      set({
        error: "Veuillez sélectionner un point de vente.",
      });

      return;
    }

    set({
      isLoadingProducts: true,
      error: null,
    });

    try {
      const response = await api.get<GetOrderProductsResponse>(
        "/orders/products",
        {
          params: {
            pointOfSaleId: id,
          },
        },
      );

      const products = response.data.products;

      const responsePos = response.data.pointOfSale;

      const currentPos = get().selectedPointOfSale;

      // Le POS correspond déjà au POS sélectionné
      if (currentPos?.id === responsePos.id) {
        set({
          products,
          isLoadingProducts: false,
        });

        return;
      }

      // Chercher le POS dans la liste connue
      const matchingPos = get().pointOfSales.find(
        (pos) => pos.id === responsePos.id,
      );

      if (!matchingPos) {
        set({
          products: [],
          isLoadingProducts: false,
          error: "Le point de vente associé aux produits est introuvable.",
        });

        return;
      }

      set({
        products,
        selectedPointOfSale: matchingPos,
        isLoadingProducts: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de récupérer les produits disponibles.",
      );

      set({
        isLoadingProducts: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // PANIER : AJOUTER
  // ========================================================

  addProduct: (product) => {
    const cart = get().cart;

    const existing = cart.find((item) => item.variantId === product.variantId);

    if (existing) {
      if (existing.quantity >= product.quantity) {
        set({
          error: "La quantité disponible pour ce produit est atteinte.",
        });

        return;
      }

      set({
        cart: cart.map((item) =>
          item.variantId === product.variantId
            ? {
                ...item,
                quantity: item.quantity + 1,
                availableQuantity: product.quantity,
              }
            : item,
        ),
        error: null,
      });

      return;
    }

    if (product.quantity <= 0) {
      set({
        error: "Ce produit n'est plus disponible.",
      });

      return;
    }

    const item: OrderCartItem = {
      variantId: product.variantId,
      productId: product.productId,
      name: product.name,
      image: product.image,
      sku: product.sku,
      unitPrice: product.price,
      quantity: 1,
      availableQuantity: product.quantity,
      packaging: product.packaging,
    };

    set({
      cart: [...cart, item],
      error: null,
    });
  },

  // ========================================================
  // PANIER : SUPPRIMER
  // ========================================================

  removeProduct: (variantId) => {
    set({
      cart: get().cart.filter((item) => item.variantId !== variantId),
      error: null,
    });
  },

  // ========================================================
  // PANIER : QUANTITÉ
  // ========================================================

  updateProductQuantity: (variantId, quantity) => {
    const cart = get().cart;

    const item = cart.find((cartItem) => cartItem.variantId === variantId);

    if (!item) {
      return;
    }

    if (quantity <= 0) {
      get().removeProduct(variantId);

      return;
    }

    if (quantity > item.availableQuantity) {
      set({
        error: `La quantité maximale disponible est de ${item.availableQuantity}.`,
      });

      return;
    }

    set({
      cart: cart.map((cartItem) =>
        cartItem.variantId === variantId
          ? {
              ...cartItem,
              quantity,
            }
          : cartItem,
      ),
      error: null,
    });
  },

  // ========================================================
  // PANIER : VIDER
  // ========================================================

  clearCart: () => {
    set({
      cart: [],
    });
  },

  // ========================================================
  // CLIENT : RECHERCHER
  // ========================================================

  searchCustomer: async (phone) => {
    set({
      isSearchingCustomer: true,
      error: null,
    });

    try {
      const response = await api.get<SearchOrderCustomerResponse>(
        "/orders/customer",
        {
          params: {
            phone,
          },
        },
      );

      const customer = response.data.customer;

      set({
        customer,
        isSearchingCustomer: false,
      });

      return customer;
    } catch (error) {
      const status = (
        error as {
          response?: {
            status?: number;
          };
        }
      )?.response?.status;

      // Le client n'existe pas :
      // c'est un état métier normal.
      if (status === 404) {
        set({
          customer: null,
          isSearchingCustomer: false,
          error: null,
        });

        return null;
      }

      const message = getErrorMessage(
        error,
        "Impossible de rechercher le client.",
      );

      set({
        isSearchingCustomer: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // CLIENT : CRÉER
  // ========================================================

  createCustomer: async (name, phone) => {
    set({
      isCreatingCustomer: true,
      error: null,
    });

    try {
      const payload: CreateOrderCustomerPayload = {
        name,
        phone,
      };

      const response = await api.post<CreateOrderCustomerResponse>(
        "/orders/customer",
        payload,
      );

      const customer = response.data.customer;

      set({
        customer,
        isCreatingCustomer: false,
      });

      return customer;
    } catch (error) {
      const message = getErrorMessage(error, "Impossible de créer le client.");

      set({
        isCreatingCustomer: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // CLIENT : SET
  // ========================================================

  setCustomer: (customer) => {
    set({
      customer,
      error: null,
    });
  },

  // ========================================================
  // FIDÉLITÉ
  // ========================================================

  fetchLoyalty: async () => {
    const { selectedPointOfSale, customer, cart } = get();

    if (!selectedPointOfSale) {
      set({
        error: "Veuillez sélectionner un point de vente.",
      });
      throw new Error("Point de vente manquant.");
    }

    if (!customer) {
      set({
        error: "Veuillez sélectionner un client.",
      });
      throw new Error("Client manquant.");
    }

    if (cart.length === 0) {
      set({
        error: "Le panier est vide.",
      });
      throw new Error("Panier vide.");
    }

    set({
      isLoadingLoyalty: true,
      error: null,
    });

    try {
      const response = await api.get<GetOrderLoyaltyResponse>(
        "/orders/loyalty",
        {
          params: {
            pointOfSaleId: selectedPointOfSale.id,
            customerId: customer.id,

            // IMPORTANT : envoyer un JSON stringifié
            items: JSON.stringify(
              cart.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            ),
          },
        },
      );

      const loyalty = response.data;

      const currentPoints = loyalty.customer.currentPoints;

      const maxPointsUsable = loyalty.redemption.maxPointsUsable;

      const currentPointsUsed = get().pointsUsed;

      const safePointsUsed = Math.min(
        Math.max(0, currentPointsUsed),
        Math.min(currentPoints, maxPointsUsable),
      );

      set({
        loyalty,
        pointsUsed: safePointsUsed,
        isLoadingLoyalty: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de récupérer les informations de fidélité.",
      );

      set({
        isLoadingLoyalty: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // FIDÉLITÉ : POINTS UTILISÉS
  // ========================================================

  setPointsUsed: (points) => {
    const loyalty = get().loyalty;

    if (!loyalty) {
      set({
        pointsUsed: 0,
      });

      return;
    }

    const max = Math.min(
      loyalty.customer.currentPoints,
      loyalty.redemption.maxPointsUsable,
    );

    const safePoints = Math.min(Math.max(0, points), max);

    set({
      pointsUsed: Math.floor(safePoints),
      error: null,
    });
  },

  // ========================================================
  // PAIEMENT
  // ========================================================

  setPaymentMethod: (paymentMethod) => {
    set({
      paymentMethod,
      error: null,
    });
  },

  // ========================================================
  // ÉTAPE
  // ========================================================

  setCurrentStep: (currentStep) => {
    set({
      currentStep,
    });
  },

  // ========================================================
  // PERSISTENCE
  // ========================================================

  persistOrder: async () => {
    const {
      selectedPointOfSale,
      cart,
      customer,
      loyalty,
      pointsUsed,
      paymentMethod,
      currentStep,
    } = get();

    // Pas de commande sans POS.
    if (!selectedPointOfSale) {
      return;
    }

    // Pas de commande sans produit.
    if (cart.length === 0) {
      return;
    }

    const order: ActiveOrder = {
      version: 1,
      pointOfSaleId: selectedPointOfSale.id,
      items: cart,
      customer,
      loyalty,
      pointsUsed,
      paymentMethod,
      currentStep,
    };

    try {
      await AsyncStorage.setItem(
        ACTIVE_ORDER_STORAGE_KEY,
        JSON.stringify(order),
      );

      set({
        hasActiveOrder: true,
      });
    } catch (error) {
      console.error("Erreur sauvegarde commande locale :", error);

      throw error;
    }
  },

  // ========================================================
  // HYDRATATION
  // ========================================================

  hydrateOrder: async () => {
    set({
      isHydrating: true,
    });

    try {
      const raw = await AsyncStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);

      // ======================================================
      // AUCUNE COMMANDE LOCALE
      // ======================================================

      if (!raw) {
        set({
          cart: [],
          customer: null,
          loyalty: null,
          pointsUsed: 0,
          paymentMethod: "CASH",
          currentStep: "PRODUCTS",
          hasActiveOrder: false,
          isHydrating: false,
          error: null,
        });

        return;
      }

      // ======================================================
      // PARSE
      // ======================================================

      const parsed: unknown = JSON.parse(raw);

      if (!parsed || typeof parsed !== "object") {
        await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);

        set({
          cart: [],
          customer: null,
          loyalty: null,
          pointsUsed: 0,
          paymentMethod: "CASH",
          currentStep: "PRODUCTS",
          hasActiveOrder: false,
          isHydrating: false,
          error: null,
        });

        return;
      }

      const order = parsed as ActiveOrder;

      // ======================================================
      // VALIDATION DU CACHE
      // ======================================================

      if (
        order.version !== 1 ||
        typeof order.pointOfSaleId !== "string" ||
        !Array.isArray(order.items) ||
        order.items.length === 0
      ) {
        await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);

        set({
          cart: [],
          customer: null,
          loyalty: null,
          pointsUsed: 0,
          paymentMethod: "CASH",
          currentStep: "PRODUCTS",
          hasActiveOrder: false,
          isHydrating: false,
          error: null,
        });

        return;
      }

      // ======================================================
      // RESTAURATION DU POS DU BROUILLON
      // ======================================================

      const pointOfSales = get().pointOfSales;

      const cachedPointOfSale =
        pointOfSales.find((pos) => pos.id === order.pointOfSaleId) ?? null;

      // ======================================================
      // POS DU BROUILLON INTROUVABLE
      // ======================================================

      if (!cachedPointOfSale) {
        await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);

        // IMPORTANT :
        //
        // On ne supprime PAS le POS actuellement
        // sélectionné/assigné.
        //
        // On supprime uniquement le brouillon invalide.

        set({
          cart: [],
          customer: null,
          loyalty: null,
          pointsUsed: 0,
          paymentMethod: "CASH",
          currentStep: "PRODUCTS",
          hasActiveOrder: false,
          isHydrating: false,
          error: null,
        });

        return;
      }

      // ======================================================
      // RESTAURATION DE LA COMMANDE
      // ======================================================

      set({
        selectedPointOfSale: cachedPointOfSale,

        cart: order.items,

        customer: order.customer ?? null,

        loyalty: order.loyalty ?? null,

        pointsUsed: order.pointsUsed ?? 0,

        paymentMethod: order.paymentMethod ?? "CASH",

        currentStep: order.currentStep ?? "PRODUCTS",

        hasActiveOrder: true,

        isHydrating: false,

        error: null,
      });
    } catch (error) {
      console.error("Erreur restauration commande locale :", error);

      // ======================================================
      // CACHE CORROMPU
      // ======================================================

      try {
        await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
      } catch (storageError) {
        console.error("Erreur suppression cache corrompu :", storageError);
      }

      // IMPORTANT :
      //
      // Ne pas toucher à :
      // - selectedPointOfSale
      // - products
      //
      // Le POS et le catalogue sont indépendants
      // du cache de commande.

      set({
        cart: [],
        customer: null,
        loyalty: null,
        pointsUsed: 0,
        paymentMethod: "CASH",
        currentStep: "PRODUCTS",
        hasActiveOrder: false,
        isHydrating: false,
        error: null,
      });
    }
  },

  // ========================================================
  // SUPPRIMER LA COMMANDE LOCALE
  // ========================================================

  clearOrder: async () => {
    await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);

    set({
      selectedPointOfSale: null,
      products: [],
      cart: [],
      customer: null,
      loyalty: null,
      pointsUsed: 0,
      paymentMethod: "CASH",
      currentStep: "PRODUCTS",
      hasActiveOrder: false,
      isValidating: false,

      error: null,
    });
  },

  // ========================================================
  // VALIDATION FINALE
  // ========================================================

  validateOrder: async () => {
    const { selectedPointOfSale, cart, customer, pointsUsed, paymentMethod } =
      get();

    // ============================================================
    // VALIDATION LOCALE
    // ============================================================

    if (!selectedPointOfSale) {
      const message = "Aucun point de vente sélectionné.";

      set({
        error: message,
      });

      throw new Error(message);
    }

    if (cart.length === 0) {
      const message = "Votre panier est vide.";

      set({
        error: message,
      });

      throw new Error(message);
    }

    set({
      isValidating: true,
      error: null,
    });

    try {
      // ==========================================================
      // PAYLOAD
      // ==========================================================

      const payload: ValidateOrderPayload = {
        pointOfSaleId: selectedPointOfSale.id,

        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),

        customer: customer
          ? {
              id: customer.id,
              name: customer.name ?? undefined,
              phone: customer.phone,
            }
          : undefined,

        pointsUsed,

        paymentMethod,
      };

      // ==========================================================
      // VALIDATION SERVEUR
      // ==========================================================

      const response = await api.post<ValidateOrderResponse>(
        "/orders/validate",
        payload,
      );

      const result = response.data;

      // ==========================================================
      // COMMANDE VALIDÉE
      // ==========================================================

      /*
       * IMPORTANT :
       *
       * À partir de maintenant, la commande locale
       * n'existe plus.
       *
       * Le serveur possède désormais la vente
       * et la facture.
       */

      try {
        await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
      } catch (storageError) {
        /*
         * La validation serveur a déjà réussi.
         *
         * Une erreur AsyncStorage ne doit donc PAS
         * faire croire à l'utilisateur que la vente
         * a échoué.
         */
        console.error(
          "Erreur suppression commande locale après validation :",
          storageError,
        );
      }

      // ==========================================================
      // RESET COMPLET DU STORE
      // ==========================================================

      set({
        products: [],
        cart: [],
        customer: null,
        loyalty: null,
        pointsUsed: 0,
        paymentMethod: "CASH",

        /*
         * IMPORTANT :
         * on quitte PREVIEW.
         */
        currentStep: "PRODUCTS",

        /*
         * IMPORTANT :
         * il n'existe plus de commande locale
         * à reprendre.
         */
        hasActiveOrder: false,

        isValidating: false,
        error: null,
      });

      // ==========================================================
      // RETOUR DE LA FACTURE
      // ==========================================================

      return result;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Impossible de valider la commande.",
      );

      set({
        isValidating: false,
        error: message,
      });

      throw error;
    }
  },

  // ========================================================
  // ERREUR
  // ========================================================

  clearError: () => {
    set({
      error: null,
    });
  },
}));
