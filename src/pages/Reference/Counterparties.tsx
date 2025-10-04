import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { CSVImportButton } from '../../components/Counterparties/CSVImportButton'
import { CounterpartiesTable } from '../../components/Counterparties/CounterpartiesTable'
import {
  getCounterparties,
  Counterparty,
} from '../../services/counterpartyService'

export const Counterparties: React.FC = () => {
  const [importStatus, setImportStatus] = useState<{
    success: number
    error: number
  } | null>(null)
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCounterparties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCounterparties()
      setCounterparties(data)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Произошла неизвестная ошибка',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCounterparties()
  }, [fetchCounterparties])

  const handleImportComplete = (successCount: number, errorCount: number) => {
    setImportStatus({ success: successCount, error: errorCount })
    // Trigger a data refresh for the table view
    fetchCounterparties()
  }

  return (
    <AppLayout
      title="Контрагенты"
      breadcrumbs={[
        { label: 'Справочники', path: '/app/reference/motors' },
        { label: 'Контрагенты', path: '/app/reference/counterparties' },
      ]}
    >
      <div className="flex justify-end mb-4">
        <CSVImportButton onImportComplete={handleImportComplete} />
      </div>

      {importStatus && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm">
          Последний импорт: Успешно добавлено/обновлено {importStatus.success}{' '}
          записей,{' '}
          {importStatus.error > 0
            ? `${importStatus.error} ошибок.`
            : '0 ошибок.'}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CounterpartiesTable
          counterparties={counterparties}
          loading={loading}
          error={error}
        />
      </div>
    </AppLayout>
  )
}
