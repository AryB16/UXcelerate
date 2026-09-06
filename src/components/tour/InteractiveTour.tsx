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
  Compass,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const InteractiveTour: React.FC = () => {
  const {
    isTourOpen,
    tourStep,
    nextTourStep,
    prevTourStep,
    endTour,
    openFpv,
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
      badge: 'EPISTEMIC MAPPING',
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      title: 'The Disaster Zone & Epistemic Uncertainty',
      description:
        'In a collapsed building, pre-disaster blueprints are obsolete. AEGIS displays a 3-layer map: pre-CAD ghost structural grids, real-time LiDAR SLAM vector pointclouds, and an amber "Staleness" decay gradient for areas where ongoing aftershocks risk secondary collapses.',
      hint: 'Notice the diagonal hatching over unexplored voids—preventing rescue squads from assuming safety.',
      positionClasses: 'top-20 left-1/2 -translate-x-1/2',
    },
    {
      step: 2,
      badge: 'RESILIENT COMMS',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      title: 'Ghost Mode & Dead Reckoning',
      description:
        'Deep concrete rubble severs radio frequencies. When Serpens-3 dives into subterranean basements, it does NOT disappear from the map. It enters Ghost Mode: pinning its last confirmed position, projecting a dead-reckoning trajectory vector, and buffering telemetry packets offline.',
      hint: 'Look at Serpens-3 on the left: "42 PKTS BUFFERED". It continues exploring autonomously while offline.',
      positionClasses: 'top-24 left-16 md:left-80',
    },
    {
      step: 3,
      badge: 'MESH TOPOLOGY',
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
      title: 'Breadcrumb RF Mesh Relays',
      description:
        'To restore connection to isolated ghost robots, operators can deploy breadcrumb repeaters. Clicking "Deploy RF Beacon" on the top of the map lets you drop a relay anywhere—expanding the mesh footprint and syncing buffered data.',
      hint: 'Green dashed circles on the map represent RF mesh coverage zones from active relay nodes.',
      positionClasses: 'top-24 left-1/2 -translate-x-1/2',
    },
    {
      step: 4,
      badge: 'TRIAGE PROTOCOL',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      title: 'START Protocol Triage & Life Support',
      description:
        'Discovered survivors are prioritized via the international Simple Triage and Rapid Treatment (START) protocol: Immediate Red, Delayed Yellow, and Minor Green. Live heart rate, SpO2, and 180 Hz acoustic tapping are fused from geophones and thermal cameras.',
      hint: 'Click "Dispatch Life Support" on any survivor card to route Vulcan-X or Serpens-3 with oxygen lines.',
      positionClasses: 'top-24 right-16 md:right-80',
    },
    {
      step: 5,
      badge: 'SHARED AUTONOMY',
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      title: 'Multispectral FPV & Scenario Testing',
      description:
        'Supervisory control handles the fleet, but operators can double-click any robot anytime to open its cockpit with FLIR Radiometric White-Hot thermal (37.1°C body heat) and 3D LiDAR radar. You can also test real crisis events using the "Aftershock", "Drop RF", and "+Survivor" buttons!',
      hint: 'Click "UX Case Study" in the top bar to inspect the complete 5-chapter design research whitepaper.',
      positionClasses: 'top-20 left-1/2 -translate-x-1/2',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center p-4">
      {/* Dimmed backdrop with pointer events allowed to close */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={endTour}
      />

      {/* Tour Card */}
      <div
        className={`pointer-events-auto absolute ${current.positionClasses} w-full max-w-lg bg-[#0a0f1d] border border-cyan-500/50 rounded-xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)] animate-fade-in text-slate-100 font-sans z-50`}
      >
        {/* Top bar: Badge & Step Indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40">
              {current.icon}
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {current.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 font-bold">
              STEP {current.step} OF {tourSteps.length}
            </span>
            <button
              onClick={endTour}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Tour (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Body */}
        <h3 className="text-sm font-bold text-slate-100 tactical-font mb-2 tracking-wide">
          {current.title}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
          {current.description}
        </p>

        {/* Technical Hint Callout */}
        <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-cyan-300 mb-4 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>{current.hint}</span>
        </div>

        {/* Bottom Actions: Progress Dots & Next/Prev */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/70">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((s, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === tourStep
                    ? 'w-6 bg-cyan-400'
                    : idx < tourStep
                    ? 'w-2 bg-cyan-700'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={endTour}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 font-mono transition-colors"
            >
              Skip
            </button>

            {tourStep > 0 && (
              <button
                onClick={prevTourStep}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={nextTourStep}
              className="flex items-center gap-1 px-3.5 py-1 text-xs rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
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
