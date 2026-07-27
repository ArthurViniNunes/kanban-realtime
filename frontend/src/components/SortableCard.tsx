import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';

import type { Card } from '@/api/cards.api';
import { Button } from './ui/button';
import { ConfirmDialog } from './ConfirmDialog';

interface SortableCardProps {
  card: Card;
  index: number;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => Promise<void>;
}

export function SortableCard({
  card,
  index,
  columnId,
  onDelete,
}: SortableCardProps) {
  const { ref, isDragSource, isDropTarget } = useSortable({
    id: card.id,
    index,
    group: columnId,
    type: 'card',
    accept: 'card',
    data: {
      cardId: card.id,
      columnId,
    },
  });

  return (
    <div
      ref={ref}
      className={[
        'flex items-center gap-2 rounded-md border bg-background p-3',
        'cursor-grab touch-none active:cursor-grabbing',
        isDragSource ? 'opacity-50' : '',
        isDropTarget ? 'ring-2 ring-primary' : '',
      ].join(' ')}
    >
      <GripVertical
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-muted-foreground"
      />

      <span className="min-w-0 flex-1 break-words">{card.title}</span>

      <ConfirmDialog
        title="Excluir cartão"
        description="Esta ação não pode ser desfeita."
        onConfirm={() => onDelete(columnId, card.id)}
      >
        <Button size="icon" variant="destructive">
          ×
        </Button>
      </ConfirmDialog>
    </div>
  );
}
