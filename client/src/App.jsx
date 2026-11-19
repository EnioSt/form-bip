import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';

// Páginas carregadas sob demanda (cada uma vira um chunk separado no build)
const lazyPage = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));

const Login = lazyPage(() => import('./pages/Login'), 'Login');
const Dashboard = lazyPage(() => import('./pages/Dashboard'), 'Dashboard');
const DashboardMetrics = lazyPage(() => import('./pages/DashboardMetrics'), 'DashboardMetrics');
const UsersAdmin = lazyPage(() => import('./pages/UsersAdmin'), 'UsersAdmin');
const PublicForm = lazyPage(() => import('./pages/PublicForm'), 'PublicForm');
const NotFound = lazyPage(() => import('./pages/NotFound'), 'NotFound');

// Rota protegida para usuários autenticados
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen message="Carregando..." />}>
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

            {/* Raiz leva ao painel (ou ao login, via ProtectedRoute) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Qualquer outro endereço */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};
