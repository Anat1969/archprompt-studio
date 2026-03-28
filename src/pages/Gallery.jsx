import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects } from '../lib/storage';
import { jsPDF } from 'jspdf';

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
  const [exporting, setExporting] = useState(false);

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

  async function handleExportPDF() {
    setExporting(true);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Cover page
    doc.setFillColor(10, 10, 11);
    doc.rect(0, 0, pageW, pageH, 'F');
    doc.setTextColor(201, 169, 110);
    doc.setFontSize(32);
    doc.text(project.name, pageW / 2, pageH / 2 - 10, { align: 'center' });
    if (project.styles?.primary) {
      doc.setFontSize(11);
      doc.setTextColor(150, 130, 100);
      const styleLabel = project.styles.primary + (project.styles.secondary ? ` × ${project.styles.secondary}` : '');
      doc.text(styleLabel, pageW / 2, pageH / 2 + 10, { align: 'center' });
    }

    const filled = ALL_KEYS.filter(k => project.images?.[k.key]);
    for (const { key, title } of filled) {
      doc.addPage();
      doc.setFillColor(10, 10, 11);
      doc.rect(0, 0, pageW, pageH, 'F');
      doc.setTextColor(201, 169, 110);
      doc.setFontSize(14);
      doc.text(title, 10, 12);
      const img = project.images[key];
      const imgH = pageH - 24;
      doc.addImage(img, 'JPEG', 10, 18, pageW - 20, imgH);
      if (project.prompts?.[key]) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(project.prompts[key].slice(0, 200), 10, pageH - 2);
      }
    }

    doc.save(`${project.name || 'prompt-studio'}.pdf`);
    setExporting(false);
  }

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="font-mono text-xs border border-border text-muted-foreground hover:border-gold/50 hover:text-gold px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {exporting ? 'מייצא...' : 'ייצוא PDF'}
          </button>
          <span className="font-mono text-xs text-muted-foreground tracking-widest">GALLERY</span>
        </div>
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