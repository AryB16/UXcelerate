import React, { useEffect } from 'react';
import { useMission } from '../../store/MissionContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  MapPin,
  Radio,
  Heart,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const InteractiveTour: React.FC = () => {
  const {
    isTourOpen,
    tourStep,
    nextTourStep,
    prevTourStep,
    endTour,
  } = useMission();

  // Keyboard navigation for tour
  useEffect(() => {
    if (!isTourOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextTourStep();
      if (e.key === 'ArrowLeft') prevTourStep();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, nextTourStep, prevTourStep, endTour]);

  if (!isTourOpen) return null;

  const tourSteps = [
    {
      step: 1,
      badge: 'EPISTEMIC DISASTER MAP',
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      title: '3-Layer Epistemic Disaster Map',
      directionalNotice: '👈 THE CENTER MAP IS FULLY VISIBLE',
      description:
        'Pre-quake blueprints are obsolete. AEGIS fuses pre-CAD ghost grids with real-time LiDAR SLAM scans and an amber Staleness Warning for areas at risk of aftershock collapse.',
      hint: 'Notice the diagonal hatching over unexplored voids—preventing rescue squads from assuming void safety.',
      // Dock on the right so Center Map is 100% unobstructed
      positionClasses: 'top-20 right-4 md:right-8',
    },
    {
      step: 2,
      badge: 'RESILIENT COMMS // GHOST MODE',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      title: 'Ghost Mode & Dead Reckoning',
      directionalNotice: '👈 LOOK AT SERPENS-3 ON THE FAR LEFT',
      description:
        'Concrete rubble blocks radio signals. When Serpens-3 dives into basements, it never vanishes. AEGIS pins its last confirmed position, draws its dead-reckoning trajectory, and buffers telemetry offline.',
      hint: 'Look at Serpens-3 on the left: "42 PKTS BUFFERED". It continues exploring autonomously while disconnected.',
      // Dock on the right so Left Roster is 100% unobstructed
      positionClasses: 'top-20 right-4 md:right-8',
    },
    {
      step: 3,
      badge: 'BREADCRUMB RF RELAYS',
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
      title: 'Breadcrumb RF Mesh Relays',
      directionalNotice: '👉 CENTER MAP & BEACON TOOLS ARE FULLY VISIBLE',
      description:
        'Bridge communication dead zones with one click. Click "Deploy RF Beacon" at the top of the map and click near an isolated robot to restore mesh connection and flush all buffered data.',
      hint: 'Green rings show active RF mesh coverage zones from deployed repeater beacons.',
      // Dock on the left so Center Map is 100% unobstructed
      positionClasses: 'top-20 left-4 md:left-8',
    },
    {
      step: 4,
      badge: 'START TRIAGE QUEUE',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      title: 'START Protocol & Life Support',
      directionalNotice: '👉 LOOK AT THE SURVIVOR QUEUE ON THE FAR RIGHT',
      description:
        'Prioritize victims objectively. Discovered survivors are classified Immediate (Red), Delayed (Yellow), or Minor (Green) using acoustic void tapping (180 Hz) and thermal body heat.',
      hint: 'Click "Dispatch Life Support" on any survivor card to route Vulcan-X or Serpens-3 with oxygen lines.',
      // Dock on the left so Right Queue is 100% unobstructed
      positionClasses: 'top-20 left-4 md:left-8',
    },
    {
      step: 5,
      badge: 'SHARED AUTONOMY & SCENARIOS',
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      title: 'Multispectral FPV & Testing Controls',
      directionalNotice: '👆 LOOK AT THE TOP CONTROLS & SIMULATION TRIGGERS',
      description:
        'Double-click any robot anytime to take manual FPV control with FLIR Thermal (37.1°C) and 3D LiDAR. Test real crisis events anytime using the Aftershock, Drop RF, and +Survivor buttons in the top bar.',
      hint: 'Click "UX Case Study" in the top bar anytime to inspect the complete 5-chapter design research paper.',
      // Dock in the center below the header so Top Header is 100% unobstructed
      positionClasses: 'top-24 left-1/2 -translate-x-1/2',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* NO dark overlay over the screen! The non-target elements are blurred/dimmed by CSS directly. */}

      {/* Tutorial Floating Card */}
      <div
        className={`pointer-events-auto fixed ${current.positionClasses} w-[420px] max-w-[92vw] bg-[#090e1a]/95 backdrop-blur-md border-2 border-cyan-400 rounded-2xl p-5 md:p-6 shadow-[0_0_50px_rgba(6,182,212,0.45)] animate-fade-in text-slate-100 font-sans z-50`}
      >
        {/* Directional Callout Banner */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 font-mono text-[11px] font-bold tracking-wider mb-3.5 shadow-inner">
          <span className="flex items-center gap-1.5 truncate">
            <span>{current.directionalNotice}</span>
          </span>
          <span className="text-[10px] text-slate-400 shrink-0">
            {current.step} / {tourSteps.length}
          </span>
        </div>

        {/* Top Header: Badge, Step Indicator & Close */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400/50 shadow-inner">
              {current.icon}
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              {current.badge}
            </span>
          </div>

          <button
            onClick={endTour}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Tour (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-bold text-slate-100 tactical-font mb-2 tracking-wide">
          {current.title}
        </h3>

        {/* Short, Punchy Description */}
        <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3">
          {current.description}
        </p>

        {/* Technical Hint Callout */}
        <div className="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-4 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{current.hint}</span>
        </div>

        {/* Bottom Actions: Progress Dots, Skip, Back, Next */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((s, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === tourStep
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : idx < tourStep
                    ? 'w-2 bg-cyan-700'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={endTour}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip
            </button>

            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={nextTourStep}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02]"
            >
              <span>{tourStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
