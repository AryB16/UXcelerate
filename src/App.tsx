import React, { useState, useEffect } from 'react';
import { MissionProvider, useMission } from './store/MissionContext';
import { MissionHeader } from './components/header/MissionHeader';
import { TacticalMap } from './components/map/TacticalMap';
import { RobotRoster } from './components/swarm/RobotRoster';
import { SurvivorQueue } from './components/triage/SurvivorQueue';
import { HazardAndRoutePanel } from './components/triage/HazardAndRoutePanel';
import { TacticalLogFeed } from './components/triage/TacticalLogFeed';
import { RobotFpvModal } from './components/swarm/RobotFpvModal';
import { CaseStudyModal } from './components/case-study/CaseStudyModal';
import { InteractiveTour } from './components/tour/InteractiveTour';
import {
  AlertTriangle,
  Terminal,
  Bot,
  Heart,
  Columns,
  X,
  CheckCircle2,
} from 'lucide-react';

const MissionControlDeck: React.FC = () => {
  const {
    robots,
    survivors,
    hazards,
    routes,
    selectRobot,
    toggleSimPaused,
    setIsCaseStudyOpen,
    isFpvOpen,
    startTour,
    isTourOpen,
    tourStep,
    reroutePrompt,
    confirmReroute,
    dismissReroute,
  } = useMission();

  const [rightPanelMode, setRightPanelMode] = useState<'triage' | 'hazards' | 'logs' | 'split'>('triage');
  const [isLeftRosterOpen, setIsLeftRosterOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'map' | 'roster' | 'triage'>('map');
  const [showEvaluatorBanner, setShowEvaluatorBanner] = useState<boolean>(() => {
    return !localStorage.getItem('aegis_eval_banner_dismissed');
  });

  const isMapExpanded = !isLeftRosterOpen && !isRightPanelOpen;

  const toggleMapExpanded = () => {
    if (isMapExpanded) {
      setIsLeftRosterOpen(true);
      setIsRightPanelOpen(true);
    } else {
      setIsLeftRosterOpen(false);
      setIsRightPanelOpen(false);
    }
  };

  // If tour opens, restore all panels so they can be spotlighted
  useEffect(() => {
    if (isTourOpen) {
      setIsLeftRosterOpen(true);
      setIsRightPanelOpen(true);
      if (tourStep === 3) {
        setRightPanelMode('triage');
      }
    }
  }, [isTourOpen, tourStep]);

  // Determine if a section should be spotlighted or blurred during the interactive tour
  const getTourSpotlightStyle = (section: 'header' | 'left' | 'center' | 'right' | 'footer') => {
    if (!isTourOpen) return '';

    const isTarget =
      (tourStep === 0 && section === 'center') ||
      (tourStep === 1 && section === 'left') ||
      (tourStep === 2 && section === 'center') ||
      (tourStep === 3 && section === 'right') ||
      (tourStep === 4 && section === 'header');

    if (isTarget) {
      return 'relative z-20 ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] rounded-xl pointer-events-auto filter-none opacity-100 transition-all duration-300 bg-[#060a12]';
    }

    return 'filter blur-[5px] opacity-20 brightness-50 pointer-events-none transition-all duration-300';
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing into an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' && !isFpvOpen && !isTourOpen) {
        e.preventDefault();
        toggleSimPaused();
      } else if ((e.key === 'm' || e.key === 'M') && !isFpvOpen && !isTourOpen) {
        toggleMapExpanded();
      } else if ((e.key === 'r' || e.key === 'R') && !isFpvOpen && !isTourOpen) {
        setIsLeftRosterOpen((prev) => !prev);
      } else if ((e.key === 't' || e.key === 'T') && !isFpvOpen && !isTourOpen) {
        setIsRightPanelOpen((prev) => !prev);
      } else if (e.key >= '1' && e.key <= '6' && !isFpvOpen && !isTourOpen) {
        const idx = parseInt(e.key, 10) - 1;
        if (robots[idx]) {
          selectRobot(robots[idx].id);
        }
      } else if ((e.key === '?' || e.key === '/') && !isTourOpen) {
        setIsCaseStudyOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [robots, selectRobot, toggleSimPaused, setIsCaseStudyOpen, isFpvOpen, isTourOpen, isMapExpanded]);

  // Calculate dynamic column span for Tactical Map
  const getCenterColSpan = () => {
    if (isLeftRosterOpen && isRightPanelOpen) return 'md:col-span-6';
    if (!isLeftRosterOpen && !isRightPanelOpen) return 'md:col-span-12';
    return 'md:col-span-9';
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#05080f] text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Evaluator Welcome Banner (Dismissible, Non-Blocking) */}
      {showEvaluatorBanner && !isTourOpen && (
        <div className="bg-gradient-to-r from-cyan-950 via-[#091b30] to-cyan-950 border-b border-cyan-500/30 px-3 py-1.5 flex items-center justify-between z-50 text-xs font-mono backdrop-blur shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-slate-200">
              <strong className="text-cyan-400 font-bold">⚡ New Evaluator?</strong> Take the 30s Interactive Tour to explore multi-robot tele-ops, triage, and seismic aftershock mitigation:
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                startTour();
                setShowEvaluatorBanner(false);
                localStorage.setItem('aegis_eval_banner_dismissed', 'true');
              }}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-[11px] shadow-sm transition-all flex items-center gap-1"
            >
              <span>Take 30s Tour 🚀</span>
            </button>
            <button
              onClick={() => {
                setShowEvaluatorBanner(false);
                localStorage.setItem('aegis_eval_banner_dismissed', 'true');
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Reactive Aftershock Reroute Decision Card */}
      {reroutePrompt && reroutePrompt.isOpen && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92vw] bg-[#0c1424]/95 border-2 border-amber-500/80 rounded-xl p-4 shadow-[0_0_35px_rgba(245,158,11,0.35)] backdrop-blur animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-amber-300 tracking-wide font-mono uppercase">
                  {reroutePrompt.title}
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                {reroutePrompt.message}
              </p>
              <div className="flex items-center gap-2 mt-3 font-mono text-xs">
                <button
                  onClick={confirmReroute}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Reroute via Alpha-1</span>
                </button>
                <button
                  onClick={dismissReroute}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors font-medium"
                >
                  Dismiss / Manual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Mission Header */}
      <div className={getTourSpotlightStyle('header')}>
        <MissionHeader />
      </div>

      {/* Main Command Deck Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 p-2 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Swarm Tele-Ops Roster */}
        <div
          className={`${
            mobileTab === 'roster' ? 'flex' : 'hidden'
          } ${isLeftRosterOpen ? 'md:flex md:col-span-3' : 'md:hidden'} h-full min-h-0 ${getTourSpotlightStyle('left')}`}
        >
          <RobotRoster onClose={() => setIsLeftRosterOpen(false)} />
        </div>

        {/* CENTER COLUMN: Tactical Disaster Map */}
        <div
          className={`${
            mobileTab === 'map' ? 'flex' : 'hidden'
          } md:flex col-span-1 ${getCenterColSpan()} h-full min-h-0 flex-col ${getTourSpotlightStyle('center')}`}
        >
          <TacticalMap
            isExpanded={isMapExpanded}
            onToggleExpand={toggleMapExpanded}
          />
        </div>

        {/* RIGHT COLUMN: Dedicated Triage, Hazards & Incident Log */}
        <div
          className={`${
            mobileTab === 'triage' ? 'flex' : 'hidden'
          } ${isRightPanelOpen ? 'md:flex md:col-span-3' : 'md:hidden'} h-full min-h-0 flex-col gap-1.5 ${getTourSpotlightStyle('right')}`}
        >
          {/* Top-Level Panel Switcher: Distinct Separation of Triage vs Hazards vs Logs */}
          <div className="flex items-center justify-between p-1 bg-[#090e1a] border border-slate-800 rounded-xl shadow-md shrink-0">
            <div className="flex items-center gap-1 flex-1 font-mono text-[10px]">
              <button
                onClick={() => setRightPanelMode('triage')}
                className={`flex-1 py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  rightPanelMode === 'triage'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Survivor Medical Triage (START Protocol)"
              >
                <Heart className="w-3 h-3 text-rose-400" />
                <span>Triage ({survivors.length})</span>
              </button>

              <button
                onClick={() => setRightPanelMode('hazards')}
                className={`flex-1 py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  rightPanelMode === 'hazards'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Hazards & Structural Paths"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Hazards ({hazards.length})</span>
              </button>

              <button
                onClick={() => setRightPanelMode('logs')}
                className={`py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  rightPanelMode === 'logs'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Live Incident & Comms Log"
              >
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span className="hidden xl:inline">Logs</span>
              </button>

              <button
                onClick={() => setRightPanelMode('split')}
                className={`py-1 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  rightPanelMode === 'split'
                    ? 'bg-slate-700 text-slate-100 font-bold border border-slate-500 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Split View (Triage + Hazards Together)"
              >
                <Columns className="w-3 h-3 text-slate-300" />
                <span className="hidden xl:inline">Split</span>
              </button>
            </div>

            <button
              onClick={() => setIsRightPanelOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Right Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel Content Based on Selection */}
          {rightPanelMode === 'triage' && (
            <div className="flex-1 min-h-0">
              <SurvivorQueue onClose={() => setIsRightPanelOpen(false)} />
            </div>
          )}

          {rightPanelMode === 'hazards' && (
            <div className="flex-1 min-h-0">
              <HazardAndRoutePanel onClose={() => setIsRightPanelOpen(false)} />
            </div>
          )}

          {rightPanelMode === 'logs' && (
            <div className="flex-1 min-h-0">
              <TacticalLogFeed />
            </div>
          )}

          {rightPanelMode === 'split' && (
            <div className="flex-1 min-h-0 flex flex-col gap-1.5">
              {/* Top Half: Survivor Medical Triage */}
              <div className="flex-1 min-h-0">
                <SurvivorQueue />
              </div>

              {/* Distinct Physical & Visual Separator */}
              <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-900/80 border-y border-slate-800 text-[10px] font-mono text-amber-400 font-bold tracking-wider uppercase shrink-0">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Environmental Hazards & Pathways</span>
                <div className="h-px flex-1 bg-amber-500/20"></div>
              </div>

              {/* Bottom Half: Environmental Hazards & Structural Pathways */}
              <div className="flex-1 min-h-0">
                <HazardAndRoutePanel />
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Floating Buttons to Re-Open Panels when Closed on Desktop */}
      {!isLeftRosterOpen && (
        <button
          onClick={() => setIsLeftRosterOpen(true)}
          className="hidden md:flex fixed bottom-9 left-3 z-30 items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07101e]/95 border border-cyan-400 text-cyan-300 hover:text-white hover:bg-cyan-950 font-mono text-xs shadow-2xl backdrop-blur transition-all"
          title="Open Swarm Tele-Ops Roster"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">Swarm Roster ({robots.length})</span>
        </button>
      )}

      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className="hidden md:flex fixed bottom-9 right-3 z-30 items-center gap-2 px-3 py-1.5 rounded-lg bg-[#180a15]/95 border border-rose-500 text-rose-300 hover:text-white hover:bg-rose-950 font-mono text-xs shadow-2xl backdrop-blur transition-all"
          title="Open Survivor Triage & Hazards Panel"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold">Triage & Hazards ({survivors.length})</span>
        </button>
      )}

      {/* Responsive Mobile Bottom Navigation Bar (< md) */}
      <nav className="flex md:hidden items-center justify-around bg-[#060a12] border-t border-slate-800 py-2 px-2 text-xs font-mono select-none z-30 shrink-0">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
            mobileTab === 'map'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🗺️</span>
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => setMobileTab('roster')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
            mobileTab === 'roster'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-sm">🤖</span>
          <span className="text-[10px]">Swarm ({robots.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('triage')}
          className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
            mobileTab === 'triage'
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-sm">❤️</span>
          <span className="text-[10px]">Triage ({survivors.length})</span>
        </button>
      </nav>

      {/* Floating Keyboard Shortcuts Hint at Bottom Bar */}
      <footer className={`hidden lg:flex items-center justify-between px-4 py-1 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-500 ${getTourSpotlightStyle('footer')}`}>
        <div className="flex items-center gap-4">
          <span>KEYBOARD SHORTCUTS:</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">1-6</kbd> Select Robot</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">R</kbd> Toggle Roster</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">T</kbd> Toggle Triage</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">M</kbd> Maximize Map</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">SPACE</kbd> Pause Sim</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">W A S D</kbd> Direct Tele-Op in FPV</span>
          <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">?</kbd> Open UX Case Study</span>
        </div>
        <div>
          <span>AEGIS-USAR // MISSION CONTROL v4.8 • INSARAG TIER-1 COMPLIANT</span>
        </div>
      </footer>

      {/* Modals & Interactive Tour */}
      <RobotFpvModal />
      <CaseStudyModal />
      <InteractiveTour />
    </div>
  );
};

export default function App() {
  return (
    <MissionProvider>
      <MissionControlDeck />
    </MissionProvider>
  );
}
