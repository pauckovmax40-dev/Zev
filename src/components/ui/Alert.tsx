import React from 'react'
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info } from 'lucide-react'

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', children, className = '' }) => {
  const Icon = iconMap[variant]
  const colors = colorMap[variant]

  return (
    <div
      className={`p-4 border-l-4 rounded-lg ${colors} flex items-start space-x-3 ${className}`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm font-medium">{children}</div>
    </div>
  )
}
