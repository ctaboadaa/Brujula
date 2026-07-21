import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AppShell from './components/AppShell'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'

const RestablecerContrasena = lazy(() => import('./pages/RestablecerContrasena'))
const Resumen = lazy(() => import('./pages/Resumen'))
const Transacciones = lazy(() => import('./pages/Transacciones'))
const Patrimonio = lazy(() => import('./pages/Patrimonio'))
const Inversiones = lazy(() => import('./pages/Inversiones'))

function FullScreenLoader() {
  return <div className="flex min-h-dvh items-center justify-center text-text-secondary">Cargando…</div>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <ErrorBoundary>
        <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
      </ErrorBoundary>
    </AppShell>
  )
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
        path="/restablecer"
        element={
          loading ? (
            <FullScreenLoader />
          ) : (
            <Suspense fallback={<FullScreenLoader />}>
              <RestablecerContrasena />
            </Suspense>
          )
        }
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
    <ErrorBoundary>
      <BrowserRouter basename="/Brujula">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
