import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { boardsApi, type Board } from '../api/boards.api';
import { Button } from '../components/Button';

export function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');

  async function loadBoards() {
    const data = await boardsApi.list();

    setBoards(data);
  }

  async function handleCreateBoard() {
    if (!title.trim()) return;

    await boardsApi.create(title);

    setTitle('');

    await loadBoards();
  }

  async function handleDeleteBoard(boardId: string) {
    await boardsApi.delete(boardId);

    await loadBoards();
  }

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div>
      <h1>Meus Boards</h1>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          value={title}
          placeholder="Nome do board"
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '0.75rem',
            flex: 1,
            minWidth: '220px',
          }}
        />

        <Button onClick={handleCreateBoard}>Criar Board</Button>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {boards.map((board) => (
          <div
            key={board.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              flex: '1 1 250px',
              maxWidth: '350px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Link
              to={`/boards/${board.id}`}
              style={{
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                overflowWrap: 'break-word',
              }}
            >
              {board.title}
            </Link>

            <Button
              variant="danger"
              onClick={() => handleDeleteBoard(board.id)}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
