import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  const checkboxId = id || props.name || `checkbox-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          aria-describedby={`${checkboxId}-description`}
          name={props.name}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxId} className="font-medium text-gray-700">
          {label}
        </label>
      </div>
    </div>
  )
}
