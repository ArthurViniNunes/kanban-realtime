import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError('');

      await login(email, password);

      navigate('/');
    } catch {
      setError('Credenciais inválidas');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '400px',
          margin: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            margin: 0,
          }}
        >
          Kanban Realtime
        </h1>

        <p
          style={{
            textAlign: 'center',
            margin: 0,
          }}
        >
          Realize login para acessar seus boards e começar a organizar suas
          tarefas!
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '0.75rem',
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '0.75rem',
          }}
        />

        <Button type="submit">Entrar</Button>

        {error && (
          <p
            style={{
              color: 'red',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            textAlign: 'center',
          }}
        >
          <span>Não possui conta? </span>

          <Link to="/register">Criar conta</Link>
        </div>
      </form>
    </div>
  );
}
