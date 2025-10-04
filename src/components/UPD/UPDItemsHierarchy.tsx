import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AvailableReceptionItem } from '../../services/updService';

// --- TYPE DEFINITIONS FOR HIERARCHY ---

// This interface is now aligned with the service response
interface PositionableItem extends AvailableReceptionItem {}

interface HierarchicalItem extends PositionableItem {
  // Inherits all properties
}

interface HierarchicalTransactionGroup {
  type: string;
  items: HierarchicalItem[];
  itemCount: number;
}

interface HierarchicalPositionGroup {
  id: string;
  baseItemName: string;
  transactions: HierarchicalTransactionGroup[];
  itemCount: number;
}

interface HierarchicalWorkGroup {
  id: string;
  workGroup: string;
  positions: HierarchicalPositionGroup[];
  itemCount: number;
}

// Represents a top-level group from the user's reference (e.g., "Двигатель 1", "Двигатель 2")
interface HierarchicalTopLevelGroup {
  id: string;
  positionNumber: number;
  mainInfo: {
    service_description: string;
    subdivision: string | null;
  };
  workGroups: HierarchicalWorkGroup[];
  itemCount: number;
  allItemIds: string[];
}

// --- HELPER FUNCTIONS ---

const getBaseItemName = (description: string): string => {
  return description;
};

// --- HIERARCHY COMPONENTS ---

