const PROJECTS_KEY = 'prompt_studio_projects';

export function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveProject(project) {
  const projects = loadProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  const updated = { ...project, updatedAt: Date.now() };
  if (idx >= 0) {
    projects[idx] = updated;
  } else {
    projects.unshift(updated);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return updated;
}

export function deleteProject(id) {
  const projects = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createProject(name = 'פרויקט חדש') {
  return {
    id: Date.now().toString(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    inspirationImage: null,
    buildingType: 'house',
    styles: { primary: '', secondary: '' },
    synthesis: '',
    visual: {
      materials: [],
      palette: [],
      light: [],
      atmosphere: [],
    },
    prompts: {
      materialsBoard: '',
      colorBoard: '',
      inspirationBoard: '',
      livingRoom: '',
      kitchen: '',
      bedroom: '',
      bathroom: '',
    },
    images: {
      materialsBoard: null,
      colorBoard: null,
      inspirationBoard: null,
      livingRoom: null,
      kitchen: null,
      bedroom: null,
      bathroom: null,
    },
  };
}