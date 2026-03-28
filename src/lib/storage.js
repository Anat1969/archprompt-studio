import { STYLES_LIST } from './promptEngine';

const GALLERY_KEY = 'promptStudio_gallery';
const CURRENT_KEY = 'promptStudio_current';
const IMAGES_GALLERY_KEY = 'promptStudio_images';

export function loadProjects() {
  try {
    const gallery = JSON.parse(localStorage.getItem(GALLERY_KEY) || '{"projects":[]}');
    return gallery.projects || [];
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const updated = { ...project, updatedAt: Date.now() };
  // Strip images before saving (too large for localStorage)
  const cleaned = stripImages(updated);
  // Save as current
  localStorage.setItem(CURRENT_KEY, JSON.stringify(cleaned));
  // Save to gallery
  const projects = loadProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = cleaned;
  } else {
    // New project: assign sequential number
    cleaned.number = projects.length + 1;
    projects.unshift(cleaned);
  }
  projects.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(GALLERY_KEY, JSON.stringify({ projects }));
  return updated;
}

function stripImages(project) {
  const copy = { ...project };
  if (copy.boards) {
    copy.boards = Object.keys(copy.boards).reduce((acc, key) => {
      const { resultImage, ...rest } = copy.boards[key];
      acc[key] = rest;
      return acc;
    }, {});
  }
  if (copy.rooms) {
    copy.rooms = Object.keys(copy.rooms).reduce((acc, key) => {
      const { resultImage, ...rest } = copy.rooms[key];
      acc[key] = rest;
      return acc;
    }, {});
  }
  if (copy.buildingTypes) {
    copy.buildingTypes = Object.keys(copy.buildingTypes).reduce((acc, key) => {
      const { resultImage, ...rest } = copy.buildingTypes[key];
      acc[key] = rest;
      return acc;
    }, {});
  }
  copy.inspirationImage = null;
  return copy;
}

export function deleteProject(id) {
  const projects = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify({ projects }));
}

export function addImageToGallery(image, projectId, projectName, styleA, styleB) {
  const images = getGalleryImages();
  const sequenceNum = images.filter(img => img.projectId === projectId).length + 1;
  const styleName = [styleA, styleB].filter(Boolean).join(' + ') || 'no-style';
  const newImage = {
    id: Date.now().toString(),
    projectId,
    projectName,
    styleA,
    styleB,
    styleName,
    sequenceNum,
    createdAt: Date.now(),
  };
  images.unshift(newImage);
  localStorage.setItem(IMAGES_GALLERY_KEY, JSON.stringify(images));
  return newImage;
}

export function getGalleryImages() {
  try {
    return JSON.parse(localStorage.getItem(IMAGES_GALLERY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function createProject(name) {
  return {
    id: Date.now().toString(),
    name: name || '',
    number: 0, // Will be assigned on save
    createdAt: Date.now(),
    updatedAt: Date.now(),
    inspirationImage: null,
    buildingType: 'private',
    visualDescription: {
      materials: '',
      palette: '',
      light: '',
      atmosphere: '',
    },
    styleSynthesis: {
      styleA: '',
      styleB: '',
      synthesisToken: '',
    },
    boards: {
      materials: { prompt: '', resultImage: null, status: 'empty' },
      colors:    { prompt: '', resultImage: null, status: 'empty' },
      mood:      { prompt: '', resultImage: null, status: 'empty' },
    },
    rooms: {
      living:   { prompt: '', resultImage: null, status: 'empty' },
      kitchen:  { prompt: '', resultImage: null, status: 'empty' },
      bedroom:  { prompt: '', resultImage: null, status: 'empty' },
      bathroom: { prompt: '', resultImage: null, status: 'empty' },
    },
    buildingTypes: {
      private:  { prompt: '', resultImage: null, status: 'empty' },
      building: { prompt: '', resultImage: null, status: 'empty' },
    },
  };
}

export function getProjectName(project) {
  if (!project) return '';
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis.styleA)?.label || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis.styleB)?.label || '';
  return [a, b].filter(Boolean).join(' × ') || project.name;
}