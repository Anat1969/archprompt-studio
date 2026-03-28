export const STYLES_LIST = [
  'Brutalism',
  'Japandi',
  'Wabi-Sabi',
  'Bauhaus',
  'Deconstructivism',
  'Scandinavian',
  'Mediterranean',
  'Industrial Loft',
  'Organic Modern',
  'High-Tech',
  'Biophilic',
];

const STYLE_KEYWORDS = {
  'Brutalism': 'raw concrete, exposed structure, monolithic forms, heavy materiality, bold geometric masses',
  'Japandi': 'wabi-sabi minimalism, natural wood, muted earth tones, functional simplicity, zen balance',
  'Wabi-Sabi': 'imperfection, patina, organic textures, aged materials, understated beauty, transience',
  'Bauhaus': 'functional geometry, primary colors, clean lines, industrial craft, form follows function',
  'Deconstructivism': 'fragmented forms, non-linear geometry, angular disruption, clashing elements',
  'Scandinavian': 'hygge warmth, pale wood, white walls, cozy textiles, light-filled simplicity',
  'Mediterranean': 'terracotta, arched openings, warm plaster, cobalt accents, sun-drenched textures',
  'Industrial Loft': 'exposed brick, steel beams, factory windows, aged metal, utilitarian elegance',
  'Organic Modern': 'curved forms, biomorphic shapes, warm neutrals, natural stone, soft sculpture',
  'High-Tech': 'structural glass, precision steel, mechanical systems, transparency, engineered detail',
  'Biophilic': 'living walls, natural light, water features, organic materials, connection to nature',
};

export function synthesizeStyles(primary, secondary) {
  if (!primary && !secondary) return '';
  if (!secondary) return STYLE_KEYWORDS[primary] || '';
  if (!primary) return STYLE_KEYWORDS[secondary] || '';
  const p = STYLE_KEYWORDS[primary] || primary;
  const s = STYLE_KEYWORDS[secondary] || secondary;
  return `${primary} meets ${secondary}: ${p.split(',')[0]}, ${p.split(',')[1] || ''}, blended with ${s.split(',')[0]}, ${s.split(',')[1] || ''}`.replace(/ ,/g, ',');
}

function visualContext(visual) {
  const parts = [];
  if (visual.materials?.length) parts.push(visual.materials.join(', '));
  if (visual.palette?.length) parts.push(visual.palette.join(', '));
  if (visual.light?.length) parts.push(visual.light.join(', '));
  if (visual.atmosphere?.length) parts.push(visual.atmosphere.join(', '));
  return parts.join(', ');
}

export function generatePrompt(type, project) {
  const synthesis = project.synthesis || synthesizeStyles(project.styles.primary, project.styles.secondary);
  const visual = visualContext(project.visual);
  const bType = project.buildingType === 'house' ? 'private residence' : 'apartment building';

  const base = `${synthesis}${visual ? ', ' + visual : ''}, ${bType}`;

  const prompts = {
    materialsBoard: `Architectural materials mood board, ${base}, material samples flat lay, stone marble wood metal fabric swatches, studio lighting, editorial photography, 16:9 --ar 16:9 --v 6.1 --style raw`,
    colorBoard: `Architectural color palette board, ${base}, paint chips color swatches gradient study, minimal layout white background, professional design presentation, 16:9 --ar 16:9 --v 6.1 --style raw`,
    inspirationBoard: `Architectural inspiration mood board, ${base}, collage of textures details spaces, editorial layout, high contrast, cinematic references --ar 16:9 --v 6.1 --style raw`,
    livingRoom: `Interior design living room, ${base}, golden hour light, architectural photography, ultra-detailed, 8k, photorealistic --ar 16:9 --v 6.1 --style raw`,
    kitchen: `Interior design kitchen, ${base}, professional kitchen photography, ambient lighting, ultra-detailed surfaces, 8k --ar 16:9 --v 6.1 --style raw`,
    bedroom: `Interior design master bedroom, ${base}, soft morning light, luxury bedding, architectural photography, ultra-detailed, 8k --ar 16:9 --v 6.1 --style raw`,
    bathroom: `Interior design bathroom, ${base}, spa-like atmosphere, natural stone, ambient candlelight, architectural photography, 8k --ar 16:9 --v 6.1 --style raw`,
  };

  return prompts[type] || '';
}

export const VISUAL_OPTIONS = {
  materials: ['בטון', 'עץ טבעי', 'אבן גיר', 'שיש', 'מתכת', 'זכוכית', 'טיח', 'לבנים'],
  palette: ['אדמה חמה', 'שחור ולבן', 'אפור קר', 'ירוק יער', 'אוקר וזהב', 'כחול-ים', 'טרה קוטה', 'מינרל'],
  light: ['אור טבעי', 'שעת הזהב', 'נרות ועמום', 'תאורת ספוט', 'אור צפוני', 'דרמטי כהה'],
  atmosphere: ['מינימליסטי', 'חמים ואינטימי', 'קריר ונקי', 'דרמטי', 'נינוח', 'לוקסוס שקט'],
};