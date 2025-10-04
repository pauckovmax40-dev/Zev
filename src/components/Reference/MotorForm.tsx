import React, { useState, useEffect } from 'react'
import { Motor, Tables } from '../../types/database'
import { Input } from '../ui/Input'
import { NumberInput } from '../ui/NumberInput'
import { Button } from '../ui/Button'
import { createMotor, updateMotor, MotorInsert } from '../../services/motorService'

type MotorFormProps = {
  motor?: Motor | null
  onSave: (motor: Motor) => void
  onClose: () => void
}

type FormState = Omit<MotorInsert, 'user_id'>

const initialFormState: FormState = {
  name: '',
  brand: '',
  power_kw: null,
  rpm: null,
  voltage: null,
  price: null,
}

export const MotorForm: React.FC<MotorFormProps> = ({
  motor,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!motor

  useEffect(() => {
    if (motor) {
      setFormData({
        name: motor.name,
        brand: motor.brand ?? '',
        power_kw: motor.power_kw,
        rpm: motor.rpm,
        voltage: motor.voltage,
        price: motor.price,
      })
    } else {
      setFormData(initialFormState)
    }
  }, [motor])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleNumberChange = (id: keyof FormState, value: number | null) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError('Название двигателя обязательно.')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)

    try {
      const dataToSubmit: MotorInsert = {
        ...formData,
        // Convert nulls to 0 or empty string for required DB defaults if not provided
        power_kw: formData.power_kw ?? 0,
        rpm: formData.rpm ?? 0,
        voltage: formData.voltage ?? 0,
        price: formData.price ?? 0,
        brand: formData.brand ?? '',
      }

      let savedMotor: Motor
      if (isEditing && motor) {
        savedMotor = await updateMotor(motor.id, dataToSubmit)
      } else {
        savedMotor = await createMotor(dataToSubmit)
      }
      onSave(savedMotor)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка сохранения.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <Input
        id="name"
        label="Название / Модель (обязательно)"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Например, АИР 100S4"
      />

      <Input
        id="brand"
        label="Производитель / Бренд"
        value={formData.brand ?? ''}
        onChange={handleChange}
        placeholder="Например, Siemens, WEG, АЭМЗ"
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          id="power_kw"
          label="Мощность, кВт"
          value={formData.power_kw}
          onChange={(v) => handleNumberChange('power_kw', v)}
          step={0.1}
          placeholder="0.75"
        />
        <NumberInput
          id="rpm"
          label="Обороты, об/мин"
          value={formData.rpm}
          onChange={(v) => handleNumberChange('rpm', v)}
          step={1}
          placeholder="1500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          id="voltage"
          label="Напряжение, В"
          value={formData.voltage}
          onChange={(v) => handleNumberChange('voltage', v)}
          step={1}
          placeholder="380"
        />
        <NumberInput
          id="price"
          label="Цена (для оценки ремонта), ₽"
          value={formData.price}
          onChange={(v) => handleNumberChange('price', v)}
          step={0.01}
          placeholder="15000.00"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" type="button" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" loading={loading}>
          {isEditing ? 'Сохранить изменения' : 'Добавить двигатель'}
        </Button>
      </div>
    </form>
  )
}
