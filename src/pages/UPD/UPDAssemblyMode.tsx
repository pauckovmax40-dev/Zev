import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { FilePlus } from 'lucide-react'

export const UPDAssemblyMode: React.FC = () => {
  const navigate = useNavigate()

  return (
    <AppLayout title="Сборка УПД (Универсальный Передаточный Документ)">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Список документов УПД
        </h2>
        <Button
          variant="primary"
          onClick={() => navigate('/upd/create')}
        >
          <FilePlus className="w-5 h-5 mr-2" />
          Создать новый УПД
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-500">
          Здесь будет список документов УПД, функционал поиска и фильтрации.
          (Шаг 6)
        </p>
        <div className="mt-4 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Список документов (UPD Documents)</p>
        </div>
      </div>
    </AppLayout>
  )
}
