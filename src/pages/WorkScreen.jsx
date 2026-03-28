import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProject } from '../lib/storage';
import { STYLES_LIST, generatePrompt, getSynthesis } from '../lib/promptEngine';
import InspirationUpload from '../components/InspirationUpload';
import VisualChips from '../components/VisualChips';
import PromptCard from '../components/PromptCard';

const BASE_BOARDS = [
  { key: 'materials', title: 'לוח חומרים' },
  { key: 'colors',    title: 'לוח צבעים' },
  { key: 'mood',      title: 'לוח השראה' },
];

const ROOM_CARDS = [
  { key: 'living',   title: 'סלון' },
  { key: 'kitchen',  title: 'מטבח' },
  { key: 'bedroom',  title: 'חדר שינה' },
  { key: 'bathroom', title: 'חדר רחצה' },
];

export default function WorkScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const projects = loadProjects();
    const found = projects.find(p => p.id === id);
    if (found) setProject(found);
    else navigate('/');
  }, [id]);

  function autoSave(partial) {
    setProject(prev => {
      const updated = { ...prev, ...partial };
      saveProject(updated);
      return updated;
    });
  }

  if (!project) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground">טוען...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-obsidian z-10 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors">
          → PROMPT STUDIO
        </button>
        <input
          value={project.name}
          onChange={(e) => autoSave({ name: e.target.value })}
          className="bg-transparent font-display text-2xl font-light text-foreground focus:outline-none focus:text-gold transition-colors flex-1 placeholder:text-muted-foreground/40"
          placeholder="שם פרויקט"
        />
        <button
          onClick={() => navigate(`/gallery/${id}`)}
          className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors border border-border hover:border-gold/50 px-3 py-1.5"
        >
          גלרייה
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Inspiration */}
        <Section title="תמונת השראה">
          <InspirationUpload
            image={project.inspirationImage}
            onChange={(img) => autoSave({ inspirationImage: img })}
          />
        </Section>

        {/* Visual Description */}
        <Section title="תיאור ויזואלי">
          <VisualChips
            visualDescription={project.visualDescription || {}}
            onChange={(visualDescription) => autoSave({ visualDescription })}
          />
        </Section>

        {/* Style Synthesis */}
        <Section title="סינתזת סגנונות">
          <StyleSynthesisPanel
            project={project}
            onUpdate={autoSave}
          />
        </Section>

        {/* Building Type */}
        <Section title="סוג מבנה">
          <div className="flex gap-0 border border-border w-fit">
            {[{ value: 'private', label: 'בית פרטי' }, { value: 'building', label: 'בניין' }].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  autoSave({ buildingType: value });
                  const prompt = generatePrompt('living', { ...project, buildingType: value });
                  console.log('Generated prompt for', value, ':', prompt);
                }}
                className={`font-mono text-xs px-6 py-2.5 tracking-wider transition-all ${
                  project.buildingType === value
                    ? 'bg-gold text-obsidian'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Base Boards */}
        <Section title="לוחות בסיס">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BASE_BOARDS.map(({ key, title }) => (
              <PromptCard
                key={key}
                type={key}
                title={title}
                project={project}
                onUpdate={(section, updatedData) => {
                  const updated = { ...project[section], [key]: updatedData };
                  autoSave({ [section]: updated });
                }}
              />
            ))}
          </div>
        </Section>

        {/* Rooms */}
        <Section title="חדרים">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOM_CARDS.map(({ key, title }) => (
              <PromptCard
                key={key}
                type={key}
                title={title}
                project={project}
                onUpdate={(section, updatedData) => {
                  const updated = { ...project[section], [key]: updatedData };
                  autoSave({ [section]: updated });
                }}
              />
            ))}
          </div>
        </Section>

        {/* Save to Gallery */}
        <div className="flex justify-center pb-10">
          <button
            onClick={() => {
              saveProject(project);
              navigate(`/gallery/${id}`);
            }}
            className="font-mono text-xs tracking-widest px-12 py-4 border border-gold/50 text-gold hover:border-gold hover:bg-gold/5 transition-all"
          >
            שמור לגלרייה
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-light text-foreground mb-4 pb-2 border-b border-border/50 tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StyleSynthesisPanel({ project, onUpdate }) {
  const synthesis = getSynthesis(project.styleSynthesis?.styleA, project.styleSynthesis?.styleB);

  function handleStyleChange(field, value) {
    const updated = { ...project.styleSynthesis, [field]: value };
    onUpdate({ styleSynthesis: updated });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="font-mono text-xs text-muted-foreground tracking-widest">סגנון A</label>
          <select
            value={project.styleSynthesis?.styleA || ''}
            onChange={(e) => handleStyleChange('styleA', e.target.value)}
            className="bg-secondary border border-border text-foreground font-mono text-xs px-3 py-2 focus:outline-none focus:border-gold/50"
            dir="ltr"
          >
            <option value="">— בחר סגנון —</option>
            {STYLES_LIST.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="font-mono text-xs text-muted-foreground tracking-widest">סגנון B</label>
          <select
            value={project.styleSynthesis?.styleB || ''}
            onChange={(e) => handleStyleChange('styleB', e.target.value)}
            className="bg-secondary border border-border text-foreground font-mono text-xs px-3 py-2 focus:outline-none focus:border-gold/50"
            dir="ltr"
          >
            <option value="">— בחר סגנון —</option>
            {STYLES_LIST.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      {synthesis && (
        <div className="border border-gold/20 bg-gold/5 px-4 py-3">
          <p className="font-mono text-xs text-gold/80 leading-relaxed italic" dir="ltr">
            {synthesis.token} — {synthesis.tension}
          </p>
        </div>
      )}
    </div>
  );
}