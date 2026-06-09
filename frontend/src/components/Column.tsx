import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cardsApi, type Card } from '@/api/cards.api';
import { Input } from '@/components/ui/input';
import {
  Card as CardComponent,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { toast } from 'sonner';

interface ColumnProps {
  id: string;
  title: string;
  cards: Card[];
}

export function Column({ id, title }: ColumnProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadCards() {
    try {
      setLoading(true);

      const data = await cardsApi.list(id);

      setCards(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCard() {
    try {
      if (!newCardTitle.trim()) return;

      await cardsApi.create(id, newCardTitle, cards.length);

      setNewCardTitle('');

      await loadCards();

      toast.success('Card criado');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      await cardsApi.delete(cardId);

      await loadCards();

      toast.success('Card removido');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  useEffect(() => {
    loadCards();
  }, [id]);

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
            onChange={(e) => setNewCardTitle(e.target.value)}
          />

          <Button size="icon" onClick={handleCreateCard}>
            +
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-background p-3"
                >
                  <Skeleton className="h-5 w-full" />
                </div>
              ))
            ) : cards.length === 0 ? (
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
                    onConfirm={() => handleDeleteCard(card.id)}
                  >
                    <Button size="icon" variant="destructive">
                      ×
                    </Button>
                  </ConfirmDialog>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </CardComponent>
  );
}
