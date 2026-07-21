import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Compass, ArrowsLeftRight, Scales, ChartLineUp } from '@phosphor-icons/react'

const NAV_ITEMS = [
  { to: '/resumen', label: 'Resumen', Icon: Compass },
  { to: '/transacciones', label: 'Movimientos', Icon: ArrowsLeftRight },
  { to: '/patrimonio', label: 'Patrimonio', Icon: Scales },
  { to: '/inversiones', label: 'Inversiones', Icon: ChartLineUp },
]

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-topo flex min-h-dvh flex-col">
      <main className="flex-1 pb-24">{children}</main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 border-t border-border-default bg-surface-elevated/95 backdrop-blur-sm"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                    isActive ? 'text-brand-primary' : 'text-text-tertiary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isActive ? 'bg-brand-primary-soft' : ''
                      }`}
                    >
                      <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
