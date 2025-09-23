// hooks/useImagePreloader.js
import { useEffect, useState } from 'react'

export function useImagePreloader(imageUrls, priority = false) {
  const [loadedImages, setLoadedImages] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!imageUrls.length) {
      setIsLoading(false)
      return
    }
    
    let loadedCount = 0
    const totalImages = imageUrls.length
    
    const preloadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url))
          loadedCount++
          if (loadedCount === totalImages) {
            setIsLoading(false)
          }
          resolve()
        }
        img.onerror = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setIsLoading(false)
          }
          resolve()
        }
        img.src = url
      })
    }
    
    // Si es priority, cargar las primeras imágenes inmediatamente
    if (priority) {
      const priorityImages = imageUrls.slice(0, 3)
      const remainingImages = imageUrls.slice(3)
      
      Promise.all(priorityImages.map(preloadImage)).then(() => {
        // Cargar el resto con delay
        setTimeout(() => {
          remainingImages.forEach(preloadImage)
        }, 100)
      })
    } else {
      imageUrls.forEach(preloadImage)
    }
  }, [imageUrls, priority])
  
  return {
    loadedImages,
    isLoading,
    isImageLoaded: (url) => loadedImages.has(url)
  }
}