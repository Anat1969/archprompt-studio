export const STYLES_LIST = [
  { id: 'brutalism',            label: 'Brutalism' },
  { id: 'japandi',              label: 'Japandi' },
  { id: 'wabi-sabi',            label: 'Wabi-Sabi' },
  { id: 'bauhaus',              label: 'Bauhaus' },
  { id: 'deconstructivism',     label: 'Deconstructivism' },
  { id: 'new-minimalism',       label: 'New Minimalism' },
  { id: 'scandinavian',         label: 'Scandinavian' },
  { id: 'mediterranean',        label: 'Mediterranean' },
  { id: 'industrial-loft',      label: 'Industrial Loft' },
  { id: 'organic-modern',       label: 'Organic Modern' },
  { id: 'high-tech',            label: 'High-Tech' },
  { id: 'tropical-modern',      label: 'Tropical Modern' },
  { id: 'critical-regionalism', label: 'Critical Regionalism' },
  { id: 'biophilic',            label: 'Biophilic Design' },
  { id: 'art-deco',             label: 'Art Deco' },
  { id: 'neo-classical',        label: 'Neo-Classical' },
];

// ─── Style Synthesis Map ───────────────────────────────────────────────────

const STYLE_SYNTHESIS_MAP = {
  'brutalism+japandi': {
    token:     'raw concrete mass with meditative timber warmth',
    light:     'raking directional light, deep shadow contrast with soft diffusion',
    material:  'board-formed concrete, white oak, washi paper panels, raw steel',
    tension:   'monumental scale compressed into intimate silence',
    architect: 'Tadao Ando spatial sensibility',
  },
  'brutalism+scandinavian': {
    token:     'heavy raw structure softened by Nordic lightness',
    light:     'flat northern diffused light washing raw surfaces',
    material:  'exposed concrete, birch plywood, linen, pale stone',
    tension:   'weight meets weightlessness',
    architect: 'Sigurd Lewerentz materiality',
  },
  'bauhaus+tropical-modern': {
    token:     'geometric precision dissolved by organic growth',
    light:     'diffused equatorial light through structural louvers',
    material:  'primary color steel, lush indoor vegetation, terrazzo',
    tension:   'grid as armature, nature as infill',
    architect: 'Oscar Niemeyer structural poetry',
  },
  'japandi+biophilic': {
    token:     'meditative restraint woven with living material',
    light:     'filtered green light through layered vegetation',
    material:  'bamboo, moss wall panels, river stone, undyed linen',
    tension:   'cultivated nature within constructed silence',
    architect: 'Kengo Kuma material dissolution',
  },
  'wabi-sabi+industrial-loft': {
    token:     'deliberate imperfection within raw industrial shell',
    light:     'single skylight shaft cutting industrial volume',
    material:  'rusted patina steel, cracked plaster, reclaimed timber',
    tension:   'beauty of age inside machinery of production',
    architect: 'Carlo Scarpa detail reverence',
  },
  'high-tech+organic-modern': {
    token:     'engineered precision shaped by natural curves',
    light:     'dynamic LED integration within flowing organic forms',
    material:  'ETFE membrane, curved glass, living green wall systems',
    tension:   'machine intelligence mimicking biological growth',
    architect: 'Renzo Piano structural transparency',
  },
  'deconstructivism+mediterranean': {
    token:     'fractured geometry bathed in southern warmth',
    light:     'harsh Mediterranean sun fracturing through angular apertures',
    material:  'white plaster fragments, terracotta shards, cobalt accent',
    tension:   'ancient order violently questioned',
    architect: 'Frank Gehry collisional forms',
  },
  'art-deco+new-minimalism': {
    token:     'geometric opulence distilled to pure essential line',
    light:     'concealed cove lighting gilding structural edges',
    material:  'fluted brass, honed marble, ebonized oak, blackened steel',
    tension:   'maximum with minimum — gold in silence',
    architect: 'John Pawson refined austerity',
  },
};

function buildDefaultSynthesis(styleA, styleB) {
  const labelA = STYLES_LIST.find(s => s.id === styleA)?.label || styleA;
  const labelB = STYLES_LIST.find(s => s.id === styleB)?.label || styleB;
  return {
    token:     `${labelA} principles in dialogue with ${labelB} sensibility`,
    light:     'considered natural light amplifying material character',
    material:  'curated material palette bridging both traditions',
    tension:   `productive tension between ${labelA} and ${labelB}`,
    architect: `contemporary synthesis of ${labelA} and ${labelB} lineages`,
  };
}

export function getSynthesis(styleA, styleB) {
  if (!styleA && !styleB) return null;
  if (!styleB || !styleA) {
    const label = STYLES_LIST.find(s => s.id === (styleA || styleB))?.label || (styleA || styleB);
    return { token: `${label} spatial language`, light: 'considered natural light', material: label.toLowerCase() + ' material palette', tension: label + ' compositional logic', architect: label + ' precedent' };
  }
  const k1 = `${styleA}+${styleB}`;
  const k2 = `${styleB}+${styleA}`;
  return STYLE_SYNTHESIS_MAP[k1] || STYLE_SYNTHESIS_MAP[k2] || buildDefaultSynthesis(styleA, styleB);
}

// ─── Token Maps ────────────────────────────────────────────────────────────

