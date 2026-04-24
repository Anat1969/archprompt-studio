import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { generatePoeticDescription } from '../lib/promptEngine';

const LS_KEY = 'architectureProjects';
const MIGRATED_FLAG = 'ls_migrated_v1';

function toDB(project) {
  return {
    name:               project.name || '',
    number:             project.number || 0,
    poetic_description: project.poeticDescription || generatePoeticDescription(project),
    inspiration_image:  project.inspirationImage || null,
    style_synthesis:    project.styleSynthesis    || {},
    visual_description: project.visualDescription || {},
    boards:             project.boards            || {},
    rooms:              project.rooms             || {},
    building_types:     project.buildingTypes     || {},
  };
}

export function hasPendingMigration() {
  if (localStorage.getItem(MIGRATED_FLAG)) return false;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0;
  } catch {
    return false;
  }
}

export default function MigrateLocalStorage({ onDone }) {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [progress, setProgress] = useState({ current: 0, total: 0, name: '' });
  const [error, setError] = useState('');

  function getProjectsFromLS() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    // Some versions stored as object keyed by id
    return Object.values(parsed);
  }

  async function runMigration() {
    setStatus('running');
    const projects = getProjectsFromLS();
    setProgress({ current: 0, total: projects.length, name: '' });

    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const displayName = p.name || `פרויקט #${p.number || (i + 1)}`;
      setProgress({ current: i + 1, total: projects.length, name: displayName });
      const data = toDB(p);
      // Ensure number is set
      if (!data.number) data.number = i + 1;
      await base44.entities.Project.create(data);
    }

    localStorage.setItem(MIGRATED_FLAG, '1');
    setStatus('done');
    setTimeout(onDone, 1500);
  }

  function skipMigration() {
    localStorage.setItem(MIGRATED_FLAG, '1');
    onDone();
  }

  const lsProjects = (() => {
    try { return getProjectsFromLS(); } catch { return []; }
  })();

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center" dir="rtl">
      <div className="border border-gold/40 bg-card max-w-md w-full mx-6 p-8 flex flex-col gap-6">
        <div>
          <p className="font-mono text-xs text-gold/70 uppercase tracking-widest mb-2">גילינו נתונים שמורים</p>
          <h2 className="font-display text-3xl font-light text-foreground">ייבוא פרויקטים מקומיים</h2>
        </div>

        <p className="font-mono text-sm text-muted-foreground leading-relaxed">
          נמצאו <strong className="text-foreground">{lsProjects.length} פרויקטים</strong> שמורים בדפדפן.
          כדי שיהיו זמינים מכל מכשיר ולא יאבדו, העבר אותם לענן עכשיו.
        </p>

        {status === 'idle' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={runMigration}
              className="border border-gold text-gold font-mono text-xs tracking-widest py-3 hover:bg-gold hover:text-white transition-all"
            >
              העבר לענן ({lsProjects.length} פרויקטים)
            </button>
            <button
              onClick={skipMigration}
              className="border border-border text-muted-foreground font-mono text-xs tracking-widest py-3 hover:border-gold/30 transition-all"
            >
              דלג (הנתונים יאבדו)
            </button>
          </div>
        )}

        {status === 'running' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-muted-foreground">{progress.name}</span>
                <span className="font-mono text-xs text-gold">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300 rounded-full"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground animate-pulse">מעביר נתונים לענן...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-sm text-gold">✓ הועבר בהצלחה!</p>
            <p className="font-mono text-xs text-muted-foreground">טוען פרויקטים...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-destructive">{error}</p>
            <button onClick={runMigration} className="border border-gold text-gold font-mono text-xs py-2">
              נסה שוב
            </button>
          </div>
        )}
      </div>
    </div>
  );
}