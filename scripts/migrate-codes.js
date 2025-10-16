// scripts/migrate-codes.js
// Script para migrar códigos QR a Firebase Firestore

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Cargar variables de entorno
config()

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

// Validar configuración
const validateConfig = () => {
  const required = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ]
  
  const missing = required.filter(key => !firebaseConfig[key])
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:')
    missing.forEach(key => {
      console.error(`   - VITE_FIREBASE_${key.toUpperCase()}`)
    })
    process.exit(1)
  }
}

// Inicializar Firebase
validateConfig()
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  progress: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
}

// Función para generar códigos de ejemplo
const generateSampleCodes = (count = 50) => {
  const projects = ['project1', 'project2', 'project3', 'project4', 'project5']
  const codes = []
  
  for (let i = 1; i <= count; i++) {
    const code = {
      code: `QR${String(i).padStart(6, '0')}`,
      projectId: projects[Math.floor(Math.random() * projects.length)],
      isValid: true,
      scannedAt: null,
      createdAt: new Date(),
      metadata: {
        generatedBy: 'migration-script',
        version: '1.0',
        description: `Código de prueba ${i}`
      }
    }
    codes.push(code)
  }
  
  return codes
}

// Función para leer códigos desde archivo CSV
const readCodesFromCSV = (filePath) => {
  try {
    const csvContent = readFileSync(resolve(filePath), 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const codes = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const codeObj = {
        code: values[0],
        projectId: values[1],
        isValid: values[2]?.toLowerCase() === 'true',
        scannedAt: values[3] ? new Date(values[3]) : null,
        createdAt: values[4] ? new Date(values[4]) : new Date(),
        metadata: {
          importedFrom: 'csv',
          originalLine: line
        }
      }
      return codeObj
    })
    
    return codes
  } catch (error) {
    log.error(`Error leyendo CSV: ${error.message}`)
    return null
  }
}

// Función para validar estructura de código
const validateCode = (code) => {
  const errors = []
  
  if (!code.code || typeof code.code !== 'string') {
    errors.push('Campo "code" inválido o faltante')
  }
  
  if (!code.projectId || typeof code.projectId !== 'string') {
    errors.push('Campo "projectId" inválido o faltante')
  }
  
  if (typeof code.isValid !== 'boolean') {
    errors.push('Campo "isValid" debe ser booleano')
  }
  
  if (code.scannedAt !== null && !(code.scannedAt instanceof Date)) {
    errors.push('Campo "scannedAt" debe ser Date o null')
  }
  
  if (!(code.createdAt instanceof Date)) {
    errors.push('Campo "createdAt" debe ser Date')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Función para verificar códigos duplicados en Firestore
const checkDuplicates = async (codes) => {
  log.progress('Verificando códigos duplicados...')
  
  const codesRef = collection(db, 'codes')
  const duplicates = []
  
  for (const code of codes) {
    const q = query(codesRef, where('code', '==', code.code))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      duplicates.push(code.code)
    }
  }
  
  return duplicates
}

// Función para migrar códigos (usando batch writes)
const migrateCodes = async (codes, options = {}) => {
  const {
    overwrite = false,
    dryRun = false,
    batchSize = 500
  } = options
  
  log.info(`Iniciando migración de ${codes.length} códigos...`)
  log.info(`Modo: ${dryRun ? 'DRY RUN (simulación)' : 'PRODUCCIÓN'}`)
  log.info(`Sobrescribir duplicados: ${overwrite ? 'SÍ' : 'NO'}`)
  
  // Validar códigos
  log.progress('Validando códigos...')
  const validationResults = codes.map(validateCode)
  const invalidCodes = validationResults.filter(r => !r.valid)
  
  if (invalidCodes.length > 0) {
    log.error(`${invalidCodes.length} códigos inválidos encontrados:`)
    invalidCodes.slice(0, 5).forEach((result, idx) => {
      console.error(`  ${idx + 1}. ${result.errors.join(', ')}`)
    })
    
    if (invalidCodes.length > 5) {
      log.warning(`... y ${invalidCodes.length - 5} más`)
    }
    
    const proceed = await askToContinue()
    if (!proceed) {
      log.warning('Migración cancelada por el usuario')
      process.exit(0)
    }
  }
  
  // Verificar duplicados si no se va a sobrescribir
  if (!overwrite) {
    const duplicates = await checkDuplicates(codes)
    
    if (duplicates.length > 0) {
      log.warning(`${duplicates.length} códigos duplicados encontrados:`)
      duplicates.slice(0, 10).forEach(code => {
        console.log(`  - ${code}`)
      })
      
      if (duplicates.length > 10) {
        log.warning(`... y ${duplicates.length - 10} más`)
      }
      
      log.info('Usa --overwrite para sobrescribir duplicados')
      
      const proceed = await askToContinue()
      if (!proceed) {
        log.warning('Migración cancelada por el usuario')
        process.exit(0)
      }
      
      // Filtrar duplicados
      codes = codes.filter(code => !duplicates.includes(code.code))
      log.info(`Continuando con ${codes.length} códigos únicos`)
    }
  }
  
  if (dryRun) {
    log.success('DRY RUN completado exitosamente')
    log.info('Ejecuta sin --dry-run para realizar la migración real')
    return { success: codes.length, failed: 0 }
  }
  
  // Migrar en batches
  log.progress('Iniciando escritura en Firestore...')
  
  let processed = 0
  let failed = 0
  const errors = []
  
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = writeBatch(db)
    const currentBatch = codes.slice(i, i + batchSize)
    
    currentBatch.forEach(code => {
      const docRef = doc(collection(db, 'codes'))
      batch.set(docRef, {
        ...code,
        createdAt: code.createdAt.toISOString(),
        scannedAt: code.scannedAt ? code.scannedAt.toISOString() : null
      })
    })
    
    try {
      await batch.commit()
      processed += currentBatch.length
      log.progress(`Procesados: ${processed}/${codes.length}`)
    } catch (error) {
      failed += currentBatch.length
      errors.push({
        batch: i / batchSize + 1,
        error: error.message
      })
      log.error(`Error en batch ${i / batchSize + 1}: ${error.message}`)
    }
  }
  
  // Actualizar estadísticas
  try {
    await updateStats()
  } catch (error) {
    log.warning(`No se pudieron actualizar estadísticas: ${error.message}`)
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50))
  log.success(`Migración completada`)
  console.log(`  Total códigos:      ${codes.length}`)
  log.success(`  Exitosos:          ${processed}`)
  if (failed > 0) {
    log.error(`  Fallidos:          ${failed}`)
  }
  console.log('='.repeat(50) + '\n')
  
  if (errors.length > 0) {
    log.warning('Errores encontrados:')
    errors.forEach(err => {
      console.error(`  Batch ${err.batch}: ${err.error}`)
    })
  }
  
  return { success: processed, failed }
}

