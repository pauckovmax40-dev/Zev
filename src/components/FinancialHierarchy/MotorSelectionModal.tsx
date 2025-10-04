import React, { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Motor } from '../../types/database'
import { HierarchicalItem } from '../../types/financialHierarchy'
import { fetchMotors } from '../../services/motorService'
import { Search, Loader2, Zap } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatCurrency } from './shared'

interface MotorSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onMotorSelect: (newItemData: { name: string; unitPrice: number }) => void
  currentItem: HierarchicalItem | null
}

const MotorCard: React.FC<{ motor: Motor; onSelect: () => void, isSelected: boolean }> = ({ motor, onSelect, isSelected }) => {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-lg p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800 text-sm pr-4">{motor.name}</h3>
        <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm text-indigo-600">{formatCurrency(motor.price_per_unit)}</p>
            <p className="text-xs text-gray-500">за шт.</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500 gap-4 flex-wrap">
        <span className="flex items-center gap-1"><Zap size={12} /> {motor.power_kw || '0'} кВт</span>
        <span>{motor.rpm || '0'} об/мин</span>
        {motor.manufacturer && <span>{motor.manufacturer}</span>}
      </div>
    </div>
  )
}


export const MotorSelectionModal: React.FC<MotorSelectionModalProps> = ({
  isOpen,
  onClose,
  onMotorSelect,
  currentItem,
}) => {
  const [motors, setMotors] = useState<Motor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setError(null)
      setSelectedMotor(null)
      setSearchTerm('')
      fetchMotors()
        .then(setMotors)
        .catch((err) => setError(err.message || 'Не удалось загрузить двигатели.'))
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  const filteredMotors = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return motors
    return motors.filter(
      (motor) =>
        motor.name.toLowerCase().includes(term) ||
        motor.manufacturer?.toLowerCase().includes(term) ||
        motor.power_kw?.toString().includes(term) ||
        motor.rpm?.toString().includes(term),
    )
  }, [motors, searchTerm])

  const handleSelect = () => {
    if (selectedMotor) {
      onMotorSelect({
        name: selectedMotor.name,
        unitPrice: selectedMotor.price_per_unit,
      })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Замена двигателя" size="2xl">
      <div className="flex flex-col h-[70vh]">
        {currentItem && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
            <p className="font-semibold">Текущий элемент:</p>
            <p>{currentItem.itemName}</p>
            <p className="text-xs">
              Количество: {currentItem.quantity} | Сумма:{' '}
              {formatCurrency(currentItem.unitPrice * currentItem.quantity)}
            </p>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию, мощности, оборотам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-3">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && filteredMotors.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              Двигатели не найдены.
            </div>
          )}
          {!loading &&
            filteredMotors.map((motor) => (
              <MotorCard 
                key={motor.id} 
                motor={motor} 
                onSelect={() => setSelectedMotor(motor)}
                isSelected={selectedMotor?.id === motor.id}
              />
            ))}
        </div>

        <div className="flex justify-end items-center pt-4 border-t mt-4 space-x-3">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSelect}
            disabled={!selectedMotor}
          >
            Заменить
          </Button>
        </div>
      </div>
    </Modal>
  )
}
