export type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCustomerRequest = {
  name: string;
  email: string;
};



