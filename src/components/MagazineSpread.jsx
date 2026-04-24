import { motion, AnimatePresence } from 'framer-motion';
import { getSynthesis, STYLES_LIST, VISUAL_OPTIONS } from '../lib/promptEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDisplayName(project) {
  const { styleSynthesis } = project;
  if (!styleSynthesis?.styleA && !styleSynthesis?.styleB) return project.name || `פרויקט #${project.number}`;
  const a = STYLES_LIST.find(s => s.id === styleSynthesis?.styleA)?.label?.split(' — ')[0] || '';
  const b = STYLES_LIST.find(s => s.id === styleSynthesis?.styleB)?.label?.split(' — ')[0] || '';
  return [a, b].filter(Boolean).join(' × ') || project.name;
}

function getVisualLabel(category, id) {
  return VISUAL_OPTIONS[category]?.find(o => o.id === id)?.label || id;
}

function getAllImages(project) {
  return [
    ...Object.values(project.boards || {}),
    ...Object.values(project.rooms  || {}),
    ...Object.values(project.buildingTypes || {}),
  ].filter(v => v?.resultImage).map(v => v.resultImage);
}

// ─── Editorial texts per image type ──────────────────────────────────────────

const BOARD_CAPTIONS = {
  materials: (synthesis) => synthesis
    ? `לוח החומרים הוא ה-DNA של הפרויקט. כאן מתגבשים חומרי הגלם שמגדירים את הטמפרטורה החושית — ${synthesis.material || ''}.`
    : 'לוח החומרים — השכבה הראשונה של הזהות האסתטית של הפרויקט.',
  colors: (synthesis) => synthesis
    ? `פלטת הצבעים היא הגל הרגשי של המרחב. ${synthesis.tension ? `"${synthesis.tension}"` : ''} — ניואנסים של אור וצל שמכוונים את ההרגשה ברגע הכניסה.`
    : 'לוח הצבעים — מפה רגשית של הפרויקט.',
  mood: (synthesis) => synthesis
    ? `לוח האווירה מתרגם תחושה לחזון. ${synthesis.token ? synthesis.token : ''} — איסוף רגעים ויזואליים שמדברים את השפה שהמלים לא יכולות.`
    : 'לוח ההשראה — אוסף תמונות שמגדירות את הרוח הכוללת.',
};

const ROOM_CAPTIONS = {
  living: (synthesis) => synthesis
    ? `הסלון הוא הלב הפועם של הבית — המקום שבו פרטיות מפגשת חברה. ${synthesis.material ? `${synthesis.material}.` : ''} ${synthesis.tension ? `"${synthesis.tension}"` : ''}`
    : 'הסלון — החלל שמגדיר את אופי הבית.',
  kitchen: (synthesis) => synthesis
    ? `המטבח הוא מעבדת היומיום — מקום בו ריח וצורה פוגשים זה את זה. ${synthesis.light ? synthesis.light : ''}. אסתטיקה שמשרתת תפקוד, ותפקוד שמשרת יופי.`
    : 'המטבח — שם שגרה הופכת לאמנות.',
  bedroom: (synthesis) => synthesis
    ? `חדר השינה הוא קודש הקדשים של הבית. ${synthesis.tension ? `"${synthesis.tension}" —` : ''} שקט מחושב שמאפשר לנשמה לנוח.`
    : 'חדר השינה — החלל האינטימי ביותר.',
  bathroom: (synthesis) => synthesis
    ? `חדר הרחצה הוא הרגע הפרטי ביותר. ${synthesis.material ? synthesis.material + '.' : ''} מינימליזם שאינו ויתור — אלא בחירה.`
    : 'חדר הרחצה — טקס יומי של כניסה וצאת.',
};

const BUILDING_CAPTIONS = {
  private: (synthesis, project) => synthesis
    ? `חזית הבית הפרטי היא המשפט הראשון שהבניין אומר לרחוב. ${project.poeticDescription ? project.poeticDescription : ''}`
    : 'הבית הפרטי — פנים שפונות החוצה.',
  building: (synthesis, project) => synthesis
    ? `הבניין הרב-קומותי מדבר בשפה עירונית — שפה שמחויבת גם לשמיים גם לרחוב. ${synthesis.tension ? `"${synthesis.tension}"` : ''}`
    : 'הבניין — דיאלוג בין פרט לציבור.',
};

function getCaption(imageType, imageKey, project) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  if (imageType === 'boards') return (BOARD_CAPTIONS[imageKey] || (() => ''))(synthesis);
  if (imageType === 'rooms')  return (ROOM_CAPTIONS[imageKey]  || (() => ''))(synthesis);
  if (imageType === 'buildingTypes') return (BUILDING_CAPTIONS[imageKey] || (() => ''))(synthesis, project);
  return '';
}

// ─── Layout variants ──────────────────────────────────────────────────────────
// Each "page" can have one of several layouts alternating through the magazine.

const LAYOUTS = ['hero-text-bottom', 'text-left-image-right', 'image-left-text-right', 'fullbleed-caption'];

function getLayout(index) {
  return LAYOUTS[index % LAYOUTS.length];
}

