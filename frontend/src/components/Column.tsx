import { useState } from 'react';
import type { Card } from '@/api/cards.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card as CardComponent,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { SortableCard } from '@/components/SortableCard';
import { useDroppable } from '@dnd-kit/react';

interface ColumnProps {
  id: string;
  title: string;
  cards: Card[];
  onCreateCard: (
    columnId: string,
    title: string,
    order: number,
  ) => Promise<boolean>;
  onDeleteCard: (columnId: string, cardId: string) => Promise<void>;
}

export function Column({
  id,
  title,
  cards,
  onCreateCard,
  onDeleteCard,
}: ColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id,
    type: 'column',
    accept: 'card',
    collisionPriority: -1,
  });

  async function handleCreateCard() {
    if (!newCardTitle.trim()) return;

    try {
      setCreating(true);

      const created = await onCreateCard(id, newCardTitle.trim(), cards.length);

      if (created) {
        setNewCardTitle('');
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <CardComponent className="w-80 shrink-0">
      <CardHeader>
        <CardTitle className="break-words">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Novo card"
            value={newCardTitle}
            onChange={(event) => setNewCardTitle(event.target.value)}
          />

          <Button size="icon" onClick={handleCreateCard} disabled={creating}>
            {creating ? '...' : '+'}
          </Button>
        </div>

        <div
          ref={droppableRef}
          className={[
            'min-h-20 space-y-2 rounded-md transition-colors',
            isDropTarget ? 'bg-accent/50 ring-2 ring-primary/40' : '',
          ].join(' ')}
        >
          {cards.length === 0 ? (
            <EmptyState
              title="Nenhum card"
              description="Arraste um card para cá ou crie um novo."
            />
          ) : (
            cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                index={index}
                columnId={id}
                onDelete={onDeleteCard}
              />
            ))
          )}
        </div>
      </CardContent>
    </CardComponent>
  );
}
