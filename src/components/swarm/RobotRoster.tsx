import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { RobotType } from '../../types';
import {
  BatteryCharging,
  Wifi,
  WifiOff,
  Signal,
  Eye,
  Radio,
  Bot,
  Compass,
  RotateCw,
  X,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface RobotRosterProps {
  onClose?: () => void;
}

export const RobotRoster: React.FC<RobotRosterProps> = ({ onClose }) => {
  const {
    robots,
    selectedRobotId,
    selectRobot,
    openFpv,
    restoreComms,
    deployBeaconAt,
  } = useMission();

  const [filter, setFilter] = useState<'all' | 'connected' | 'degraded' | 'disconnected'>('all');

  const filteredRobots = robots.filter((r) => {
    if (filter === 'all') return true;
    return r.commsStatus === filter;
  });

  const getRobotIcon = (type: RobotType) => {
    switch (type) {
      case 'aerial_drone':
        return '🛸';
      case 'heavy_quadruped':
        return '🐕';
      case 'snake_crawler':
        return '🐍';
      case 'tracked_rover':
        return '🚜';
      case 'wall_climber':
        return '🦎';
      case 'amphibious':
        return '🌊';
    }
  };

  const handleSelectRobot = (botId: string) => {
    selectRobot(botId);
    soundManager.playTacticalClick();
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none">
      {/* 1. Compact Panel Header with Close Button strictly at top right */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 tactical-font">
            Swarm Roster ({robots.length})
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 hidden sm:inline-block">
            AUTO-SYNC
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Roster Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Filter Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-950/60 border-b border-slate-800 text-[10px] font-mono shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-0.5 px-1 rounded transition-colors text-center ${
            filter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({robots.length})
        </button>

        <button
          onClick={() => setFilter('connected')}
          className={`flex-1 py-0.5 px-1 rounded transition-colors text-center ${
            filter === 'connected'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Online ({robots.filter((r) => r.commsStatus === 'connected').length})
        </button>

        <button
          onClick={() => setFilter('degraded')}
          className={`flex-1 py-0.5 px-1 rounded transition-colors text-center ${
            filter === 'degraded'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Degraded ({robots.filter((r) => r.commsStatus === 'degraded').length})
        </button>

        <button
          onClick={() => setFilter('disconnected')}
          className={`flex-1 py-0.5 px-1 rounded transition-colors text-center ${
            filter === 'disconnected'
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ghost ({robots.filter((r) => r.commsStatus === 'disconnected').length})
        </button>
      </div>

      {/* 3. Ultra-Dense Robot Cards List (All 6 robots glanceable without scrolling) */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0">
        {filteredRobots.map((bot) => {
          const isSelected = selectedRobotId === bot.id;
          const isDisconnected = bot.commsStatus === 'disconnected';
          const isDegraded = bot.commsStatus === 'degraded';

          return (
            <div
              key={bot.id}
              onClick={() => handleSelectRobot(bot.id)}
              className={`p-2 rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                  : isDisconnected
                  ? 'bg-rose-950/15 border-rose-900/50 hover:border-rose-700/60'
                  : 'bg-[#0a101d] border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Line 1: Type icon + Robot Name + Callsign badge + Status chip floated right */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0">{getRobotIcon(bot.type)}</span>
                  <span className="text-xs font-bold text-slate-100 font-mono truncate">{bot.name}</span>
                  <span className="text-[9px] text-cyan-400 font-mono uppercase bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-800/60 shrink-0">
                    {bot.callsign}
                  </span>
                </div>

                {isDisconnected ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse shrink-0">
                    <WifiOff className="w-2.5 h-2.5 text-rose-400" />
                    <span>GHOST</span>
                  </span>
                ) : isDegraded ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 shrink-0">
                    <Signal className="w-2.5 h-2.5 text-amber-400" />
                    <span>DEGRADED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shrink-0">
                    <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                    <span>ONLINE</span>
                  </span>
                )}
              </div>

              {/* Line 2: Monospace micro-telemetry row: Battery with 2px progress bar, latency/RSSI, and coordinates */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BatteryCharging
                    className={`w-3 h-3 shrink-0 ${
                      bot.battery < 25 ? 'text-rose-400' : bot.battery < 50 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                  <span className="text-slate-300 shrink-0">{Math.round(bot.battery)}%</span>
                  <div className="w-10 bg-slate-800 rounded-full h-[2px] overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full ${
                        bot.battery < 25 ? 'bg-rose-500' : bot.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bot.battery}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                  <span>{isDisconnected ? 'NO MESH' : `${bot.latencyMs}ms`}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <Compass className="w-2.5 h-2.5 text-cyan-400" />
                  <span>
                    [{Math.round(bot.position.x)}, {Math.round(bot.position.y)}]
                  </span>
                </div>
              </div>

              {/* Line 3: Current task truncated to a single line */}
              <div className="truncate text-[10px] text-slate-400 font-mono mb-1.5">
                {bot.currentTask}
              </div>

              {/* Action Bar: Slim 20px action bar: [FPV] + [Relay] side-by-side */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFpv(bot.id);
                  }}
                  className="flex-1 h-5 flex items-center justify-center gap-1 px-1.5 rounded bg-cyan-600/25 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-medium transition-colors"
                  title={`Open FPV Feed for ${bot.name}`}
                >
                  <Eye className="w-2.5 h-2.5 text-cyan-400" />
                  <span>FPV</span>
                </button>

                {isDisconnected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreComms(bot.id);
                    }}
                    className="flex-1 h-5 flex items-center justify-center gap-1 px-1.5 rounded bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-medium transition-colors"
                    title="Sync buffered packets"
                  >
                    <RotateCw className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Relay / Sync</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deployBeaconAt(bot.position.x, bot.position.y, `Relay by ${bot.name}`);
                    }}
                    className="flex-1 h-5 flex items-center justify-center gap-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-mono transition-colors"
                    title="Deploy Breadcrumb Mesh Beacon"
                  >
                    <Radio className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Relay</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
