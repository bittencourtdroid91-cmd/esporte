import { ReminderConfig } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  reminderConfig: ReminderConfig;
  notificationPermission: NotificationPermission | 'unsupported';
  onClose: () => void;
  onRequestPermission: () => void;
  onConfigChange: (next: ReminderConfig) => void;
}

export default function SettingsPanel({
  isOpen,
  reminderConfig,
  notificationPermission,
  onClose,
  onRequestPermission,
  onConfigChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm p-4">
      <div className="max-w-xl mx-auto mt-20 glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Configuracoes</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-surface-container-high">Fechar</button>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
          <p className="text-sm font-semibold">Permissao de notificacao</p>
          <p className="text-xs text-on-surface-variant">Status: {notificationPermission}</p>
          <button onClick={onRequestPermission} className="px-3 py-2 rounded-lg bg-secondary text-on-secondary text-sm font-semibold">
            Ativar notificacoes
          </button>
        </div>

        <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low">
          <span>Lembretes ativos</span>
          <input
            type="checkbox"
            checked={reminderConfig.enabled}
            onChange={(event) => onConfigChange({ ...reminderConfig, enabled: event.target.checked })}
          />
        </label>

        <label className="block text-sm">
          Intervalo de hidratacao (min)
          <input
            type="number"
            min={30}
            step={15}
            value={reminderConfig.hydrationEveryMinutes}
            onChange={(event) => onConfigChange({ ...reminderConfig, hydrationEveryMinutes: Number(event.target.value) || 90 })}
            className="mt-2 w-full rounded-xl p-3 bg-surface-container-low"
          />
        </label>

        <label className="block text-sm">
          Horario suplemento
          <input
            type="time"
            value={reminderConfig.supplementTime}
            onChange={(event) => onConfigChange({ ...reminderConfig, supplementTime: event.target.value })}
            className="mt-2 w-full rounded-xl p-3 bg-surface-container-low"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Caminhada manha
            <input
              type="time"
              value={reminderConfig.walkMorningTime}
              onChange={(event) => onConfigChange({ ...reminderConfig, walkMorningTime: event.target.value })}
              className="mt-2 w-full rounded-xl p-3 bg-surface-container-low"
            />
          </label>

          <label className="block text-sm">
            Caminhada tarde
            <input
              type="time"
              value={reminderConfig.walkAfternoonTime}
              onChange={(event) => onConfigChange({ ...reminderConfig, walkAfternoonTime: event.target.value })}
              className="mt-2 w-full rounded-xl p-3 bg-surface-container-low"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
