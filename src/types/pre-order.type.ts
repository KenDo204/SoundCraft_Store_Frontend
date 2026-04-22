export interface PreOrderPayload {
  product_id: number;
  customer_note?: string;
}

export interface PreOrderResponse {
  id: number;
  product_id: number;
  user_id: number;
  status: string;
  customer_note?: string;
  createdAt: string;
}
