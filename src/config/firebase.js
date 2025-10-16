// src/config/firebase.js - VERSIÓN MEJORADA CON VALIDACIÓN
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Validar variables de entorno
const validateEnvVariable = (key, value) => {
  if (!value || value.trim() === '') {
    throw new Error(`Variable de entorno faltante: ${key}`)
  }
  return value.trim()
}

// Configuración de Firebase con validación
const firebaseConfig = {
  apiKey: validateEnvVariable('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: validateEnvVariable('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: validateEnvVariable('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: validateEnvVariable('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: validateEnvVariable('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: validateEnvVariable('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID)
}

// Verificar integridad de la configuración
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key])

if (missingKeys.length > 0) {
  console.error('❌ Configuración de Firebase incompleta. Claves faltantes:', missingKeys)
  throw new Error(`Configuración de Firebase incompleta: ${missingKeys.join(', ')}`)
}

// Inicializar Firebase con manejo de errores
let app
let auth

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  console.log('✅ Firebase inicializado correctamente')
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error)
  throw error
}

export { auth }
export default app