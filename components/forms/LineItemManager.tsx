'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { addLineItemSchema, type AddLineItemFormData } from '@/lib/validation/invoiceSchema';
import type { InvoiceLineItem } from '@/types/invoice';

interface LineItemManagerProps {
  lineItems: InvoiceLineItem[];
  onAdd: (item: AddLineItemFormData) => Promise<void>;
  onRemove?: (lineItemId: string) => void;
  readOnly?: boolean;
}

export function LineItemManager({ lineItems, onAdd, onRemove, readOnly = false }: LineItemManagerProps) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [errors, setErrors] = useState<{ description?: string; quantity?: string; unitPrice?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const quantityNum = parseFloat(quantity) || 0;
      const unitPriceNum = parseFloat(unitPrice) || 0;
      const data = addLineItemSchema.parse({ description, quantity: quantityNum, unitPrice: unitPriceNum });
      setSubmitting(true);
      await onAdd(data);
      setDescription('');
      setQuantity('1');
      setUnitPrice('');
    } catch (err: any) {
      if (err.name === 'ZodError' && err.issues) {
        const formErrors: { description?: string; quantity?: string; unitPrice?: string } = {};
        err.issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            const field = issue.path[0];
            if (field === 'description') {
              formErrors.description = issue.message;
            } else if (field === 'quantity') {
              formErrors.quantity = issue.message;
            } else if (field === 'unitPrice') {
              formErrors.unitPrice = issue.message;
            }
          }
        });
        setErrors(formErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Line Items</h3>
      
      {!readOnly && (
        <form onSubmit={handleAdd} className="mb-4 p-4 border rounded">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="line-item-description-input"
              error={errors.description}
            />
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string or valid numbers
                if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setQuantity(val);
                }
              }}
              data-testid="line-item-quantity-input"
              error={errors.quantity}
            />
            <Input
              label="Unit Price"
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string or valid decimal numbers
                if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setUnitPrice(val);
                }
              }}
              placeholder="0.00"
              data-testid="line-item-unit-price-input"
              error={errors.unitPrice}
            />
          </div>
          <Button type="submit" disabled={submitting} data-testid="add-line-item-button">
            Add Line Item
          </Button>
        </form>
      )}

      {lineItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Subtotal</th>
                {!readOnly && onRemove && <th className="border border-gray-300 px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.lineItemId}>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ${item.subtotal.toFixed(2)}
                  </td>
                  {!readOnly && onRemove && (
                    <td className="border border-gray-300 px-4 py-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => onRemove(item.lineItemId)}
                        data-testid={`remove-line-item-${item.lineItemId}`}
                      >
                        Remove
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No line items added yet.</p>
      )}
    </div>
  );
}