// ─── Fade transition ──────────────────────────────────────────────────────────

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.35 } },
};

// ─── Spread dispatcher ────────────────────────────────────────────────────────

export default function MagazineSpread({ spread, project }) {
  const key = spread.type + (spread.label || '') + (spread.imageKey || '');
  return (
    <AnimatePresence mode="wait">
      <motion.div key={key} {...pageTransition} className="w-full h-full">
        {spread.type === 'cover'    && <CoverPage    project={project} />}
        {spread.type === 'image'    && <ImagePage    project={project} spread={spread} />}
        {spread.type === 'colophon' && <ColophonPage project={project} />}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

function CoverPage({ project }) {
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages   = getAllImages(project);
  const heroUrl     = project.inspirationImage || allImages[0] || null;

  return (
    <div className="w-full h-full relative bg-[#0e0e0e] overflow-hidden flex">
      {/* Full-bleed hero image, left 60% */}
      <div className="relative w-[60%] h-full flex-shrink-0">
        {heroUrl ? (
          <>
            <img src={heroUrl} alt={displayName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]" />
        )}
      </div>

      {/* Right text column */}
      <div className="flex-1 bg-[#0e0e0e] flex flex-col justify-between px-10 py-14 border-r border-white/5">
        <div>
          <p className="font-mono text-xs tracking-[0.4em] text-gold/60 mb-10 uppercase">Prompt Studio</p>
          <div className="w-6 h-px bg-gold mb-10" />
          <span className="font-mono text-xs text-white/25 block mb-3">#{String(project.number).padStart(2, '0')}</span>
          <h1 className="font-display text-4xl font-light text-white leading-tight tracking-wide mb-8">
            {displayName}
          </h1>
          {project.poeticDescription && (
            <p className="font-mono text-sm text-white/50 leading-relaxed italic border-r-2 border-gold/40 pr-4">
              {project.poeticDescription}
            </p>
          )}
        </div>

        {synthesis && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-1">design tension</p>
            <p className="font-display text-lg text-white/70 font-light italic leading-snug" dir="ltr">
              "{synthesis.tension}"
            </p>
            <div className="w-full h-px bg-white/10 my-3" />
            <div className="flex flex-wrap gap-2">
              {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
                const val = project.visualDescription?.[cat];
                if (!val) return null;
                return (
                  <span key={cat} className="font-mono text-xs px-2 py-0.5 border border-white/10 text-white/30">
                    {getVisualLabel(cat, val)}
                  </span>
                );
              })}
            </div>
            <p className="font-mono text-xs text-white/15 tracking-widest mt-2">
              {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image Page ───────────────────────────────────────────────────────────────
// Each image gets its own editorial page. Layout rotates.

function ImagePage({ project, spread }) {
  const { imageUrl, imageLabel, imageKey, imageType, pageIndex } = spread;
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const caption     = getCaption(imageType, imageKey, project);
  const layout      = getLayout(pageIndex);

  const sectionTag = imageType === 'boards' ? 'שפה עיצובית'
                   : imageType === 'rooms'   ? 'מרחב פנים'
                   : 'חזית מבנה';

  // ── Layout A: Full-bleed image, text block at bottom ──
  if (layout === 'hero-text-bottom') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#111]">
        <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover" />
        {/* Dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* Top tag */}
        <div className="absolute top-10 right-10 flex items-center gap-3">
          <div className="w-4 h-px bg-gold" />
          <span className="font-mono text-xs text-white/50 uppercase tracking-widest">{sectionTag}</span>
        </div>
        {/* Bottom editorial block */}
        <div className="absolute bottom-0 left-0 right-0 px-14 py-12">
          <p className="font-mono text-xs text-gold/70 uppercase tracking-widest mb-3">{imageLabel}</p>
          <h2 className="font-display text-4xl font-light text-white leading-tight mb-5">{displayName}</h2>
          {caption && (
            <p className="font-mono text-sm text-white/60 leading-loose max-w-xl">{caption}</p>
          )}
          {synthesis && (
            <p className="font-mono text-xs text-white/25 mt-5 leading-relaxed" dir="ltr">{synthesis.token}</p>
          )}
        </div>
        {/* Page number */}
        <div className="absolute bottom-10 left-10">
          <span className="font-mono text-xs text-white/15">{String(pageIndex + 2).padStart(2, '0')}</span>
        </div>
      </div>
    );
  }

  // ── Layout B: Text left, image right ──
  if (layout === 'text-left-image-right') {
    return (
      <div className="w-full h-full flex bg-background">
        {/* Left text column */}
        <div className="w-[42%] flex-shrink-0 flex flex-col justify-between px-12 py-16 border-l border-border">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-4 h-px bg-gold" />
              <span className="font-mono text-xs text-gold/70 uppercase tracking-widest">{sectionTag}</span>
            </div>
            <h2 className="font-display text-5xl font-light text-foreground leading-tight mb-6">{imageLabel}</h2>
            <div className="w-8 h-px bg-border mb-8" />
            {caption && (
              <p className="font-mono text-sm text-muted-foreground leading-loose">{caption}</p>
            )}
          </div>
          <div>
            {synthesis && (
              <div className="border-r-2 border-gold/30 pr-4 mb-6">
                <p className="font-display text-lg text-foreground/70 italic font-light leading-snug">
                  "{synthesis.tension}"
                </p>
              </div>
            )}
            <span className="font-mono text-xs text-muted-foreground/30">{String(pageIndex + 2).padStart(2, '0')}</span>
          </div>
        </div>
        {/* Right image */}
        <div className="flex-1 relative overflow-hidden bg-[#111]">
          <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // ── Layout C: Image left, text right ──
  if (layout === 'image-left-text-right') {
    return (
      <div className="w-full h-full flex bg-background">
        {/* Left image */}
        <div className="w-[58%] flex-shrink-0 relative overflow-hidden bg-[#111]">
          <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </div>
        {/* Right text column */}
        <div className="flex-1 flex flex-col justify-between px-12 py-16 border-r border-border">
          <div>
            <span className="font-mono text-xs text-muted-foreground/40 uppercase tracking-widest block mb-2">{sectionTag}</span>
            <div className="w-full h-px bg-border mb-8" />
            <h2 className="font-display text-4xl font-light text-foreground leading-tight mb-6">{imageLabel}</h2>
            {caption && (
              <p className="font-mono text-sm text-muted-foreground leading-loose">{caption}</p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {synthesis && (
              <>
                <div className="w-full h-px bg-border" />
                <p className="font-mono text-xs text-muted-foreground/50 leading-relaxed" dir="ltr">{synthesis.material}</p>
              </>
            )}
            <span className="font-mono text-xs text-muted-foreground/25">{String(pageIndex + 2).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout D: Full-bleed + side caption strip ──
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#111]">
      <img src={imageUrl} alt={imageLabel} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/20 to-transparent" />
      {/* Right caption strip */}
      <div className="absolute top-0 left-0 bottom-0 w-[36%] flex flex-col justify-center px-10 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-gold" />
          <span className="font-mono text-xs text-white/50 uppercase tracking-widest">{sectionTag}</span>
        </div>
        <h2 className="font-display text-4xl font-light text-white leading-tight">{imageLabel}</h2>
        {caption && (
          <p className="font-mono text-sm text-white/60 leading-loose">{caption}</p>
        )}
        {synthesis && (
          <div className="border-r border-gold/30 pr-4 mt-2">
            <p className="font-display text-base text-white/50 italic font-light leading-snug">
              "{synthesis.token}"
            </p>
          </div>
        )}
        <span className="font-mono text-xs text-white/20 mt-6">{String(pageIndex + 2).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// ─── Colophon Page ────────────────────────────────────────────────────────────

function ColophonPage({ project }) {
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages   = getAllImages(project);

  return (
    <div className="w-full h-full flex bg-[#0e0e0e]">
      {/* Left: image collage */}
      <div className="w-[55%] flex-shrink-0 relative overflow-hidden">
        {allImages.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-white/5">
            {allImages.slice(-4).map((url, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            ))}
          </div>
        ) : allImages.length >= 2 ? (
          <div className="flex flex-col h-full gap-px bg-white/5">
            {allImages.slice(-2).map((url, i) => (
              <div key={i} className="flex-1 relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            ))}
          </div>
        ) : allImages[0] ? (
          <img src={allImages[0]} alt="" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0e0e]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0e0e0e]/80 pointer-events-none" />
      </div>

      {/* Right: colophon text */}
      <div className="flex-1 flex flex-col justify-between px-12 py-16">
        <div>
          <p className="font-mono text-xs text-gold/40 uppercase tracking-[0.4em] mb-10">כולופון</p>
          <h2 className="font-display text-4xl font-light text-white leading-tight mb-2">{displayName}</h2>
          <p className="font-mono text-xs text-white/20 mb-10">
            #{String(project.number).padStart(2, '0')} —{' '}
            {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          </p>
          {project.poeticDescription && (
            <p className="font-mono text-sm text-white/50 leading-relaxed italic border-r-2 border-gold/30 pr-4 mb-8">
              {project.poeticDescription}
            </p>
          )}
          {synthesis && (
            <div className="flex flex-col gap-5 border-r border-white/10 pr-5">
              {[
                { label: 'synthesis token', val: synthesis.token },
                { label: 'material palette', val: synthesis.material },
                { label: 'light condition',  val: synthesis.light },
                { label: 'architect ref',    val: synthesis.architect },
              ].filter(r => r.val).map(row => (
                <div key={row.label}>
                  <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-1">{row.label}</p>
                  <p className="font-mono text-xs text-white/45 leading-relaxed" dir="ltr">{row.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-wrap gap-2">
            {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
              const val = project.visualDescription?.[cat];
              if (!val) return null;
              return (
                <span key={cat} className="font-mono text-xs px-2 py-0.5 border border-white/10 text-white/25">
                  {getVisualLabel(cat, val)}
                </span>
              );
            })}
          </div>
          <p className="font-mono text-xs text-white/10 tracking-widest mt-2">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
        </div>
      </div>
    </div>
  );
}