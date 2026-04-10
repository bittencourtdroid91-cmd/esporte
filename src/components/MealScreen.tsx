import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, Flame, Timer } from 'lucide-react';
import { DailyLog } from '../types';
import { cn } from '../lib/utils';

interface Recipe {
  id: string;
  type: string;
  time: string;
  name: string;
  kcal: number;
  min: number;
  img: string;
}

const recipes: Recipe[] = [
  {
    id: 'cafe',
    type: 'Cafe da Manha',
    time: '07:00',
    name: 'Whey + fruta de baixa carga glicemica',
    kcal: 320,
    min: 5,
    img: 'https://images.unsplash.com/photo-1632101588461-1f85a93fef9f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'almoco',
    type: 'Almoco',
    time: '12:00',
    name: 'Proteina + vegetais cozidos + carbo inteligente',
    kcal: 540,
    min: 25,
    img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'jantar',
    type: 'Jantar (opcional)',
    time: '19:00',
    name: 'Sopa leve ou whey com frutas vermelhas',
    kcal: 280,
    min: 15,
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=700&q=80',
  },
];

interface MealScreenProps {
  log: DailyLog;
  previousWeekLog?: DailyLog;
  substitutions: Record<string, Record<string, string[]>>;
  onMealToggle: (mealId: string, completed: boolean) => void;
  onMealPhoto: (mealId: string, photoDataUrl: string) => void;
}

export default function MealScreen({ log, previousWeekLog, substitutions, onMealToggle, onMealPhoto }: MealScreenProps) {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const selectedMeal = useMemo(() => recipes.find((meal) => meal.id === selectedMealId), [selectedMealId]);

  const substitutionBlocks = Object.entries(substitutions).slice(0, 2);

  const handlePhotoUpload = (mealId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onMealPhoto(mealId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">Planejador de Refeicoes</h1>
        <p className="text-on-surface-variant mt-1">Modo sem fome no jantar: opcoes leves com proteina minima.</p>
      </section>

      <div className="space-y-4">
        {recipes.map((meal) => {
          const mealLog = log.mealLogs[meal.id];
          const previousPhoto = previousWeekLog?.mealLogs?.[meal.id]?.photoDataUrl;
          const currentPhoto = mealLog?.photoDataUrl;

          return (
            <div key={meal.id} className="glass-card rounded-2xl p-4 space-y-4">
              <div className="flex gap-4">
                <img
                  alt={meal.name}
                  className="w-24 h-24 rounded-xl object-cover"
                  src={currentPhoto || meal.img}
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">{meal.type} • {meal.time}</span>
                      <h3 className="text-lg font-bold mt-1">{meal.name}</h3>
                    </div>
                    {mealLog?.completed && <CheckCircle2 className="text-emerald-400" size={20} />}
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant mt-2">
                    <span className="flex items-center gap-1"><Flame size={14} /> {meal.kcal} kcal</span>
                    <span className="flex items-center gap-1"><Timer size={14} /> {meal.min} min</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onMealToggle(meal.id, !mealLog?.completed)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-semibold',
                    mealLog?.completed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-surface-container-high'
                  )}
                >
                  {mealLog?.completed ? 'Marcada como feita' : 'Marcar refeicao'}
                </button>

                <label className="px-3 py-2 rounded-xl text-sm font-semibold bg-surface-container-high cursor-pointer flex items-center gap-2">
                  <Camera size={16} /> Foto
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(meal.id, e)} />
                </label>

                <button onClick={() => setSelectedMealId(meal.id)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-primary/20 text-primary">
                  Abrir detalhes
                </button>
              </div>

              {(currentPhoto || previousPhoto) && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Comparativo semanal</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-on-surface-variant mb-1">Hoje</p>
                      <img src={currentPhoto || meal.img} alt="Hoje" className="w-full h-24 rounded-xl object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant mb-1">Semana passada</p>
                      <img src={previousPhoto || meal.img} alt="Semana passada" className="w-full h-24 rounded-xl object-cover opacity-80" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-lg font-bold">Substituicoes Inteligentes</h3>
        {substitutionBlocks.map(([group, mapping]) => (
          <div key={group}>
            <p className="text-xs uppercase tracking-widest text-secondary font-bold mb-2">{group}</p>
            <div className="space-y-2">
              {Object.entries(mapping).slice(0, 2).map(([base, options]) => (
                <p key={base} className="text-sm text-on-surface-variant">
                  <span className="text-on-surface font-semibold">{base}</span>: {options.join(', ')}
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      {selectedMeal && (
        <section className="glass-card rounded-2xl p-5">
          <h3 className="text-lg font-bold">Detalhes da Refeicao</h3>
          <p className="text-on-surface-variant mt-2">{selectedMeal.name}</p>
          <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
            <li>• Bociogenicos sempre cozidos/vapor/assados, nunca crus.</li>
            <li>• Prioridade de proteina para preservar massa magra.</li>
            <li>• Mastigar devagar e porcoes menores por causa do Wegovy.</li>
          </ul>
        </section>
      )}
    </div>
  );
}
