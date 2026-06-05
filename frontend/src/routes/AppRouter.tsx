import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { BoardsPage } from '../pages/BoardsPage';
import { BoardPage } from '../pages/BoardPage';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <BoardsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <ProtectedRoute>
              <Layout>
                <BoardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
