export type EmployeeRole = "EMPLOYEE";

export interface EmployeePointOfSale {
  id: string;
  name: string;
  code: string;
  isMainStore: boolean;
  isActive: boolean;
}

export interface EmployeeAssignment {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pointOfSale: EmployeePointOfSale;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  telephone: string;
  image: string | null;
  role: EmployeeRole;
  isActive: boolean;
  isBanned: boolean;
  banExpiresAt: string | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
  assignments: EmployeeAssignment[];
}

export interface EmployeeFormData {
  name: string;
  telephone: string;
  email: string;
  pointOfSaleId: string;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  telephone: string;
  email?: string;
  pointOfSaleId?: string;
  isActive?: boolean;
}

export interface UpdateEmployeePayload {
  name: string;
  telephone: string;
  email?: string;
  pointOfSaleId?: string;
  isActive?: boolean;
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  employee?: Employee;
}

export interface EmployeesResponse {
  success: boolean;
  message?: string;
  employees?: Employee[];
}
