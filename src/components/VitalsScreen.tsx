import { Activity, Droplets, Footprints, Trophy } from 'lucide-react';
import { DailyLog, Profile } from '../types';

interface VitalsScreenProps {
  profile: Profile;
  todayLabel: string;
  log: DailyLog;
  waterGoal: number;
  streakDays: number;
  monthlyAverage: number;
  monthlyBadge: string;
  weeklyLogs: DailyLog[];
  onAddWater: (liters: number) => void;
}

export default function VitalsScreen({
  profile,
  todayLabel,
  log,
  waterGoal,
  streakDays,
  monthlyAverage,
  monthlyBadge,
  weeklyLogs,
  onAddWater,
}: VitalsScreenProps) {
  const hydrationPct = Math.min(100, (log.hydrationLiters / waterGoal) * 100);
  const weeklyMax = Math.max(1, ...weeklyLogs.map((entry) => entry.dailyScore));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-3xl font-bold tracking-tight leading-tight">Ola {profile.nome}, vamos com consistencia</h2>
        <p className="text-on-surface-variant font-medium mt-1 capitalize">{todayLabel}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Score do Dia</p>
              <h3 className="text-4xl font-black text-primary">{log.dailyScore.toFixed(1)} / 10</h3>
            </div>
            <Activity className="text-primary" size={30} />
          </div>
          <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-container" style={{ width: `${(log.dailyScore / 10) * 100}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">Baseado em checklist, hidratacao e sintomas.</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-1">Streak</p>
          <p className="text-3xl font-black text-secondary">{streakDays} dias</p>
          <p className="text-xs mt-2 text-on-surface-variant">Meta: manter score acima de 7.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Hidratacao</p>
              <h3 className="text-2xl font-bold text-secondary">{log.hydrationLiters.toFixed(2)}L / {waterGoal}L</h3>
            </div>
            <Droplets className="text-secondary" size={28} />
          </div>
          <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden mb-4">
            <div className="h-full bg-secondary" style={{ width: `${hydrationPct}%` }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => onAddWater(-0.25)} className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest">-250ml</button>
            <button onClick={() => onAddWater(0.25)} className="px-3 py-2 rounded-xl bg-secondary text-on-secondary font-bold">+250ml</button>
            <button onClick={() => onAddWater(0.5)} className="px-3 py-2 rounded-xl bg-secondary/80 text-on-secondary font-bold">+500ml</button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Ranking Mensal</p>
          <p className="text-3xl font-black text-tertiary">{monthlyAverage.toFixed(1)}</p>
          <div className="flex items-center gap-2 mt-2 text-tertiary">
            <Trophy size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">{monthlyBadge}</span>
          </div>
        </div>
      </div>

      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Tendencia dos Ultimos 7 Dias</h3>
          <Footprints className="text-on-surface-variant" size={18} />
        </div>
        <div className="grid grid-cols-7 gap-2 items-end h-40">
          {weeklyLogs.map((entry) => {
            const heightPct = Math.max(8, (entry.dailyScore / weeklyMax) * 100);
            const day = entry.date.slice(8, 10);
            return (
              <div key={entry.date} className="flex flex-col items-center gap-2">
                <div className="w-full bg-surface-container-highest rounded-lg overflow-hidden h-28 flex items-end">
                  <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-lg" style={{ height: `${heightPct}%` }} />
                </div>
                <span className="text-[10px] text-on-surface-variant">{day}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
