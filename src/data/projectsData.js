// src/data/projectsData.js
import { createProject } from './projectConfig';

export const projectsData = {
  'proyecto-1': createProject('proyecto-1', {
    title: 'Casa Moderna Alpha',
    subtitle: 'Residencia familiar contemporánea',
    description: 'Casa moderna con diseño contemporáneo, tecnología sustentable y acabados de lujo.',
    imageCount: 16,
    area: '350 m²',
    year: '2024'
  }),
  
  'proyecto-2': createProject('proyecto-2', {
    title: 'Villa Ejecutiva Beta',
    subtitle: 'Residencia ejecutiva de lujo', 
    description: 'Villa de lujo con acabados premium, espacios amplios y vista panorámica.',
    imageCount: 10,
    area: '450 m²',
    year: '2024'
  }),
  
  'proyecto-3': createProject('proyecto-3', {
    title: 'Casa Minimalista Gamma',
    subtitle: 'Diseño minimalista y funcional',
    description: 'Casa con diseño minimalista, líneas limpias y espacios multifuncionales.',
    imageCount: 12,
    area: '280 m²', 
    year: '2023'
  }),
  
  'proyecto-4': createProject('proyecto-4', {
    title: 'Residencia Familiar Delta',
    subtitle: 'Hogar perfecto para familias',
    description: 'Residencia diseñada pensando en la comodidad y funcionalidad familiar.',
    imageCount: 14,
    area: '220 m²',
    year: '2023'
  }),
  
  'proyecto-5': createProject('proyecto-5', {
    title: 'Casa Ecológica Epsilon',
    subtitle: 'Construcción sustentable',
    description: 'Casa ecológica con tecnologías verdes y materiales sostenibles.',
    imageCount: 52,
    area: '320 m²',
    year: '2024'
  }),
  
  'proyecto-6': createProject('proyecto-6', {
    title: 'Villa Mediterránea Zeta',
    subtitle: 'Estilo mediterráneo clásico',
    description: 'Villa con arquitectura mediterránea, patios internos y detalles artesanales.',
    imageCount: 15,
    area: '380 m²',
    year: '2024'
  }),
  
  'proyecto-7': createProject('proyecto-7', {
    title: 'Casa Urbana Eta',
    subtitle: 'Diseño urbano moderno',
    description: 'Casa urbana con diseño moderno, aprovechamiento máximo del espacio y tecnología integrada.',
    imageCount: 9,
    area: '180 m²',
    year: '2023'
  })
};

export const getAllProjects = () => Object.values(projectsData);
export const getProject = (id) => projectsData[id];
export const getCarouselSlides = () => {
  return getAllProjects().map(project => ({
    img: project.mainImage,
    caption: project.caption,
    id: project.id,
    title: project.title,
    imageCount: project.imageCount
  }));
};