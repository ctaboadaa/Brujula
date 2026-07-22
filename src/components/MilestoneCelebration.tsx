import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flag } from '@phosphor-icons/react'
import { formatCurrency } from '../lib/format'

interface MilestoneCelebrationProps {
  milestone: number | null
  onDismiss: () => void
}

const CONFETTI_COLORS = ['var(--brand-primary)', 'var(--brand-secondary)', 'var(--status-success)']

function useConfettiPieces(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 220,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.15,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        isCircle: i % 2 === 0,
      })),
    [count],
  )
}

export default function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const confetti = useConfettiPieces(18)
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <AnimatePresence>
      {milestone !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-surface-overlay"
            onClick={onDismiss}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Nuevo hito de patrimonio alcanzado"
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-card border border-border-default bg-surface-elevated p-6 text-center shadow-lg"
          >
            {!prefersReducedMotion &&
              confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{ x: c.x, y: 140, opacity: 0, rotate: c.rotate }}
                  transition={{ duration: 1.1, delay: c.delay, ease: 'easeOut' }}
                  style={{ background: c.color }}
                  className={`pointer-events-none absolute left-1/2 top-8 h-2.5 w-2.5 ${c.isCircle ? 'rounded-full' : 'rounded-sm'}`}
                />
              ))}

            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-soft text-brand-secondary">
              <Flag size={28} weight="fill" />
            </div>

            <p className="mt-4 font-display text-lg font-medium text-text-primary">¡Nuevo hito en tu camino!</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-brand-primary">
              {formatCurrency(milestone)}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Tu patrimonio neto superó esta marca. Sigue así, vas en la ruta correcta.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onDismiss}
              className="mt-5 w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse"
            >
              Seguir
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
