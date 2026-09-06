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
} from 'lucide-react';

const MissionControlDeck: React.FC = () => {
  const {
    robots,
    survivors,
    selectRobot,
    toggleSimPaused,
    setIsCaseStudyOpen,
    isFpvOpen,
    startTour,
    isTourOpen,
    tourStep,
  } = useMission();

  const [rightPanelTab, setRightPanelTab] = useState<'survivors' | 'hazards' | 'logs'>('survivors');
  const [isLeftRosterOpen, setIsLeftRosterOpen] = useState<boolean>(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'map' | 'roster' | 'triage'>('map');

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
    }
  }, [isTourOpen]);

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

  // Auto-launch guided tour on first visit after 1.2s
  useEffect(() => {
    const hasSeen = localStorage.getItem('aegis_tour_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem('aegis_tour_seen', 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

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

        {/* RIGHT COLUMN: Triage, Hazards & Incident Log */}
        <div
          className={`${
            mobileTab === 'triage' ? 'flex' : 'hidden'
          } ${isRightPanelOpen ? 'md:flex md:col-span-3' : 'md:hidden'} h-full min-h-0 flex-col gap-2 ${getTourSpotlightStyle('right')}`}
        >
          {/* Top Half: Survivor Triage Queue */}
          <div className="flex-1 min-h-0">
            <SurvivorQueue onClose={() => setIsRightPanelOpen(false)} />
          </div>

          {/* Bottom Half: Switcher between Hazards/Corridors and Incident Log */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-1 mb-1 font-mono text-[10px] bg-slate-900/60 p-1 rounded border border-slate-800">
              <button
                onClick={() => setRightPanelTab('survivors')}
                className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
                  rightPanelTab === 'survivors'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Hazards & Paths</span>
              </button>

              <button
                onClick={() => setRightPanelTab('logs')}
                className={`flex-1 py-1 rounded transition-colors flex items-center justify-center gap-1 ${
                  rightPanelTab === 'logs'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Live Event Log</span>
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {rightPanelTab === 'survivors' ? (
                <HazardAndRoutePanel />
              ) : (
                <TacticalLogFeed />
              )}
            </div>
          </div>
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
          title="Open Survivor Triage & Incident Log"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold">Triage & Logs ({survivors.length})</span>
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
