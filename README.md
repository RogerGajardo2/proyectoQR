# 🏗️ ProconIng - Sistema de Gestión Web

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-A+-brightgreen.svg)](SECURITY.md)

Sitio web corporativo para ProconIng - Arquitectura y Construcción, con sistema de gestión de proyectos, reseñas y panel administrativo.

## 🚀 Características Principales

### ✨ Funcionalidades
- 🏠 Landing page moderna y responsive
- 📱 Diseño mobile-first optimizado
- 🎨 Galería de proyectos con carrusel interactivo
- ⭐ Sistema de reseñas con códigos únicos
- 📧 Formulario de contacto integrado
- 🔐 Panel administrativo seguro con Firebase
- 📊 Gestión de códigos y reseñas
- 🎯 Navegación fluida entre secciones

### 🔒 Seguridad
- ✅ Autenticación Firebase
- ✅ Rate limiting en formularios
- ✅ Validación y sanitización de inputs
- ✅ Protección CSRF
- ✅ Content Security Policy
- ✅ Detección de spam
- ✅ Prevención XSS

### ⚡ Performance
- ✅ Componentes memoizados
- ✅ Lazy loading de imágenes
- ✅ Code splitting
- ✅ Optimización de bundle
- ✅ Caché de datos

## 📋 Requisitos Previos

- Node.js 18+ o superior
- npm 9+ o superior
- Cuenta de Firebase
- Cuenta de Web3Forms (para formularios)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/proyectoQR.git
cd proyectoQR
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar plantilla
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```
```env
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Web3Forms
VITE_WEB3FORMS_KEY=tu_web3forms_key
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción
```bash
# Generar build optimizado
npm run build

# Preview del build
npm run preview
```

## 📁 Estructura del Proyecto
```
proyectoQR/
├── public/
│   └── resources/        # Imágenes y videos
├── src/
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes UI base
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── ProjectsCarousel.jsx
│   │   ├── Reviews.jsx
│   │   ├── Contact.jsx
│   │   ├── AdminCodes.jsx
│   │   └── ...
│   ├── config/          # Configuración
│   │   └── firebase.js
│   ├── data/            # Datos y configuración
│   │   ├── projectsData.js
│   │   └── projectConfig.js
│   ├── hooks/           # Custom hooks
│   │   ├── useReveal.js
│   │   └── useGoToSection.js
│   ├── utils/           # Utilidades
│   │   ├── logger.js
│   │   ├── security.js
│   │   └── ...
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos globales
├── .env.example         # Plantilla de variables
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Seguridad

### Rate Limiting

| Acción | Límite | Ventana |
|--------|--------|---------|
| Login | 5 intentos | 15 minutos |
| Contacto | 10 envíos | 1 hora |
| Reseñas | 3 reseñas | 1 hora |

### Validaciones

- ✅ Emails: Formato RFC 5322
- ✅ Teléfonos: Formato chileno (+56)
- ✅ Archivos: .json, max 1-2MB
- ✅ Textos: Sanitizados contra XSS
- ✅ IDs: Validación de formato


## 📱 Panel Administrativo

### Acceso

1. Navegar a `/#/admin/codigos`
2. Iniciar sesión con credenciales de Firebase
3. Gestionar códigos y reseñas

### Funcionalidades

- ✏️ Crear códigos únicos
- 📥 Importar/Exportar códigos
- 👀 Ver códigos disponibles y usados
- ⭐ Gestionar reseñas
- ✏️ Editar reseñas existentes
- 🗑️ Eliminar reseñas

## 🎨 Personalización

### Colores

Editar en `src/index.css`:
```css
:root {
  --title: #4b5563;
  --subtitle: #8B7500;
  --text: #6b7280;
  --alt: #f3f4f6;
  --line: #e5e7eb;
}
```

### Proyectos

Agregar proyectos en `src/data/projectsData.js`:
```javascript
'proyecto-9': createProject('proyecto-9', {
  title: 'Nuevo Proyecto',
  subtitle: 'Subtítulo',
  description: 'Descripción...',
  imageCount: 20,
  area: '150 m²',
  type: 'Casa',
  year: '2025',
  features: [
    'Característica 1',
    'Característica 2'
  ]
})
```

## 🧪 Testing
```bash
# Ejecutar linter
npm run lint

# Auditar seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix
```

## 📊 Analytics y Monitoreo

### Logs en Producción

Los logs se guardan en:
- `localStorage`: últimos 100 logs
- Consola del navegador (solo errores)

### Exportar Logs

En consola del navegador:
```javascript
window.ProconLogger.exportLogs()
```

### Ver Estadísticas
```javascript
// Estadísticas de proyectos
window.ProconProjects.getStats()

// Estadísticas de reseñas
// (desde /admin/codigos)
```

## 🚀 Deployment

### GitHub Pages
```bash
# Build
npm run build

# Deploy
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request


## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados © 2025 ProconIng.

## 👥 Equipo

- **Desarrollo**: Roger Gajardo
- **Diseño**: ProconIng
- **Cliente**: ProconIng

## 📞 Contacto

- **Email**: contacto@proconing.cl
- **Teléfono**: +569 7349 5086
- **Web**: https://proconing.cl
- **Instagram**: [@procon.ing](https://www.instagram.com/procon.ing)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Web3Forms](https://web3forms.com/)

---

**Versión**: 1.1.0  
**Última actualización**: 2025-01-16  
**Estado**: ✅ Producción