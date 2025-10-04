import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { UPDItemsHierarchy } from '../../components/UPD/UPDItemsHierarchy';
import {
  getAvailableReceptionItems,
  getCounterparties,
  getSubdivisions,
  createUpdAndLinkItems,
  AvailableReceptionItem,
} from '../../services/updService';

interface Counterparty {
  id: string;
  name: string;
  inn: string;
}

interface Subdivision {
  id: string;
  name: string;
  code: string;
}

export default function CreateUPD() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableReceptionItem[]>([]);

  const [selectedCounterpartyId, setSelectedCounterpartyId] = useState<string>('');
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadCounterparties();
    loadSubdivisions();
  }, []);

  useEffect(() => {
    if (selectedCounterpartyId) {
      loadAvailableItems();
    } else {
      setAvailableItems([]);
      setSelectedItemIds(new Set());
    }
  }, [selectedCounterpartyId, selectedSubdivisionId]);

  async function loadCounterparties() {
    try {
      const data = await getCounterparties();
      setCounterparties(data);
    } catch (err) {
      setError('Ошибка загрузки контрагентов');
      console.error(err);
    }
  }

  async function loadSubdivisions() {
    try {
      const data = await getSubdivisions();
      setSubdivisions(data);
    } catch (err) {
      setError('Ошибка загрузки подразделений');
      console.error(err);
    }
  }

  async function loadAvailableItems() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableReceptionItems(
        selectedCounterpartyId,
        selectedSubdivisionId || undefined
      );
      setAvailableItems(data);
      setSelectedItemIds(new Set());
    } catch (err) {
      setError('Ошибка загрузки доступных позиций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleItemSelection(itemId: string) {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItemIds(newSelection);
  }

  function toggleSelectAll() {
    if (selectedItemIds.size === availableItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(availableItems.map((item) => item.id)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!documentNumber.trim()) {
      setError('Введите номер УПД');
      return;
    }

    if (selectedItemIds.size === 0) {
      setError('Выберите хотя бы одну позицию');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createUpdAndLinkItems({
        counterpartyId: selectedCounterpartyId,
        subdivisionId: selectedSubdivisionId || undefined,
        documentNumber,
        documentDate,
        itemIds: Array.from(selectedItemIds),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/upd');
      }, 1500);
    } catch (err) {
      setError('Ошибка при создании УПД');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    selectedCounterpartyId &&
    documentNumber.trim() &&
    selectedItemIds.size > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/upd')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку УПД
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Создание нового УПД</h1>
        <p className="text-slate-600 mt-2">
          Выберите контрагента и позиции для формирования документа
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          УПД успешно создан! Перенаправление...
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Фильтры
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Контрагент *
              </label>
              <select
                value={selectedCounterpartyId}
                onChange={(e) => setSelectedCounterpartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите контрагента</option>
                {counterparties.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name} (ИНН: {cp.inn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Подразделение (опционально)
              </label>
              <select
                value={selectedSubdivisionId}
                onChange={(e) => setSelectedSubdivisionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCounterpartyId}
              >
                <option value="">Все подразделения</option>
                {subdivisions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedCounterpartyId && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Доступные позиции ({availableItems.length})
              </h2>

              {loading ? (
                <div className="text-center py-8 text-slate-600">
                  Загрузка позиций...
                </div>
              ) : (
                <UPDItemsHierarchy
                  items={availableItems}
                  selectedItemIds={selectedItemIds}
                  onToggleItem={toggleItemSelection}
                  onToggleAll={toggleSelectAll}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Данные документа
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Номер УПД *
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Например: 00БП-000001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Дата УПД *
                  </label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/upd')}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить УПД'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
