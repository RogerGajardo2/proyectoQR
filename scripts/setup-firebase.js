// scripts/setup-firebase.js
// Script para configuración inicial de Firebase

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore'
import { config } from 'dotenv'

config()

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
}

const setupFirebase = async () => {
  try {
    log.info('Iniciando configuración de Firebase...')
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    log.success('Firebase inicializado correctamente')
    
    // Crear documento de estadísticas inicial
    log.info('Creando documento de estadísticas globales...')
    const statsRef = doc(db, 'stats', 'global')
    await setDoc(statsRef, {
      totalCodes: 0,
      validCodes: 0,
      scannedCodes: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })
    
    log.success('Documento de estadísticas creado')
    
    // Crear índices (información)
    log.info('\n📋 Índices recomendados para crear en Firestore Console:')
    console.log('\nColección: codes')
    console.log('  1. code (Ascending) + isValid (Ascending)')
    console.log('  2. projectId (Ascending) + isValid (Ascending)')
    console.log('  3. createdAt (Descending) + isValid (Ascending)')
    
    log.success('\n✅ Configuración completada exitosamente!')
    log.info('\nPróximos pasos:')
    console.log('  1. Crear índices en Firestore Console')
    console.log('  2. Aplicar Security Rules: firebase deploy --only firestore:rules')
    console.log('  3. Migrar códigos: npm run migrate:sample')
    
  } catch (error) {
    log.error('Error durante la configuración:')
    console.error(error)
    process.exit(1)
  }
}

setupFirebase()