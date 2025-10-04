import React, { useState, useMemo, useEffect } from 'react'
import { Download, PlusCircle, Save } from 'lucide-react'
import {
  FinancialRow,
  HierarchicalItem,
  HierarchicalOrderGroup,
} from '../../types/financialHierarchy'
import { transformFinancialData } from '../../utils/transformFinancialData'
import { exportAssembledPositionsToExcel } from '../../utils/exportToExcel'
import { OrderGroup } from './OrderGroup'
import { ExcelUploader } from './ExcelUploader'
import { MotorSelectionModal } from './MotorSelectionModal'
import {
  getCounterparties,
  Counterparty,
} from '../../services/counterpartyService'
import { saveRepairOrders } from '../../services/repairOrderService'

interface FinancialHierarchyViewProps {
  data: FinancialRow[]
}

export const FinancialHierarchyView: React.FC<FinancialHierarchyViewProps> = ({
  data: initialData,
}) => {
  const [flatData, setFlatData] = useState<FinancialRow[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMotorModalOpen, setIsMotorModalOpen] = useState(false)
  const [
    currentItemForMotorChange,
    setCurrentItemForMotorChange,
  ] = useState<HierarchicalItem | null>(null)
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [selectedCounterparty, setSelectedCounterparty] = useState<string>('')

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const data = await getCounterparties()
        setCounterparties(data)
        if (data.length > 0) {
          setSelectedCounterparty(data[0].id)
        }
      } catch (error) {
        console.error(error)
        alert('Не удалось загрузить список контрагентов.')
      }
    }
    fetchCounterparties()
  }, [])

  const hierarchicalData: HierarchicalOrderGroup[] = useMemo(
    () => transformFinancialData(flatData),
    [flatData],
  )

  const handleItemQuantityChange = (itemId: string, newQuantity: number) => {
    setFlatData((prevData) =>
      prevData.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    )
  }

  const handleOpenMotorSelection = (itemId: string) => {
    const flatItem = flatData.find((item) => item.id === itemId)
    if (flatItem) {
      const currentItem: HierarchicalItem = {
        id: flatItem.id,
        itemName: flatItem.itemName,
        quantity: flatItem.quantity,
        unitPrice: flatItem.amount,
        totalAmount: flatItem.amount * flatItem.quantity,
      }
      setCurrentItemForMotorChange(currentItem)
      setIsMotorModalOpen(true)
    } else {
      console.error('Could not find item with ID:', itemId)
    }
  }

  const handleMotorSelect = (newItemData: {
    name: string
    unitPrice: number
  }) => {
    if (!currentItemForMotorChange) return

    setFlatData((prevData) =>
      prevData.map((row) => {
        if (row.id === currentItemForMotorChange.id) {
          return {
            ...row,
            itemName: newItemData.name,
            amount: newItemData.unitPrice,
          }
        }
        return row
      }),
    )

    setIsMotorModalOpen(false)
    setCurrentItemForMotorChange(null)
  }

  const handleExport = () => {
    if (flatData.length > 0) {
      exportAssembledPositionsToExcel(flatData, 'собранные-позиции')
    } else {
      alert('Нет данных для экспорта.')
    }
  }

  const handleLoadDemo = () => {
    alert('Загрузка демо-данных еще не реализована.')
  }

  const handleSaveOrder = async () => {
    if (hierarchicalData.length === 0) {
      alert('Нет данных для сохранения.')
      return
    }
    if (!selectedCounterparty) {
      alert('Пожалуйста, выберите контрагента.')
      return
    }

    setIsSaving(true)
    try {
      await saveRepairOrders(hierarchicalData, selectedCounterparty)
      alert('Заказы успешно сохранены!')
      // Optionally clear the data after saving
      // setFlatData([]);
    } catch (error) {
      console.error(error)
      alert(`Ошибка сохранения заказа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Собранные Позиции
          </h2>
          <div className="flex items-center gap-3">
            <ExcelUploader
              onDataUpload={setFlatData}
              setLoading={setIsLoading}
            />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download size={16} />
              скачать xlsx
            </button>
            <button
              onClick={handleLoadDemo}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle size={16} />
              Загрузить данные (Демо)
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="counterparty"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Контрагент
          </label>
          <select
            id="counterparty"
            name="counterparty"
            value={selectedCounterparty}
            onChange={(e) => setSelectedCounterparty(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={counterparties.length === 0}
          >
            {counterparties.length > 0 ? (
              counterparties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ИНН: {c.inn || 'не указан'})
                </option>
              ))
            ) : (
              <option>Загрузка контрагентов...</option>
            )}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Загрузка и обработка файла...</p>
          </div>
        ) : hierarchicalData.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Нет данных для отображения. Загрузите файл для начала работы.
          </div>
        ) : (
          <div className="space-y-4">
            {hierarchicalData.map((order) => (
              <OrderGroup
                key={order.id}
                order={order}
                onItemQuantityChange={handleItemQuantityChange}
                onSelectMotor={handleOpenMotorSelection}
              />
            ))}
          </div>
        )}
      </div>

      {hierarchicalData.length > 0 && (
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            <Save size={16} />
            {isSaving ? 'Сохранение...' : 'Сохранить Заказ'}
          </button>
        </div>
      )}

      <MotorSelectionModal
        isOpen={isMotorModalOpen}
        onClose={() => setIsMotorModalOpen(false)}
        currentItem={currentItemForMotorChange}
        onMotorSelect={handleMotorSelect}
      />
    </>
  )
}
