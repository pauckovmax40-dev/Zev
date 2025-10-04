import React from 'react'
import { AppLayout } from '../components/Layout/AppLayout'

export const Settings: React.FC = () => {
  return (
    <AppLayout title="Настройки">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Настройки пользователя и системы</h2>
        <p className="text-gray-500">
          Здесь можно будет управлять профилем, уведомлениями и другими системными параметрами.
        </p>
      </div>
    </AppLayout>
  )
}
