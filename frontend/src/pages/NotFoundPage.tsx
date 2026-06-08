import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-8xl font-bold tracking-tighter">404</h1>

      <h2 className="text-2xl font-semibold">Página não encontrada</h2>

      <p className="max-w-md text-muted-foreground">
        Parece que você tentou acessar uma página que não existe.
      </p>

      <Button asChild>
        <Link to="/">Voltar para o início</Link>
      </Button>
    </div>
  );
}
