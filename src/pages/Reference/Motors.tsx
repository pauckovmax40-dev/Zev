import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Plus, Edit, Trash2, Search, Loader2, Gauge, Upload } from 'lucide-react'
import { Motor } from '../../types/database'
import { fetchMotors, deleteMotor } from '../../services/motorService'
import { Modal } from '../../components/ui/Modal'
import { MotorForm } from '../../components/Reference/MotorForm'
import { MotorCSVImportButton } from '../../components/Reference/MotorCSVImportButton'

export const Motors: React.FC = () => {
  const [motors, setMotors] = useState<Motor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingMotor, setEditingMotor] = useState<Motor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadMotors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMotors()
      setMotors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMotors()
  }, [loadMotors])

  const handleAdd = () => {
    setEditingMotor(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (motor: Motor) => {
    setEditingMotor(motor)
    setIsFormModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить двигатель "${name}"?`)) {
      try {
        await deleteMotor(id)
        setMotors((prev) => prev.filter((m) => m.id !== id))
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Ошибка удаления.')
      }
    }
  }

  const handleSave = (savedMotor: Motor) => {
    if (editingMotor) {
      setMotors((prev) =>
        prev.map((m) => (m.id === savedMotor.id ? savedMotor : m)),
      )
    } else {
      setMotors((prev) => [savedMotor, ...prev])
    }
    setIsFormModalOpen(false)
    setEditingMotor(null)
  }

  const handleImportComplete = (successCount: number) => {
    if (successCount > 0) {
      // Keep the modal open to show the success message, but reload data in the background
      loadMotors()
    }
  }

  const filteredMotors = motors.filter((motor) =>
    motor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motor.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) || // Updated to use manufacturer
    motor.power_kw?.toString().includes(searchTerm)
  )

  const formatNumber = (num: number | null | undefined, unit: string = '') => {
    if (num === null || num === undefined) return '—'
    return `${num.toLocaleString('ru-RU')} ${unit}`
  }

  return (
    <AppLayout
      title="Справочник Двигателей"
      breadcrumbs={[
        { label: 'Справочники', path: '/app/reference/motors' },
        { label: 'Двигатели', path: '/app/reference/motors' },
      ]}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию или бренду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Импорт
            </Button>
            <Button variant="primary" onClick={handleAdd}>
                <Plus className="w-5 h-5 mr-2" />
                Добавить Двигатель
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-10 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-600">Загрузка данных...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-sm text-red-700 bg-red-100">{error}</div>
        )}

        {!loading && !error && filteredMotors.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            <Gauge className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold">Нет записей о двигателях</p>
            <p className="text-sm">Нажмите "Добавить Двигатель", чтобы начать.</p>
          </div>
        )}

        {!loading && filteredMotors.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Название / Модель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Производитель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Мощность (кВт)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Обороты (об/мин)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Цена (₽)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMotors.map((motor) => (
                <tr key={motor.id} className="hover:bg-gray-50 transition duration-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {motor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {motor.manufacturer || '—'} {/* Updated to use manufacturer */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(motor.power_kw, 'кВт')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(motor.rpm, 'об/мин')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(motor.price_per_unit, '₽')} {/* Updated to use price_per_unit */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(motor)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(motor.id, motor.name)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingMotor ? 'Редактировать Двигатель' : 'Добавить Новый Двигатель'}
        size="md"
      >
        <MotorForm
          motor={editingMotor}
          onSave={handleSave}
          onClose={() => setIsFormModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Импорт Двигателей из CSV"
        size="lg"
      >
        <MotorCSVImportButton onImportComplete={handleImportComplete} />
      </Modal>
    </AppLayout>
  )
}
