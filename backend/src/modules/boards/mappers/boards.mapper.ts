export type CardDTO = {
  id: string;
  title: string;
  description?: string | null;
  columnId: string;
};

export type ColumnDTO = {
  id: string;
  title: string;
  order: number;
  cards: CardDTO[];
};

export type BoardDTO = {
  id: string;
  title: string;
  columns: ColumnDTO[];
};

type BoardWithRelations = {
  id: string;
  title: string;
  columns: {
    id: string;
    title: string;
    order: number;
    cards: {
      id: string;
      title: string;
      description: string | null;
      columnId: string;
    }[];
  }[];
};

export function toBoardDTO(board: BoardWithRelations): BoardDTO {
  return {
    id: board.id,
    title: board.title,
    columns: (board.columns ?? []).map((column) => ({
      id: column.id,
      title: column.title,
      order: column.order,
      cards: (column.cards ?? []).map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description ?? null,
        columnId: card.columnId,
      })),
    })),
  };
}
