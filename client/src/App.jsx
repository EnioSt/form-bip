import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardMetrics from './pages/DashboardMetrics';
import UsersAdmin from './pages/UsersAdmin';
import PublicForm from './pages/PublicForm';

// Rota protegida para usuários autenticados
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/form/:token" element={<PublicForm />} />

          {/* Rotas Privadas (Dashboard de Métricas, Kanban e Usuários) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UsersAdmin />
              </ProtectedRoute>
            }
          />

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
