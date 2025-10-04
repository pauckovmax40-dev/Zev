import React, { useState, useEffect } from 'react'
import { Subdivision, SubdivisionInsert } from '../../types/database'
import { subdivisionService } from '../../services/subdivisionService'
import { Alert, Button, Input, Textarea, Checkbox } from '../ui' // FIXED: Changed to lowercase 'ui'

interface SubdivisionFormProps {
  initialData?: Subdivision
  onSave: (subdivision: Subdivision) => void
  onCancel: () => void
}

export const SubdivisionForm: React.FC<SubdivisionFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SubdivisionInsert>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    is_active: initialData?.is_active ?? true,
    code: initialData?.code || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        is_active: initialData.is_active,
        code: initialData.code || '',
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let result: Subdivision
      if (isEditing && initialData) {
        result = await subdivisionService.updateSubdivision(initialData.id, formData)
      } else {
        result = await subdivisionService.createSubdivision(formData)
      }
      onSave(result)
    } catch (err) {
      console.error('Subdivision save error:', err)
      setError(err instanceof Error ? err.message : 'Не удалось сохранить подразделение.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        label="Название подразделения (обязательно)"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Например, Цех №1"
      />

      <Input
        label="Код (опционально)"
        name="code"
        value={formData.code || ''}
        onChange={handleChange}
        placeholder="Краткий код для учета"
      />

      <Textarea
        label="Описание"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        rows={3}
        placeholder="Подробное описание функций подразделения"
      />

      <Checkbox
        label="Активно"
        name="is_active"
        checked={formData.is_active ?? true}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEditing ? 'Сохранить изменения' : 'Создать подразделение'}
        </Button>
      </div>
    </form>
  )
}
