import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects } from '../lib/storage';
import MagazineSpread from '../components/MagazineSpread';

export default function MagazineViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [projectIdx, setProjectIdx] = useState(0);
  const [spreadIdx, setSpreadIdx]   = useState(0);

  useEffect(() => {
    const all = loadProjects();
    const withImages = all.filter(p => {
      const vals = [
        ...Object.values(p.boards || {}),
        ...Object.values(p.rooms  || {}),
        ...Object.values(p.buildingTypes || {}),
      ];
      return vals.some(v => v?.resultImage);
    });
    setProjects(withImages);
    const idx = withImages.findIndex(p => p.id === id);
    setProjectIdx(idx >= 0 ? idx : 0);
    setSpreadIdx(0);
  }, [id]);

  const project = projects[projectIdx];

  // Keyboard navigation
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft')  goNext();
    if (e.key === 'ArrowRight') goPrev();
    if (e.key === 'Escape')     navigate('/gallery');
  }, [spreadIdx, projectIdx, projects]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!project) return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <p className="font-mono text-sm text-muted-foreground">טוען...</p>
    </div>
  );

  // Build spreads for current project: [cover, boards, rooms, exterior, colophon]
  const spreads = buildSpreads(project);
  const totalSpreads = spreads.length;

  function goPrev() {
    if (spreadIdx > 0) {
      setSpreadIdx(s => s - 1);
    } else if (projectIdx > 0) {
      const prevProject = projects[projectIdx - 1];
      navigate(`/magazine/${prevProject.id}`);
      setProjectIdx(i => i - 1);
      setSpreadIdx(0);
    }
  }

  function goNext() {
    if (spreadIdx < totalSpreads - 1) {
      setSpreadIdx(s => s + 1);
    } else if (projectIdx < projects.length - 1) {
      const nextProject = projects[projectIdx + 1];
      navigate(`/magazine/${nextProject.id}`);
      setProjectIdx(i => i + 1);
      setSpreadIdx(0);
    }
  }

  const canPrev = spreadIdx > 0 || projectIdx > 0;
  const canNext = spreadIdx < totalSpreads - 1 || projectIdx < projects.length - 1;

  return (
    <div className="fixed inset-0 bg-[#111] flex flex-col overflow-hidden" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-white/10 z-10 flex-shrink-0">
        <button
          onClick={() => navigate('/gallery')}
          className="font-mono text-xs text-white/50 hover:text-white transition-colors"
        >
          ← מקרא
        </button>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm text-white/70 tracking-wider">
            {spreads[spreadIdx]?.label || ''}
          </span>
          <span className="font-mono text-xs text-white/30">
            {spreadIdx + 1} / {totalSpreads}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 1 && (
            <span className="font-mono text-xs text-white/30">
              פרויקט {projectIdx + 1} / {projects.length}
            </span>
          )}
        </div>
      </div>

      {/* Magazine spread */}
      <div className="flex-1 overflow-hidden relative">
        <MagazineSpread spread={spreads[spreadIdx]} project={project} />

        {/* Page turn navigation */}
        {canPrev && (
          <button
            onClick={goPrev}
            className="absolute right-0 top-0 h-full w-20 flex items-center justify-end pr-4 group z-10"
            aria-label="עמוד קודם"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/15 border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-all duration-200">
              <span className="text-white/50 group-hover:text-white text-lg transition-colors">›</span>
            </div>
          </button>
        )}
        {canNext && (
          <button
            onClick={goNext}
            className="absolute left-0 top-0 h-full w-20 flex items-center justify-start pl-4 group z-10"
            aria-label="עמוד הבא"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/15 border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-all duration-200">
              <span className="text-white/50 group-hover:text-white text-lg transition-colors">‹</span>
            </div>
          </button>
        )}
      </div>

      {/* Spread dots */}
      <div className="flex items-center justify-center gap-2 py-3 bg-black/60 flex-shrink-0">
        {spreads.map((s, i) => (
          <button
            key={i}
            onClick={() => setSpreadIdx(i)}
            className={`transition-all duration-200 rounded-full ${
              i === spreadIdx
                ? 'w-6 h-1.5 bg-gold'
                : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Build spreads from project data ─────────────────────────────────────────

const BOARD_LABELS    = { materials: 'חומרים', colors: 'צבעים', mood: 'אווירה' };
const ROOM_LABELS     = { living: 'סלון', kitchen: 'מטבח', bedroom: 'חדר שינה', bathroom: 'חדר רחצה' };
const BUILDING_LABELS = { private: 'בית פרטי', building: 'בניין' };

function buildSpreads(project) {
  const spreads = [];

  // 1. Cover spread
  spreads.push({ type: 'cover', label: 'עטיפה' });

  // 2. Boards spread (if any)
  const boardImages = Object.entries(project.boards || {})
    .filter(([, v]) => v?.resultImage)
    .map(([k, v]) => ({ url: v.resultImage, label: BOARD_LABELS[k] || k }));
  if (boardImages.length > 0) {
    spreads.push({ type: 'boards', label: 'לוחות בסיס', images: boardImages });
  }

  // 3. Rooms — pair them into spreads of 2
  const roomImages = Object.entries(project.rooms || {})
    .filter(([, v]) => v?.resultImage)
    .map(([k, v]) => ({ url: v.resultImage, label: ROOM_LABELS[k] || k }));
  if (roomImages.length > 0) {
    for (let i = 0; i < roomImages.length; i += 2) {
      spreads.push({
        type: 'rooms',
        label: `מרחבי פנים — ${roomImages.slice(i, i+2).map(r => r.label).join(', ')}`,
        images: roomImages.slice(i, i + 2),
      });
    }
  }

  // 4. Exteriors
  const extImages = Object.entries(project.buildingTypes || {})
    .filter(([, v]) => v?.resultImage)
    .map(([k, v]) => ({ url: v.resultImage, label: BUILDING_LABELS[k] || k }));
  if (extImages.length > 0) {
    spreads.push({ type: 'exterior', label: 'חזית מבנה', images: extImages });
  }

  // 5. Colophon
  spreads.push({ type: 'colophon', label: 'כולופון' });

  return spreads;
}