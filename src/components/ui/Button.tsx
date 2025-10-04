import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' // Added 'icon' variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const variantStyles = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md',
  secondary:
    'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md',
  ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:outline-none',
  icon: 'p-2 text-gray-500 hover:bg-gray-100 rounded-full', // Style for icon buttons
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  const isIcon = variant === 'icon'

  return (
    <button
      className={`${baseStyles} ${isIcon ? '' : sizeStyles[size]} ${variantStyles[variant]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin h-5 w-5 ${isIcon ? 'text-indigo-600' : 'text-white'}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  )
}
