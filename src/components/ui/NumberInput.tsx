import React from 'react'

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: string
  id: string
  error?: string
  value: number | null
  onChange: (value: number | null) => void
  step?: number
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  error,
  value,
  onChange,
  step = 1,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    if (rawValue === '') {
      onChange(null)
    } else {
      // Use parseFloat for numeric and integer types
      const numericValue = parseFloat(rawValue)
      if (!isNaN(numericValue)) {
        onChange(numericValue)
      } else {
        // If input is invalid (e.g., just a dot), keep the current value or set to null
        onChange(null)
      }
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        {...props}
        value={value === null ? '' : value}
        onChange={handleChange}
        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
