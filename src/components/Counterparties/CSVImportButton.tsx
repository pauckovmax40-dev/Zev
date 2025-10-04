import React, { useState, useRef } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { parseCSV } from '../../utils/csv'
import { importCounterparties } from '../../services/counterpartyService'

interface CSVImportButtonProps {
  onImportComplete: (successCount: number, errorCount: number, errors: string[]) => void
}

export const CSVImportButton: React.FC<CSVImportButtonProps> = ({
  onImportComplete,
}) => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
    errors?: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setMessage({ type: 'error', text: 'Пожалуйста, выберите файл формата CSV.' })
        return
      }
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setLoading(true)
    setMessage({ type: 'info', text: `Загрузка файла "${file.name}"...` })

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedData = parseCSV(csvText)

        if (parsedData.length === 0) {
          setMessage({ type: 'error', text: 'Файл CSV пуст или не содержит данных.' })
          setLoading(false)
          return
        }

        setMessage({ type: 'info', text: `Найдено ${parsedData.length} записей. Начинается импорт...` })

        const result = await importCounterparties(parsedData)

        if (result.errorCount > 0) {
          setMessage({
            type: 'error',
            text: `Импорт завершен с ошибками. Успешно: ${result.successCount}, Ошибок: ${result.errorCount}.`,
            errors: result.errors,
          })
        } else {
          setMessage({
            type: 'success',
            text: `Импорт успешно завершен! Добавлено/обновлено ${result.successCount} контрагентов.`,
          })
        }

        onImportComplete(result.successCount, result.errorCount, result.errors)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при обработке CSV.'
        setMessage({ type: 'error', text: `Ошибка импорта: ${errorMessage}` })
        console.error('Import failed:', error)
      } finally {
        setLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Ошибка чтения файла.' })
      setLoading(false)
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setMessage(null)
  }

  const getMessageStyles = () => {
    if (!message) return ''
    switch (message.type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />
      <Button onClick={triggerFileInput} loading={loading} disabled={loading} size="sm">
        <Upload className="w-4 h-4 mr-2" />
        {loading ? 'Импорт...' : 'Импорт из CSV'}
      </Button>

      {message && (
        <div className={`p-3 text-sm rounded-lg border ${getMessageStyles()}`}>
          <p>{message.text}</p>
          {message.errors && message.errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Детали ошибок:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs bg-red-50 p-2 rounded-md max-h-40 overflow-y-auto">
                {message.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Ожидаемый формат CSV: `name, inn, kpp, address, contact_person, phone, email, description, is_active`.
        Поля `name` и `inn` используются для определения уникальности.
      </p>
    </div>
  )
}