const ItemRow: React.FC<{
  item: HierarchicalItem;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ item, isSelected, onToggle }) => {
  const totalAmount = item.price * item.quantity;
  return (
    <div className="flex items-start pl-4 py-1.5">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="rounded border-slate-400 text-blue-600 mr-4 mt-1 flex-shrink-0 focus:ring-blue-500"
      />
      <div className="flex-grow min-w-0">
        <p className="text-sm text-slate-800">{item.item_description}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
          <span>Кол-во: {item.quantity}</span>
          <span>Цена: {item.price.toLocaleString('ru-RU')} ₽</span>
          <span className="font-medium text-slate-600">
            Сумма: {totalAmount.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
    </div>
  );
};

const TransactionTypeGroup: React.FC<{
  group: HierarchicalTransactionGroup;
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
}> = ({ group, selectedItemIds, onToggleItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeColor = group.type === 'Приход' ? 'text-green-700' : 'text-red-700';

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center cursor-pointer py-1 group hover:bg-slate-50 rounded px-2"
      >
        <div className="text-slate-400 group-hover:text-slate-800">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <h5 className={`text-sm font-medium ml-1 ${typeColor}`}>{group.type}</h5>
        <span className="text-sm text-slate-500 ml-auto">({group.itemCount})</span>
      </div>
      {isExpanded && (
        <div className="mt-1 pl-4 border-l-2 border-slate-200">
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PositionGroup: React.FC<{
  group: HierarchicalPositionGroup;
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
}> = ({ group, selectedItemIds, onToggleItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center cursor-pointer py-1.5 group hover:bg-slate-50 rounded px-2"
      >
        <div className="text-slate-500 group-hover:text-slate-900">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
        <h4 className="text-sm text-slate-800 ml-2 flex-grow min-w-0">
          {group.baseItemName}
        </h4>
        <span className="text-sm text-slate-500 ml-auto">({group.itemCount})</span>
      </div>
      {isExpanded && (
        <div className="space-y-1 mt-1 pl-6">
          {group.transactions.map((transaction) => (
            <TransactionTypeGroup
              key={transaction.type}
              group={transaction}
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WorkGroup: React.FC<{
  group: HierarchicalWorkGroup;
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
}> = ({ group, selectedItemIds, onToggleItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="py-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center cursor-pointer py-1.5 group hover:bg-blue-50 rounded px-2"
      >
        <div className="text-slate-500 group-hover:text-slate-900">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
        <h3 className="text-base font-medium text-slate-800 ml-2 flex-grow min-w-0">
          {group.workGroup}
        </h3>
        <span className="text-base text-slate-500 ml-auto">({group.itemCount})</span>
      </div>
      {isExpanded && (
        <div className="space-y-2 mt-2 pl-4">
          {group.positions.map((pos) => (
            <PositionGroup
              key={pos.id}
              group={pos}
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PositionCard: React.FC<{
  group: HierarchicalTopLevelGroup;
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
}> = ({ group, selectedItemIds, onToggleItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedCount = useMemo(() => {
    return group.allItemIds.filter((id) => selectedItemIds.has(id)).length;
  }, [group.allItemIds, selectedItemIds]);

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-start cursor-pointer p-4 hover:bg-slate-50 rounded-t-lg"
      >
        <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0 mt-1">
          {group.positionNumber}
        </span>
        <div className="flex-grow min-w-0 ml-4">
          <h2 className="text-base font-semibold text-slate-900">
            {group.mainInfo.service_description}
          </h2>
          {group.mainInfo.subdivision && (
            <p className="mt-1 text-sm text-slate-600">
              Подразделение: {group.mainInfo.subdivision}
            </p>
          )}
        </div>
        <div className="flex items-center flex-shrink-0 ml-4 mt-1">
          <div className="text-right mr-3">
            <span className="text-sm text-slate-600 font-medium">
              {selectedCount} / {group.itemCount} работ
            </span>
          </div>
          <div className="text-slate-500">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="pb-3 mt-1 px-4 pl-14">
          {group.workGroups.map((workGroup) => (
            <WorkGroup
              key={workGroup.id}
              group={workGroup}
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

export interface UPDItemsHierarchyProps {
  items: PositionableItem[];
  selectedItemIds: Set<string>;
  onToggleItem: (itemId: string) => void;
  onToggleAll: () => void;
}

export const UPDItemsHierarchy: React.FC<UPDItemsHierarchyProps> = ({
  items,
  selectedItemIds,
  onToggleItem,
  onToggleAll,
}) => {
  const hierarchicalData: HierarchicalTopLevelGroup[] = useMemo(() => {
    const positionMap = new Map<number, PositionableItem[]>();
    items.forEach((item) => {
      const key = item.position_number;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(item);
    });

    const sortedPositions = Array.from(positionMap.entries()).sort((a, b) => a[0] - b[0]);

    return sortedPositions.map(([positionNumber, positionItems]) => {
      const firstItem = positionItems[0];
      const workGroupMap = new Map<string, PositionableItem[]>();
      positionItems.forEach((item) => {
        const workGroupName = item.work_group || 'Прочие работы';
        if (!workGroupMap.has(workGroupName)) workGroupMap.set(workGroupName, []);
        workGroupMap.get(workGroupName)!.push(item);
      });

      const workGroups: HierarchicalWorkGroup[] = Array.from(workGroupMap.entries()).map(
        ([workGroupName, workItems]) => {
          const positionMap = new Map<string, PositionableItem[]>();
          workItems.forEach((item) => {
            const baseName = getBaseItemName(item.item_description);
            if (!positionMap.has(baseName)) positionMap.set(baseName, []);
            positionMap.get(baseName)!.push(item);
          });

          const positions: HierarchicalPositionGroup[] = Array.from(positionMap.entries()).map(
            ([baseName, posItems]) => {
              const transactionMap = new Map<string, PositionableItem[]>();
              posItems.forEach((item) => {
                const type = item.transaction_type || 'Неопределено';
                if (!transactionMap.has(type)) transactionMap.set(type, []);
                transactionMap.get(type)!.push(item);
              });

              const transactions: HierarchicalTransactionGroup[] = Array.from(transactionMap.entries()).map(
                ([type, transactionItems]) => ({
                  type,
                  items: transactionItems,
                  itemCount: transactionItems.length,
                })
              );

              return { id: baseName, baseItemName: baseName, transactions, itemCount: posItems.length };
            }
          );

          return { id: workGroupName, workGroup: workGroupName, positions, itemCount: workItems.length };
        }
      );

      return {
        id: positionNumber.toString(),
        positionNumber: positionNumber,
        mainInfo: {
          service_description: firstItem.motor_service_description,
          subdivision: firstItem.subdivision_name,
        },
        workGroups,
        itemCount: positionItems.length,
        allItemIds: positionItems.map(item => item.id),
      };
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Нет доступных позиций для выбранных фильтров
      </div>
    );
  }

  const allSelected = items.length > 0 && selectedItemIds.size === items.length;
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < items.length;
  const totalSelectedAmount = items
    .filter((item) => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected;
            }}
            onChange={onToggleAll}
            className="rounded border-slate-400 text-blue-600 h-5 w-5 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-slate-700">
            {selectedItemIds.size === 0
              ? 'Выбрать все'
              : `Выбрано: ${selectedItemIds.size} из ${items.length}`}
          </label>
        </div>
        {selectedItemIds.size > 0 && (
          <div className="text-right">
            <p className="text-sm text-slate-600">Сумма выбранных позиций:</p>
            <p className="text-lg font-bold text-slate-900">
              {totalSelectedAmount.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 mt-4">
        {hierarchicalData.map((group) => (
          <PositionCard
            key={group.id}
            group={group}
            selectedItemIds={selectedItemIds}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>
    </div>
  );
};
