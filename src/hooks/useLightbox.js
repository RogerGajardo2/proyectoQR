// hooks/useLightbox.js
import { useState, useCallback, useEffect } from 'react'

export function useLightbox() {
  const [lightboxImage, setLightboxImage] = useState(null)
  
  const openLightbox = useCallback((image, caption) => {
    setLightboxImage({ img: image, caption })
  }, [])
  
  const closeLightbox = useCallback(() => {
    setLightboxImage(null)
  }, [])
  
  // Manejar tecla ESC y scroll lock
  useEffect(() => {
    if (!lightboxImage) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxImage, closeLightbox])
  
  return {
    lightboxImage,
    openLightbox,
    closeLightbox,
    isOpen: !!lightboxImage
  }
}