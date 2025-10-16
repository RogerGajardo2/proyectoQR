// src/hooks/useProjectCache.js
import { useState, useEffect, useCallback } from 'react'
import { getProject } from '../data/projectsData'
import { logger } from '../utils/logger'

const projectCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useProjectCache(projectId) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const loadProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar caché
      const cached = projectCache.get(projectId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        logger.info('Proyecto cargado desde caché', { projectId })
        setProject(cached.data)
        setLoading(false)
        return
      }
      
      // Cargar proyecto
      const projectData = getProject(projectId)
      
      if (projectData) {
        // Guardar en caché
        projectCache.set(projectId, {
          data: projectData,
          timestamp: Date.now()
        })
        setProject(projectData)
        logger.info('Proyecto cargado', { projectId })
      } else {
        throw new Error('Proyecto no encontrado')
      }
      
      setLoading(false)
    } catch (err) {
      logger.error('Error cargando proyecto', { projectId, error: err })
      setError(err.message)
      setLoading(false)
    }
  }, [projectId])
  
  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId, loadProject])
  
  const clearCache = useCallback(() => {
    projectCache.delete(projectId)
    logger.info('Caché de proyecto limpiada', { projectId })
  }, [projectId])
  
  return { 
    project, 
    loading, 
    error, 
    refetch: loadProject,
    clearCache 
  }
}

export default useProjectCache