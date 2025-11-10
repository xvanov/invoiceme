export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  createdAt?: string;
};

export type RecordPaymentRequest = {
  invoiceId: string;
  amount: number;
  paymentDate: string;
};


