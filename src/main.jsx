// src/main.jsx - MEJORADO CON SUPRESIÓN DE ERRORES DE EXTENSIONES
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { logger } from './utils/logger'

// ============================================
// SOLUCIÓN 1: Suprimir error conocido de Firebase Auth con extensiones
// ============================================
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  const originalAddListener = chrome.runtime.onMessage.addListener
  chrome.runtime.onMessage.addListener = function(...args) {
    try {
      return originalAddListener.apply(this, args)
    } catch (error) {
      // Ignorar errores de message channel cerrado (causados por extensiones del navegador)
      if (error.message && error.message.includes('message channel closed')) {
        console.debug('[ProconIng] Error de message channel ignorado (extensión del navegador)')
        return
      }
      throw error
    }
  }
}

// Suprimir warnings específicos de runtime en producción
if (import.meta.env.PROD) {
  const originalError = console.error
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || ''
    
    // Lista de errores conocidos que podemos ignorar
    const ignoredErrors = [
      'message channel closed',
      'runtime.lastError',
      'Extension context invalidated'
    ]
    
    if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
      console.debug('[ProconIng] Error conocido ignorado:', errorMessage.substring(0, 100))
      return
    }
    
    originalError.apply(console, args)
  }
}

// Error handler global
window.addEventListener('error', (event) => {
  // Ignorar errores de extensiones del navegador
  if (event.message && event.message.includes('Extension context')) {
    console.debug('[ProconIng] Error de extensión ignorado')
    event.preventDefault()
    return
  }
  
  logger.error('Error global capturado', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  // Ignorar rechazos relacionados con extensiones
  const reason = event.reason?.toString() || ''
  if (reason.includes('message channel') || reason.includes('Extension context')) {
    console.debug('[ProconIng] Promise rejection de extensión ignorada')
    event.preventDefault()
    return
  }
  
  logger.error('Promise rechazada sin catch', {
    reason: event.reason,
    promise: event.promise
  })
  
  // Prevenir el comportamiento por defecto solo para errores no críticos
  if (!reason.includes('Firebase') && !reason.includes('Network')) {
    event.preventDefault()
  }
})

// Performance monitoring (opcional)
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    
    logger.info('Performance metrics', {
      pageLoadTime,
      domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      resourcesLoaded: perfData.loadEventEnd - perfData.responseEnd
    })
  })
}

// Verificar soporte de navegador
const checkBrowserSupport = () => {
  const isSupported = 
    'fetch' in window &&
    'Promise' in window &&
    'IntersectionObserver' in window

  if (!isSupported) {
    logger.warn('Navegador antiguo detectado')
    
    // Mostrar mensaje de advertencia
    const warningDiv = document.createElement('div')
    warningDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fef3c7;
      color: #92400e;
      padding: 1rem;
      text-align: center;
      z-index: 99999;
      font-family: system-ui;
    `
    warningDiv.innerHTML = `
      <strong>⚠️ Navegador Desactualizado</strong><br>
      Para una mejor experiencia, actualiza tu navegador a la última versión.
    `
    document.body.prepend(warningDiv)
  }
}

checkBrowserSupport()

// Renderizar aplicación
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)

// Log de inicialización
logger.info('Aplicación inicializada', {
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || '1.1.0'
})

// Exportar para debugging en consola
if (import.meta.env.DEV) {
  window.__APP_DEBUG__ = {
    logger,
    version: '1.1.0',
    environment: import.meta.env.MODE
  }
  
  console.log('%c ProconIng App Loaded ', 'background: #4b5563; color: #fff; padding: 4px 8px; border-radius: 4px;')
  console.log('Debug tools available at window.__APP_DEBUG__')
}