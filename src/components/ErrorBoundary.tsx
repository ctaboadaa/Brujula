import { Component, type ErrorInfo, type ReactNode } from 'react'
import CompassRose from './CompassRose'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error inesperado en Brújula:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="bg-topo flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-card border border-border-default bg-surface-elevated p-8 text-center shadow-lg">
          <CompassRose className="mx-auto mb-4 h-12 w-12 text-brand-primary" />
          <h1 className="mb-2 font-display text-xl font-medium text-text-primary">Algo salió mal</h1>
          <p className="mb-6 text-sm text-text-secondary">
            Tuvimos un problema inesperado. Tus datos están seguros — intenta recargar la página.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full rounded-control bg-brand-primary py-2.5 font-medium text-text-inverse"
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }
}
