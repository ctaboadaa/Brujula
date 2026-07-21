import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../hooks/useAuth'
import CompassRose from '../components/CompassRose'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'signUp') {
      setInfo('Revisa tu correo para confirmar tu cuenta.')
    }
  }

  return (
    <div className="bg-topo flex min-h-dvh items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-card border border-border-default bg-surface-elevated p-8 shadow-lg"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
          className="mb-6 flex flex-col items-center gap-3 text-center"
        >
          <CompassRose className="h-12 w-12 text-brand-primary" />
          <div>
            <h1 className="font-display text-2xl font-medium text-text-primary">Brújula</h1>
            <p className="font-display text-sm italic text-text-secondary">
              tu camino a la libertad financiera
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-secondary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-control border border-border-default bg-surface-secondary px-3 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </motion.div>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-sm text-success">
              {info}
            </p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse transition-colors hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {submitting ? 'Un momento…' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
          </motion.button>

          <button
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            className="w-full text-sm text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-text-primary"
          >
            {mode === 'signIn' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Entra'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
