import { ChangeEvent } from 'react';
import { AlertTriangle, Download, FileUp, FileText, Save } from 'lucide-react';
import { DailyLog, Mood, Symptom } from '../types';
import { cn } from '../lib/utils';

const moodOptions: Array<{ key: Mood; label: string; emoji: string }> = [
  { key: 'otima', label: 'Otima', emoji: '??' },
  { key: 'bem', label: 'Bem', emoji: '??' },
  { key: 'regular', label: 'Regular', emoji: '??' },
  { key: 'cansada', label: 'Cansada', emoji: '??' },
  { key: 'enjoo', label: 'Enjoo', emoji: '??' },
];

const symptomOptions: Array<{ key: Symptom; label: string }> = [
  { key: 'nausea', label: 'Nausea' },
  { key: 'tontura', label: 'Tontura' },
  { key: 'fadiga', label: 'Fadiga' },
  { key: 'dor_cabeca', label: 'Dor de cabeca' },
];

interface NotesScreenProps {
  log: DailyLog;
  checklistItems: Array<{ id: string; descricao: string; categoria: string }>;
  onMoodChange: (mood: Mood) => void;
  onSymptomsChange: (symptoms: Symptom[]) => void;
  onNoteChange: (note: string) => void;
  onWeightChange: (value: number | undefined) => void;
  onChecklistToggle: (id: string, checked: boolean) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onGenerateReport: () => void;
}

export default function NotesScreen({
  log,
  checklistItems,
  onMoodChange,
  onSymptomsChange,
  onNoteChange,
  onWeightChange,
  onChecklistToggle,
  onExportBackup,
  onImportBackup,
  onGenerateReport,
}: NotesScreenProps) {
  const toggleSymptom = (symptom: Symptom) => {
    const exists = log.symptoms.includes(symptom);
    if (exists) {
      onSymptomsChange(log.symptoms.filter((item) => item !== symptom));
      return;
    }

    onSymptomsChange([...log.symptoms, symptom]);
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportBackup(file);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="text-2xl font-bold">Checklist Diario</h2>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low">
              <div>
                <p className="font-semibold">{item.descricao}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">{item.categoria}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(log.checklist[item.id])}
                onChange={(event) => onChecklistToggle(item.id, event.target.checked)}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-xl font-bold">Humor e Sintomas</h3>
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.key}
              onClick={() => onMoodChange(mood.key)}
              className={cn(
                'p-3 rounded-xl text-center border',
                log.mood === mood.key ? 'border-primary bg-primary/10' : 'border-on-surface/10 bg-surface-container-low'
              )}
            >
              <p className="text-xl">{mood.emoji}</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">{mood.label}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom.key}
              onClick={() => toggleSymptom(symptom.key)}
              className={cn(
                'px-3 py-2 rounded-full text-xs font-semibold',
                log.symptoms.includes(symptom.key) ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-high text-on-surface-variant'
              )}
            >
              {symptom.label}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-xl font-bold">Nota e Peso</h3>
        <textarea
          value={log.note}
          onChange={(event) => onNoteChange(event.target.value)}
          className="w-full min-h-32 rounded-xl bg-surface-container-low p-4 resize-none"
          placeholder="Como voce se sentiu hoje?"
        />
        <label className="block text-sm">
          Peso atual (kg)
          <input
            type="number"
            step="0.1"
            value={log.weightKg ?? ''}
            onChange={(event) => onWeightChange(event.target.value ? Number(event.target.value) : undefined)}
            className="mt-2 w-full rounded-xl bg-surface-container-low p-3"
          />
        </label>
        <div className="flex items-center gap-2 text-on-surface-variant text-sm">
          <Save size={16} />
          Salvamento automatico local para usuario unico.
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-xl font-bold">Backup e Relatorios</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExportBackup} className="px-3 py-2 rounded-xl bg-secondary text-on-secondary font-semibold text-sm flex items-center gap-2">
            <Download size={16} /> Exportar backup
          </button>
          <label className="px-3 py-2 rounded-xl bg-surface-container-high font-semibold text-sm flex items-center gap-2 cursor-pointer">
            <FileUp size={16} /> Importar backup
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={onGenerateReport} className="px-3 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center gap-2">
            <FileText size={16} /> Relatorio semanal PDF
          </button>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2 text-red-300">
          <AlertTriangle size={18} />
          <h3 className="text-lg font-bold">Modo Crise</h3>
        </div>
        <ul className="space-y-2 text-sm text-on-surface-variant">
          <li>• Nausea: pequenas porcoes, evitar gordura, hidratacao fracionada.</li>
          <li>• Tontura: sentar, elevar pernas, ingerir liquido e fonte leve de carboidrato.</li>
          <li>• Fadiga extrema: reduzir treino para mobilidade e descanso ativo.</li>
          <li>• Dor no joelho: parar impacto imediatamente e aplicar gelo por 15 min.</li>
        </ul>
      </section>
    </div>
  );
}
