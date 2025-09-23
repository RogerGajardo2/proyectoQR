// hooks/useOptimizedCarousel.js
import { useState, useRef, useCallback, useEffect } from 'react'

export function useOptimizedCarousel(itemsLength, autoPlayInterval = 6000) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef(null)
  const isHoveredRef = useRef(false)
  
  // Función para navegar a un índice específico
  const goToSlide = useCallback((index) => {
    const normalizedIndex = ((index % itemsLength) + itemsLength) % itemsLength
    setCurrentIndex(normalizedIndex)
  }, [itemsLength])
  
  // Funciones de navegación
  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])
  
  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])
  
  // Función para iniciar el timer
  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!isHoveredRef.current) {
      timerRef.current = setInterval(goToNext, autoPlayInterval)
    }
  }, [goToNext, autoPlayInterval])
  
  // Función para pausar el auto-play
  const pauseAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])
  
  // Manejar hover
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true
    pauseAutoPlay()
  }, [pauseAutoPlay])
  
  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false
    startAutoPlay()
  }, [startAutoPlay])
  
  // Efecto para el auto-play
  useEffect(() => {
    startAutoPlay()
    return () => pauseAutoPlay()
  }, [startAutoPlay, pauseAutoPlay])
  
  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])
  
  return {
    currentIndex,
    goToSlide,
    goToNext,
    goToPrevious,
    handleMouseEnter,
    handleMouseLeave,
    pauseAutoPlay,
    startAutoPlay
  }
}