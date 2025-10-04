import React, { useState } from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Download, Save } from 'lucide-react'
import { ReceptionExcelUploader } from '../../components/FinancialHierarchy/ReceptionExcelUploader'
import { ReceptionPreview } from '../../components/FinancialHierarchy/ReceptionPreview'
import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
import { saveReceptionData } from '../../services/receptionService'
import { Alert } from '../../components/ui/Alert'

export const NewAcceptance: React.FC = () => {
  const [receptionData, setReceptionData] = useState<ReceptionExcelRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDataUpload = (data: ReceptionExcelRow[]) => {
    setReceptionData(data)
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleSave = async () => {
    if (receptionData.length === 0) {
      setErrorMessage('Нет данных для сохранения')
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await saveReceptionData(receptionData)
      setSuccessMessage('Данные успешно сохранены в базу данных')
      setReceptionData([])
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка сохранения данных')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout
      title="Новая Приемка"
      breadcrumbs={[
        { label: 'Приемка (Заказы)', path: '/app/acceptance' },
        { label: 'Новый Заказ', path: '/app/acceptance/new' },
      ]}
    >
      <div className="space-y-6">
        {successMessage && (
          <Alert variant="success">{successMessage}</Alert>
        )}
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Собранные Позиции
            </h2>
            <div className="flex items-center space-x-2">
              <ReceptionExcelUploader
                onDataUpload={handleDataUpload}
                setLoading={setLoading}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка данных...</p>
            </div>
          ) : (
            <ReceptionPreview data={receptionData} />
          )}
        </div>

        {receptionData.length > 0 && (
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setReceptionData([])}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Сохранить позиции
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
