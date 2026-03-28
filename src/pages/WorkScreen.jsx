import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProjects, saveProject, getProjectName } from '../lib/storage';
import { STYLES_LIST, generatePrompt, getSynthesis } from '../lib/promptEngine';
import InspirationUpload from '../components/InspirationUpload';
import VisualChips from '../components/VisualChips';
import PromptCard from '../components/PromptCard';

const BOARDS = [
  { key: 'materials', title: 'לוח חומרים' },
  { key: 'colors',    title: 'לוח צבעים' },
  { key: 'mood',      title: 'לוח השראה' },
];

const ROOMS = [
  { key: 'living',   title: 'סלון' },
  { key: 'kitchen',  title: 'מטבח' },
  { key: 'bedroom',  title: 'חדר שינה' },
  { key: 'bathroom', title: 'חדר רחצה' },
];

const BUILDING_TYPES = [
  { key: 'private',  title: 'בית פרטי — חוץ' },
  { key: 'building', title: 'בניין — חוץ' },
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

  function handleSaveAndReturn() {
    if (project) {
      saveProject(project);
    }
    navigate('/');
  }

  if (!project) return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground">טוען...</span>
    </div>
  );

  const displayName = getProjectName(project);

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-obsidian z-10 flex items-center gap-4">
        <button onClick={handleSaveAndReturn} className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors">
          ← פרויקטים
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gold">#{String(project.number).padStart(2, '0')}</span>
          <input
            value={project.name}
            onChange={(e) => autoSave({ name: e.target.value })}
            placeholder={displayName}
            className="bg-transparent font-display text-2xl font-light text-foreground focus:outline-none focus:text-gold transition-colors placeholder:text-muted-foreground/40"
          />
        </div>
        <button
          onClick={handleSaveAndReturn}
          className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors border border-border hover:border-gold/50 px-3 py-1.5"
        >
          שמור וחזור
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

        {/* Building Type Toggle */}
        <Section title="סוג מבנה (לחדרים)">
          <div className="flex gap-3">
            {[
              { val: 'private', label: 'בית פרטי' },
              { val: 'building', label: 'בניין' }
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => autoSave({ buildingType: val })}
                className={`font-mono text-xs px-4 py-2 border transition-all ${
                  project.buildingType === val
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border text-muted-foreground hover:border-gold/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Base Boards */}
        <Section title="לוחות בסיס (3 מנועים)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOARDS.map(({ key, title }) => (
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
        <Section title="חדרים (4 מנועים)">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOMS.map(({ key, title }) => (
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

        {/* Building Types - Exterior */}
        <Section title="חוץ מבנה (2 מנועים)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUILDING_TYPES.map(({ key, title }) => (
              <PromptCard
                key={key}
                type={key}
                title={title}
                project={project}
                onUpdate={(section, updatedData) => {
                  const updated = { ...project[section], [key]: updatedData };
                  autoSave({ [section]: updated });
                }}
                isBuildingType={true}
              />
            ))}
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex justify-center pb-10">
          <button
            onClick={handleSaveAndReturn}
            className="font-mono text-xs tracking-widest px-12 py-4 border border-gold/50 text-gold hover:border-gold hover:bg-gold/5 transition-all"
          >
            שמור וחזור לרשימה
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