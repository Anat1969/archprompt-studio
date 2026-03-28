import { useRef } from 'react';

export default function InspirationUpload({ image, onChange }) {
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) readFile(file);
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        readFile(item.getAsFile());
        break;
      }
    }
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      className="relative w-full h-40 border border-border bg-secondary cursor-pointer group hover:border-gold/50 transition-all focus:outline-none focus:border-gold/50"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {image ? (
        <img src={image} alt="השראה" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="font-mono text-xs text-muted-foreground tracking-widest group-hover:text-gold/70 transition-colors">גרור / הדבק / בחר תמונת השראה</span>
        </div>
      )}
      {image && (
        <div className="absolute inset-0 bg-obsidian/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="font-mono text-xs text-gold tracking-wider">החלף תמונה</span>
        </div>
      )}
    </div>
  );
}