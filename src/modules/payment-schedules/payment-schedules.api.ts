import { apiClient } from "@/modules/auth/auth.api";
import type { PaymentScheduleDocument } from "@/modules/invoices/invoices.api";

export type PaymentScheduleAmountType = "percentage" | "fixed";

export type CreatePaymentScheduleStagePayload = {
  stageName: string;
  amount: number;
  amountType: PaymentScheduleAmountType;
  dueDate?: string;
};

export type CreatePaymentSchedulePayload = {
  leadId: string;
  totalAmount?: number;
  stages: CreatePaymentScheduleStagePayload[];
};

export type CreatePaymentScheduleResponse = {
  success: boolean;
  message: string;
  data: {
    schedule: PaymentScheduleDocument;
  };
};

export async function createPaymentScheduleProvider(
  payload: CreatePaymentSchedulePayload,
) {
  const response = await apiClient.post<CreatePaymentScheduleResponse>(
    "/api/payment-schedules",
    payload,
  );

  return response.data;
}

export type GetPaymentScheduleByLeadResponse = {
  success: boolean;
  message: string;
  data: {
    schedule: PaymentScheduleDocument | null;
  };
};

export async function getPaymentScheduleByLeadProvider(leadId: string) {
  const response = await apiClient.get<GetPaymentScheduleByLeadResponse>(
    `/api/payment-schedules/lead/${leadId}`,
  );

  return response.data.data;
}

export type UpdatePaymentSchedulePayload = {
  totalAmount?: number;
  stages: Array<{
    _id?: string;
    stageName: string;
    amount: number;
    amountType: PaymentScheduleAmountType;
    dueDate?: string;
  }>;
};

export async function updatePaymentScheduleProvider(
  leadId: string,
  payload: UpdatePaymentSchedulePayload,
) {
  const response = await apiClient.put<CreatePaymentScheduleResponse>(
    `/api/payment-schedules/lead/${leadId}`,
    payload,
  );
  return response.data;
}

