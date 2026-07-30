import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Column as ColumnComponent } from '@/components/Column';
import { columnsApi, type Column } from '@/api/columns.api';
import { boardsApi } from '@/api/boards.api';
import { cardsApi, type Card } from '@/api/cards.api';
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
import { connectSocket, disconnectSocket, socket } from '@/socket/socket';

import type {
  BoardAccessRevokedPayload,
  BoardMemberAddedPayload,
  BoardMemberRemovedPayload,
  BoardMemberRoleUpdatedPayload,
  CardDeletedPayload,
  CardMovedPayload,
  PresenceUpdatedPayload,
} from '@/socket/socket-contracts';

import { useAuth } from '@/hooks/useAuth';
import {
  boardMemberApi,
  type BoardMember,
  type ManageableBoardRole,
} from '@/api/board-members.api';
import { BoardMembersPanel } from '@/components/BoardMembersPanel';

export function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const [presence, setPresence] = useState<PresenceUpdatedPayload | null>(null);

  const [members, setMembers] = useState<BoardMember[]>([]);

  const onlineUsers =
    presence && presence.boardId === boardId ? presence.users : [];

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

      setColumns((currentColumns) =>
        upsertColumn(currentColumns, {
          ...newColumn,
          cards: newColumn.cards ?? [],
        }),
      );

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

      setColumns((currentColumns) => removeColumn(currentColumns, columnId));

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

      setColumns((currentColumns) => upsertCard(currentColumns, newCard));

      toast.success('Card criado');

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));

      return false;
    }
  }

  async function handleDeleteCard(_columnId: string, cardId: string) {
    try {
      await cardsApi.delete(cardId);

      setColumns((currentColumns) => removeCard(currentColumns, cardId));

      toast.success('Card removido');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleAddMember(
    email: string,
    role: ManageableBoardRole,
  ): Promise<boolean> {
    if (!boardId) return false;

    try {
      const newMember = await boardMemberApi.add(boardId, {
        email,
        role,
      });

      setMembers((currentMembers) => {
        const withoutDuplicate = currentMembers.filter(
          (member) => member.id !== newMember.id,
        );

        return [...withoutDuplicate, newMember];
      });

      toast.success('Membro adicionado');

      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  }

  async function handleUpdateMemberRole(
    memberId: string,
    role: ManageableBoardRole,
  ) {
    if (!boardId) return;

    try {
      const updateMember = await boardMemberApi.updateRole(boardId, memberId, {
        role,
      });

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === updateMember.id ? updateMember : member,
        ),
      );
      toast.success('Função atualizada');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!boardId) return;

    try {
      await boardMemberApi.remove(boardId, memberId);
      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== memberId),
      );
      toast.success('Membro removido');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function upsertCard(columns: Column[], card: Card): Column[] {
    const targetExists = columns.some((column) => column.id === card.columnId);

    if (!targetExists) {
      return columns;
    }

    return columns.map((column) => {
      if (column.id !== card.columnId) {
        return column;
      }

      const cardsWithoutDuplicate = (column.cards ?? []).filter(
        (currentCard) => currentCard.id !== card.id,
      );

      const insertionIndex = Math.max(
        0,
        Math.min(card.order, cardsWithoutDuplicate.length),
      );

      cardsWithoutDuplicate.splice(insertionIndex, 0, card);

      return {
        ...column,
        cards: cardsWithoutDuplicate.map((currentCard, order) => ({
          ...currentCard,
          columnId: column.id,
          order,
        })),
      };
    });
  }

  function removeCard(columns: Column[], cardId: string): Column[] {
    return columns.map((column) => {
      const currentCards = column.cards ?? [];

      if (!currentCards.some((card) => card.id === cardId)) {
        return column;
      }

      return {
        ...column,
        cards: currentCards
          .filter((card) => card.id !== cardId)
          .map((card, order) => ({
            ...card,
            order,
          })),
      };
    });
  }

  function upsertColumn(columns: Column[], newColumn: Column): Column[] {
    const alreadyExists = columns.some((column) => column.id === newColumn.id);

    if (alreadyExists) {
      return columns;
    }

    return [
      ...columns,
      {
        ...newColumn,
        cards: newColumn.cards ?? [],
      },
    ].sort(
      (left, right) =>
        left.order - right.order || left.id.localeCompare(right.id),
    );
  }

  function removeColumn(columns: Column[], columnId: string): Column[] {
    return columns.filter((column) => column.id !== columnId);
  }

  useEffect(() => {
    if (!boardId) return;

    const currentBoardId: string = boardId;
    let isActive = true;

    async function loadBoard() {
      try {
        const [board, boardMembers] = await Promise.all([
          boardsApi.getById(currentBoardId),
          boardMemberApi.list(currentBoardId),
        ]);

        if (!isActive) return;

        setBoardTitle(board.title);
        setColumns(board.columns ?? []);
        setMembers(boardMembers);
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

  // Socket.io event listeners
  useEffect(() => {
    if (!boardId) return;

    const currentBoardId = boardId;

    function handleConnect() {
      socket.emit('board:join', currentBoardId);

      socket.emit('board:sync', currentBoardId, (response) => {
        if ('error' in response) {
          if (response.error === 'Unauthorized') {
            toast.error('Você não possui mais acesso a este board');

            navigate('/', {
              replace: true,
            });

            return;
          }

          if (response.error === 'Board not found') {
            setBoardNotFound(true);
            return;
          }

          toast.error(response.error);
          return;
        }

        setBoardTitle(response.title);
        setColumns(response.columns);
        setMembers(response.members);
        setBoardNotFound(false);
      });
    }

    function handleCardMoved({ card, toColumnId }: CardMovedPayload) {
      setColumns((currentColumns) => {
        const targetExists = currentColumns.some(
          (column) => column.id === toColumnId,
        );

        if (!targetExists) {
          return currentColumns;
        }

        const columnsWithoutCard = currentColumns.map((column) => {
          const cardsWithoutMovedCard = (column.cards ?? []).filter(
            (currentCard) => currentCard.id !== card.id,
          );

          if (cardsWithoutMovedCard.length === (column.cards ?? []).length) {
            return column;
          }

          return {
            ...column,
            cards: cardsWithoutMovedCard.map((currentCard, order) => ({
              ...currentCard,
              order,
            })),
          };
        });

        return columnsWithoutCard.map((column) => {
          if (column.id !== toColumnId) {
            return column;
          }

          const targetCards = [...(column.cards ?? [])];

          const insertionIndex = Math.max(
            0,
            Math.min(card.order, targetCards.length),
          );

          targetCards.splice(insertionIndex, 0, {
            ...card,
            columnId: toColumnId,
          });

          return {
            ...column,
            cards: targetCards.map((currentCard, order) => ({
              ...currentCard,
              columnId: toColumnId,
              order,
            })),
          };
        });
      });
    }

    function handleCardCreated(card: Card) {
      setColumns((currentColumns) => upsertCard(currentColumns, card));
    }

    function handleCardDeleted({ cardId }: CardDeletedPayload) {
      setColumns((currentColumns) => removeCard(currentColumns, cardId));
    }

    function handleColumnCreated(column: Column) {
      setColumns((currentColumns) => upsertColumn(currentColumns, column));
    }

    function handleColumnDeleted({ columnId }: { columnId: string }) {
      setColumns((currentColumns) => removeColumn(currentColumns, columnId));
    }

    function handleMemberAdded({
      boardId: eventBoardId,
      member,
    }: BoardMemberAddedPayload) {
      if (eventBoardId !== currentBoardId) return;

      setMembers((currentMembers) => {
        const withoutDuplicate = currentMembers.filter(
          (currentMember) => currentMember.id !== member.id,
        );

        return [...withoutDuplicate, member];
      });
    }

    function handleMemberRoleUpdated({
      boardId: eventBoardId,
      member,
    }: BoardMemberRoleUpdatedPayload) {
      if (eventBoardId !== currentBoardId) return;

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === member.id ? member : currentMember,
        ),
      );
    }

    function handleMemberRemoved({
      boardId: eventBoardId,
      memberId,
    }: BoardMemberRemovedPayload) {
      if (eventBoardId !== currentBoardId) return;

      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.id !== memberId),
      );
    }

    function handleAccessRevoked({
      boardId: revokedBoardId,
    }: BoardAccessRevokedPayload) {
      if (revokedBoardId !== currentBoardId) return;

      toast.error('Seu acesso a este board foi removido');

      navigate('/', {
        replace: true,
      });
    }

    function handlePresenceUpdated(payload: PresenceUpdatedPayload) {
      if (payload.boardId === currentBoardId) {
        setPresence(payload);
      }
    }

    socket.on('connect', handleConnect);

    socket.on('card:moved', handleCardMoved);
    socket.on('card:created', handleCardCreated);
    socket.on('card:deleted', handleCardDeleted);

    socket.on('column:created', handleColumnCreated);
    socket.on('column:deleted', handleColumnDeleted);

    socket.on('presence:update', handlePresenceUpdated);

    socket.on('member:added', handleMemberAdded);
    socket.on('member:role-updated', handleMemberRoleUpdated);
    socket.on('member:removed', handleMemberRemoved);
    socket.on('board:access-revoked', handleAccessRevoked);

    const canConnect = connectSocket();

    if (!canConnect) {
      socket.off('connect', handleConnect);

      socket.off('card:moved', handleCardMoved);
      socket.off('card:created', handleCardCreated);
      socket.off('card:deleted', handleCardDeleted);

      socket.off('column:created', handleColumnCreated);
      socket.off('column:deleted', handleColumnDeleted);

      socket.off('presence:update', handlePresenceUpdated);

      socket.off('member:added', handleMemberAdded);
      socket.off('member:role-updated', handleMemberRoleUpdated);
      socket.off('member:removed', handleMemberRemoved);
      socket.off('board:access-revoked', handleAccessRevoked);
      return;
    }

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      if (socket.connected) {
        socket.emit('board:leave', currentBoardId);
      }

      socket.off('connect', handleConnect);

      socket.off('card:moved', handleCardMoved);
      socket.off('card:created', handleCardCreated);
      socket.off('card:deleted', handleCardDeleted);

      socket.off('column:created', handleColumnCreated);
      socket.off('column:deleted', handleColumnDeleted);

      socket.off('presence:update', handlePresenceUpdated);

      socket.off('member:added', handleMemberAdded);
      socket.off('member:role-updated', handleMemberRoleUpdated);
      socket.off('member:removed', handleMemberRemoved);
      socket.off('board:access-revoked', handleAccessRevoked);

      disconnectSocket();
    };
  }, [boardId, navigate]);

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

      {!loading && presence?.boardId === boardId && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {onlineUsers.length}{' '}
          {onlineUsers.length === 1 ? 'usuário online' : 'usuários online'}
        </div>
      )}

      {!loading && user && (
        <div className="mb-6">
          <BoardMembersPanel
            members={members}
            currentUserId={user.id}
            onAdd={handleAddMember}
            onUpdateRole={handleUpdateMemberRole}
            onRemove={handleRemoveMember}
          />
        </div>
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
