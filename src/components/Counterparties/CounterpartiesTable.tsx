import React from 'react'
import { Counterparty } from '../../services/counterpartyService'
import { Loader2, AlertCircle, MoreHorizontal } from 'lucide-react'

interface CounterpartiesTableProps {
  counterparties: Counterparty[]
  loading: boolean
  error: string | null
  onSelect?: (counterparty: Counterparty) => void
}

export const CounterpartiesTable: React.FC<CounterpartiesTableProps> = ({
  counterparties,
  loading,
  error,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Загрузка данных...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50"
        role="alert"
      >
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        <div>
          <span className="font-medium">Ошибка загрузки!</span> {error}
        </div>
      </div>
    )
  }

  if (counterparties.length === 0) {
    return (
      <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">Контрагенты не найдены</h3>
        <p className="text-sm text-gray-500 mt-1">
          Попробуйте изменить условия поиска или добавить новых контрагентов.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Наименование
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ИНН / КПП
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Контакты
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Статус
            </th>
            {!onSelect && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Действия</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {counterparties.map(cp => (
            <tr
              key={cp.id}
              className={`transition-colors ${
                onSelect
                  ? 'cursor-pointer hover:bg-indigo-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect && onSelect(cp)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{cp.name}</div>
                <div className="text-xs text-gray-500 truncate max-w-xs">
                  {cp.address || 'Адрес не указан'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>ИНН: {cp.inn || '–'}</div>
                <div>КПП: {cp.kpp || '–'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium text-gray-800">
                  {cp.contact_person || ''}
                </div>
                <div className="text-xs">{cp.phone || ''}</div>
                <div className="text-xs">{cp.email || ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {cp.is_active ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Активен
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Неактивен
                  </span>
                )}
              </td>
              {!onSelect && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-indigo-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
