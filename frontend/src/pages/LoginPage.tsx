import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
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
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Entrar</button>

      {error && <p>{error}</p>}
    </form>
  );
}
