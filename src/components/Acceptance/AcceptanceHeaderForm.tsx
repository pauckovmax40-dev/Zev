import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Search, ChevronRight, X } from 'lucide-react'
import { CounterpartySelectionModal } from './CounterpartySelectionModal'
import { Counterparty } from '../../services/counterpartyService'

interface AcceptanceHeaderFormProps {
  // Props for saving order metadata will be added here in the future
}

export const AcceptanceHeaderForm: React.FC<AcceptanceHeaderFormProps> = () => {
  const [selectedCounterparty, setSelectedCounterparty] =
    useState<Counterparty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNextStep = () => {
    console.log('Moving to Step 2 with counterparty:', selectedCounterparty)
    // Logic to save Step 1 data and advance the form state
  }

  const handleSelectCounterparty = (counterparty: Counterparty) => {
    setSelectedCounterparty(counterparty)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Форма создания нового заказа на ремонт (Шаг 1 из 5)
        </h2>

        <div className="space-y-4">
          <p className="text-gray-500 mb-4">
            Выберите контрагента и укажите основные параметры двигателя для
            ремонта.
          </p>

          {/* Counterparty Selection */}
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label
                htmlFor="counterparty-display"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Контрагент
              </label>
              <div className="relative">
                <div
                  id="counterparty-display"
                  className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 min-h-[42px] flex items-center"
                >
                  {selectedCounterparty ? (
                    <span>
                      {selectedCounterparty.name}{' '}
                      <span className="text-gray-400 text-xs">
                        ИНН: {selectedCounterparty.inn || '–'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Контрагент не выбран</span>
                  )}
                </div>
                {selectedCounterparty && (
                  <button
                    onClick={() => setSelectedCounterparty(null)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    aria-label="Очистить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(true)}
            >
              <Search className="w-4 h-4 mr-2" />
              Выбрать
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNextStep}
              disabled={!selectedCounterparty}
              variant="secondary"
            >
              Далее (Шаг 2)
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      <CounterpartySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectCounterparty}
      />
    </>
  )
}
