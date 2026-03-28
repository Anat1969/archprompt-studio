export const STYLES_LIST = [
  { id: 'brutalism',           label: 'Brutalism' },
  { id: 'japandi',             label: 'Japandi' },
  { id: 'wabi-sabi',           label: 'Wabi-Sabi' },
  { id: 'bauhaus',             label: 'Bauhaus' },
  { id: 'deconstructivism',    label: 'Deconstructivism' },
  { id: 'new-minimalism',      label: 'New Minimalism' },
  { id: 'scandinavian',        label: 'Scandinavian' },
  { id: 'mediterranean',       label: 'Mediterranean' },
  { id: 'industrial-loft',     label: 'Industrial Loft' },
  { id: 'organic-modern',      label: 'Organic Modern' },
  { id: 'high-tech',           label: 'High-Tech' },
  { id: 'tropical-modern',     label: 'Tropical Modern' },
  { id: 'critical-regionalism',label: 'Critical Regionalism' },
  { id: 'biophilic',           label: 'Biophilic Design' },
  { id: 'art-deco',            label: 'Art Deco' },
  { id: 'neo-classical',       label: 'Neo-Classical' },
];

const STYLE_KEYWORDS = {
  'brutalism':            'raw concrete, exposed structure, monolithic forms, heavy materiality, bold geometric masses',
  'japandi':              'wabi-sabi minimalism, natural wood, muted earth tones, functional simplicity, zen balance',
  'wabi-sabi':            'imperfection, patina, organic textures, aged materials, understated beauty, transience',
  'bauhaus':              'functional geometry, primary colors, clean lines, industrial craft, form follows function',
  'deconstructivism':     'fragmented forms, non-linear geometry, angular disruption, clashing elements',
  'new-minimalism':       'clean volumes, restrained palette, negative space, refined details, silent luxury',
  'scandinavian':         'hygge warmth, pale wood, white walls, cozy textiles, light-filled simplicity',
  'mediterranean':        'terracotta, arched openings, warm plaster, cobalt accents, sun-drenched textures',
  'industrial-loft':      'exposed brick, steel beams, factory windows, aged metal, utilitarian elegance',
  'organic-modern':       'curved forms, biomorphic shapes, warm neutrals, natural stone, soft sculpture',
  'high-tech':            'structural glass, precision steel, mechanical systems, transparency, engineered detail',
  'tropical-modern':      'lush greenery, open-air living, teak and stone, natural ventilation, indoor-outdoor flow',
  'critical-regionalism': 'local materials, cultural context, climate response, vernacular reinterpretation',
  'biophilic':            'living walls, natural light, water features, organic materials, connection to nature',
  'art-deco':             'geometric ornament, gold and black, symmetry, bold patterns, opulent materials',
  'neo-classical':        'columns, pediments, symmetry, marble, classical proportions, timeless grandeur',
};

const VISUAL_KEYWORDS = {
  materials:  { concrete: 'raw concrete surfaces', wood: 'natural wood grain', metal: 'brushed metal accents', stone: 'natural stone', glass: 'structural glass', mixed: 'mixed raw materials' },
  palette:    { warm: 'warm earth tones', cool: 'cool blue-grey palette', neutral: 'neutral whites and beiges', contrasted: 'high contrast black and white' },
  light:      { 'soft-diffused': 'soft diffused natural light', 'dramatic-direct': 'dramatic direct sunlight', 'natural-gentle': 'gentle ambient light' },
  atmosphere: { minimalist: 'minimal clean atmosphere', organic: 'organic flowing atmosphere', industrial: 'industrial raw atmosphere', luxury: 'quiet luxury atmosphere' },
};

export function synthesizeStyles(styleA, styleB) {
  if (!styleA && !styleB) return '';
  const kA = STYLE_KEYWORDS[styleA] || styleA;
  const kB = STYLE_KEYWORDS[styleB] || styleB;
  const labelA = STYLES_LIST.find(s => s.id === styleA)?.label || styleA;
  const labelB = STYLES_LIST.find(s => s.id === styleB)?.label || styleB;
  if (!styleB) return kA;
  if (!styleA) return kB;
  return `${labelA} meets ${labelB}: ${kA.split(',')[0]}, blended with ${kB.split(',')[0]}`;
}

function visualContext(visualDescription) {
  const parts = [];
  for (const [cat, val] of Object.entries(visualDescription)) {
    if (val && VISUAL_KEYWORDS[cat]?.[val]) parts.push(VISUAL_KEYWORDS[cat][val]);
  }
  return parts.join(', ');
}

export function generatePrompt(type, project) {
  const { styleSynthesis, visualDescription, buildingType } = project;
  const synthesis = styleSynthesis?.synthesisToken || synthesizeStyles(styleSynthesis?.styleA, styleSynthesis?.styleB);
  const visual = visualContext(visualDescription || {});
  const bType = buildingType === 'private' ? 'private residence' : 'apartment building';
  const base = [synthesis, visual, bType].filter(Boolean).join(', ');

  const prompts = {
    materials: `Architectural materials mood board, ${base}, material samples flat lay, stone marble wood metal fabric swatches, studio lighting, editorial photography, 16:9 --ar 16:9 --v 6.1 --style raw`,
    colors:    `Architectural color palette board, ${base}, paint chips color swatches gradient study, minimal layout white background, professional design presentation, 16:9 --ar 16:9 --v 6.1 --style raw`,
    mood:      `Architectural inspiration mood board, ${base}, collage of textures details spaces, editorial layout, high contrast, cinematic references --ar 16:9 --v 6.1 --style raw`,
    living:    `Interior design living room, ${base}, golden hour light, architectural photography, ultra-detailed, 8k, photorealistic --ar 16:9 --v 6.1 --style raw`,
    kitchen:   `Interior design kitchen, ${base}, professional kitchen photography, ambient lighting, ultra-detailed surfaces, 8k --ar 16:9 --v 6.1 --style raw`,
    bedroom:   `Interior design master bedroom, ${base}, soft morning light, luxury bedding, architectural photography, ultra-detailed, 8k --ar 16:9 --v 6.1 --style raw`,
    bathroom:  `Interior design bathroom, ${base}, spa-like atmosphere, natural stone, ambient candlelight, architectural photography, 8k --ar 16:9 --v 6.1 --style raw`,
  };

  return prompts[type] || '';
}

export const VISUAL_OPTIONS = {
  materials:  [
    { id: 'concrete', label: 'בטון' },
    { id: 'wood',     label: 'עץ טבעי' },
    { id: 'metal',    label: 'מתכת' },
    { id: 'stone',    label: 'אבן' },
    { id: 'glass',    label: 'זכוכית' },
    { id: 'mixed',    label: 'מעורב' },
  ],
  palette: [
    { id: 'warm',       label: 'חמים' },
    { id: 'cool',       label: 'קריר' },
    { id: 'neutral',    label: 'ניטרלי' },
    { id: 'contrasted', label: 'ניגודים חזקים' },
  ],
  light: [
    { id: 'soft-diffused',   label: 'אור מרוכך' },
    { id: 'dramatic-direct', label: 'אור דרמטי' },
    { id: 'natural-gentle',  label: 'אור טבעי עדין' },
  ],
  atmosphere: [
    { id: 'minimalist', label: 'מינימליסטי' },
    { id: 'organic',    label: 'אורגני' },
    { id: 'industrial', label: 'תעשייתי' },
    { id: 'luxury',     label: 'לוקסוס שקט' },
  ],
};

export const SECTION_LABELS = {
  materials:  'חומרים',
  palette:    'פלטת צבעים',
  light:      'אור',
  atmosphere: 'אווירה',
};