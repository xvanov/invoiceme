'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { customerSchema, type CustomerFormData } from '@/lib/validation/customerSchema';
import type { Customer } from '@/types/customer';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
  onCancel?: () => void;
}

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate with Zod first - trim whitespace and check for empty
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    
    // Check for empty values before Zod validation for better error messages
    if (!trimmedName) {
      setErrors({ name: 'Name is required' });
      return;
    }
    if (!trimmedEmail) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    // Validate email format with Zod
    try {
      customerSchema.parse({ name: trimmedName, email: trimmedEmail });
    } catch (validationErr: any) {
      // Handle Zod validation errors
      if (validationErr.name === 'ZodError' && validationErr.issues) {
        const formErrors: { name?: string; email?: string } = {};
        validationErr.issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            const field = issue.path[0];
            if (field === 'name') {
              formErrors.name = issue.message;
            } else if (field === 'email') {
              formErrors.email = issue.message;
            }
          }
        });
        setErrors(formErrors);
        return; // Don't submit if validation fails
      }
      // If it's not a ZodError, re-throw
      throw validationErr;
    }

    // If validation passes, submit the form
    try {
      setSubmitting(true);
      await onSubmit({ name: trimmedName, email: trimmedEmail });
    } catch (err: any) {
      // Handle backend validation errors
      if (err.response?.data?.validationErrors) {
        const formErrors: { name?: string; email?: string } = {};
        err.response.data.validationErrors.forEach((error: any) => {
          if (error.field === 'name') {
            formErrors.name = error.message;
          } else if (error.field === 'email') {
            formErrors.email = error.message;
          }
        });
        setErrors(formErrors);
      } else if (err.response?.status === 409) {
        // Handle conflict (duplicate email)
        setErrors({ email: err.response?.data?.message || 'Email already exists' });
      } else {
        // Handle other errors
        setErrors({ email: err.response?.data?.message || 'An error occurred' });
      }
      // Don't re-throw - we've handled the error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        label="Name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="customer-name-input"
        error={errors.name}
      />
      <Input
        label="Email"
        name="email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="customer-email-input"
        error={errors.email}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} data-testid="save-customer-button">
          Save
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

