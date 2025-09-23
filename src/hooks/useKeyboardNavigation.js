// hooks/useKeyboardNavigation.js
import { useEffect } from 'react'

export function useKeyboardNavigation(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const handler = handlers[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}

// hooks/useOptimizedScroll.js
import { useCallback } from 'react'

export function useOptimizedScroll() {
  const scrollToElement = useCallback((elementId, offset = 12) => {
    const element = document.getElementById(elementId)
    if (!element) return
    
    const header = document.querySelector('header')
    const headerHeight = header?.getBoundingClientRect().height || 0
    const targetPosition = window.pageYOffset + 
      element.getBoundingClientRect().top - 
      (headerHeight + offset)
    
    // Usar requestAnimationFrame para mejor performance
    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    })
  }, [])
  
  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [])
  
  return {
    scrollToElement,
    scrollToTop
  }
}