import React, { useRef, useState } from 'react'
import { CloudUpload as UploadCloud } from 'lucide-react'
import { ReceptionExcelRow, parseReceptionExcel } from '../../utils/parseReceptionExcel'

interface ReceptionExcelUploaderProps {
  onDataUpload: (data: ReceptionExcelRow[]) => void
  setLoading: (loading: boolean) => void
}

export const ReceptionExcelUploader: React.FC<ReceptionExcelUploaderProps> = ({
  onDataUpload,
  setLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result
        if (buffer instanceof ArrayBuffer) {
          const data = await parseReceptionExcel(buffer)
          onDataUpload(data)
        } else {
          throw new Error('Не удалось прочитать файл как ArrayBuffer.')
        }
      } catch (parseError: any) {
        setError(parseError.message || 'Ошибка при обработке файла.')
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('Не удалось прочитать файл.')
      setLoading(false)
    }
    reader.readAsArrayBuffer(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls"
      />
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <UploadCloud size={16} />
        Загрузить данные (Демо)
      </button>
      {error && (
        <p className="text-red-500 text-xs absolute top-full mt-1 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
