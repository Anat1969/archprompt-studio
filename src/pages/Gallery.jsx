import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects } from '../lib/storage';
import MagazinePage from '../components/MagazinePage';

export default function Gallery() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const all = loadProjects();
    // Only show projects that have at least one result image
    const withImages = all.filter(p => {
      const hasBoard = Object.values(p.boards || {}).some(v => v?.resultImage);
      const hasRoom  = Object.values(p.rooms  || {}).some(v => v?.resultImage);
      const hasBuild = Object.values(p.buildingTypes || {}).some(v => v?.resultImage);
      return hasBoard || hasRoom || hasBuild;
    });
    setProjects(withImages);
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border px-8 py-6 flex items-center gap-6 sticky top-0 bg-background z-10">
        <button
          onClick={() => navigate('/projects')}
          className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          ← פרויקטים
        </button>
        <div>
          <h1 className="font-display text-4xl font-light tracking-widest text-gold">MAGAZINE</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider">פרסום אדריכלות — דפי פרויקט</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 py-10 max-w-7xl mx-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-2xl font-light text-muted-foreground mb-4">אין תמונות עדיין</p>
            <p className="font-mono text-xs text-muted-foreground">העלה תמונות בפרויקטים כדי לייצר דפי מגזין</p>
          </div>
        ) : (
          projects.map(p => <MagazinePage key={p.id} project={p} />)
        )}
      </main>

      <footer className="border-t border-border px-8 py-4 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">PROMPT STUDIO — ARCHITECTURAL MAGAZINE</p>
      </footer>
    </div>
  );
}