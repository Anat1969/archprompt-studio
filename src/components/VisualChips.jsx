import { VISUAL_OPTIONS, SECTION_LABELS } from '../lib/promptEngine';

export default function VisualChips({ visualDescription, onChange }) {
  function select(category, id) {
    const current = visualDescription[category];
    onChange({ ...visualDescription, [category]: current === id ? '' : id });
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(VISUAL_OPTIONS).map(([cat, options]) => (
        <div key={cat}>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mb-2 uppercase">{SECTION_LABELS[cat]}</p>
          <div className="flex flex-wrap gap-2">
            {options.map(({ id, label }) => {
              const active = visualDescription[cat] === id;
              return (
                <button
                  key={id}
                  onClick={() => select(cat, id)}
                  className={`font-mono text-xs px-3 py-1.5 border tracking-wider transition-all ${
                    active
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}