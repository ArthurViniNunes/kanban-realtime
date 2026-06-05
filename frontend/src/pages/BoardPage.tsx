import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Column as ColumnComponent } from '../components/Column';
import { columnsApi, type Column } from '../api/columns.api';

export function BoardPage() {
  const { boardId } = useParams();

  const [columns, setColumns] = useState<Column[]>([]);
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

  useEffect(() => {
    loadColumns();
  }, [boardId]);

  return (
    <div>
      <h1>Board</h1>

      <input
        placeholder="Nova coluna"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleCreateColumn}>Criar coluna</button>

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

            <button onClick={() => handleDeleteColumn(column.id)}>
              Excluir coluna
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
