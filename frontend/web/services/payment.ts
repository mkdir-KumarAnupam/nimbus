import { api } from "@/lib/api";

export interface CreatePaymentRequest {
  reservationId: string;
}

export interface CreatePaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
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
