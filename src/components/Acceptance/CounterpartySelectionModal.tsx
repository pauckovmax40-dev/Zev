import React, { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { CounterpartiesTable } from '../Counterparties/CounterpartiesTable'
import {
  getCounterparties,
  Counterparty,
} from '../../services/counterpartyService'
import { Search } from 'lucide-react'
import { CSVImportButton } from '../Counterparties/CSVImportButton'

interface CounterpartySelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (counterparty: Counterparty) => void
}

export const CounterpartySelectionModal: React.FC<
  CounterpartySelectionModalProps
> = ({ isOpen, onClose, onSelect }) => {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchCounterparties = () => {
    setLoading(true)
    setError(null)
    getCounterparties()
      .then(data => {
        setCounterparties(data)
      })
      .catch(e => {
        setError(
          e instanceof Error
            ? e.message
            : 'Не удалось загрузить контрагентов',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (isOpen) {
      fetchCounterparties()
    }
  }, [isOpen, refreshKey])

  const filteredCounterparties = useMemo(() => {
    if (!searchTerm) {
      return counterparties
    }
    const lowercasedFilter = searchTerm.toLowerCase()
    return counterparties.filter(
      cp =>
        cp.name.toLowerCase().includes(lowercasedFilter) ||
        (cp.inn && cp.inn.toLowerCase().includes(lowercasedFilter)),
    )
  }, [counterparties, searchTerm])

  const handleSelect = (counterparty: Counterparty) => {
    onSelect(counterparty)
  }

  const handleImportComplete = (successCount: number) => {
    if (successCount > 0) {
      setRefreshKey(prev => prev + 1)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор Контрагента" size="xl">
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            id="search-counterparty"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Поиск по наименованию или ИНН..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <CSVImportButton onImportComplete={handleImportComplete} />
        </div>

        <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg">
          <CounterpartiesTable
            counterparties={filteredCounterparties}
            loading={loading}
            error={error}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </Modal>
  )
}
