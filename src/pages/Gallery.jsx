import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProjects, getGalleryImages } from '../lib/storage';
import { jsPDF } from 'jspdf';

const ALL_KEYS = [
  { key: 'materials', section: 'boards', title: 'לוח חומרים',  sectionLabel: 'לוחות בסיס' },
  { key: 'colors',    section: 'boards', title: 'לוח צבעים',   sectionLabel: 'לוחות בסיס' },
  { key: 'mood',      section: 'boards', title: 'לוח השראה',   sectionLabel: 'לוחות בסיס' },
  { key: 'private',   section: 'buildingTypes', title: 'בית פרטי',   sectionLabel: 'סוג מבנה' },
  { key: 'building',  section: 'buildingTypes', title: 'בניין',       sectionLabel: 'סוג מבנה' },
  { key: 'living',    section: 'rooms',  title: 'סלון',         sectionLabel: 'חדרים' },
  { key: 'kitchen',   section: 'rooms',  title: 'מטבח',         sectionLabel: 'חדרים' },
  { key: 'bedroom',   section: 'rooms',  title: 'חדר שינה',     sectionLabel: 'חדרים' },
  { key: 'bathroom',  section: 'rooms',  title: 'חדר רחצה',     sectionLabel: 'חדרים' },
];

export default function Gallery() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [allGalleryImages, setAllGalleryImages] = useState([]);

  useEffect(() => {
    const allProjects = loadProjects();
    setProjects(allProjects);
    const images = getGalleryImages();
    setAllGalleryImages(images);
    if (allProjects.length > 0) {
      setSelectedProjectId(allProjects[0].id);
    }
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setLightbox(null);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectImages = allGalleryImages.filter(img => img.projectId === selectedProjectId);

  async function handleExportPDF() {
    setExporting(true);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(10, 10, 11);
    doc.rect(0, 0, pageW, pageH, 'F');
    doc.setTextColor(201, 169, 110);
    doc.setFontSize(32);
    doc.text(currentProject.name, pageW / 2, pageH / 2 - 10, { align: 'center' });
    const styleA = currentProject.styleSynthesis?.styleA;
    const styleB = currentProject.styleSynthesis?.styleB;
    if (styleA) {
      doc.setFontSize(11);
      doc.setTextColor(150, 130, 100);
      doc.text(styleA + (styleB ? ` × ${styleB}` : ''), pageW / 2, pageH / 2 + 10, { align: 'center' });
    }

    const filled = ALL_KEYS.filter(k => currentProject[k.section]?.[k.key]?.resultImage);
    for (const { key, section, title } of filled) {
      doc.addPage();
      doc.setFillColor(10, 10, 11);
      doc.rect(0, 0, pageW, pageH, 'F');
      doc.setTextColor(201, 169, 110);
      doc.setFontSize(14);
      doc.text(title, 10, 12);
      const img = currentProject[section][key].resultImage;
      doc.addImage(img, 'JPEG', 10, 18, pageW - 20, pageH - 28);
      const prompt = currentProject[section][key].prompt;
      if (prompt) {
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        doc.text(prompt.slice(0, 250), 10, pageH - 2);
      }
    }

    doc.save(`${currentProject.name || 'prompt-studio'}.pdf`);
    setExporting(false);
  }

  if (!currentProject) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground">טוען...</span>
    </div>
  );

  const sections = ['לוחות בסיס', 'חדרים'];
  const hasImages = ALL_KEYS.some(k => currentProject[k.section]?.[k.key]?.resultImage);

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors">
          → HOME
        </button>
        <h1 className="font-display text-2xl font-light text-foreground flex-1">GALLERY</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting || !hasImages}
            className="font-mono text-xs border border-border text-muted-foreground hover:border-gold/50 hover:text-gold px-3 py-1.5 transition-colors disabled:opacity-30"
          >
            {exporting ? 'מייצא...' : 'ייצוא PDF'}
          </button>
        </div>
      </header>

      {/* Project Selector */}
      <div className="border-b border-border px-6 py-4 overflow-x-auto">
        <div className="flex gap-3">
          {projects.map((proj, idx) => {
            const projImages = allGalleryImages.filter(img => img.projectId === proj.id);
            const firstImage = projImages[0];
            const count = projImages.length;
            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`flex-shrink-0 border transition-all ${
                  selectedProjectId === proj.id
                    ? 'border-gold bg-gold/10'
                    : 'border-border hover:border-gold/50'
                }`}
              >
                {firstImage ? (
                  <div className="relative">
                    <img src={firstImage.imageData} alt={proj.name} className="w-28 h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent flex items-end">
                      <div className="p-2 w-full">
                        <p className="font-mono text-xs text-gold font-bold">{idx + 1}</p>
                        <p className="font-mono text-xs text-muted-foreground/80">{count} תמונות</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-secondary flex flex-col items-center justify-center">
                    <p className="font-mono text-xs text-gold font-bold">{idx + 1}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">ריק</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {currentProject.inspirationImage && (
        <div className="w-full h-48 overflow-hidden border-b border-border relative">
          <img src={currentProject.inspirationImage} alt="השראה" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian pointer-events-none" />
        </div>
      )}

      <div className="px-6 py-6 border-b border-border/50">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-1">PROJECT</p>
            <p className="font-display text-lg font-light text-gold">{currentProject.name}</p>
          </div>
          {currentProject.styleSynthesis?.styleA && (
            <div>
              <p className="font-mono text-xs text-muted-foreground mb-1">STYLE</p>
              <p className="font-mono text-xs text-gold">{currentProject.styleSynthesis.styleA}{currentProject.styleSynthesis.styleB ? ` × ${currentProject.styleSynthesis.styleB}` : ''}</p>
            </div>
          )}
          {currentProject.buildingType && (
            <div>
              <p className="font-mono text-xs text-muted-foreground mb-1">TYPE</p>
              <p className="font-mono text-xs text-foreground">{currentProject.buildingType === 'private' ? 'בית פרטי' : 'בניין'}</p>
            </div>
          )}
        </div>
        {currentProject.styleSynthesis?.synthesisToken && (
          <p className="font-mono text-xs text-gold/50 mt-3 leading-relaxed" dir="ltr">{currentProject.styleSynthesis.synthesisToken}</p>
        )}
      </div>

      <div className="px-6 py-8 flex flex-col gap-10">
        {/* Uploaded Images Gallery */}
        {projectImages.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-light text-muted-foreground mb-4 pb-2 border-b border-border/40 tracking-wide">תמונות שהועלו</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectImages.map((img) => (
                <div
                  key={img.id}
                  className="group cursor-pointer border border-border hover:border-gold/50 transition-all overflow-hidden"
                  onClick={() => setLightbox({ image: img })}
                >
                  <div className="aspect-video overflow-hidden bg-secondary">
                    <img
                      src={img.imageData}
                      alt={`${img.styleName} #${img.sequenceNum}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="px-3 py-2">
                    <p className="font-display text-base font-light text-foreground group-hover:text-gold transition-colors">{img.styleName}</p>
                    <p className="font-mono text-xs text-muted-foreground">#{img.sequenceNum}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sections.map(sectionLabel => {
          const cards = ALL_KEYS.filter(k => k.sectionLabel === sectionLabel && currentProject[k.section]?.[k.key]?.resultImage);
          if (cards.length === 0) return null;
          return (
            <div key={sectionLabel}>
              <h2 className="font-display text-2xl font-light text-muted-foreground mb-4 pb-2 border-b border-border/40 tracking-wide">{sectionLabel}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map(({ key, section, title }) => (
                  <div
                    key={key}
                    className="group cursor-pointer border border-border hover:border-gold/50 transition-all overflow-hidden"
                    onClick={() => setLightbox({ key, section, title })}
                  >
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img
                        src={currentProject[section][key].resultImage}
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

        {!hasImages && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-3xl font-light text-muted-foreground">אין תמונות עדיין</p>
            <p className="font-mono text-xs text-muted-foreground mt-2">הדבק תמונות מהמידג'רני בכרטיסי הפרומפט</p>
            <button
              onClick={() => navigate(`/work/${selectedProjectId}`)}
              className="mt-6 font-mono text-xs border border-gold/50 text-gold px-6 py-2 hover:border-gold transition-colors"
            >
              חזרה לפרויקט
            </button>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-obsidian/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-xl font-light text-gold">
                {lightbox.image ? `${lightbox.image.styleName} #${lightbox.image.sequenceNum}` : lightbox.title}
              </p>
              <button onClick={() => setLightbox(null)} className="font-mono text-sm text-muted-foreground hover:text-gold transition-colors px-2">
                × סגור
              </button>
            </div>
            <img
              src={lightbox.image ? lightbox.image.imageData : currentProject[lightbox.section][lightbox.key].resultImage}
              alt={lightbox.image ? lightbox.image.styleName : lightbox.title}
              className="w-full object-contain max-h-[80vh]"
            />
            {!lightbox.image && currentProject[lightbox.section][lightbox.key].prompt && (
              <div className="mt-3 border border-border/50 bg-card px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground leading-relaxed" dir="ltr">{currentProject[lightbox.section][lightbox.key].prompt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}