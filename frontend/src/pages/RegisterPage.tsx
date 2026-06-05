import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await authService.register(name, email, password);

      alert('Usuário criado com sucesso!');

      navigate('/login');
    } catch {
      alert('Erro ao criar usuário');
    }
  }

  return (
    <div>
      <h1>Cadastro</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Criar conta</button>
      </form>
    </div>
  );
}
