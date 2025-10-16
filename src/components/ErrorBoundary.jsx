// src/components/ErrorBoundary.jsx - Error Boundary Mejorado
import { Component } from 'react'
import { logger } from '../utils/logger'
import Button from './ui/Button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de fallback
    return { 
      hasError: true,
      error 
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log del error
    logger.error('Error boundary capturó un error', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })

    // Actualizar el estado con la información del error
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Si hay demasiados errores, podría ser un loop infinito
    if (this.state.errorCount > 5) {
      logger.error('Demasiados errores detectados, posible loop infinito')
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    // Recargar la página si es necesario
    if (this.props.resetOnError) {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    window.location.href = '/#/inicio'
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icono de error */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo salió mal
            </h1>

            {/* Descripción */}
            <p className="text-gray-600 mb-6">
              Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg text-xs">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Detalles técnicos
                </summary>
                <p className="text-red-600 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full justify-center"
              >
                Intentar nuevamente
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full justify-center"
              >
                Volver al inicio
              </Button>

              {/* Botón para reportar (opcional) */}
              {this.props.showReportButton && (
                <button
                  onClick={() => {
                    // Aquí podrías abrir un modal o enviar a un sistema de tickets
                    const subject = encodeURIComponent('Reporte de Error - ProconIng')
                    const body = encodeURIComponent(
                      `Error: ${this.state.error?.toString() || 'Desconocido'}\n\n` +
                      `URL: ${window.location.href}\n` +
                      `Fecha: ${new Date().toISOString()}`
                    )
                    window.location.href = `mailto:contacto@proconing.cl?subject=${subject}&body=${body}`
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reportar este error
                </button>
              )}
            </div>

            {/* Información adicional */}
            <p className="text-xs text-gray-400 mt-6">
              ID de error: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      )
    }

    // Renderizar children normalmente si no hay error
    return this.props.children
  }
}

// Error Boundary más pequeño para componentes específicos
export class MiniErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logger.error(`Error en ${this.props.componentName || 'componente'}`, {
      error: error.toString(),
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            Error al cargar {this.props.componentName || 'este componente'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-red-600 text-xs underline mt-2"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary