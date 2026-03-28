import { useState, useRef } from 'react';
import { generatePrompt } from '../lib/promptEngine';

const SECTION_MAP = {
  materials: 'boards',
  colors:    'boards',
  mood:      'boards',
  living:    'rooms',
  kitchen:   'rooms',
  bedroom:   'rooms',
  bathroom:  'rooms',
};

export default function PromptCard({ type, title, project, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const imageAreaRef = useRef(null);
  const section = SECTION_MAP[type];
  const cardData = project[section]?.[type] || { prompt: '', resultImage: null };

  function handleGenerate() {
    const prompt = generatePrompt(type, project);
    onUpdate(section, { ...cardData, prompt });
  }

  function handlePromptChange(value) {
    onUpdate(section, { ...cardData, prompt: value });
  }

  function handleCopy() {
    if (!cardData.prompt) return;
    navigator.clipboard.writeText(cardData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleImageChange(dataUrl) {
    const updated = { ...cardData, resultImage: dataUrl, status: 'filled' };
    onUpdate(section, updated);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => handleImageChange(ev.target.result);
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
      reader.onload = (ev) => handleImageChange(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => handleImageChange(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="border border-border bg-card flex flex-col gap-0 overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg font-light tracking-wide text-gold">{title}</h3>
        <button
          onClick={handleGenerate}
          className="font-mono text-xs tracking-wider border border-gold/50 text-gold/80 hover:border-gold hover:text-gold px-3 py-1 transition-all"
        >
          הפק פרומפט
        </button>
      </div>

      {/* Prompt textarea */}
      <div className="relative">
        <textarea
          value={cardData.prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder="הפרומפט יופיע כאן..."
          className="w-full bg-transparent font-mono text-xs text-foreground/80 p-4 resize-none h-24 focus:outline-none placeholder:text-muted-foreground/40 leading-relaxed"
          dir="ltr"
        />
        {cardData.prompt && (
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
        onClick={() => document.getElementById(`img-input-${type}`)?.click()}
      >
        <input
          id={`img-input-${type}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
        {cardData.resultImage ? (
          <img src={cardData.resultImage} alt={title} className="w-full h-full object-cover" />
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