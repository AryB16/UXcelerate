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
    goToTourStep,
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
      badge: 'TACTICAL GIS',
      icon: <MapPin className="w-4 h-4 text-cyan-400" />,
      title: 'BPDC Tactical Map',
      description:
        'Live GIS map of BITS Pilani Dubai Campus showing the Sector 4 collapse perimeter. Click any robot or survivor pin to track live telemetry.',
      positionClasses: 'top-20 left-1/2 -translate-x-1/2',
      widthClass: 'w-[320px] md:w-[350px]',
    },
    {
      step: 2,
      badge: 'SWARM FLEET',
      icon: <Eye className="w-4 h-4 text-cyan-400" />,
      title: 'Robot Swarm Roster',
      description:
        'Manage your 6 specialized rescue units with live battery, signal, and sensor feeds. Click any robot to inspect telemetry or enter FPV pilot mode.',
      positionClasses: 'top-20 left-3 md:left-64',
      widthClass: 'w-[320px] md:w-[350px]',
    },
    {
      step: 3,
      badge: 'RAPID RESPONSE',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      title: 'Survivor Triage & Controls',
      description:
        'Survivors are prioritized by medical vitals from Immediate to Minor. Dispatch rescue units, deploy mesh beacons, or trigger test simulations.',
      positionClasses: 'top-20 right-3 md:right-68',
      widthClass: 'w-[320px] md:w-[350px]',
    },
  ];

  const current = tourSteps[tourStep] || tourSteps[0];

  return (
    <div
      style={{ zIndex: 99999 }}
      className={`pointer-events-auto fixed ${current.positionClasses} ${current.widthClass} max-w-[94vw] bg-[#090e1a]/98 border-2 border-cyan-400 rounded-lg p-3.5 md:p-4 shadow-[0_12px_45px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.45)] text-slate-100 font-sans`}
    >
      {/* Top Header: Badge, Step Counter & Close */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-cyan-950/80 border border-cyan-400/50">
            {current.icon}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
            {current.badge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {current.step} / {tourSteps.length}
          </span>
          <button
            onClick={endTour}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Tour (ESC)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-100 tactical-font mb-1.5 tracking-wide">
        {current.title}
      </h3>

      {/* 2-Sentence Concise Description */}
      <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans mb-3">
        {current.description}
      </p>

      {/* Bottom Actions: Progress Dots & Next/Back */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {tourSteps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToTourStep(idx)}
              title={`Go to step ${idx + 1}: ${s.badge}`}
              className={`h-1.5 rounded-full transition-all focus:outline-none ${
                idx === tourStep
                  ? 'w-5 bg-cyan-400'
                  : idx < tourStep
                  ? 'w-2 bg-cyan-700 hover:bg-cyan-500'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={endTour}
            className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip
          </button>

          {tourStep > 0 && (
            <button
              onClick={prevTourStep}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={nextTourStep}
            className="flex items-center gap-1 px-3 py-1 text-[11px] rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold tracking-wider transition-all"
          >
            <span>{tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
