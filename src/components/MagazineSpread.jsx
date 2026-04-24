import { motion, AnimatePresence } from 'framer-motion';
import { getSynthesis, STYLES_LIST, VISUAL_OPTIONS } from '../lib/promptEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(project) {
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

const fadeSlide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.3 } },
};

// ─── Spread dispatcher ────────────────────────────────────────────────────────

export default function MagazineSpread({ spread, project }) {
  const key = spread.type + (spread.label || '');
  return (
    <AnimatePresence mode="wait">
      <motion.div key={key} {...fadeSlide} className="w-full h-full">
        {spread.type === 'cover'    && <CoverSpread    project={project} />}
        {spread.type === 'boards'   && <BoardsSpread   project={project} images={spread.images} />}
        {spread.type === 'rooms'    && <RoomsSpread    project={project} images={spread.images} />}
        {spread.type === 'exterior' && <ExteriorSpread project={project} images={spread.images} />}
        {spread.type === 'colophon' && <ColophonSpread project={project} />}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Cover Spread ─────────────────────────────────────────────────────────────
// Left page: hero image full bleed. Right page: typographic cover.

function CoverSpread({ project }) {
  const synthesis  = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages  = getAllImages(project);
  const heroUrl    = allImages[0] || null;

  return (
    <div className="w-full h-full grid grid-cols-2">
      {/* Left — hero image */}
      <div className="relative overflow-hidden bg-[#1a1a1a]">
        {heroUrl ? (
          <>
            <img src={heroUrl} alt={displayName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]" />
        )}
        {/* Synthesis token over image */}
        {synthesis && (
          <div className="absolute bottom-10 left-8 right-8">
            <p className="font-mono text-xs text-white/50 uppercase tracking-widest mb-2">design synthesis</p>
            <p className="font-display text-xl text-white/90 font-light leading-snug italic" dir="ltr">
              "{synthesis.tension}"
            </p>
          </div>
        )}
      </div>

      {/* Right — typographic cover */}
      <div className="relative bg-background flex flex-col justify-between px-12 py-14 border-r border-border">
        {/* Top: magazine logo */}
        <div>
          <p className="font-mono text-xs tracking-[0.4em] text-gold/70 mb-8">PROMPT STUDIO — ARCHITECTURE MAGAZINE</p>
          <div className="w-8 h-px bg-gold mb-8" />
        </div>

        {/* Center: project title */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs text-muted-foreground">#{String(project.number).padStart(2, '0')}</span>
          <h1 className="font-display text-5xl font-light text-foreground leading-tight tracking-wide">{displayName}</h1>
          {project.poeticDescription && (
            <p className="font-mono text-sm text-muted-foreground leading-relaxed italic border-r-2 border-gold pr-4">
              {project.poeticDescription}
            </p>
          )}
          {synthesis && (
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-1">חומרים</p>
                <p className="font-mono text-xs text-foreground/70 leading-relaxed" dir="ltr">{synthesis.material}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest mb-1">אסכולה</p>
                <p className="font-mono text-xs text-foreground/70 leading-relaxed" dir="ltr">{synthesis.architect}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: date + visual tags */}
        <div className="flex flex-col gap-3">
          <div className="w-full h-px bg-border" />
          <div className="flex flex-wrap gap-2">
            {['materials', 'palette', 'light', 'atmosphere'].map(cat => {
              const val = project.visualDescription?.[cat];
              if (!val) return null;
              return (
                <span key={cat} className="font-mono text-xs px-2 py-0.5 border border-border text-muted-foreground">
                  {getVisualLabel(cat, val)}
                </span>
              );
            })}
          </div>
          <p className="font-mono text-xs text-muted-foreground/30">
            {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Boards Spread ────────────────────────────────────────────────────────────
// Left: editorial text about design language. Right: board images grid.

function BoardsSpread({ project, images }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);

  return (
    <div className="w-full h-full grid grid-cols-2">
      {/* Left — editorial */}
      <div className="relative bg-background flex flex-col justify-between px-12 py-14 overflow-hidden">
        {/* Background texture: subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <p className="font-mono text-xs text-gold/70 uppercase tracking-[0.3em] mb-4">שפה עיצובית</p>
            <h2 className="font-display text-4xl font-light text-foreground leading-tight">
              לוחות<br />הבסיס
            </h2>
          </div>

          {synthesis && (
            <div className="flex flex-col gap-6">
              <p className="font-display text-xl font-light text-foreground/80 leading-relaxed italic">
                "{synthesis.tension}"
              </p>
              <div className="w-12 h-px bg-gold" />
              <p className="font-mono text-sm text-muted-foreground leading-loose" dir="ltr">
                {synthesis.token}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest">פלטת חומרים</p>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed" dir="ltr">
              {synthesis?.material || '—'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest">אווירת אור</p>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              {project.visualDescription?.light
                ? getVisualLabel('light', project.visualDescription.light)
                : '—'}
            </p>
          </div>
        </div>

        <p className="relative z-10 font-mono text-xs text-muted-foreground/20 tracking-widest">DESIGN LANGUAGE</p>
      </div>

      {/* Right — boards images */}
      <div className="relative bg-[#111] overflow-hidden">
        {images.length === 1 && (
          <div className="w-full h-full">
            <img src={images[0].url} alt={images[0].label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-6 left-6 font-mono text-xs text-white/60 uppercase tracking-widest">{images[0].label}</span>
          </div>
        )}
        {images.length === 2 && (
          <div className="flex flex-col h-full">
            {images.map((img, i) => (
              <div key={i} className={`relative flex-1 overflow-hidden ${i === 0 ? 'border-b border-white/10' : ''}`}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 font-mono text-xs text-white/50 uppercase tracking-widest">{img.label}</span>
              </div>
            ))}
          </div>
        )}
        {images.length >= 3 && (
          <div className="grid grid-rows-2 h-full">
            <div className="relative overflow-hidden border-b border-white/10">
              <img src={images[0].url} alt={images[0].label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 font-mono text-xs text-white/50 uppercase tracking-widest">{images[0].label}</span>
            </div>
            <div className="grid grid-cols-2">
              {images.slice(1, 3).map((img, i) => (
                <div key={i} className={`relative overflow-hidden ${i === 0 ? 'border-l border-white/10' : ''}`}>
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 font-mono text-xs text-white/50 uppercase tracking-widest">{img.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rooms Spread ─────────────────────────────────────────────────────────────
// Full-bleed 2-image layout with gradient overlay for editorial text.

function RoomsSpread({ project, images }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const [img1, img2] = images;

  return (
    <div className="w-full h-full grid grid-cols-2">
      {/* Left — full-bleed room image with text overlay */}
      <div className="relative overflow-hidden bg-[#111]">
        {img1 && (
          <>
            <img src={img1.url} alt={img1.label} className="w-full h-full object-cover" />
            {/* Gradient: dark on right edge to blend into text */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        )}
        {/* Room label */}
        <div className="absolute top-8 right-8">
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest">{img1?.label}</p>
        </div>
        {/* Editorial caption */}
        {synthesis && (
          <div className="absolute bottom-10 left-0 right-0 px-8">
            <p className="font-display text-2xl text-white/90 font-light leading-snug italic">
              "{synthesis.token}"
            </p>
          </div>
        )}
      </div>

      {/* Right — second room image OR text if no second image */}
      {img2 ? (
        <div className="relative overflow-hidden bg-[#111] border-r border-white/5">
          <img src={img2.url} alt={img2.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          {/* Room label */}
          <div className="absolute top-8 left-8">
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">{img2.label}</p>
          </div>
          {/* Atmosphere & material info */}
          <div className="absolute bottom-10 left-8 right-8 flex flex-col gap-2">
            {project.visualDescription?.atmosphere && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-px bg-white/40" />
                <p className="font-mono text-xs text-white/50">{getVisualLabel('atmosphere', project.visualDescription.atmosphere)}</p>
              </div>
            )}
            {synthesis && (
              <p className="font-mono text-xs text-white/30 leading-relaxed" dir="ltr">{synthesis.light}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-background flex flex-col justify-center px-12 py-14">
          <p className="font-mono text-xs text-gold/70 uppercase tracking-widest mb-6">מרחב פנים</p>
          <p className="font-display text-3xl font-light text-foreground leading-snug mb-6">{img1?.label}</p>
          {synthesis && (
            <p className="font-mono text-sm text-muted-foreground leading-relaxed" dir="ltr">{synthesis.material}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Exterior Spread ──────────────────────────────────────────────────────────
// Dramatic full-spread with text block on dark overlay.

function ExteriorSpread({ project, images }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const [img1, img2] = images;

  return (
    <div className="w-full h-full grid grid-cols-2">
      {/* Left — text editorial */}
      <div className="relative flex flex-col justify-between px-12 py-14 bg-[#0e0e0e] overflow-hidden">
        {/* Subtle background image bleed */}
        {img1 && (
          <>
            <img src={img1.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/95 to-[#0e0e0e]/70" />
          </>
        )}
        <div className="relative z-10">
          <p className="font-mono text-xs text-gold/60 uppercase tracking-[0.3em] mb-6">חזית מבנה</p>
          <h2 className="font-display text-5xl font-light text-white leading-tight mb-6">
            {getDisplayName(project)}
          </h2>
          <div className="w-12 h-px bg-gold mb-8" />
          {project.poeticDescription && (
            <p className="font-mono text-sm text-white/60 leading-loose italic mb-8">
              {project.poeticDescription}
            </p>
          )}
          {synthesis && (
            <div className="flex flex-col gap-4">
              <p className="font-mono text-xs text-white/30 uppercase tracking-widest">design tension</p>
              <p className="font-display text-lg text-white/80 font-light italic leading-snug" dir="ltr">
                "{synthesis.tension}"
              </p>
            </div>
          )}
        </div>
        <div className="relative z-10">
          {synthesis && (
            <p className="font-mono text-xs text-white/20 leading-relaxed" dir="ltr">{synthesis.material}</p>
          )}
        </div>
      </div>

      {/* Right — exterior image(s) */}
      <div className="relative bg-[#111] overflow-hidden">
        {img2 ? (
          <>
            <div className="h-1/2 relative border-b border-white/10">
              <img src={img1.url} alt={img1.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 font-mono text-xs text-white/40 uppercase tracking-widest">{img1.label}</span>
            </div>
            <div className="h-1/2 relative">
              <img src={img2.url} alt={img2.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 font-mono text-xs text-white/40 uppercase tracking-widest">{img2.label}</span>
            </div>
          </>
        ) : img1 ? (
          <>
            <img src={img1.url} alt={img1.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30" />
            <span className="absolute bottom-8 left-8 font-mono text-xs text-white/40 uppercase tracking-widest">{img1.label}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Colophon Spread ──────────────────────────────────────────────────────────
// Final typographic closing page.

function ColophonSpread({ project }) {
  const synthesis   = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);
  const displayName = getDisplayName(project);
  const allImages   = getAllImages(project);

  return (
    <div className="w-full h-full grid grid-cols-2">
      {/* Left — last image collage */}
      <div className="relative bg-[#111] overflow-hidden">
        {allImages.length >= 2 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-px bg-white/5">
            {allImages.slice(-4).map((url, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}
          </div>
        ) : allImages.length === 1 ? (
          <>
            <img src={allImages[0]} alt="" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#111]" />
        )}
        {/* Overlay gradient blend into right side */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0e0e0e]/90 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Right — colophon text */}
      <div className="bg-[#0e0e0e] flex flex-col justify-between px-12 py-14">
        <div>
          <p className="font-mono text-xs text-gold/50 uppercase tracking-[0.4em] mb-8">כולופון</p>
          <h2 className="font-display text-4xl font-light text-white leading-tight mb-3">{displayName}</h2>
          <p className="font-mono text-xs text-white/30 mb-10">
            #{String(project.number).padStart(2, '0')} —{' '}
            {new Date(project.updatedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          </p>
          {synthesis && (
            <div className="flex flex-col gap-5 border-r border-gold/30 pr-5">
              <div>
                <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-1">synthesis token</p>
                <p className="font-mono text-xs text-white/50 leading-relaxed" dir="ltr">{synthesis.token}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-1">material palette</p>
                <p className="font-mono text-xs text-white/50 leading-relaxed" dir="ltr">{synthesis.material}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-1">light condition</p>
                <p className="font-mono text-xs text-white/50 leading-relaxed" dir="ltr">{synthesis.light}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-1">architect precedent</p>
                <p className="font-mono text-xs text-white/50 leading-relaxed" dir="ltr">{synthesis.architect}</p>
              </div>
            </div>
          )}
        </div>

        {/* Visual tags */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-px bg-white/10" />
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
          <p className="font-mono text-xs text-white/15 tracking-widest">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
        </div>
      </div>
    </div>
  );
}