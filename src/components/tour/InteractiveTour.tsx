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
  CheckCircle2,
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
      badge: 'EPISTEMIC MAP',
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      title: '3-Layer Epistemic Disaster Map',
      description:
        'Pre-quake blueprints are obsolete. AEGIS fuses pre-CAD ghost grids with real-time LiDAR SLAM pointclouds and an amber Staleness Warning for areas at risk of aftershock collapse.',
      hint: 'Notice the diagonal hatching over unexplored voids—rescue squads cannot presume void safety until verified.',
      positionClasses: 'bottom-8 left-1/2 -translate-x-1/2',
    },
    {
      step: 2,
      badge: 'RESILIENT COMMS',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      title: 'Ghost Mode & Dead Reckoning',
      description:
        'Concrete rubble blocks radio signals. When Serpens-3 dives into basements, it never vanishes. AEGIS pins its last confirmed position, draws its dead-reckoning trajectory, and buffers telemetry offline.',
      hint: 'Look at Serpens-3 on the left: "42 PKTS BUFFERED". It continues exploring autonomously while disconnected.',
      positionClasses: 'top-1/2 -translate-y-1/2 right-6 md:right-16',
    },
    {
      step: 3,
      badge: 'RF RELAY MESH',
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
      title: 'Breadcrumb RF Mesh Relays',
      description:
        'Bridge communication dead zones with one click. Click "Deploy RF Beacon" at the top of the map and click near an isolated robot to restore mesh connection and flush all buffered data.',
      hint: 'Green rings show active RF mesh coverage zones from deployed repeater beacons.',
      positionClasses: 'bottom-8 left-1/2 -translate-x-1/2',
    },
    {
      step: 4,
      badge: 'START TRIAGE',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      title: 'START Protocol & Life Support',
      description:
        'Prioritize victims objectively. Discovered survivors are classified Immediate (Red), Delayed (Yellow), or Minor (Green) using acoustic void tapping (180 Hz) and thermal body heat.',
      hint: 'Click "Dispatch Life Support" on any survivor card to route Vulcan-X or Serpens-3 with oxygen lines.',
      positionClasses: 'top-1/2 -translate-y-1/2 left-6 md:left-16',
    },
    {
      step: 5,
      badge: 'SHARED AUTONOMY',
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      title: 'Multispectral FPV & Testing Controls',
      description:
        'Double-click any robot anytime to take manual FPV control with FLIR Thermal (37.1°C) and 3D LiDAR. Test real crisis events anytime using the Aftershock, Drop RF, and +Survivor buttons in the top bar.',
      hint: 'Click "UX Case Study" in the top bar anytime to inspect the complete 5-chapter design research paper.',
      positionClasses: 'top-20 left-1/2 -translate-x-1/2',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Dimmed backdrop - clicking ends tour */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={endTour}
      />

      {/* Larger, High-Impact Tour Card */}
      <div
        className={`pointer-events-auto absolute ${current.positionClasses} w-full max-w-xl md:max-w-2xl bg-[#090e1a] border-2 border-cyan-400/70 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] animate-fade-in text-slate-100 font-sans z-50`}
      >
        {/* Top Header: Badge, Step Indicator & Close */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-inner">
              {current.icon}
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/70 px-2.5 py-1 rounded-md border border-cyan-800/60">
              {current.badge}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 font-bold tracking-wider">
              STEP {current.step} / {tourSteps.length}
            </span>
            <button
              onClick={endTour}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Exit Tour (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-slate-100 tactical-font mb-2.5 tracking-wide">
          {current.title}
        </h3>

        {/* Short, Punchy Description */}
        <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">
          {current.description}
        </p>

        {/* Technical Hint Callout */}
        <div className="p-3 rounded-lg bg-slate-950/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{current.hint}</span>
        </div>

        {/* Bottom Actions: Progress Dots, Skip, Back, Next */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {tourSteps.map((s, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === tourStep
                    ? 'w-7 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                    : idx < tourStep
                    ? 'w-2.5 bg-cyan-700'
                    : 'w-2.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <button
              onClick={endTour}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip Tour
            </button>

            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={nextTourStep}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02]"
            >
              <span>{tourStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
