import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { Hazard, SectorRoute } from '../../types';
import {
  AlertTriangle,
  Flame,
  Zap,
  Navigation,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react';

interface HazardAndRoutePanelProps {
  onClose?: () => void;
}

export const HazardAndRoutePanel: React.FC<HazardAndRoutePanelProps> = ({ onClose }) => {
  const {
    hazards,
    routes,
    selectedHazardId,
    selectHazard,
    toggleHazardStatus,
    addTacticalLog,
  } = useMission();

  const [activeTab, setActiveTab] = useState<'hazards' | 'routes'>('hazards');

  const getHazardIcon = (type: Hazard['type']) => {
    switch (type) {
      case 'gas_leak':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'structural_collapse':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'high_voltage':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b101b] border border-slate-800 rounded-md overflow-hidden shadow-xl select-none">
      {/* Header Tabs */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('hazards')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all ${
              activeTab === 'hazards'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Hazards ({hazards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all ${
              activeTab === 'routes'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Corridors ({routes.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
            AUTOPATH v2.4
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-2 pb-6 space-y-2 no-scrollbar">
        {activeTab === 'hazards' ? (
          /* HAZARDS LIST */
          hazards.map((haz) => {
            const isSelected = selectedHazardId === haz.id;

            return (
              <div
                key={haz.id}
                onClick={() => selectHazard(haz.id)}
                className={`p-2.5 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#0e1526] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {getHazardIcon(haz.type)}
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 font-mono">
                        {haz.title}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {haz.location.sector} • Radius: {haz.location.radius}m
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border uppercase font-bold ${
                      haz.status === 'active'
                        ? 'bg-rose-950/50 text-rose-400 border-rose-500/40'
                        : haz.status === 'contained'
                        ? 'bg-amber-950/50 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {haz.status}
                  </span>
                </div>

                <div className="p-2 rounded-sm bg-[#080d1a] border border-slate-800/80 text-[11px] font-mono text-amber-300 font-semibold my-1.5 break-words">
                  {haz.readout}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                  <span className="text-slate-500">Detected @{haz.timestamp}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHazardStatus(haz.id);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono hover:underline"
                  >
                    Cycle Status
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* ROUTES LIST */
          routes.map((rte) => {
            const isBlocked = rte.status === 'blocked';
            const isNew = rte.status === 'newly_discovered';
            const isHazardous = rte.status === 'hazardous';

            return (
              <div
                key={rte.id}
                className="p-2.5 rounded-md border border-slate-800 bg-[#0e1526] hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-mono flex items-center gap-1.5">
                      <span>{rte.name}</span>
                      {isNew && <span className="text-[10px] text-emerald-400">✨ NEW</span>}
                    </h3>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Width: {rte.widthCm}cm • Risk Score: {rte.riskScore}/100
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border uppercase font-bold ${
                      isBlocked
                        ? 'bg-rose-950/50 text-rose-400 border-rose-500/40'
                        : isNew
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                        : isHazardous
                        ? 'bg-amber-950/50 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {rte.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-mono my-1.5 leading-relaxed break-words">
                  {rte.description}
                </p>

                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">{rte.points.length} SLAM Waypoints</span>
                  {!isBlocked && (
                    <button
                      onClick={() => {
                        addTacticalLog(
                          'info',
                          'DISPATCH',
                          `EVACUATION PATH SENT: Human rescue units assigned to ${rte.name}.`
                        );
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono hover:underline"
                    >
                      <span>Assign to Field Team</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
