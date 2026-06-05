import { useEffect, useState } from 'react';

import { cardsApi, type Card } from '../api/cards.api';

interface ColumnProps {
  id: string;
  title: string;
}

export function Column({ id, title }: ColumnProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardTitle, setNewCardTitle] = useState('');

  async function loadCards() {
    const data = await cardsApi.list(id);

    setCards(data);
  }

  async function handleCreateCard() {
    if (!newCardTitle.trim()) return;

    await cardsApi.create(id, newCardTitle, cards.length);

    setNewCardTitle('');

    await loadCards();
  }

  async function handleDeleteCard(cardId: string) {
    await cardsApi.delete(cardId);

    await loadCards();
  }

  useEffect(() => {
    loadCards();
  }, [id]);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        minWidth: '250px',
      }}
    >
      <h3>{title}</h3>

      <div>
        <input
          placeholder="Novo card"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
        />

        <button onClick={handleCreateCard}>Criar</button>
      </div>

      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            {card.title}

            <button onClick={() => handleDeleteCard(card.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
