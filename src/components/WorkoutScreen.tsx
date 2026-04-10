import { Dumbbell, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { KneeStatus } from '../types';
import { cn } from '../lib/utils';

interface WorkoutScreenProps {
  kneeStatus: KneeStatus;
  onKneeStatusChange: (status: KneeStatus) => void;
}

const guidanceByStatus: Record<KneeStatus, { title: string; detail: string; intensity: string }> = {
  verde: {
    title: 'Treino normal de adaptacao',
    detail: 'Caminhada 2x no dia + alongamento + fortalecimento superior leve.',
    intensity: 'leve a moderada',
  },
  amarelo: {
    title: 'Reducao de carga',
    detail: 'Manter somente 1 caminhada curta e foco em mobilidade sem impacto.',
    intensity: 'leve',
  },
  vermelho: {
    title: 'Modo protecao do joelho',
    detail: 'Pausar caminhada longa, gelo 15 minutos e priorizar repouso ativo.',
    intensity: 'minima',
  },
};

export default function WorkoutScreen({ kneeStatus, onKneeStatusChange }: WorkoutScreenProps) {
  const guidance = guidanceByStatus[kneeStatus];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Semaforo do Joelho</h2>
          {kneeStatus === 'verde' && <ShieldCheck className="text-emerald-400" />}
          {kneeStatus === 'amarelo' && <TriangleAlert className="text-yellow-400" />}
          {kneeStatus === 'vermelho' && <ShieldAlert className="text-red-400" />}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['verde', 'amarelo', 'vermelho'] as KneeStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onKneeStatusChange(status)}
              className={cn(
                'py-3 rounded-xl border text-sm font-bold uppercase tracking-widest',
                status === 'verde' && 'border-emerald-500/30',
                status === 'amarelo' && 'border-yellow-500/30',
                status === 'vermelho' && 'border-red-500/30',
                kneeStatus === status ? 'bg-surface-container-highest scale-105' : 'bg-surface-container-low opacity-70'
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-surface-container-high">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Plano automatico</p>
          <h3 className="text-lg font-bold mt-1">{guidance.title}</h3>
          <p className="text-sm text-on-surface-variant mt-2">{guidance.detail}</p>
          <p className="text-xs mt-2 text-secondary uppercase tracking-widest font-bold">Intensidade sugerida: {guidance.intensity}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Plano de Treino do Dia</h2>
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Dumbbell className="text-primary" size={20} />
            <div>
              <h3 className="font-bold">Sessao 1: Caminhada de baixa intensidade</h3>
              <p className="text-sm text-on-surface-variant">20-30 min, superficie plana, tenis com amortecimento.</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Dumbbell className="text-secondary" size={20} />
            <div>
              <h3 className="font-bold">Sessao 2: Alongamento + superior</h3>
              <p className="text-sm text-on-surface-variant">10-20 min, sem impacto no joelho.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