const MATERIAL_TOKENS = {
  concrete: 'raw board-formed concrete, visible formwork texture',
  wood:     'warm-toned timber, visible grain, natural oil finish',
  metal:    'brushed steel panels, patinated brass accents',
  stone:    'honed limestone, rough-hewn travertine veining',
  glass:    'structural glazing, fritted glass, translucent membrane',
  mixed:    'layered material palette, deliberate material transitions',
};

const PALETTE_TOKENS = {
  warm:       'ochre, burnt sienna, warm grey, aged brass undertones',
  cool:       'slate, fog, pewter, cool white, shadow blue',
  neutral:    'raw linen, bone, natural concrete, bleached oak',
  contrasted: 'deep charcoal against bright white, sharp tonal opposition',
};

const LIGHT_TOKENS = {
  'soft-diffused':   'even northern diffused light, no harsh shadows, volumetric softness',
  'dramatic-direct': 'raking directional sunlight, deep cast shadows, chiaroscuro contrast',
  'natural-gentle':  'filtered ambient daylight, soft penumbra transitions',
};

const ATMOSPHERE_TOKENS = {
  minimalist: 'strict spatial economy, void as protagonist, nothing superfluous',
  organic:    'curved transitions, material warmth, absence of right angles',
  industrial: 'exposed structural systems, mechanical honesty, utilitarian beauty',
  luxury:     'refined material selection, concealed craftsmanship, sensory richness',
};

const BUILDING_TYPE_TOKENS = {
  private: {
    scale:   'intimate residential scale, human proportioned volumes',
    texture: 'warm residential materiality, domestic comfort',
    view:    'interior perspective from living zone, personal scale',
  },
  building: {
    scale:   'architectural monumental scale, civic proportions',
    texture: 'refined commercial finish, institutional presence',
    view:    'architectural perspective showing structural expression',
  },
};

const CAMERA_BASE = {
  camera:   'Shot on Hasselblad X2D 100C, Zeiss Otus 28mm f/1.4',
  settings: 'f/8, ISO 100, natural light, no flash, no HDR',
  rules:    'rule of thirds, foreground shadow anchors lower left, depth through three layered planes, single vanishing point, 20% negative space minimum',
};

const ROOM_CAMERA = {
  living:   'eye-level interior perspective, 28mm, capturing spatial flow',
  kitchen:  'three-quarter view showing counter and volume, 35mm tilt-shift',
  bedroom:  'low angle from entry threshold looking toward fenestration, 28mm',
  bathroom: 'tight architectural detail, 50mm, material and light focus',
};

const BOARD_CAMERA = {
  materials: 'flat lay material study, overhead 90°, Macro 100mm, tactile focus',
  colors:    'architectural color field study, abstract tonal arrangement',
  mood:      'atmospheric interior fragment, shallow depth, 85mm f/1.4',
};

const COMPOSITION_RULES = 'Composition: rule of thirds, deep spatial layers, natural depth, clean architecture.';

// ─── Prompt Builders ───────────────────────────────────────────────────────

export function generatePrompt(type, project) {
  const { visualDescription = {}, styleSynthesis = {}, buildingType = 'private' } = project;
  const synthesis = getSynthesis(styleSynthesis.styleA, styleSynthesis.styleB);
  const mat   = MATERIAL_TOKENS[visualDescription.materials]  || '';
  const pal   = PALETTE_TOKENS[visualDescription.palette]     || '';
  const light = LIGHT_TOKENS[visualDescription.light]         || '';
  const atmo  = ATMOSPHERE_TOKENS[visualDescription.atmosphere] || '';
  const build = BUILDING_TYPE_TOKENS[buildingType] || BUILDING_TYPE_TOKENS.private;

  const boardTypes = ['materials', 'colors', 'mood'];
  if (boardTypes.includes(type)) {
    const subjects = {
      materials: `Architectural material study board — ${mat}, ${pal}`,
      colors:    `Architectural color palette board — ${pal}, ${atmo}`,
      mood:      `Architectural mood inspiration board — ${atmo}, ${synthesis?.token || ''}`,
    };
    const parts = [
      subjects[type] + '.',
      synthesis ? `${synthesis.architect}, ${synthesis.tension}.` : '',
      synthesis ? `${synthesis.material}, ${synthesis.light}.` : '',
      light && `${light}, ${build.texture}.`,
      'Photorealistic architectural photography.',
      COMPOSITION_RULES,
    ];
    return parts.filter(Boolean).join(' ');
  }

  const roomNames = {
    living:   'living room interior',
    kitchen:  'kitchen interior',
    bedroom:  'master bedroom interior',
    bathroom: 'bathroom interior',
  };
  const cam = ROOM_CAMERA[type];
  const parts = [
    `${roomNames[type]}, ${synthesis?.token || ''}.`,
    [mat, pal, atmo].filter(Boolean).join(', ') + '.',
    synthesis ? `${synthesis.architect}, ${synthesis.tension}.` : '',
    synthesis ? synthesis.material + '.' : '',
    light && `${light}, ${build.scale}.`,
    cam && `${cam}, ${CAMERA_BASE.camera}, ${CAMERA_BASE.settings}.`,
    COMPOSITION_RULES,
    'Photorealistic architectural interior photography, magazine quality.',
  ];
  return parts.filter(Boolean).join(' ');
}

// synthesizeStyles is used for the synthesis token display
export function synthesizeStyles(styleA, styleB) {
  const s = getSynthesis(styleA, styleB);
  return s?.token || '';
}

// ─── UI Metadata ───────────────────────────────────────────────────────────

export const VISUAL_OPTIONS = {
  materials: [
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