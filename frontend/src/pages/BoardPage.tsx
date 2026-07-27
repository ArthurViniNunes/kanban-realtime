import { useEffect, useRef, useState } from 'react';
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
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

export function BoardPage() {
  const { boardId } = useParams();

  const [boardNotFound, setBoardNotFound] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [boardTitle, setBoardTitle] = useState('');
  const [title, setTitle] = useState('');
  const [loadedBoardId, setLoadedBoardId] = useState<string | null>(null);

  const loading = loadedBoardId !== boardId;
  const [creating, setCreating] = useState(false);

  const columnsSnapshot = useRef<Column[]>([]);

  const dragStateRef = useRef<{
    cardId: string;
    initialColumnId: string;
    initialOrder: number;
    columnId: string;
    order: number;
  } | null>(null);

  const movePendingRef = useRef(false);

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

      setColumns((prev) => [
        ...prev,
        {
          ...newColumn,
          cards: newColumn.cards ?? [],
        },
      ]);

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

      <DragDropProvider
        onBeforeDragStart={(event) => {
          if (movePendingRef.current) {
            event.preventDefault();
          }
        }}
        onDragStart={(event) => {
          columnsSnapshot.current = structuredClone(columns);

          const { source } = event.operation;

          if (!isSortable(source)) {
            dragStateRef.current = null;
            return;
          }

          const cardId = String(source.id);

          const sourceColumn = columns.find((column) =>
            (column.cards ?? []).some((card) => card.id === cardId),
          );

          const sourceIndex =
            sourceColumn?.cards.findIndex((card) => card.id === cardId) ?? -1;

          if (!sourceColumn || sourceIndex === -1) {
            dragStateRef.current = null;
            return;
          }

          dragStateRef.current = {
            cardId,
            initialColumnId: sourceColumn.id,
            initialOrder: sourceIndex,
            columnId: sourceColumn.id,
            order: sourceIndex,
          };
        }}
        onDragOver={(event) => {
          const { source, target } = event.operation;

          if (!isSortable(source) || !target) {
            return;
          }

          const sourceCardId = String(source.id);

          event.preventDefault();

          const targetGroup = isSortable(target)
            ? target.group
            : target.type === 'column'
              ? target.id
              : undefined;

          if (typeof targetGroup !== 'string') {
            return;
          }

          setColumns((currentColumns) => {
            const sourceColumn = currentColumns.find((column) =>
              (column.cards ?? []).some((card) => card.id === sourceCardId),
            );

            const targetColumn = currentColumns.find(
              (column) => column.id === targetGroup,
            );

            if (!sourceColumn || !targetColumn) {
              return currentColumns;
            }

            const sourceIndex = (sourceColumn.cards ?? []).findIndex(
              (card) => card.id === sourceCardId,
            );

            if (sourceIndex === -1) {
              return currentColumns;
            }

            const targetIndex = isSortable(target)
              ? target.index
              : (targetColumn.cards?.length ?? 0);

            if (
              sourceColumn.id === targetColumn.id &&
              sourceIndex === targetIndex
            ) {
              return currentColumns;
            }

            if (sourceColumn.id === targetColumn.id) {
              const reorderedCards = [...(sourceColumn.cards ?? [])];
              const [movedCard] = reorderedCards.splice(sourceIndex, 1);

              if (!movedCard) {
                return currentColumns;
              }

              const insertionIndex = Math.max(
                0,
                Math.min(targetIndex, reorderedCards.length),
              );

              reorderedCards.splice(insertionIndex, 0, movedCard);

              if (dragStateRef.current?.cardId === movedCard.id) {
                dragStateRef.current = {
                  ...dragStateRef.current,
                  columnId: sourceColumn.id,
                  order: insertionIndex,
                };
              }

              return currentColumns.map((column) =>
                column.id === sourceColumn.id
                  ? {
                      ...column,
                      cards: reorderedCards.map((card, order) => ({
                        ...card,
                        order,
                      })),
                    }
                  : column,
              );
            }

            const sourceCards = [...(sourceColumn.cards ?? [])];
            const [movedCard] = sourceCards.splice(sourceIndex, 1);

            if (!movedCard) {
              return currentColumns;
            }

            const targetCards = [...(targetColumn.cards ?? [])];

            const insertionIndex = Math.max(
              0,
              Math.min(targetIndex, targetCards.length),
            );

            targetCards.splice(insertionIndex, 0, {
              ...movedCard,
              columnId: targetColumn.id,
            });

            if (dragStateRef.current?.cardId === movedCard.id) {
              dragStateRef.current = {
                ...dragStateRef.current,
                columnId: targetColumn.id,
                order: insertionIndex,
              };
            }

            return currentColumns.map((column) => {
              if (column.id === sourceColumn.id) {
                return {
                  ...column,
                  cards: sourceCards.map((card, order) => ({
                    ...card,
                    order,
                  })),
                };
              }

              if (column.id === targetColumn.id) {
                return {
                  ...column,
                  cards: targetCards.map((card, order) => ({
                    ...card,
                    order,
                  })),
                };
              }

              return column;
            });
          });
        }}
        onDragEnd={async (event) => {
          const dragState = dragStateRef.current;
          const previousColumns = columnsSnapshot.current;

          if (event.canceled || !event.operation.target) {
            setColumns(previousColumns);
            dragStateRef.current = null;
            return;
          }

          if (!dragState) {
            dragStateRef.current = null;
            return;
          }

          const positionChanged =
            dragState.initialColumnId !== dragState.columnId ||
            dragState.initialOrder !== dragState.order;

          if (!positionChanged) {
            dragStateRef.current = null;
            return;
          }

          movePendingRef.current = true;

          try {
            await cardsApi.move(
              dragState.cardId,
              dragState.columnId,
              dragState.order,
            );
          } catch (error) {
            setColumns(previousColumns);
            toast.error(getErrorMessage(error));
          } finally {
            movePendingRef.current = false;
            dragStateRef.current = null;
          }
        }}
      >
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {columns.length === 0 ? (
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
                    cards={column.cards ?? []}
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
      </DragDropProvider>
    </div>
  );
}
