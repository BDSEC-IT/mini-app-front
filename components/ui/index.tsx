import React from 'react';

// Design System
export const styles = {
  button: {
    primary: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium",
    secondary: "px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium",
    success: "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium",
    danger: "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium",
    tab: (active: boolean) => `px-4 py-2 text-sm font-medium transition-colors ${
      active 
        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`
  },
  input: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
  container: "bg-white dark:bg-gray-900"
};

// Reusable Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'secondary', 
  className = '', 
  children, 
  ...props 
}) => (
  <button className={`${styles.button[variant]} ${className}`} {...props}>
    {children}
  </button>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input className={`${styles.input} ${className}`} {...props} />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => (
  <select className={`${styles.input} ${className}`} {...props}>
    {children}
  </select>
);

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`${styles.card} ${className}`}>
    {children}
  </div>
);