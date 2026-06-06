import { useEffect, useState } from 'react';
import { Button } from './Button';
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
        background: '#f5f5f5',
        borderRadius: '8px',
        padding: '1rem',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h3>{title}</h3>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <input
          placeholder="Novo card"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          style={{
            flex: 1,
          }}
        />

        <Button onClick={handleCreateCard}>+</Button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{card.title}</span>

            <Button variant="danger" onClick={() => handleDeleteCard(card.id)}>
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
