import React from 'react';
import { useMission } from '../../store/MissionContext';
import { Survivor, TriageCategory } from '../../types';
import {
  Heart,
  Activity,
  AlertOctagon,
  Clock,
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

  const getTriageBadge = (triage: TriageCategory) => {
    switch (triage) {
      case 'immediate':
        return {
          label: 'RED // IMMEDIATE',
          classes: 'bg-rose-950/80 text-rose-300 border-rose-500/60 animate-pulse',
        };
      case 'delayed':
        return {
          label: 'YELLOW // DELAYED',
          classes: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
        };
      case 'minor':
        return {
          label: 'GREEN // MINOR',
          classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
        };
      case 'expectant':
        return {
          label: 'BLACK // EXPECTANT',
          classes: 'bg-slate-900 text-slate-400 border-slate-700',
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090508] border border-rose-950/60 rounded-md overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-rose-950/45 via-slate-900/90 to-slate-900/90 border-b border-rose-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-100 tactical-font">
            Survivor Triage Queue ({survivors.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 hidden sm:inline-block">
            START PROTOCOL
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Triage Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Survivor List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {survivors.map((surv) => {
          const isSelected = selectedSurvivorId === surv.id;
          const badge = getTriageBadge(surv.triage);
          const isAssigned = !!surv.assignedRobotId;

          return (
            <div
              key={surv.id}
              onClick={() => selectSurvivor(surv.id)}
              className={`p-3 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-950/30 border-rose-400 ring-1 ring-rose-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Label and Triage Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                    <span>{surv.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      @{surv.discoveredAt}
                    </span>
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {surv.location.sector} • Depth: {surv.location.depthMeters}m
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${badge.classes}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Vitals Telemetry Grid */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono mb-2">
                <div>
                  <div className="text-slate-500 text-[9px]">HEART RATE</div>
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
                    <span>{surv.vitals.heartRate} BPM</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[9px]">SpO2 OXYGEN</div>
                  <div className="font-bold text-cyan-400">
                    {surv.vitals.spO2}%
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[9px]">GOLDEN WINDOW</div>
                  <div className="font-bold text-amber-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{surv.survivabilityWindowHours}h</span>
                  </div>
                </div>
              </div>

              {/* Acoustic & Thermal Details */}
              <div className="text-[10px] font-mono text-slate-300 mb-2 leading-relaxed bg-slate-900/50 p-1.5 rounded border border-slate-800/60">
                <p className="line-clamp-2">{surv.notes}</p>
              </div>

              {/* Nearby hazards alert if any */}
              {surv.hazardsNearby.length > 0 && (
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-amber-400 mb-2 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/40">
                  <AlertOctagon className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{surv.hazardsNearby[0]}</span>
                </div>
              )}

              {/* Dispatch Action: Only robots with Medical/Life-Support capabilities */}
              <div className="pt-2 border-t border-slate-800">
                {isAssigned ? (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{surv.assignedRobotId} Assigned // Life Support En Route</span>
                  </div>
                ) : (
                  <div>
                    <div className="text-[9px] font-mono text-rose-300/80 mb-1 flex items-center justify-between">
                      <span>AUTHORIZED LIFE-SUPPORT PAYLOADS:</span>
                      <span className="text-slate-400">MED KIT / O2 LINE</span>
                    </div>
                    <div className="flex items-center gap-1 w-full">
                      <select
                        id={`assign-select-${surv.id}`}
                        defaultValue="ROB-02"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950 border border-rose-900/60 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-rose-500 max-w-[145px] truncate"
                      >
                        {robots
                          .filter(
                            (r) =>
                              r.payload.toLowerCase().includes('med') ||
                              r.payload.toLowerCase().includes('oxygen') ||
                              r.payload.toLowerCase().includes('o2') ||
                              r.id === 'ROB-02' ||
                              r.id === 'ROB-03'
                          )
                          .map((r) => {
                            const isOffline = r.commsStatus === 'disconnected';
                            const payloadShort = r.id === 'ROB-02' ? 'Med Kit' : 'Micro-O2';
                            return (
                              <option key={r.id} value={r.id} disabled={isOffline}>
                                {r.name} ({payloadShort}){isOffline ? ' • OFFLINE' : ''}
                              </option>
                            );
                          })}
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
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-medium shadow transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Life Support</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
