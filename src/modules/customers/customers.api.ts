import { apiClient } from "@/modules/auth/auth.api";

type AdminCustomerPhone = {
  number?: string;
  countryCode?: string;
};

export type AdminCustomer = {
  _id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: AdminCustomerPhone;
  isActive?: boolean;
  source?: string;
  inquiryFor?: string;
  createdAt?: string;
  isReturning?: boolean;
};

export type GetAdminCustomersData = {
  customers: AdminCustomer[];
  total: number;
  page: number;
  limit: number;
};

export type GetAdminCustomersResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomersData;
};

export type AdminCustomerProject = {
  _id: string;
  customerId: string;
  buildingType?: string;
  location?: string;
  source?: string;
  quoteValue?: number;
  lifecycleStatus?: string;
  isQuoteReady?: boolean;
  isHandedToSales?: boolean;
  isRaisedToPO?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCustomerInvoiceLineItem = {
  images?: string[];
  items?: string[];
  rate?: number;
  markup?: number;
  quantity?: number;
  tax?: number;
  total?: number;
  _id?: string;
};

export type AdminCustomerInvoice = {
  _id: string;
  leadId?: string;
  customerId?: string;
  quotationId?: string;
  createdBy?: string;
  invoiceNumber?: string;
  date?: string;
  paymentScheduleId?: string;
  daysToPay?: number;
  poNumber?: string;
  lineItems?: AdminCustomerInvoiceLineItem[];
  subtotal?: number;
  markupTotal?: number;
  discount?: number;
  depositAmount?: number;
  totalAmount?: number;
  status?: string;
  sentAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type GetAdminCustomerDetailData = {
  customer: AdminCustomer;
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  projects: AdminCustomerProject[];
  invoices: AdminCustomerInvoice[];
};

export type GetAdminCustomerDetailResponse = {
  success: boolean;
  message: string;
  data: GetAdminCustomerDetailData;
};

export async function getAdminCustomersProvider(page = 1, limit = 20) {
  const response = await apiClient.get<GetAdminCustomersResponse>(
    "/api/admin/customers",
    {
      params: { page, limit },
    },
  );

  return response.data;
}

export async function getAdminCustomerDetailProvider(customerId: string) {
  const response = await apiClient.get<GetAdminCustomerDetailResponse>(
    `/api/admin/customers/${customerId}`,
  );

  return response.data;
}

// Sales customers (public) API
export type SalesCustomerPhone = {
  number?: string;
  countryCode?: string;
};

export type SalesCustomer = {
  _id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: SalesCustomerPhone;
  isActive?: boolean;
  source?: string;
  inquiryFor?: string;
  createdAt?: string;
};

export type GetSalesCustomersData = {
  customers: SalesCustomer[];
  total: number;
  page?: number;
  limit?: number;
};

export type GetSalesCustomersResponse = {
  success: boolean;
  message: string;
  data: GetSalesCustomersData;
};

export async function getSalesCustomersProvider(page = 1, limit = 20) {
  const response = await apiClient.get<GetSalesCustomersResponse>(
    "/api/sales/customers",
    { params: { page, limit } },
  );

  return response.data;
}
