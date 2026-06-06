import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Column as ColumnComponent } from '../components/Column';
import { columnsApi, type Column } from '../api/columns.api';
import { boardsApi } from '../api/boards.api';
import { Button } from '../components/Button';

export function BoardPage() {
  const { boardId } = useParams();

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
    if (!boardId) return;

    const boards = await boardsApi.list();

    const board = boards.find((board) => board.id === boardId);

    if (board) {
      setBoardTitle(board.title);
    }
  }

  useEffect(() => {
    loadColumns();
    loadBoardTitle();
  }, [boardId]);

  return (
    <div>
      <div
        style={{
          marginBottom: '1rem',
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
          }}
        >
          ← Voltar para Boards
        </Link>
      </div>

      <h1>{boardTitle || 'Carregando board...'}</h1>

      <input
        placeholder="Nova coluna"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Button onClick={handleCreateColumn}>Criar coluna</Button>

      <hr />

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        {columns.map((column) => (
          <div key={column.id}>
            <ColumnComponent id={column.id} title={column.title} />

            <Button
              variant="danger"
              onClick={() => handleDeleteColumn(column.id)}
            >
              Excluir coluna
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
