export type DashboardStock = {
  totalQuantity: number;
  variantsCount: number;
};

export type DashboardRecentOrder = {
  id: string;
  createdAt: string;
};

export type DashboardOrders = {
  today: number;
  recent: DashboardRecentOrder[];
};

export type ManagerDashboard = {
  role: "MANAGER";

  stock: {
    main: DashboardStock;
  };

  employees: {
    total: number;
  };

  pointOfSales: {
    total: number;
  };

  orders: DashboardOrders;
};

export type EmployeeDashboard = {
  role: "EMPLOYEE";

  pointOfSale: {
    id: string;
    name: string;
    code: string;
  } | null;

  stock: DashboardStock;

  orders: DashboardOrders;
};

export type Dashboard = ManagerDashboard | EmployeeDashboard;

export type DashboardResponse = {
  success: boolean;
  dashboard: Dashboard;
};
