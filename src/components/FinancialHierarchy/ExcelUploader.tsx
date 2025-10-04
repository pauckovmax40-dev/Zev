import React, { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { FinancialRow } from '../../types/financialHierarchy'
import { parseAssembledPositionsExcel } from '../../utils/parseExcelData'

interface ExcelUploaderProps {
  onDataUpload: (data: FinancialRow[]) => void
  setLoading: (loading: boolean) => void
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
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
          const data = await parseAssembledPositionsExcel(buffer)
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

    // Reset file input to allow uploading the same file again
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
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <UploadCloud size={16} />
        Загрузить xlsx
      </button>
      {error && (
        <p className="text-red-500 text-xs absolute top-full mt-1 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
