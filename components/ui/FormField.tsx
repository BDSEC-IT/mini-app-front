import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const FormField = ({
  name,
  label,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  children,
  className = '',
}: FormFieldProps) => {
  const { register, formState: { errors } } = useFormContext();
  const errorMessage = errors[name]?.message as string | undefined;
  
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {children || (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errorMessage
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
          } ${
            disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'
          } text-gray-900 dark:text-white`}
        />
      )}
      
      {errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormField; 