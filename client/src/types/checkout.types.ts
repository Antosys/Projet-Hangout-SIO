export interface CheckoutSession {
  id: string;
  status: 'complete' | 'expired' | 'open';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
}

export interface CheckoutVerifyResponse {
  success: boolean;
  session?: CheckoutSession;
  message?: string;
}
