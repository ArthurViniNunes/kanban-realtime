import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authService } from '../services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError('');

      await authService.register(name, email, password);

      alert('Usuário criado com sucesso!');

      navigate('/login');
    } catch {
      setError('Erro ao criar usuário');
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
          width: '400px',
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
          Crie sua conta para acessar seus boards e começar a organizar suas
          tarefas!
        </p>

        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '0.75rem',
          }}
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '0.75rem',
          }}
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '0.75rem',
          }}
        />

        <button type="submit">Criar conta</button>

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
          <span>Já possui conta? </span>

          <Link to="/login">Entrar</Link>
        </div>
      </form>
    </div>
  );
}
