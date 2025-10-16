// scripts/validate-env.js
// Script para validar variables de entorno

import { config } from 'dotenv'
import { existsSync, readFileSync } from 'fs'

config()

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

// Variables requeridas
const requiredVars = {
  firebase: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ],
  optional: [
    'VITE_WEB3FORMS_KEY'
  ]
}

const validateEnv = () => {
  console.log('\n' + '='.repeat(50))
  console.log('  Validación de Variables de Entorno')
  console.log('='.repeat(50) + '\n')
  
  // Verificar si existe .env
  if (!existsSync('.env')) {
    log.error('Archivo .env no encontrado')
    log.info('Copia .env.example a .env y configura las variables')
    console.log('\n  cp .env.example .env\n')
    process.exit(1)
  }
  
  log.success('Archivo .env encontrado')
  
  // Validar variables de Firebase
  console.log('\n📦 Variables de Firebase:')
  const missingFirebase = []
  
  requiredVars.firebase.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      log.error(`  ${varName}: NO CONFIGURADA`)
      missingFirebase.push(varName)
    } else {
      // Validaciones específicas
      let isValid = true
      let warning = ''
      
      if (varName === 'VITE_FIREBASE_API_KEY') {
        if (!value.startsWith('AIza')) {
          isValid = false
          warning = 'debe comenzar con "AIza"'
        }
      } else if (varName === 'VITE_FIREBASE_AUTH_DOMAIN') {
        if (!value.includes('firebaseapp.com')) {
          isValid = false
          warning = 'debe contener "firebaseapp.com"'
        }
      } else if (varName === 'VITE_FIREBASE_PROJECT_ID') {
        if (value.length < 6) {
          isValid = false
          warning = 'demasiado corto'
        }
      }
      
      if (!isValid) {
        log.warning(`  ${varName}: CONFIGURADA pero posiblemente incorrecta (${warning})`)
      } else {
        log.success(`  ${varName}: ✓`)
      }
    }
  })
  
  // Validar variables opcionales
  console.log('\n📦 Variables Opcionales:')
  requiredVars.optional.forEach(varName => {
    const value = process.env[varName]
    if (!value) {
      log.warning(`  ${varName}: No configurada (opcional)`)
    } else {
      log.success(`  ${varName}: ✓`)
    }
  })
  
  // Verificar .env.example
  console.log('\n📄 Verificando .env.example:')
  if (existsSync('.env.example')) {
    const exampleContent = readFileSync('.env.example', 'utf-8')
    const exampleVars = exampleContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0])
    
    const currentVars = Object.keys(process.env).filter(key => 
      key.startsWith('VITE_')
    )
    
    const missingInExample = currentVars.filter(v => !exampleVars.includes(v))
    const missingInEnv = exampleVars.filter(v => !currentVars.includes(v))
    
    if (missingInExample.length > 0) {
      log.warning('Variables en .env pero no en .env.example:')
      missingInExample.forEach(v => console.log(`  - ${v}`))
    }
    
    if (missingInEnv.length > 0) {
      log.warning('Variables en .env.example pero no en .env:')
      missingInEnv.forEach(v => console.log(`  - ${v}`))
    }
    
    if (missingInExample.length === 0 && missingInEnv.length === 0) {
      log.success('.env y .env.example están sincronizados')
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50))
  if (missingFirebase.length > 0) {
    log.error(`Faltan ${missingFirebase.length} variables requeridas`)
    console.log('\nVariables faltantes:')
    missingFirebase.forEach(v => console.log(`  - ${v}`))
    console.log('\nConfigúralas en el archivo .env')
    process.exit(1)
  } else {
    log.success('✅ Todas las variables requeridas están configuradas')
  }
  console.log('='.repeat(50) + '\n')
}

validateEnv()