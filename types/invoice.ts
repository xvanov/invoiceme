export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

export type InvoiceLineItem = {
  lineItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Invoice = {
  id: string;
  customerId: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  balance: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInvoiceRequest = {
  customerId: string;
};

export type AddLineItemRequest = {
  description: string;
  quantity: number;
  unitPrice: number;
};


