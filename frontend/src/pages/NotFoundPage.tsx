import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5rem',
        gap: '1rem',
      }}
    >
      <h1>404</h1>

      <h2>Página não encontrada</h2>

      <p>A rota informada não existe.</p>

      <Link to="/">Voltar para o início</Link>
    </div>
  );
}
