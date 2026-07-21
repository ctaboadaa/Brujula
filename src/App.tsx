import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Resumen from './pages/Resumen'
import Transacciones from './pages/Transacciones'
import Patrimonio from './pages/Patrimonio'
import Inversiones from './pages/Inversiones'

function FullScreenLoader() {
  return <div className="flex min-h-dvh items-center justify-center text-text-secondary">Cargando…</div>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

function AppRoutes() {
  const { session, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? <FullScreenLoader /> : session ? <Navigate to="/resumen" replace /> : <Login />}
      />
      <Route
        path="/resumen"
        element={
          <ProtectedRoute>
            <Resumen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transacciones"
        element={
          <ProtectedRoute>
            <Transacciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patrimonio"
        element={
          <ProtectedRoute>
            <Patrimonio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inversiones"
        element={
          <ProtectedRoute>
            <Inversiones />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/resumen" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter basename="/Brujula">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
