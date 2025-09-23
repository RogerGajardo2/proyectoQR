// hooks/useLazyLoading.js
import { useState, useEffect, useRef, useCallback } from 'react'

export function useLazyLoading(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    
    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }
    
    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold])
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])
  
  return {
    elementRef,
    isInView,
    isLoaded,
    handleLoad,
    shouldLoad: isInView
  }
}