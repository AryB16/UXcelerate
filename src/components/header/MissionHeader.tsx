import React, { useState, useEffect } from 'react';
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

  const [zuluTime, setZuluTime] = useState<string>(() => {
    return new Date().toISOString().substring(11, 19) + 'Z';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setZuluTime(new Date().toISOString().substring(11, 19) + 'Z');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 select-none shrink-0 shadow-xl">
      {/* 1. Dedicated Top-Docked Evaluator Test Bench (24px compact strip) */}
      <div className="h-6 bg-[#04070d] border-b border-amber-500/30 px-3 flex items-center justify-between text-[10px] font-mono shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-amber-400/90 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold tracking-wider">[EVALUATOR TEST BENCH // LIVE SCENARIO INJECTORS]</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={triggerAftershock}
            title="Simulate 5.2M Aftershock & Secondary Collapse"
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-transparent hover:bg-slate-800 text-amber-400/90 border border-slate-700 text-[10px] transition-colors"
          >
            <Flame className="w-2.5 h-2.5 text-amber-400" />
            <span>Simulate Aftershock</span>
          </button>

          <button
            onClick={() => triggerCommsDrop()}
            title="Simulate RF Mesh Disconnect & Store-and-Forward"
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-transparent hover:bg-slate-800 text-rose-400/90 border border-slate-700 text-[10px] transition-colors"
          >
            <WifiOff className="w-2.5 h-2.5 text-rose-400" />
            <span>Sever RF Mesh</span>
          </button>

          <button
            onClick={discoverNewSurvivor}
            title="Simulate Biosignal Detection"
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-transparent hover:bg-slate-800 text-emerald-400/90 border border-slate-700 text-[10px] transition-colors"
          >
            <Zap className="w-2.5 h-2.5 text-emerald-400" />
            <span>+Discover Survivor</span>
          </button>

          <span className="text-slate-700 px-0.5">|</span>

          <button
            onClick={startTour}
            title="Start 30-Second Guided Walkthrough"
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-transparent hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
            <span>Tour (30s)</span>
          </button>

          <button
            onClick={() => setIsCaseStudyOpen(true)}
            title="Open Complete UX Design Case Study"
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-transparent hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] transition-colors"
          >
            <BookOpen className="w-2.5 h-2.5" />
            <span>UX Case Study</span>
          </button>
        </div>
      </div>

      {/* 2. Main Operational Command Header */}
      <div className="bg-[#070d18]/95 border-b border-cyan-500/20 px-4 py-2 backdrop-blur flex items-center justify-between gap-4">
        
        {/* Left: Brand & Incident Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-cyan-950/60 border border-cyan-400/40 text-cyan-400">
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

        {/* Center: Standardized Mission Vital Telemetry Cards */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Card 1: Golden Window */}
          <div className="bg-[#0a101d] border border-slate-800 rounded-md px-3 py-1 h-11 w-36 min-w-[140px] flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-slate-400 font-mono tracking-wider leading-none">Golden Window</div>
              <div className="text-xs font-mono font-bold text-amber-400 leading-tight mt-0.5 truncate">
                67h 41m rem
              </div>
            </div>
          </div>

          {/* Card 2: Seismic Risk */}
          <div className={`bg-[#0a101d] border border-slate-800 rounded-md px-3 py-1 h-11 w-36 min-w-[140px] flex items-center gap-2.5 ${
            overview.aftershockRiskLevel === 'CRITICAL' ? 'border-rose-500/50 bg-rose-950/20' : ''
          }`}>
            <Activity className={`w-4 h-4 shrink-0 ${overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-slate-400 font-mono tracking-wider leading-none">Seismic Risk</div>
              <div className="text-xs font-mono font-bold leading-tight mt-0.5 flex items-center gap-1.5 truncate">
                <span className={overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-slate-200'}>
                  {overview.aftershockRiskLevel}
                </span>
                {overview.aftershockRiskLevel === 'CRITICAL' && (
                  <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded border border-rose-500/30">ALERT</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Mesh RF */}
          <div className="bg-[#0a101d] border border-slate-800 rounded-md px-3 py-1 h-11 w-36 min-w-[140px] flex items-center gap-2.5">
            {overview.overallMeshIntegrity > 70 ? (
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-slate-400 font-mono tracking-wider leading-none">Mesh RF</div>
              <div className="text-xs font-mono font-bold leading-tight mt-0.5 flex items-center gap-1.5 truncate">
                <span className={overview.overallMeshIntegrity > 70 ? 'text-emerald-400' : 'text-rose-400'}>
                  {overview.overallMeshIntegrity}%
                </span>
                {isStoreAndForwardSyncing && (
                  <span className="text-[8px] text-cyan-400 animate-pulse font-sans bg-cyan-950/80 px-1 rounded border border-cyan-500/30">SYNC</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Survivors */}
          <div className="bg-[#0a101d] border border-slate-800 rounded-md px-3 py-1 h-11 w-36 min-w-[140px] flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-slate-400 font-mono tracking-wider leading-none">Survivors</div>
              <div className="text-xs font-mono font-bold text-rose-400 leading-tight mt-0.5 truncate">
                {overview.survivorsFound} <span className="text-slate-400 text-[10px] font-normal">({overview.survivorsExtracted} safe)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operational Telemetry Status & Zulu Clock */}
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-bold tracking-wider text-[11px] bg-[#0a101d] border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>C2 ONLINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">{zuluTime}</span>
          </div>

          {/* Tablet compact indicators if screen < lg */}
          <div className="flex lg:hidden items-center gap-2 bg-[#0a101d] border border-slate-800 rounded-md px-2 py-1 text-[11px]">
            <span className="text-amber-400 font-bold">67h</span>
            <span className="text-slate-700">•</span>
            <span className={overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {overview.aftershockRiskLevel}
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-bold">{overview.overallMeshIntegrity}%</span>
          </div>
        </div>

      </div>
    </header>
  );
};
