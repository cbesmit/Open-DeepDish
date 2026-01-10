import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GeneradorPage from './pages/GeneradorPage';
import RecetasPage from './pages/RecetasPage';
import RecetaDetallePage from './pages/RecetaDetallePage';
import ConfigPage from './pages/ConfigPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas Protegidas */}
        <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
        }>
            <Route index element={<DashboardPage />} />
            <Route path="generador" element={<GeneradorPage />} />
            <Route path="recetas" element={<RecetasPage />} />
            <Route path="recetas/:id" element={<RecetaDetallePage />} />
            <Route path="config" element={<ConfigPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;