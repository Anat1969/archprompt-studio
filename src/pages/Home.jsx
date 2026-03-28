import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects, createProject, saveProject, deleteProject } from '../lib/storage';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  function handleNew() {
    const p = createProject();
    saveProject(p);
    navigate(`/work/${p.id}`);
  }

  function handleOpen(id) {
    navigate(`/work/${id}`);
  }

  function handleDelete(e, id) {
    e.stopPropagation();
    deleteProject(id);
    setProjects(loadProjects());
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl font-light tracking-widest text-gold">PROMPT STUDIO</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider">ARCHITECTURAL MIDJOURNEY GENERATOR</p>
        </div>
        <button
          onClick={handleNew}
          className="border border-gold text-gold font-mono text-xs tracking-widest px-6 py-3 hover:bg-gold hover:text-obsidian transition-all duration-200"
        >
          + פרויקט חדש
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 py-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-3xl font-light text-muted-foreground mb-4">אין פרויקטים עדיין</p>
            <p className="font-mono text-xs text-muted-foreground">לחץ על "פרויקט חדש" כדי להתחיל</p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl font-light text-muted-foreground mb-6 tracking-wide">פרויקטים אחרונים</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleOpen(p.id)}
                  className="border border-border bg-card hover:border-gold cursor-pointer transition-all duration-200 group animate-fade-in"
                >
                  {/* Inspiration thumbnail */}
                  <div className="aspect-video bg-secondary overflow-hidden">
                    {p.inspirationImage ? (
                      <img src={p.inspirationImage} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-muted-foreground">ללא תמונה</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <p className="font-display text-lg font-light text-foreground group-hover:text-gold transition-colors">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">{formatDate(p.updatedAt)}</p>
                      {p.styles?.primary && (
                        <p className="font-mono text-xs text-gold/60 mt-1">{p.styles.primary}{p.styles.secondary ? ` × ${p.styles.secondary}` : ''}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="font-mono text-xs text-muted-foreground hover:text-destructive transition-colors px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border px-8 py-4 text-center">
        <p className="font-mono text-xs text-muted-foreground tracking-widest">PROMPT STUDIO — OBSIDIAN EDITION</p>
      </footer>
    </div>
  );
}