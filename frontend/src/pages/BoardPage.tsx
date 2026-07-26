import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Column as ColumnComponent } from '@/components/Column';
import { columnsApi, type Column } from '@/api/columns.api';
import { boardsApi } from '@/api/boards.api';
import { cardsApi } from '@/api/cards.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotFoundPage } from './NotFoundPage';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function BoardPage() {
  const { boardId } = useParams();

  const [boardNotFound, setBoardNotFound] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [boardTitle, setBoardTitle] = useState('');
  const [title, setTitle] = useState('');
  const [loadedBoardId, setLoadedBoardId] = useState<string | null>(null);

  const loading = loadedBoardId !== boardId;
  const [creating, setCreating] = useState(false);

  async function handleCreateColumn() {
    setCreating(true);
    try {
      if (!boardId || !title.trim()) return;

      const newColumn = await columnsApi.create(
        boardId,
        title,
        columns?.length ?? 0,
      );

      setTitle('');

      setColumns((prev) => [...prev, newColumn]);

      toast.success('Coluna criada');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteColumn(columnId: string) {
    try {
      await columnsApi.delete(columnId);

      setColumns((prev) => prev.filter((c) => c.id !== columnId));

      toast.success('Coluna removida');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleCreateCard(
    columnId: string,
    cardTitle: string,
    order: number,
  ): Promise<boolean> {
    try {
      const newCard = await cardsApi.create(columnId, cardTitle, order);

      setColumns((currentColumns) =>
        currentColumns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cards: [...column.cards, newCard],
              }
            : column,
        ),
      );

      toast.success('Card criado');

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));

      return false;
    }
  }

  async function handleDeleteCard(columnId: string, cardId: string) {
    try {
      await cardsApi.delete(cardId);

      setColumns((currentColumns) =>
        currentColumns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                cards: column.cards
                  .filter((card) => card.id !== cardId)
                  .map((card, order) => ({
                    ...card,
                    order,
                  })),
              }
            : column,
        ),
      );

      toast.success('Card removido');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  useEffect(() => {
    if (!boardId) return;

    const currentBoardId: string = boardId;
    let isActive = true;

    async function loadBoard() {
      try {
        const board = await boardsApi.getById(currentBoardId);

        if (!isActive) return;

        setBoardTitle(board.title);
        setColumns(board.columns ?? []);
        setBoardNotFound(false);
      } catch {
        if (isActive) {
          setBoardNotFound(true);
        }
      } finally {
        if (isActive) {
          setLoadedBoardId(currentBoardId);
        }
      }
    }

    void loadBoard();

    return () => {
      isActive = false;
    };
  }, [boardId]);

  if (!boardId) {
    return <NotFoundPage />;
  }

  if (boardNotFound && !loading) {
    return <NotFoundPage />;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar para Boards
        </Link>
      </div>

      {loading ? (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      ) : (
        <PageHeader
          title={boardTitle}
          description="Gerencie colunas e cards deste board."
        />
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Nova coluna"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="sm:max-w-md"
        />

        <Button onClick={handleCreateColumn} disabled={creating}>
          {creating ? 'Criando...' : 'Criar coluna'}
        </Button>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {(columns?.length ?? 0) === 0 ? (
          <EmptyState
            title="Nenhuma coluna criada"
            description="Crie sua primeira coluna para começar."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {columns.map((column) => (
              <div key={column.id} className="flex shrink-0 flex-col gap-2">
                <ColumnComponent
                  id={column.id}
                  title={column.title}
                  cards={column.cards}
                  onCreateCard={handleCreateCard}
                  onDeleteCard={handleDeleteCard}
                />

                <ConfirmDialog
                  title="Excluir coluna"
                  description="Todos os cards desta coluna serão removidos permanentemente."
                  onConfirm={() => handleDeleteColumn(column.id)}
                >
                  <Button variant="destructive">Excluir coluna</Button>
                </ConfirmDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
