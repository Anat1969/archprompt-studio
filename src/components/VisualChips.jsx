import { VISUAL_OPTIONS } from '../lib/promptEngine';

const SECTION_LABELS = {
  materials: 'חומרים',
  palette: 'פלטת צבעים',
  light: 'אור',
  atmosphere: 'אווירה',
};

export default function VisualChips({ visual, onChange }) {
  function toggle(category, value) {
    const current = visual[category] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...visual, [category]: updated });
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(VISUAL_OPTIONS).map(([cat, options]) => (
        <div key={cat}>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2 uppercase">{SECTION_LABELS[cat]}</p>
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const active = (visual[cat] || []).includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggle(cat, opt)}
                  className={`font-mono text-xs px-3 py-1.5 border tracking-wider transition-all ${
                    active
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}