import React from 'react';
import { useMission } from '../../store/MissionContext';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Radio,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Activity,
  Flame,
  Zap,
  Sparkles,
} from 'lucide-react';

export const MissionHeader: React.FC = () => {
  const {
    overview,
    isSimPaused,
    isAudioMuted,
    toggleSimPaused,
    toggleAudio,
    setIsCaseStudyOpen,
    triggerAftershock,
    triggerCommsDrop,
    discoverNewSurvivor,
    isStoreAndForwardSyncing,
    startTour,
  } = useMission();

  return (
    <header className="bg-[#070d18]/95 border-b border-cyan-500/20 px-4 py-2.5 backdrop-blur sticky top-0 z-40 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* Left: Brand & Incident Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 tactical-font flex items-center gap-1.5">
                <span className="text-cyan-400">AEGIS</span>
                <span className="text-slate-400">//</span>
                <span>USAR MISSION CONTROL</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                INSARAG TIER-1
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>INCIDENT: 7.2M QUAKE // ST. JUDE COMPLEX</span>
              <span className="text-cyan-600">•</span>
              <span className="text-cyan-400">SWARM AUTO-MESH ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Center: Mission Vital Telemetry */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs font-mono">
          
          {/* Golden 72H Window */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-tight uppercase">Golden Window</div>
              <div className="font-bold text-amber-400 tracking-wide">67h 41m remaining</div>
            </div>
          </div>

          {/* Aftershock Seismic Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
            overview.aftershockRiskLevel === 'CRITICAL'
              ? 'bg-rose-950/70 border-rose-500/80 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-200'
          }`}>
            <Activity className={`w-3.5 h-3.5 ${overview.aftershockRiskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 leading-tight uppercase">Aftershock Risk</div>
              <div className="font-bold tracking-wide flex items-center gap-1.5">
                <span>{overview.aftershockRiskLevel}</span>
                {overview.aftershockRiskLevel === 'CRITICAL' && <span className="text-[10px] text-rose-400 underline font-sans">EVAC ALERT</span>}
              </div>
            </div>
          </div>

          {/* Mesh Network Health */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60">
            {overview.overallMeshIntegrity > 70 ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            )}
            <div>
              <div className="text-[10px] text-slate-400 leading-tight uppercase">Mesh RF Integrity</div>
              <div className="font-bold tracking-wide flex items-center gap-1.5">
                <span className={overview.overallMeshIntegrity > 70 ? 'text-emerald-400' : 'text-rose-400'}>
                  {overview.overallMeshIntegrity}%
                </span>
                {isStoreAndForwardSyncing && (
                  <span className="text-[10px] text-cyan-400 animate-pulse font-sans">SYNCING PKTS...</span>
                )}
              </div>
            </div>
          </div>

          {/* Survivors Tally */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-950/40 border border-rose-500/30">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <div>
              <div className="text-[10px] text-slate-400 leading-tight uppercase">Survivors Detected</div>
              <div className="font-bold text-rose-400 tracking-wide">
                {overview.survivorsFound} <span className="text-slate-500 text-[10px]">({overview.survivorsExtracted} safe)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Simulation Scenarios & Evaluation Docs */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Simulation Triggers Dropdown / Quick Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button
              onClick={triggerAftershock}
              title="Simulate 5.2M Aftershock & Secondary Collapse"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Aftershock</span>
            </button>

            <button
              onClick={() => triggerCommsDrop()}
              title="Simulate RF Mesh Disconnect & Store-and-Forward"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>Drop RF</span>
            </button>

            <button
              onClick={discoverNewSurvivor}
              title="Simulate Biosignal Detection"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>+Survivor</span>
            </button>
          </div>

          {/* Pause / Audio controls */}
          <button
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={toggleSimPaused}
            title={isSimPaused ? 'Resume Simulation' : 'Pause Simulation'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
          >
            {isSimPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Guided Interactive Tour Button */}
          <button
            onClick={startTour}
            title="Start 30-Second Guided Walkthrough"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs tracking-wider border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all font-mono uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Tour (30s)</span>
          </button>

          {/* UX Case Study & Evaluation Deck Button */}
          <button
            onClick={() => setIsCaseStudyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all font-mono uppercase"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>UX Case Study</span>
          </button>

        </div>

      </div>
    </header>
  );
};
