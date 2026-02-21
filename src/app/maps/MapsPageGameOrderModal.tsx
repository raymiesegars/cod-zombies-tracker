'use client';

import { useState, useCallback, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import type { Game } from '@/types';

type ListItem = { gameId: string; visible: boolean };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  initialGameOrder: string[];
  initialHasSeenSetupModal: boolean;
  onSave: (gameOrder: string[], markSetupSeen: boolean) => Promise<void>;
  isFirstTimePrompt?: boolean;
};

export function MapsPageGameOrderModal({
  isOpen,
  onClose,
  games,
  initialGameOrder,
  initialHasSeenSetupModal,
  onSave,
  isFirstTimePrompt = false,
}: Props) {
  const [list, setList] = useState<ListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || games.length === 0) return;
    const defaultOrder = [...games].sort((a, b) => a.order - b.order).map((g) => g.id);
    const order = initialGameOrder.length > 0 ? initialGameOrder : defaultOrder;
    const visibleSet = new Set(order);
    const visibleOrdered = order.filter((id) => games.some((g) => g.id === id));
    const hidden = games.filter((g) => !visibleSet.has(g.id));
    setList([
      ...visibleOrdered.map((gameId) => ({ gameId, visible: true })),
      ...hidden.map((g) => ({ gameId: g.id, visible: false })),
    ]);
  }, [isOpen, games, initialGameOrder]);

  const toggleVisible = useCallback((index: number) => {
    setList((prev) => {
      const next = [...prev];
      const item = next[index]!;
      next[index] = { ...item, visible: !item.visible };
      if (item.visible) {
        const [removed] = next.splice(index, 1);
        next.push(removed!);
      } else {
        const [removed] = next.splice(index, 1);
        const firstHidden = next.findIndex((i) => !i.visible);
        if (firstHidden === -1) next.push(removed!);
        else next.splice(firstHidden, 0, removed!);
      }
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.setData('application/json', JSON.stringify({ index }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDraggedIndex(null);
    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    const dragIndex = typeof raw === 'string' && raw.startsWith('{') ? JSON.parse(raw).index : parseInt(raw, 10);
    if (typeof dragIndex !== 'number' || dragIndex === dropIndex) return;
    setList((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      if (!removed) return prev;
      next.splice(dropIndex, 0, removed);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleSave = useCallback(async () => {
    const gameOrder = list.filter((i) => i.visible).map((i) => i.gameId);
    setSaving(true);
    try {
      await onSave(gameOrder, isFirstTimePrompt && !initialHasSeenSetupModal);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [list, onSave, onClose, isFirstTimePrompt, initialHasSeenSetupModal]);

  const gameById = Object.fromEntries(games.map((g) => [g.id, g]));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFirstTimePrompt ? 'Set up your maps page' : 'Maps page order'}
      description={
        isFirstTimePrompt
          ? 'Choose which games appear on the maps page and in what order. Drag to reorder, use the eye to show or hide a game. You can change this anytime from the settings icon.'
          : 'Drag games to reorder. Use the eye icon to show or hide a game on the maps page.'
      }
      size="lg"
      className="max-h-[90vh] flex flex-col"
    >
      <div className="flex flex-col gap-4">
        <ul className="space-y-1 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] pr-1 -mr-1" role="list">
          {list.map((item, index) => {
            const game = gameById[item.gameId];
            if (!game) return null;
            const isDragging = draggedIndex === index;
            return (
              <li
                key={game.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 rounded-lg border px-3 py-2.5 sm:py-3
                  transition-colors touch-manipulation
                  ${isDragging ? 'opacity-50 border-blood-500/60 bg-bunker-800' : 'border-bunker-700 bg-bunker-800/60 hover:bg-bunker-800'}
                `}
              >
                <span
                  className="flex-shrink-0 cursor-grab active:cursor-grabbing text-bunker-500 hover:text-bunker-400"
                  aria-hidden
                >
                  <GripVertical className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0 font-medium text-white truncate">{game.name}</span>
                <button
                  type="button"
                  onClick={() => toggleVisible(index)}
                  className="flex-shrink-0 p-2 rounded-lg text-bunker-400 hover:text-bunker-200 hover:bg-bunker-700 transition-colors"
                  title={item.visible ? 'Hide from maps page' : 'Show on maps page'}
                  aria-label={item.visible ? `Hide ${game.name}` : `Show ${game.name}`}
                >
                  {item.visible ? (
                    <Eye className="w-5 h-5 text-military-400" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-bunker-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-bunker-600 text-bunker-300 hover:bg-bunker-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
