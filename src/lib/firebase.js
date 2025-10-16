// src/lib/firebase.js - VERSIÓN MEJORADA CON FIRESTORE
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { logger } from '../utils/logger'

// Validar variables de entorno
const validateEnvVariable = (key, value) => {
  if (!value || value.trim() === '') {
    throw new Error(`Variable de entorno faltante: ${key}`)
  }
  return value.trim()
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: validateEnvVariable('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: validateEnvVariable('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: validateEnvVariable('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: validateEnvVariable('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: validateEnvVariable('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: validateEnvVariable('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID)
}

// Inicializar Firebase
let app
let auth
let db

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  logger.info('Firebase inicializado correctamente')
} catch (error) {
  logger.error('Error al inicializar Firebase', error)
  throw error
}

export { auth, db }
export default app