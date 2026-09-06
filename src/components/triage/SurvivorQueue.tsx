import React from 'react';
import { useMission } from '../../store/MissionContext';
import { Survivor, TriageCategory } from '../../types';
import {
  Heart,
  Activity,
  Send,
  CheckCircle2,
  X,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface SurvivorQueueProps {
  onClose?: () => void;
}

export const SurvivorQueue: React.FC<SurvivorQueueProps> = ({ onClose }) => {
  const {
    survivors,
    robots,
    selectedSurvivorId,
    selectSurvivor,
    dispatchRobotToSurvivor,
  } = useMission();

  const getTriageDisplay = (triage: TriageCategory) => {
    switch (triage) {
      case 'immediate':
        return {
          badge: 'CRITICAL (RED)',
          color: 'text-rose-400 bg-rose-950/50 border-rose-500/50',
          pulse: true,
        };
      case 'delayed':
        return {
          badge: 'STABLE (YELLOW)',
          color: 'text-amber-400 bg-amber-950/50 border-amber-500/50',
          pulse: false,
        };
      case 'minor':
        return {
          badge: 'STABLE (GREEN)',
          color: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/50',
          pulse: false,
        };
      case 'expectant':
        return {
          badge: 'EXPECTANT',
          color: 'text-slate-400 bg-slate-800 border-slate-700',
          pulse: false,
        };
    }
  };

  const getConditionTag = (surv: Survivor) => {
    if (surv.entrapmentType === 'heavy_rubble') return 'Pinned by Slab';
    if (surv.entrapmentType === 'void_space') return 'Void Space Void';
    if (surv.entrapmentType === 'confined_crawlway') return 'Confined Crawlway';
    return 'Surface Debris';
  };

  return (
    <div className="flex flex-col h-full bg-[#0b101b] border border-slate-800 rounded-md overflow-hidden shadow-xl select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 tactical-font">
            Survivor Triage Queue ({survivors.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
            START PROTOCOL
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Triage Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Survivor Objective Cards List */}
      <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-2 no-scrollbar">
        {survivors.map((surv) => {
          const isSelected = selectedSurvivorId === surv.id;
          const triageInfo = getTriageDisplay(surv.triage);
          const isAssigned = !!surv.assignedRobotId;
          const condition = getConditionTag(surv);

          return (
            <div
              key={surv.id}
              onClick={() => {
                selectSurvivor(surv.id);
                soundManager.playSonarPing();
              }}
              className={`p-2.5 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-[#0e1526] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* 1. Header: Prominent Status Badge + Countdown Timer */}
              <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px]">
                <span
                  className={`px-2 py-0.5 rounded-sm border font-bold ${triageInfo.color} ${
                    triageInfo.pulse ? 'animate-pulse' : ''
                  }`}
                >
                  {triageInfo.badge}
                </span>

                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span>⏳</span>
                  <span>{surv.survivabilityWindowHours}h Left</span>
                </span>
              </div>

              {/* 2. Victim Info: Label and Condition Tag */}
              <div className="mb-2">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-slate-100 font-mono truncate">
                    {surv.label}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    Depth {surv.location.depthMeters}m
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Condition: <span className="text-slate-300 font-medium">{condition}</span>
                </div>
              </div>

              {/* 3. Vitals: Animated Heartbeat Pulse Line & 2 Clear Chips */}
              <div className="flex items-center gap-2 mb-2.5 bg-[#080d1a] p-1.5 rounded-sm border border-slate-800/80 font-mono text-[10px]">
                <div className="flex items-center gap-1 text-rose-400 font-bold shrink-0">
                  <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                  <span>Pulse: {surv.vitals.heartRate} BPM</span>
                </div>

                <span className="text-slate-700">|</span>

                <div className="flex items-center gap-1 text-cyan-300 font-bold shrink-0">
                  <span>SpO2: {surv.vitals.spO2}%</span>
                </div>

                {/* Subtle ECG pulse line visualization */}
                <div className="flex-1 flex items-center justify-end overflow-hidden opacity-60">
                  <svg className="w-16 h-3.5 stroke-rose-500 fill-none" viewBox="0 0 64 14">
                    <path
                      d="M 0 7 L 14 7 L 18 2 L 23 12 L 28 4 L 32 9 L 36 7 L 64 7"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 4. Action Row */}
              {isAssigned ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-emerald-950/30 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-bold">
                    ✓ {surv.assignedRobotId} En Route • Life Support Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    id={`assign-select-${surv.id}`}
                    defaultValue="ROB-02"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#080d1a] border border-slate-700 text-slate-200 text-[10px] rounded-sm px-1.5 h-7 font-mono focus:outline-none focus:border-cyan-500 max-w-[110px] shrink-0"
                  >
                    {robots
                      .filter(
                        (r) =>
                          r.id === 'ROB-02' ||
                          r.id === 'ROB-03' ||
                          r.payload.toLowerCase().includes('med') ||
                          r.payload.toLowerCase().includes('oxygen')
                      )
                      .map((r) => (
                        <option key={r.id} value={r.id} disabled={r.commsStatus === 'disconnected'}>
                          {r.name} {r.commsStatus === 'disconnected' ? '(OFFLINE)' : ''}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectEl = document.getElementById(
                        `assign-select-${surv.id}`
                      ) as HTMLSelectElement;
                      const targetBot = selectEl ? selectEl.value : 'ROB-02';
                      dispatchRobotToSurvivor(targetBot, surv.id);
                    }}
                    className="flex-1 h-7 flex items-center justify-center gap-1 px-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold shadow transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>🚨 DISPATCH RESCUE UNIT</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
