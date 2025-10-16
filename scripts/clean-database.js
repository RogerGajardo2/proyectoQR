// scripts/clean-database.js
// Script para limpiar códigos en Firestore (usar con CUIDADO)

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  getDocs,
  writeBatch,
  doc,
  query,
  where
} from 'firebase/firestore'
import { config } from 'dotenv'
import readline from 'readline'

config()

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

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
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
}

const askConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}⚠${colors.reset} ${question} (escribe "CONFIRMAR" para continuar): `, (answer) => {
      rl.close()
      resolve(answer === 'CONFIRMAR')
    })
  })
}

const deleteAllCodes = async () => {
  log.info('Obteniendo todos los códigos...')
  
  const codesRef = collection(db, 'codes')
  const snapshot = await getDocs(codesRef)
  
  if (snapshot.empty) {
    log.info('No hay códigos para eliminar')
    return 0
  }
  
  const totalCodes = snapshot.size
  log.warning(`Se encontraron ${totalCodes} códigos`)
  
  const confirmed = await askConfirmation(
    `¿Estás seguro de eliminar TODOS los ${totalCodes} códigos?`
  )
  
  if (!confirmed) {
    log.info('Operación cancelada')
    return 0
  }
  
  log.info('Eliminando códigos...')
  
  // Eliminar en batches de 500
  const batchSize = 500
  let deleted = 0
  
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db)
    const currentBatch = snapshot.docs.slice(i, i + batchSize)
    
    currentBatch.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref)
    })
    
    await batch.commit()
    deleted += currentBatch.length
    log.info(`Eliminados: ${deleted}/${totalCodes}`)
  }
  
  log.success(`✅ ${deleted} códigos eliminados exitosamente`)
  return deleted
}

const deleteInvalidCodes = async () => {
  log.info('Obteniendo códigos inválidos...')
  
  const codesRef = collection(db, 'codes')
  const q = query(codesRef, where('isValid', '==', false))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    log.info('No hay códigos inválidos para eliminar')
    return 0
  }
  
  const totalCodes = snapshot.size
  log.warning(`Se encontraron ${totalCodes} códigos inválidos`)
  
  const confirmed = await askConfirmation(
    `¿Estás seguro de eliminar ${totalCodes} códigos inválidos?`
  )
  
  if (!confirmed) {
    log.info('Operación cancelada')
    return 0
  }
  
  log.info('Eliminando códigos inválidos...')
  
  const batch = writeBatch(db)
  snapshot.docs.forEach(docSnapshot => {
    batch.delete(docSnapshot.ref)
  })
  
  await batch.commit()
  log.success(`✅ ${totalCodes} códigos inválidos eliminados`)
  return totalCodes
}

const deleteByProject = async (projectId) => {
  log.info(`Obteniendo códigos del proyecto: ${projectId}...`)
  
  const codesRef = collection(db, 'codes')
  const q = query(codesRef, where('projectId', '==', projectId))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    log.info(`No hay códigos para el proyecto: ${projectId}`)
    return 0
  }
  
  const totalCodes = snapshot.size
  log.warning(`Se encontraron ${totalCodes} códigos del proyecto ${projectId}`)
  
  const confirmed = await askConfirmation(
    `¿Estás seguro de eliminar ${totalCodes} códigos del proyecto ${projectId}?`
  )
  
  if (!confirmed) {
    log.info('Operación cancelada')
    return 0
  }
  
  log.info('Eliminando códigos...')
  
  const batch = writeBatch(db)
  snapshot.docs.forEach(docSnapshot => {
    batch.delete(docSnapshot.ref)
  })
  
  await batch.commit()
  log.success(`✅ ${totalCodes} códigos eliminados del proyecto ${projectId}`)
  return totalCodes
}

const deleteOldCodes = async (daysOld) => {
  log.info(`Obteniendo códigos más antiguos que ${daysOld} días...`)
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const codesRef = collection(db, 'codes')
  const snapshot = await getDocs(codesRef)
  
  const oldDocs = snapshot.docs.filter(doc => {
    const createdAt = new Date(doc.data().createdAt)
    return createdAt < cutoffDate
  })
  
  if (oldDocs.length === 0) {
    log.info(`No hay códigos más antiguos que ${daysOld} días`)
    return 0
  }
  
  const totalCodes = oldDocs.length
  log.warning(`Se encontraron ${totalCodes} códigos antiguos`)
  
  const confirmed = await askConfirmation(
    `¿Estás seguro de eliminar ${totalCodes} códigos?`
  )
  
  if (!confirmed) {
    log.info('Operación cancelada')
    return 0
  }
  
  log.info('Eliminando códigos antiguos...')
  
  const batch = writeBatch(db)
  oldDocs.forEach(docSnapshot => {
    batch.delete(docSnapshot.ref)
  })
  
  await batch.commit()
  log.success(`✅ ${totalCodes} códigos antiguos eliminados`)
  return totalCodes
}

const updateStats = async () => {
  log.info('Actualizando estadísticas...')
  
  const codesRef = collection(db, 'codes')
  const snapshot = await getDocs(codesRef)
  
  const totalCodes = snapshot.size
  let validCodes = 0
  let scannedCodes = 0
  
  snapshot.forEach(doc => {
    const data = doc.data()
    if (data.isValid) validCodes++
    if (data.scannedAt) scannedCodes++
  })
  
  const statsRef = doc(db, 'stats', 'global')
  await setDoc(statsRef, {
    totalCodes,
    validCodes,
    scannedCodes,
    lastUpdated: new Date().toISOString()
  })
  
  log.success('Estadísticas actualizadas')
  log.info(`Total: ${totalCodes} | Válidos: ${validCodes} | Escaneados: ${scannedCodes}`)
}

const main = async () => {
  console.log('\n' + '='.repeat(50))
  console.log('  Limpieza de Base de Datos')
  console.log('  ⚠️  USAR CON PRECAUCIÓN ⚠️')
  console.log('='.repeat(50) + '\n')
  
  const args = process.argv.slice(2)
  
  try {
    let deleted = 0
    
    if (args.includes('--all')) {
      // Eliminar TODOS los códigos
      deleted = await deleteAllCodes()
    } else if (args.includes('--invalid')) {
      // Eliminar solo códigos inválidos
      deleted = await deleteInvalidCodes()
    } else if (args.find(arg => arg.startsWith('--project='))) {
      // Eliminar por proyecto
      const projectId = args.find(arg => arg.startsWith('--project=')).split('=')[1]
      deleted = await deleteByProject(projectId)
    } else if (args.find(arg => arg.startsWith('--older-than='))) {
      // Eliminar códigos antiguos
      const days = parseInt(args.find(arg => arg.startsWith('--older-than=')).split('=')[1])
      deleted = await deleteOldCodes(days)
    } else {
      log.error('Debes especificar una opción:')
      console.log('\nOpciones disponibles:')
      console.log('  --all                    Eliminar TODOS los códigos')
      console.log('  --invalid                Eliminar solo códigos inválidos')
      console.log('  --project=PROJECT_ID     Eliminar códigos de un proyecto')
      console.log('  --older-than=DAYS        Eliminar códigos más antiguos que N días')
      console.log('\nEjemplos:')
      console.log('  npm run clean:db -- --invalid')
      console.log('  npm run clean:db -- --project=project1')
      console.log('  npm run clean:db -- --older-than=30')
      console.log('  npm run clean:db -- --all  # ⚠️ PELIGROSO!')
      process.exit(1)
    }
    
    if (deleted > 0) {
      await updateStats()
    }
    
    log.success('\n✅ Operación completada exitosamente')
    
  } catch (error) {
    log.error('Error durante la limpieza:')
    console.error(error)
    process.exit(1)
  }
}

main()