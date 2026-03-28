import { useState, useRef } from 'react';

export default function PromptCard({ title, promptKey, prompt, image, onGenerate, onPromptChange, onImagePaste }) {
  const [copied, setCopied] = useState(false);
  const imageAreaRef = useRef(null);

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => onImagePaste(promptKey, ev.target.result);
        reader.readAsDataURL(file);
        break;
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => onImagePaste(promptKey, ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onImagePaste(promptKey, ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="border border-border bg-card flex flex-col gap-0 overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg font-light tracking-wide text-gold">{title}</h3>
        <button
          onClick={onGenerate}
          className="font-mono text-xs tracking-wider border border-gold/50 text-gold/80 hover:border-gold hover:text-gold px-3 py-1 transition-all"
        >
          הפק פרומפט
        </button>
      </div>

      {/* Prompt textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(promptKey, e.target.value)}
          placeholder="הפרומפט יופיע כאן..."
          className="w-full bg-transparent font-mono text-xs text-foreground/80 p-4 resize-none h-24 focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed"
          dir="ltr"
        />
        {prompt && (
          <button
            onClick={handleCopy}
            className="absolute bottom-2 left-2 font-mono text-xs text-muted-foreground hover:text-gold transition-colors px-2 py-1 border border-border hover:border-gold/50"
          >
            {copied ? 'הועתק' : 'העתק'}
          </button>
        )}
      </div>

      {/* 16:9 image area */}
      <div
        ref={imageAreaRef}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
        className="relative w-full aspect-video bg-secondary border-t border-border cursor-pointer group focus:outline-none focus:border-gold/50"
        onClick={() => document.getElementById(`img-input-${promptKey}`)?.click()}
      >
        <input
          id={`img-input-${promptKey}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="font-mono text-xs text-muted-foreground/50 tracking-wider group-hover:text-muted-foreground transition-colors">הדבק / גרור / בחר תמונה</span>
            <span className="font-mono text-xs text-muted-foreground/30">16:9</span>
          </div>
        )}
      </div>
    </div>
  );
}