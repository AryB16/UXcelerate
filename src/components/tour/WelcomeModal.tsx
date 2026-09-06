import React, { useState, useEffect } from 'react';
import { useMission } from '../../store/MissionContext';
import { Shield, Sparkles, ArrowRight, X } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { startTour } = useMission();
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('aegis_welcome_dismissed');
    if (!dismissed) {
      // Show shortly after mount
      const timer = setTimeout(() => setIsOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('aegis_welcome_dismissed', 'true');
    }
    setIsOpen(false);
    startTour();
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('aegis_welcome_dismissed', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex: 99990 }}
      className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-[#131822] border border-slate-700 rounded-md p-5 shadow-2xl text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide text-cyan-400">
            Welcome to AEGIS
          </span>
        </div>

        <h2 className="text-base font-bold text-white mb-2">
          Do you want a quick tutorial?
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Take a 30-second tour to see how the robot swarm, live map, and survivor rescue queue work.
        </p>

        {/* Do not show again checkbox */}
        <label className="flex items-center gap-2 mb-4 text-[11px] text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:outline-none"
          />
          <span>Don't show this again</span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors text-center"
          >
            Skip for now
          </button>

          <button
            onClick={handleStartTour}
            className="flex-1 py-2 px-3 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Start Tutorial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
