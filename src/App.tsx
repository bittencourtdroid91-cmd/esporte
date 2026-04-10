import { useEffect, useMemo, useState } from 'react';
import { Settings, Activity, Utensils, Dumbbell, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import VitalsScreen from './components/VitalsScreen';
import MealScreen from './components/MealScreen';
import WorkoutScreen from './components/WorkoutScreen';
import NotesScreen from './components/NotesScreen';
import AIAssistant from './components/AIAssistant';
import SettingsPanel from './components/SettingsPanel';
import { PROTOCOL_DATA } from './constants';
import { AppData, DailyLog, KneeStatus, Mood, Symptom } from './types';
import { formatPtDateLong, lastNDates, todayISO, toISODate } from './lib/date';
import { createDailyLog, exportBackup, importBackupFile, loadAppData, saveAppData } from './lib/storage';

type Screen = 'vitals' | 'meal' | 'workout' | 'notes';

const WATER_GOAL = Number(PROTOCOL_DATA.suplementacao_diaria.agua.meta_diaria_litros) || 2;
const SCORE_TARGET = 7;

const moodPoints: Record<Mood, number> = {
  otima: 2,
  bem: 1.6,
  regular: 1.2,
  cansada: 0.8,
  enjoo: 0.4,
};

const getTodayNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

const calculateScore = (log: DailyLog): number => {
  const checklistValues = Object.values(log.checklist);
  const checklistRatio = checklistValues.length
    ? checklistValues.filter(Boolean).length / checklistValues.length
    : 0;
  const checklistScore = checklistRatio * 6;
  const hydrationScore = Math.min(log.hydrationLiters / WATER_GOAL, 1) * 2;
  const moodScore = moodPoints[log.mood];
  const symptomPenalty = Math.min(1.5, log.symptoms.length * 0.3);
  const finalScore = Math.max(0, Math.min(10, checklistScore + hydrationScore + moodScore - symptomPenalty));
  return Number(finalScore.toFixed(1));
};

const resolveBadge = (average: number): string => {
  if (average >= 9) return 'Diamante';
  if (average >= 7.5) return 'Ouro';
  if (average >= 5) return 'Prata';
  return 'Bronze';
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('vitals');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    getTodayNotificationPermission()
  );

  const today = todayISO();

  useEffect(() => {
    if (!appData.logs[today]) {
      setAppData((prev) => ({
        ...prev,
        logs: {
          ...prev.logs,
          [today]: createDailyLog(today),
        },
      }));
    }
  }, [appData.logs, today]);

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  const currentLog = appData.logs[today] ?? createDailyLog(today);

  const updateTodayLog = (updater: (log: DailyLog) => DailyLog) => {
    setAppData((prev) => {
      const current = prev.logs[today] ?? createDailyLog(today);
      const next = updater(current);
      const withScore = { ...next, dailyScore: calculateScore(next) };
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [today]: withScore,
        },
      };
    });
  };

  const weeklyLogs = useMemo(() => {
    return lastNDates(7).map((date) => appData.logs[date] ?? createDailyLog(date));
  }, [appData.logs]);

  const previousWeekDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return toISODate(date);
  }, []);

  const previousWeekLog = appData.logs[previousWeekDate];

  const streakDays = useMemo(() => {
    let streak = 0;
    const cursor = new Date();

    while (true) {
      const key = toISODate(cursor);
      const log = appData.logs[key];
      if (!log || log.dailyScore < SCORE_TARGET) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [appData.logs]);

  const monthlyAverage = useMemo(() => {
    const currentMonth = today.slice(0, 7);
    const monthLogs = Object.values(appData.logs).filter((log) => log.date.startsWith(currentMonth));
    if (!monthLogs.length) return 0;
    const total = monthLogs.reduce((sum, log) => sum + log.dailyScore, 0);
    return total / monthLogs.length;
  }, [appData.logs, today]);

  const monthlyBadge = resolveBadge(monthlyAverage);

  const recentLogs = useMemo(() => weeklyLogs.slice(-5), [weeklyLogs]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  useEffect(() => {
    if (!appData.reminderConfig.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const sentKey = `vitalis.reminders.${today}`;
    const sentMap = new Set<string>(JSON.parse(localStorage.getItem(sentKey) || '[]'));

    const markSent = (tag: string) => {
      sentMap.add(tag);
      localStorage.setItem(sentKey, JSON.stringify(Array.from(sentMap)));
    };

    const notify = (title: string, body: string, tag: string) => {
      if (sentMap.has(tag)) return;
      new Notification(title, { body, tag });
      markSent(tag);
    };

    const hydrationTimer = window.setInterval(() => {
      new Notification('Vitalis: hora da hidratacao', {
        body: 'Beba 250ml de agua para manter a meta diaria.',
        tag: `hydration-${Date.now()}`,
      });
    }, appData.reminderConfig.hydrationEveryMinutes * 60 * 1000);

    const scheduleTimer = window.setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (hhmm === appData.reminderConfig.supplementTime) {
        notify('Vitalis: suplementos', 'Hora de creatina e whey.', 'supplement');
      }
      if (hhmm === appData.reminderConfig.walkMorningTime) {
        notify('Vitalis: caminhada da manha', 'Inicie sua caminhada leve de 20 minutos.', 'walk-morning');
      }
      if (hhmm === appData.reminderConfig.walkAfternoonTime) {
        notify('Vitalis: caminhada da tarde', 'Hora da segunda caminhada leve.', 'walk-afternoon');
      }
    }, 30 * 1000);

    return () => {
      clearInterval(hydrationTimer);
      clearInterval(scheduleTimer);
    };
  }, [appData.reminderConfig, today]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'vitals':
        return (
          <VitalsScreen
            profile={PROTOCOL_DATA.profile}
            todayLabel={formatPtDateLong(today)}
            log={currentLog}
            waterGoal={WATER_GOAL}
            streakDays={streakDays}
            monthlyAverage={monthlyAverage}
            monthlyBadge={monthlyBadge}
            weeklyLogs={weeklyLogs}
            onAddWater={(liters) =>
              updateTodayLog((log) => ({
                ...log,
                hydrationLiters: Math.max(0, Number((log.hydrationLiters + liters).toFixed(2))),
              }))
            }
          />
        );
      case 'meal':
        return (
          <MealScreen
            log={currentLog}
            previousWeekLog={previousWeekLog}
            substitutions={PROTOCOL_DATA.substituicoes_inteligentes}
            onMealToggle={(mealId, completed) =>
              updateTodayLog((log) => ({
                ...log,
                mealLogs: {
                  ...log.mealLogs,
                  [mealId]: {
                    ...(log.mealLogs[mealId] ?? { completed: false }),
                    completed,
                  },
                },
              }))
            }
            onMealPhoto={(mealId, photoDataUrl) =>
              updateTodayLog((log) => ({
                ...log,
                mealLogs: {
                  ...log.mealLogs,
                  [mealId]: {
                    ...(log.mealLogs[mealId] ?? { completed: false }),
                    photoDataUrl,
                  },
                },
              }))
            }
          />
        );
      case 'workout':
        return (
          <WorkoutScreen
            kneeStatus={currentLog.kneeStatus}
            onKneeStatusChange={(status: KneeStatus) =>
              updateTodayLog((log) => ({
                ...log,
                kneeStatus: status,
              }))
            }
          />
        );
      case 'notes':
        return (
          <NotesScreen
            log={currentLog}
            checklistItems={PROTOCOL_DATA.checklist_diario}
            onMoodChange={(mood: Mood) =>
              updateTodayLog((log) => ({
                ...log,
                mood,
              }))
            }
            onSymptomsChange={(symptoms: Symptom[]) =>
              updateTodayLog((log) => ({
                ...log,
                symptoms,
              }))
            }
            onNoteChange={(note: string) =>
              updateTodayLog((log) => ({
                ...log,
                note,
              }))
            }
            onWeightChange={(weightKg) =>
              updateTodayLog((log) => ({
                ...log,
                weightKg,
              }))
            }
            onChecklistToggle={(id, checked) =>
              updateTodayLog((log) => ({
                ...log,
                checklist: {
                  ...log.checklist,
                  [id]: checked,
                },
              }))
            }
            onExportBackup={() => exportBackup(appData)}
            onImportBackup={async (file: File) => {
              const imported = await importBackupFile(file);
              setAppData(imported);
            }}
            onGenerateReport={async () => {
              const module = await import('./lib/report');
              module.generateWeeklyReport(appData, PROTOCOL_DATA.profile.nome);
            }}
          />
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'vitals', label: 'Sinais', icon: Activity },
    { id: 'meal', label: 'Refeicao', icon: Utensils },
    { id: 'workout', label: 'Treino', icon: Dumbbell },
    { id: 'notes', label: 'Notas', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-on-surface/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center font-black text-primary">V</div>
            <h1 className="text-2xl font-black italic text-primary-container tracking-tighter">Vitalis</h1>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full hover:bg-on-surface/5 transition-colors">
            <Settings className="text-on-surface-variant" size={24} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-2xl z-50 rounded-t-[3rem] border-t border-on-surface/5">
        <div className="flex justify-around items-center px-4 pb-8 pt-4 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id as Screen)}
                className={cn(
                  'flex flex-col items-center justify-center transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-tr from-primary-container to-primary text-white rounded-full p-4 scale-110 -translate-y-4 shadow-lg shadow-primary/40'
                    : 'text-on-surface-variant p-2 hover:text-primary'
                )}
              >
                <Icon size={isActive ? 28 : 24} />
                <span className={cn('text-[10px] uppercase tracking-widest font-bold mt-1', isActive ? 'block' : 'hidden')}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AIAssistant protocol={PROTOCOL_DATA} recentLogs={recentLogs} />

      <SettingsPanel
        isOpen={settingsOpen}
        reminderConfig={appData.reminderConfig}
        notificationPermission={notificationPermission}
        onClose={() => setSettingsOpen(false)}
        onRequestPermission={requestNotificationPermission}
        onConfigChange={(next) => setAppData((prev) => ({ ...prev, reminderConfig: next }))}
      />
    </div>
  );
}
