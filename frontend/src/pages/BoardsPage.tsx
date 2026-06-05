import { useEffect, useState } from 'react';

import { boardsApi, type Board } from '../api/boards.api';

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
      <h1>Boards</h1>

      <input
        value={title}
        placeholder="Nome do board"
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={handleCreateBoard}>Criar</button>

      <ul>
        {boards.map((board) => (
          <li key={board.id}>
            {board.title}

            <button onClick={() => handleDeleteBoard(board.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
