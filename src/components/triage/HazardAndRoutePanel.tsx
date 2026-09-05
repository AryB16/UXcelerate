import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { Hazard, SectorRoute } from '../../types';
import {
  AlertTriangle,
  Flame,
  Zap,
  Navigation,
  CheckCircle,
  XCircle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const HazardAndRoutePanel: React.FC = () => {
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
    <div className="flex flex-col h-full bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Tabs */}
      <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('hazards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
              activeTab === 'hazards'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hazards ({hazards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
              activeTab === 'routes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Corridors ({routes.length})</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          AUTOPATH v2.4
        </span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeTab === 'hazards' ? (
          /* HAZARDS LIST */
          hazards.map((haz) => {
            const isSelected = selectedHazardId === haz.id;

            return (
              <div
                key={haz.id}
                onClick={() => selectHazard(haz.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
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
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                      haz.status === 'active'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                        : haz.status === 'contained'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                    }`}
                  >
                    {haz.status}
                  </span>
                </div>

                <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-amber-300 font-semibold my-2">
                  {haz.readout}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                  <span className="text-slate-500">Detected @{haz.timestamp}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHazardStatus(haz.id);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
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
                className={`p-3 rounded-lg border transition-all ${
                  isBlocked
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : isNew
                    ? 'bg-emerald-950/20 border-emerald-800/60'
                    : isHazardous
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
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
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                      isBlocked
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                        : isNew
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : isHazardous
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                    }`}
                  >
                    {rte.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-mono my-2 leading-relaxed">
                  {rte.description}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
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
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
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
