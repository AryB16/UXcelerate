import React from 'react';
import { useMission } from '../../store/MissionContext';
import { Survivor, TriageCategory } from '../../types';
import {
  Heart,
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

  const totalSurv = Math.max(1, survivors.length);
  const immediateCount = survivors.filter((s) => s.triage === 'immediate').length;
  const delayedCount = survivors.filter((s) => s.triage === 'delayed').length;
  const minorCount = survivors.filter((s) => s.triage === 'minor' || s.triage === 'expectant').length;

  const getTriageTheme = (triage: TriageCategory) => {
    switch (triage) {
      case 'immediate':
        return {
          tag: 'RED',
          borderAccent: 'border-l-2 border-rose-500',
          dotColor: 'text-rose-500',
        };
      case 'delayed':
        return {
          tag: 'YELLOW',
          borderAccent: 'border-l-2 border-amber-500',
          dotColor: 'text-amber-400',
        };
      case 'minor':
        return {
          tag: 'GREEN',
          borderAccent: 'border-l-2 border-emerald-500',
          dotColor: 'text-emerald-400',
        };
      case 'expectant':
        return {
          tag: 'BLACK',
          borderAccent: 'border-l-2 border-slate-600',
          dotColor: 'text-slate-500',
        };
    }
  };

  const getConditionTag = (surv: Survivor) => {
    if (surv.entrapmentType === 'heavy_rubble') return 'Pinned by Slab';
    if (surv.entrapmentType === 'void_space') return 'Elevator Void';
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
            Survivors ({survivors.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
            RESCUE QUEUE
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Survivors Menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Compact Survivor Objective Cards List */}
      <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-1.5 no-scrollbar">
        {survivors.map((surv) => {
          const isSelected = selectedSurvivorId === surv.id;
          const theme = getTriageTheme(surv.triage);
          const isAssigned = !!surv.assignedRobotId;
          const condition = getConditionTag(surv);

          return (
            <div
              key={surv.id}
              onClick={() => {
                selectSurvivor(surv.id);
                soundManager.playSonarPing();
              }}
              className={`p-2.5 rounded-sm border border-slate-800/90 ${theme.borderAccent} transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-[#0e1526] hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Row 1: Header (Triage Dot + Priority + Victim Title | Golden Window Countdown) */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs ${theme.dotColor}`}>●</span>
                  <span className={`text-[10px] font-mono font-bold ${theme.dotColor}`}>
                    {theme.tag}
                  </span>
                  <span className="text-slate-600 text-xs font-mono">•</span>
                  <h3 className="text-xs font-bold text-slate-100 font-mono truncate">
                    {surv.label}
                  </h3>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  ⏳ {surv.survivabilityWindowHours}h left
                </span>
              </div>

              {/* Row 2: Telemetry Strip in clean neutral monospace */}
              <div className="text-xs font-mono text-slate-400 mb-2 truncate">
                <span className="text-slate-300">{surv.vitals.heartRate} BPM</span>
                <span className="text-slate-600 mx-1.5">•</span>
                <span className="text-slate-300">{surv.vitals.spO2}% SpO2</span>
                <span className="text-slate-600 mx-1.5">•</span>
                <span>Depth {surv.location.depthMeters}m</span>
                <span className="text-slate-600 mx-1.5">•</span>
                <span className="text-slate-300">{condition}</span>
              </div>

              {/* Row 3: Action Row */}
              {isAssigned ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-xs font-mono w-fit">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-medium">✓ {surv.assignedRobotId} En Route</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    id={`assign-select-${surv.id}`}
                    defaultValue="ROB-02"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#080d1a] border border-slate-700 text-slate-300 text-xs rounded-sm px-2 h-7 font-mono focus:outline-none focus:border-cyan-500 max-w-[125px] shrink-0"
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
                    className="h-7 px-3 text-xs font-mono font-medium rounded-sm bg-slate-800 hover:bg-rose-700 text-white border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>🚨 Dispatch</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Anchor: Triage Statistics & Extraction Corridor Bar */}
      <div className="p-2.5 bg-[#090d16] border-t border-slate-800 text-[10px] font-mono shrink-0 select-none">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
          <span>TRIAGE RATIO // START SPECTRUM</span>
          <span className="text-slate-300">
            {immediateCount} RED • {delayedCount} YEL • {minorCount} GRN
          </span>
        </div>

        {/* Proportional Visual START Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 mb-2">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${(immediateCount / totalSurv) * 100}%` }}
            title={`Immediate (Red): ${immediateCount}`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${(delayedCount / totalSurv) * 100}%` }}
            title={`Delayed (Yellow): ${delayedCount}`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(minorCount / totalSurv) * 100}%` }}
            title={`Minor (Green): ${minorCount}`}
          />
        </div>

        {/* Quick Corridor Clearance Tally */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="text-slate-300 font-semibold">4 Corridors Surveyed</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">1 Cleared for Stretchers</span>
          <span>•</span>
          <span className="text-rose-400 font-medium">1 Blocked</span>
        </div>
      </div>
    </div>
  );
};