// Función para actualizar estadísticas globales
const updateStats = async () => {
  log.progress('Actualizando estadísticas...')
  
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
  log.info(`  Total: ${totalCodes} | Válidos: ${validCodes} | Escaneados: ${scannedCodes}`)
}

// Función para preguntar al usuario
const askToContinue = () => {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    readline.question('¿Deseas continuar? (s/n): ', (answer) => {
      readline.close()
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y')
    })
  })
}

// Función principal
const main = async () => {
  console.log('\n' + '='.repeat(50))
  console.log('  Script de Migración de Códigos QR')
  console.log('  ProconIng - Firebase Firestore')
  console.log('='.repeat(50) + '\n')
  
  // Parsear argumentos
  const args = process.argv.slice(2)
  const options = {
    overwrite: args.includes('--overwrite'),
    dryRun: args.includes('--dry-run'),
    sample: args.includes('--sample'),
    csv: args.find(arg => arg.startsWith('--csv='))?.split('=')[1],
    count: parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 50
  }
  
  let codes = []
  
  // Determinar fuente de códigos
  if (options.csv) {
    log.info(`Leyendo códigos desde CSV: ${options.csv}`)
    codes = readCodesFromCSV(options.csv)
    
    if (!codes) {
      log.error('No se pudieron leer los códigos desde CSV')
      process.exit(1)
    }
  } else if (options.sample) {
    log.info(`Generando ${options.count} códigos de ejemplo...`)
    codes = generateSampleCodes(options.count)
  } else {
    log.error('Debes especificar una fuente de códigos:')
    console.log('  --sample           Generar códigos de ejemplo')
    console.log('  --csv=archivo.csv  Leer desde archivo CSV')
    console.log('\nOpciones adicionales:')
    console.log('  --count=N          Número de códigos de ejemplo (default: 50)')
    console.log('  --dry-run          Simular migración sin escribir')
    console.log('  --overwrite        Sobrescribir códigos duplicados')
    console.log('\nEjemplos:')
    console.log('  npm run migrate:codes -- --sample')
    console.log('  npm run migrate:codes -- --sample --count=100 --dry-run')
    console.log('  npm run migrate:codes -- --csv=codes.csv --overwrite')
    process.exit(1)
  }
  
  // Ejecutar migración
  try {
    const result = await migrateCodes(codes, options)
    
    if (result.failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    log.error(`Error fatal: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
  
  log.success('Proceso completado exitosamente')
  process.exit(0)
}

// Ejecutar
main().catch(error => {
  log.error(`Error no manejado: ${error.message}`)
  console.error(error)
  process.exit(1)
})