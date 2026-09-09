export type UserRole = "MANAGER" | "EMPLOYEE";

export type SettingsSection =
  | "account"
  | "business"
  | "catalog"
  | "inventory"
  | "customers"
  | "system";

export type SettingsLink = {
  label: string;
  value: string;
  description?: string;
  icon: string;
  section: SettingsSection;
  roles: UserRole[];
};

export const LINKS_SETTINGS: SettingsLink[] = [
  // ─────────────────────────────────────
  // COMPTE
  // ─────────────────────────────────────
  {
    label: "Mon compte",
    value: "/settings/profile",
    description: "Gérer vos informations personnelles",
    icon: "user",
    section: "account",
    roles: ["MANAGER", "EMPLOYEE"],
  },

  {
    label: "Sécurité",
    value: "/settings/security",
    description: "Modifier votre mot de passe et sécuriser votre compte",
    icon: "lock",
    section: "account",
    roles: ["MANAGER", "EMPLOYEE"],
  },

  // ─────────────────────────────────────
  // BOUTIQUE & ORGANISATION
  // ─────────────────────────────────────
  {
    label: "Boutique",
    value: "/settings/shop",
    description: "Gérer les informations et l'identité de votre boutique",
    icon: "shopping-bag",
    section: "business",
    roles: ["MANAGER"],
  },

  {
    label: "Points de vente",
    value: "/settings/point-of-sale",
    description: "Gérer les points de vente et leurs affectations",
    icon: "map-pin",
    section: "business",
    roles: ["MANAGER"],
  },

  {
    label: "Personnel",
    value: "/settings/employees",
    description: "Gérer les employés et leurs affectations",
    icon: "users",
    section: "business",
    roles: ["MANAGER"],
  },

  // ─────────────────────────────────────
  // PRODUITS
  // ─────────────────────────────────────
  {
    label: "Produits",
    value: "/settings/products",
    description: "Gérer les jus, saveurs, formats et prix",
    icon: "coffee",
    section: "catalog",
    roles: ["MANAGER"],
  },

  {
    label: "Emballages",
    value: "/settings/packaging",
    description: "Gérer les bouteilles et autres emballages",
    icon: "box",
    section: "catalog",
    roles: ["MANAGER"],
  },

  // ─────────────────────────────────────
  // STOCK & PRODUCTION
  // ─────────────────────────────────────
  {
    label: "Matières premières",
    value: "/settings/raw-materials",
    description: "Gérer les fruits, ingrédients et autres matières premières",
    icon: "package",
    section: "inventory",
    roles: ["MANAGER"],
  },

  {
    label: "Production",
    value: "/settings/production",
    description: "Planifier et enregistrer les productions de jus",
    icon: "activity",
    section: "inventory",
    roles: ["MANAGER"],
  },

  {
    label: "Stock",
    value: "/settings/stock",
    description: "Consulter les stocks et suivre les mouvements",
    icon: "archive",
    section: "inventory",
    roles: ["MANAGER"],
  },

  {
    label: "Distribution",
    value: "/settings/distribution",
    description: "Gérer l'envoi des produits vers les points de vente",
    icon: "truck",
    section: "inventory",
    roles: ["MANAGER"],
  },

  {
    label: "Pertes",
    value: "/settings/losses",
    description: "Enregistrer et suivre les pertes de produits et de matières",
    icon: "alert-triangle",
    section: "inventory",
    roles: ["MANAGER"],
  },

  // ─────────────────────────────────────
  // CLIENTS & FIDÉLITÉ
  // ─────────────────────────────────────
  {
    label: "Clients",
    value: "/settings/customers",
    description: "Gérer les clients et consulter leur historique",
    icon: "users",
    section: "customers",
    roles: ["MANAGER", "EMPLOYEE"],
  },

  {
    label: "Fidélité",
    value: "/settings/loyalty",
    description: "Configurer le programme de fidélité et les points",
    icon: "star",
    section: "customers",
    roles: ["MANAGER"],
  },

  // ─────────────────────────────────────
  // APPLICATION
  // ─────────────────────────────────────
  {
    label: "Notifications",
    value: "/settings/notifications",
    description: "Gérer les notifications de l'application",
    icon: "bell",
    section: "system",
    roles: ["MANAGER", "EMPLOYEE"],
  },

  {
    label: "Préférences",
    value: "/settings/preferences",
    description: "Personnaliser le fonctionnement de l'application",
    icon: "sliders",
    section: "system",
    roles: ["MANAGER", "EMPLOYEE"],
  },
];

export const SECTION_CONFIG: Record<
  SettingsSection,
  {
    title: string;
    description: string;
  }
> = {
  account: {
    title: "Mon compte",
    description: "Vos informations personnelles et la sécurité",
  },

  business: {
    title: "Boutique & équipe",
    description: "Gérez votre boutique, vos points de vente et votre équipe",
  },

  catalog: {
    title: "Catalogue",
    description: "Gérez vos produits, formats, prix et emballages",
  },

  inventory: {
    title: "Stock & production",
    description:
      "Gérez les matières premières, la production et la distribution",
  },

  customers: {
    title: "Clients & fidélité",
    description: "Gérez vos clients et votre programme de fidélité",
  },

  system: {
    title: "Application",
    description: "Configurez les notifications et les préférences",
  },
};

export const SECTION_ORDER: SettingsSection[] = [
  "account",
  "business",
  "catalog",
  "inventory",
  "customers",
  "system",
];
