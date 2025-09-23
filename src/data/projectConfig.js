// src/data/projectConfig.js
const BASE_URL = import.meta.env.BASE_URL || '';

export const getProjectImage = (projectId, imageNumber) => {
  return `${BASE_URL}resources/projects/${projectId}/${imageNumber}.webp`;
};

export const createProject = (id, projectConfig = {}) => {
  // Configuración por defecto
  const defaultConfig = {
    title: 'Proyecto',
    subtitle: 'Descripción del proyecto',
    description: 'Descripción detallada del proyecto.',
    year: '2024',
    area: '200 m²',
    type: 'Casa',
    imageCount: 52,
    features: [
      `Área total: ${projectConfig.area || '200 m²'}`,
      'Construcción de alta calidad',
      'Materiales premium',
      'Diseño funcional y moderno',
      'Acabados de primera',
      'Excelente ubicación'
    ]
  };

  // Combinar configuración por defecto con la personalizada
  const finalConfig = { ...defaultConfig, ...projectConfig };

  return {
    id,
    title: finalConfig.title,
    subtitle: finalConfig.subtitle,
    description: finalConfig.description,
    year: finalConfig.year,
    area: finalConfig.area,
    type: finalConfig.type,
    imageCount: finalConfig.imageCount,
    features: finalConfig.features,
    
    get images() {
      return Array.from({ length: this.imageCount }, (_, i) => 
        getProjectImage(this.id, i + 1)
      );
    },
    
    get gallery() {
      return Array.from({ length: this.imageCount }, (_, i) => ({
        img: getProjectImage(this.id, i + 1),
        caption: `${this.title} - Foto ${i + 1}`
      }));
    },
    
    get mainImage() {
      return this.images[0];
    },
    
    get caption() {
      return `${this.type} · ${this.area} · ${this.year}`;
    }
  };
};