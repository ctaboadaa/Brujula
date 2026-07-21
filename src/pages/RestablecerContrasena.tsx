import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CompassRose from '../components/CompassRose'

export default function RestablecerContrasena() {
  const { session, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDone(true)
  }

  return (
    <div className="bg-topo flex min-h-dvh items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-card border border-border-default bg-surface-elevated p-8 shadow-lg"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <CompassRose className="h-12 w-12 text-brand-primary" />
          <h1 className="font-display text-2xl font-medium text-text-primary">Nueva contraseña</h1>
        </div>

        {done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-text-secondary">Tu contraseña se actualizó correctamente.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate('/resumen')}
              className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse"
            >
              Ir a la app
            </motion.button>
          </div>
        ) : !session ? (
          <p className="text-sm text-text-secondary">
            Este link de recuperación no es válido o ya expiró. Pide uno nuevo desde la pantalla de inicio de sesión.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-secondary">
                Contraseña nueva
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-text-secondary">
                Confirma la contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse disabled:opacity-50"
            >
              {submitting ? 'Guardando…' : 'Guardar contraseña'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
