import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Column as ColumnComponent } from '../components/Column';
import { columnsApi, type Column } from '../api/columns.api';
import { boardsApi } from '../api/boards.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotFoundPage } from './NotFoundPage';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';

export function BoardPage() {
  const { boardId } = useParams();
  const [boardNotFound, setBoardNotFound] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [boardTitle, setBoardTitle] = useState('');
  const [title, setTitle] = useState('');

  async function loadColumns() {
    if (!boardId) return;

    const data = await columnsApi.list(boardId);

    setColumns(data);
  }

  async function handleCreateColumn() {
    if (!boardId || !title.trim()) return;

    await columnsApi.create(boardId, title, columns.length);

    setTitle('');

    await loadColumns();
  }

  async function handleDeleteColumn(columnId: string) {
    await columnsApi.delete(columnId);

    await loadColumns();
  }

  async function loadBoardTitle() {
    const boards = await boardsApi.list();

    const board = boards.find((board) => board.id === boardId);

    if (!board) {
      setBoardNotFound(true);
      return;
    }

    setBoardTitle(board.title);
  }

  useEffect(() => {
    loadColumns();
    loadBoardTitle();
  }, [boardId]);

  if (boardNotFound) {
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

      <PageHeader
        title={boardTitle || 'Carregando board...'}
        description="Gerencie colunas e cards deste board."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Nova coluna"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="sm:max-w-md"
        />

        <Button onClick={handleCreateColumn}>Criar coluna</Button>
      </div>

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
                <ColumnComponent id={column.id} title={column.title} />

                <Button
                  variant="destructive"
                  onClick={() => handleDeleteColumn(column.id)}
                >
                  Excluir coluna
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
