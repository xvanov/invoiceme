import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', name, ...props }, ref) => {
    return (
      <div className="mb-5">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          name={name}
          className={`
            w-full px-4 py-3 
            border rounded-lg
            text-gray-900 
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <div 
            className="mt-2 text-sm text-red-600 font-medium animate-fade-in" 
            data-testid={name ? `customer-${name}-error` : 'customer-field-error'}
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
