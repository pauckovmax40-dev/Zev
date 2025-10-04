import React, { useState, useRef } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { parseMotorsCSV } from '../../utils/motorCsv'
import { importMotors } from '../../services/motorService'

interface MotorCSVImportButtonProps {
  onImportComplete: (successCount: number) => void
}

export const MotorCSVImportButton: React.FC<MotorCSVImportButtonProps> = ({
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
        const parsedData = parseMotorsCSV(csvText)

        if (parsedData.length === 0) {
          setMessage({ type: 'error', text: 'Файл CSV пуст или не содержит данных.' })
          setLoading(false)
          return
        }

        setMessage({ type: 'info', text: `Найдено ${parsedData.length} записей. Начинается импорт...` })

        const result = await importMotors(parsedData)

        if (result.errorCount > 0) {
          setMessage({
            type: 'error',
            text: `Импорт завершен с ошибками. Успешно: ${result.successCount}, Ошибок: ${result.errorCount}.`,
            errors: result.errors,
          })
        } else {
          setMessage({
            type: 'success',
            text: `Импорт успешно завершен! Добавлено/обновлено ${result.successCount} двигателей.`,
          })
        }

        if (result.successCount > 0) {
            onImportComplete(result.successCount)
        }

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
    reader.readAsText(file, 'UTF-8')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setMessage(null)
  }

  // Updated expected format based on user's schema and CSV parser logic
  const expectedFormat = '`name,manufacturer,power_kw,rpm,voltage,current,efficiency,price_per_unit` (или `brand` вместо `manufacturer`, `price` вместо `price_per_unit`).'

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
        <div className={`p-3 text-sm rounded-lg border ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
            message.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-blue-100 text-blue-800 border-blue-200'
        }`}>
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
        Ожидаемый формат CSV: {expectedFormat}
        Поле `name` используется для определения уникальности.
      </p>
    </div>
  )
}
