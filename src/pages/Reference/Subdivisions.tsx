import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Subdivision } from '../../types/database'
import { subdivisionService } from '../../services/subdivisionService'
import { Button, Modal, Alert } from '../../components/ui'
import { SubdivisionList } from '../../components/Reference/SubdivisionList'
import { SubdivisionForm } from '../../components/Reference/SubdivisionForm'
import { SubdivisionCSVImportButton } from '../../components/Reference/SubdivisionCSVImportButton' // NEW
import { Plus } from 'lucide-react'

export const Subdivisions: React.FC = () => {
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubdivision, setEditingSubdivision] = useState<Subdivision | undefined>(undefined)

  const fetchSubdivisions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await subdivisionService.fetchSubdivisions()
      setSubdivisions(data)
    } catch (err) {
      console.error('Error fetching subdivisions:', err)
      setError('Не удалось загрузить список подразделений.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubdivisions()
  }, [fetchSubdivisions])

  const handleOpenCreate = () => {
    setEditingSubdivision(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (subdivision: Subdivision) => {
    setEditingSubdivision(subdivision)
    setIsModalOpen(true)
  }

  const handleSave = (savedSubdivision: Subdivision) => {
    if (editingSubdivision) {
      // Update existing item
      setSubdivisions(prev =>
        prev.map(s => (s.id === savedSubdivision.id ? savedSubdivision : s))
      )
    } else {
      // Add new item
      setSubdivisions(prev => [...prev, savedSubdivision].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setIsModalOpen(false)
    setEditingSubdivision(undefined)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это подразделение?')) {
      return
    }
    try {
      await subdivisionService.deleteSubdivision(id)
      setSubdivisions(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting subdivision:', err)
      setError('Не удалось удалить подразделение. Возможно, оно используется в заказах.')
    }
  }

  const handleImportComplete = (count: number) => {
    if (count > 0) {
      // Refresh the list after successful import
      fetchSubdivisions()
    }
  }

  return (
    <AppLayout
      title="Подразделения"
      breadcrumbs={[
        { label: 'Справочники', path: '/app/reference/motors' },
        { label: 'Подразделения', path: '/app/reference/subdivisions' },
      ]}
    >
      <div className="space-y-6">
        {/* Updated layout to accommodate import button on the left and add button on the right */}
        <div className="flex justify-between items-start">
          <SubdivisionCSVImportButton onImportComplete={handleImportComplete} />
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus className="w-5 h-5 mr-2" />
            Добавить подразделение
          </Button>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <SubdivisionList
            subdivisions={subdivisions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubdivision ? 'Редактировать подразделение' : 'Создать новое подразделение'}
      >
        <SubdivisionForm
          initialData={editingSubdivision}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AppLayout>
  )
}
