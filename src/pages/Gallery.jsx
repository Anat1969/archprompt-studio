import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects } from '../lib/storage';

const ALL_KEYS = [
  { key: 'materialsBoard', title: 'לוח חומרים', section: 'לוחות בסיס' },
  { key: 'colorBoard', title: 'לוח צבעים', section: 'לוחות בסיס' },
  { key: 'inspirationBoard', title: 'לוח השראה', section: 'לוחות בסיס' },
  { key: 'livingRoom', title: 'סלון', section: 'חדרים' },
  { key: 'kitchen', title: 'מטבח', section: 'חדרים' },
  { key: 'bedroom', title: 'חדר שינה', section: 'חדרים' },
  { key: 'bathroom', title: 'חדר רחצה', section: 'חדרים' },
];

export default function Gallery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const projects = loadProjects();
    const found = projects.find(p => p.id === id);
    if (found) setProject(found);
    else navigate('/');
  }, [id]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setLightbox(null);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!project) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground">טוען...</span>
    </div>
  );

  const sections = ['לוחות בסיס', 'חדרים'];

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(`/work/${id}`)} className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors">
          → חזרה לפרויקט
        </button>
        <h1 className="font-display text-2xl font-light text-foreground flex-1">{project.name}</h1>
        <span className="font-mono text-xs text-muted-foreground tracking-widest">GALLERY</span>
      </header>

      {/* Inspiration banner */}
      {project.inspirationImage && (
        <div className="w-full h-48 overflow-hidden border-b border-border">
          <img src={project.inspirationImage} alt="השראה" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian pointer-events-none" />
        </div>
      )}

      {/* Project meta */}
      <div className="px-6 py-6 border-b border-border/50">
        <div className="flex flex-wrap gap-6">
          {project.styles?.primary && (
            <div>
              <p className="font-mono text-xs text-muted-foreground mb-1">STYLE</p>
              <p className="font-mono text-xs text-gold">{project.styles.primary}{project.styles.secondary ? ` × ${project.styles.secondary}` : ''}</p>
            </div>
          )}
          {project.buildingType && (
            <div>
              <p className="font-mono text-xs text-muted-foreground mb-1">TYPE</p>
              <p className="font-mono text-xs text-foreground">{project.buildingType === 'house' ? 'בית פרטי' : 'בניין'}</p>
            </div>
          )}
        </div>
        {project.synthesis && (
          <p className="font-mono text-xs text-gold/50 mt-3 leading-relaxed" dir="ltr">{project.synthesis}</p>
        )}
      </div>

      {/* Grid by sections */}
      <div className="px-6 py-8 flex flex-col gap-10">
        {sections.map(section => {
          const cards = ALL_KEYS.filter(k => k.section === section && project.images?.[k.key]);
          if (cards.length === 0) return null;
          return (
            <div key={section}>
              <h2 className="font-display text-2xl font-light text-muted-foreground mb-4 pb-2 border-b border-border/40 tracking-wide">{section}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(({ key, title }) => (
                  <div
                    key={key}
                    className="group cursor-pointer border border-border hover:border-gold/50 transition-all overflow-hidden"
                    onClick={() => setLightbox({ key, title })}
                  >
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img
                        src={project.images[key]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="px-3 py-2">
                      <p className="font-display text-base font-light text-foreground group-hover:text-gold transition-colors">{title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {ALL_KEYS.every(k => !project.images?.[k.key]) && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-3xl font-light text-muted-foreground">אין תמונות עדיין</p>
            <p className="font-mono text-xs text-muted-foreground mt-2">הדבק תמונות מהמידג'רני בכרטיסי הפרומפט</p>
            <button
              onClick={() => navigate(`/work/${id}`)}
              className="mt-6 font-mono text-xs border border-gold/50 text-gold px-6 py-2 hover:border-gold transition-colors"
            >
              חזרה לפרויקט
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-obsidian/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-xl font-light text-gold">{lightbox.title}</p>
              <button
                onClick={() => setLightbox(null)}
                className="font-mono text-sm text-muted-foreground hover:text-gold transition-colors px-2"
              >
                × סגור
              </button>
            </div>
            <img
              src={project.images[lightbox.key]}
              alt={lightbox.title}
              className="w-full object-contain max-h-[80vh]"
            />
            {project.prompts?.[lightbox.key] && (
              <div className="mt-3 border border-border/50 bg-card px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground leading-relaxed" dir="ltr">{project.prompts[lightbox.key]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}