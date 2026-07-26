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
import { ConfirmDialog } from '@/components/ConfirmDialog';

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

        <div className="flex flex-col gap-2">
          {cards.length === 0 ? (
            <EmptyState
              title="Nenhum card"
              description="Crie um card para começar."
            />
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center gap-2 rounded-lg border bg-background p-3"
              >
                <span className="flex-1 break-words">{card.title}</span>

                <ConfirmDialog
                  title="Excluir card"
                  description="Esta ação não pode ser desfeita."
                  onConfirm={() => onDeleteCard(id, card.id)}
                >
                  <Button size="icon" variant="destructive">
                    ×
                  </Button>
                </ConfirmDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </CardComponent>
  );
}
