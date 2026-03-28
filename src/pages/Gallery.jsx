import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGalleryImages } from '../lib/storage';

export default function Gallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages(getGalleryImages());
  }, []);

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-border px-8 py-6 flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          ← פרויקטים
        </button>
        <div>
          <h1 className="font-display text-4xl font-light tracking-widest text-gold">GALLERY</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider">כל התמונות שלך</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 py-10">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-display text-2xl font-light text-muted-foreground mb-4">אין תמונות עדיין</p>
            <p className="font-mono text-xs text-muted-foreground">העלה תמונות בפרויקטים כדי לראות אותן כאן</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="group cursor-pointer border border-border hover:border-gold/50 transition-all">
                <div className="relative w-full aspect-video overflow-hidden bg-secondary">
                  <img
                    src={img.imageData}
                    alt={img.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-3 bg-card border-t border-border">
                  <p className="font-mono text-xs text-gold truncate">{img.projectName}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{img.styleName}</p>
                  <p className="font-mono text-xs text-muted-foreground/50 mt-1">
                    {new Date(img.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}