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
      badge: 'TEST BENCH & SIMULATORS',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: 'Evaluator Test Bench & Live Injectors',
      directionalNotice: '👆 LOOK AT THE TOP 24PX EVALUATOR TOOLBAR',
      description:
        'Designed specifically for evaluators. With 1 click, you can trigger a 5.2M seismic aftershock, sever RF mesh links into ghost mode, or inject acoustic biosignal survivor detections.',
      hint: 'Try clicking "Simulate Aftershock" to watch the automatic autopath corridor rerouting in real time.',
      positionClasses: 'top-20 left-1/2 -translate-x-1/2',
    },
    {
      step: 2,
      badge: 'SWARM ROSTER & TELEMETRY',
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      title: 'Swarm Fleet & Live Sensor Inspector',
      directionalNotice: '👈 THE LEFT PANEL SHOWS ROSTER + TELEMETRY',
      description:
        'A single operator supervises 6 heterogeneous units. Selecting any robot reveals its live sub-sensor readings (LiDAR SLAM, Thermal emissivity, Gas PPM, Geophone) and its packet routing tree back to base.',
      hint: 'Click on K9-TITAN or AERO-SCOUT to observe live sensor updates in the bottom inspector.',
      positionClasses: 'top-20 right-4 md:right-8',
    },
    {
      step: 3,
      badge: 'EPISTEMIC DISASTER MAP',
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      title: 'Epistemic Map & Fog of Uncertainty',
      directionalNotice: '👈 THE CENTER GIS MAP IS FULLY VISIBLE',
      description:
        'AEGIS fuses pre-disaster CAD blueprint vectors with live LiDAR SLAM and epistemic caution hatching over unexplored rubble voids, preventing squads from presuming void safety.',
      hint: 'Notice military UTM coordinate rulers along borders and the 50m tactical scale bar.',
      positionClasses: 'top-20 right-4 md:right-8',
    },
    {
      step: 4,
      badge: 'RESILIENT GHOST COMMS',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      title: 'Ghost Mode & Store-and-Forward Mesh',
      directionalNotice: '👈 NOTICE SERPENS-3 DISCONNECTED BELOW RUBBLE',
      description:
        'When thick concrete cuts RF carrier signals, Serpens-3 engages autonomous dead reckoning and buffers 42 packets in local NVRAM. Deploying a breadcrumb relay beacon instantly restores uplink.',
      hint: 'Click "Eject Relay Beacon" or "Deploy RF Beacon" near Serpens-3 to trigger instant packet flush.',
      positionClasses: 'top-20 left-4 md:left-8',
    },
    {
      step: 5,
      badge: 'START TRIAGE & DISPATCH',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      title: 'Objective START Triage & Life Support',
      directionalNotice: '👉 THE RIGHT QUEUE SHOWS TRIAGE OBJECTIVES',
      description:
        'Discovered survivors are classified by priority (Red Immediate, Yellow Delayed, Green Minor). Incident Commanders can assign medical quads or micro-oxygen lines with a single click.',
      hint: 'Notice the proportional START spectrum bar and corridor survey metrics anchored at the bottom.',
      positionClasses: 'top-20 left-4 md:left-8',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* NO dark overlay over the screen! The non-target elements are blurred/dimmed by CSS directly. */}

      {/* Tutorial Floating Card */}
      <div
        className={`pointer-events-auto fixed ${current.positionClasses} w-[420px] max-w-[92vw] bg-[#090e1a]/95 backdrop-blur-md border border-cyan-400/80 rounded-md p-5 md:p-6 shadow-2xl animate-fade-in text-slate-100 font-sans z-50`}
      >
        {/* Directional Callout Banner */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 font-mono text-[11px] font-bold tracking-wider mb-3.5 shadow-inner">
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
            <span className="p-1.5 rounded-md bg-cyan-950/80 border border-cyan-400/50 shadow-inner">
              {current.icon}
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              {current.badge}
            </span>
          </div>

          <button
            onClick={endTour}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
        <div className="p-2.5 rounded-md bg-slate-950/90 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-4 flex items-start gap-2">
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
                    ? 'w-6 bg-cyan-400'
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={nextTourStep}
              className="flex items-center gap-1 px-4 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold tracking-wider transition-all transform hover:scale-[1.02]"
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
