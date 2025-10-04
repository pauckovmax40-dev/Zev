import React from 'react'
import { Subdivision } from '../../types/database'
import { Button } from '../ui' // FIXED: Changed to lowercase 'ui'
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface SubdivisionListProps {
  subdivisions: Subdivision[]
  onEdit: (subdivision: Subdivision) => void
  onDelete: (id: string) => void
  loading: boolean
}

export const SubdivisionList: React.FC<SubdivisionListProps> = ({ subdivisions, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка подразделений...</div>
  }

  if (subdivisions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <p className="text-lg font-medium text-gray-600">Нет зарегистрированных подразделений.</p>
        <p className="text-sm text-gray-500 mt-1">Нажмите "Добавить подразделение", чтобы начать.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Код
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Описание
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Активно
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subdivisions.map((subdivision) => (
            <tr key={subdivision.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {subdivision.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subdivision.code || '—'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {subdivision.description || 'Нет описания'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {subdivision.is_active ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => onEdit(subdivision)}
                  title="Редактировать"
                >
                  <Edit className="w-4 h-4 text-indigo-600 hover:text-indigo-900" />
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => onDelete(subdivision.id)}
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-900" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
