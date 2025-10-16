// src/components/LazyComponents.jsx
import { lazy } from 'react'

// Lazy load de componentes pesados
export const AdminCodes = lazy(() => import('./admin/AdminCodes'))
export const ProjectDetail = lazy(() => import('./ProjectDetail'))
export const ProjectsList = lazy(() => import('./ProjectsList'))

// Exportar individualmente para facilitar imports
export default {
  AdminCodes,
  ProjectDetail,
  ProjectsList
}