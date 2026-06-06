import ReactDOM from 'react-dom/client';

import './index.css';

import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>,
);
