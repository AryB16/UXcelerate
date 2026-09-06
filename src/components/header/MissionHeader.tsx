import React from 'react';
import { useMission } from '../../store/MissionContext';
import {
  Wifi,
  WifiOff,
  Radio,
  Clock,
  BookOpen,
  Activity,
  Flame,
  Zap,
  Sparkles,
  Heart,
} from 'lucide-react';

export const MissionHeader: React.FC = () => {
  const {
    overview,
    setIsCaseStudyOpen,
    triggerAftershock,
    triggerCommsDrop,
    discoverNewSurvivor,
    isStoreAndForwardSyncing,
    startTour,
  } = useMission();

  return (
    <header className="bg-[#070d18]/95 border-b border-cyan-500/20 px-4 py-2 backdrop-blur sticky top-0 z-40 shadow-xl select-none">
      <div className="flex items-center justify-between gap-3 w-full">
        
        {/* Left: Brand & Incident Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 tactical-font flex items-center gap-1.5 leading-none">
                <span className="text-cyan-400">AEGIS</span>
                <span className="text-slate-500">//</span>
                <span>USAR MISSION CONTROL</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                INSARAG TIER-1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>INCIDENT: 7.2M QUAKE // ST. JUDE COMPLEX</span>
              <span className="text-cyan-600 hidden sm:inline">•</span>
              <span className="text-cyan-400 hidden sm:inline">SWARM AUTO-MESH ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Center: Mission Vital Telemetry HUD (Desktop Unified Glass Capsule) */}
        <div className="hidden xl:flex items-center bg-[#050b16] border border-slate-800/90 rounded-lg p-1 text-xs font-mono shadow-inner shrink-0">
          
          {/* Golden 72H Window */}
          <div className="flex items-center gap-2 px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase leading-none">Golden Window</div>
              <div className="font-bold text-amber-400 tracking-wide text-[11px] leading-tight mt-0.5">67h 41m rem</div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 shrink-0" />

          {/* Aftershock Seismic Status */}
          <div className={`flex items-center gap-2 px-3 py-1 transition-all ${
            overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400 animate-pulse' : 'text-slate-200'
          }`}>
            <Activity className={`w-3.5 h-3.5 shrink-0 ${overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-[9px] text-slate-400 uppercase leading-none">Seismic Risk</div>
              <div className="font-bold tracking-wide text-[11px] leading-tight mt-0.5 flex items-center gap-1">
                <span className={overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-slate-200'}>
                  {overview.aftershockRiskLevel}
                </span>
                {overview.aftershockRiskLevel === 'CRITICAL' && (
                  <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded border border-rose-500/30">ALERT</span>
                )}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 shrink-0" />

          {/* Mesh Network Health */}
          <div className="flex items-center gap-2 px-3 py-1">
            {overview.overallMeshIntegrity > 70 ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-bounce shrink-0" />
            )}
            <div>
              <div className="text-[9px] text-slate-400 uppercase leading-none">Mesh RF</div>
              <div className="font-bold tracking-wide text-[11px] leading-tight mt-0.5">
                <span className={overview.overallMeshIntegrity > 70 ? 'text-emerald-400' : 'text-rose-400'}>
                  {overview.overallMeshIntegrity}%
                </span>
                {isStoreAndForwardSyncing && (
                  <span className="text-[9px] text-cyan-400 animate-pulse ml-1 font-sans">SYNC</span>
                )}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 shrink-0" />

          {/* Survivors Tally */}
          <div className="flex items-center gap-2 px-3 py-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase leading-none">Survivors</div>
              <div className="font-bold text-rose-400 tracking-wide text-[11px] leading-tight mt-0.5">
                {overview.survivorsFound} <span className="text-slate-400 text-[10px]">({overview.survivorsExtracted} safe)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Center: Tablet Compact HUD (md to xl) */}
        <div className="hidden md:flex xl:hidden items-center gap-2 bg-[#050b16] border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold text-[11px]">67h 41m</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-[11px]">{overview.aftershockRiskLevel}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-[11px] text-emerald-400">{overview.overallMeshIntegrity}%</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1 text-rose-400">
            <Heart className="w-3.5 h-3.5" />
            <span className="font-bold text-[11px]">{overview.survivorsFound}</span>
          </div>
        </div>

        {/* Right: Simulation Triggers & Evaluation Tour/Docs */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Simulation Triggers Group */}
          <div className="flex items-center bg-[#050b16] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={triggerAftershock}
              title="Simulate 5.2M Aftershock & Secondary Collapse"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Aftershock</span>
            </button>

            <button
              onClick={() => triggerCommsDrop()}
              title="Simulate RF Mesh Disconnect & Store-and-Forward"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded font-medium bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>Drop RF</span>
            </button>

            <button
              onClick={discoverNewSurvivor}
              title="Simulate Biosignal Detection"
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded font-medium bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>+Survivor</span>
            </button>
          </div>

          {/* Guided Interactive Tour Button */}
          <button
            onClick={startTour}
            title="Start 30-Second Guided Walkthrough"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs tracking-wider border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all font-mono uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="hidden sm:inline">Tour (30s)</span>
            <span className="sm:hidden">Tour</span>
          </button>

          {/* UX Case Study & Evaluation Deck Button */}
          <button
            onClick={() => setIsCaseStudyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all font-mono uppercase"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UX Case Study</span>
            <span className="sm:hidden">Docs</span>
          </button>

        </div>

      </div>
    </header>
  );
};
