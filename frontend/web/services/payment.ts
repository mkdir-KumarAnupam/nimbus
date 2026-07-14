import { api } from "@/lib/api";

export interface CreatePaymentRequest {
  reservation_id: string;
}

export interface CreatePaymentResponse {
  orderId?: string;
  OrderID?: string;
  amount?: number;
  Amount?: number;
  currency?: string;
  Currency?: string;
  key?: string;
  KeyID?: string;
}

export async function createPayment(
  body: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const { data } = await api.post<CreatePaymentResponse>(
    "/payments",
    body
  );

  return data;
}

export interface RequestRefundRequest {
  reservationId: string;
  reason: string;
}

export async function requestRefund(
  body: RequestRefundRequest
): Promise<void> {
  await api.post("/payments/refund", body);
}

export interface PaymentSummaryResponse {
  amount: number;
  currency: string;
  status: string;
  refundStatus?: string;
}

export async function getPaymentSummary(
  reservationId: string
): Promise<PaymentSummaryResponse> {
  const { data } = await api.get<PaymentSummaryResponse>(
    `/payments/reservation/${reservationId}`
  );
  return data;
}
