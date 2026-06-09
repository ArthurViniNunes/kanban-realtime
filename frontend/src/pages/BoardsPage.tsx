import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { boardsApi, type Board } from '@/api/boards.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadBoards() {
    try {
      setLoading(true);

      const data = await boardsApi.list();

      setBoards(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard() {
    try {
      setCreating(true);

      if (!title.trim()) return;

      await boardsApi.create(title);

      toast.success('Board criado');

      setTitle('');

      await loadBoards();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBoard(boardId: string) {
    try {
      await boardsApi.delete(boardId);

      toast.success('Board excluído');

      await loadBoards();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div>
      <PageHeader
        title="Meus Boards"
        description="Gerencie seus boards e organize seu trabalho."
      />

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Input
          value={title}
          placeholder="Nome do board"
          onChange={(e) => setTitle(e.target.value)}
          className="sm:max-w-md"
        />

        <Button onClick={handleCreateBoard} disabled={creating}>
          {creating ? 'Criando...' : 'Criar Board'}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          title="Nenhum board encontrado"
          description="Crie seu primeiro board para começar."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {boards.map((board) => (
            <Card key={board.id}>
              <CardHeader>
                <CardTitle className="break-words">{board.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                <Link to={`/boards/${board.id}`}>
                  <Button className="w-full">Abrir</Button>
                </Link>

                <ConfirmDialog
                  title="Excluir board"
                  description="Essa ação não pode ser desfeita. Todos os dados deste board serão perdidos. Deseja realmente excluí-lo?"
                  onConfirm={() => handleDeleteBoard(board.id)}
                >
                  <Button variant="destructive">Excluir</Button>
                </ConfirmDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
