import React from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'

export const Archive: React.FC = () => {
  // Placeholder for Archive (Step 9)
  return (
    <AppLayout title="Архив завершенных документов">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-500">
          Здесь будут завершенные документы УПД, фильтры по дате и контрагенту, а также отчетность. (Шаг 9)
        </p>
        <div className="mt-4 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Отчеты и Архив</p>
        </div>
      </div>
    </AppLayout>
  )
}
