const GALLERY_KEY = 'promptStudio_gallery';
const CURRENT_KEY = 'promptStudio_current';

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
  // Save as current
  localStorage.setItem(CURRENT_KEY, JSON.stringify(updated));
  // Save to gallery
  const projects = loadProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = updated;
  } else {
    projects.unshift(updated);
  }
  projects.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(GALLERY_KEY, JSON.stringify({ projects }));
  return updated;
}

export function deleteProject(id) {
  const projects = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(GALLERY_KEY, JSON.stringify({ projects }));
}

export function createProject(name = 'פרויקט חדש') {
  return {
    id: Date.now().toString(),
    name,
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