import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { TacticalLog } from '../../types';
import {
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const TacticalLogFeed: React.FC = () => {
  const { logs } = useMission();
  const [filter, setFilter] = useState<'all' | 'emergency' | 'warning' | 'info'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getLogIcon = (type: TacticalLog['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060a12] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 tactical-font">
            Incident Event Stream ({logs.length})
          </h2>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-1.5 py-0.5 rounded ${
              filter === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('emergency')}
            className={`px-1.5 py-0.5 rounded ${
              filter === 'emergency' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-500'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-1.5 py-0.5 rounded ${
              filter === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
            }`}
          >
            Warn
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-[11px]">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded border flex items-start gap-2 ${
              log.type === 'emergency'
                ? 'bg-rose-950/25 border-rose-900/50 text-rose-200'
                : log.type === 'warning'
                ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                : log.type === 'success'
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                : 'bg-slate-900/40 border-slate-800 text-slate-300'
            }`}
          >
            {getLogIcon(log.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5 text-[10px]">
                <span className="font-bold text-slate-200">{log.source}</span>
                <span className="text-slate-500">{log.timestamp}</span>
              </div>
              <p className="leading-relaxed text-[10px] break-words">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
