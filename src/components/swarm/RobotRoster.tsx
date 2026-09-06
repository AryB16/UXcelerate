import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { Robot, RobotType } from '../../types';
import {
  BatteryCharging,
  Wifi,
  WifiOff,
  Signal,
  Eye,
  Radio,
  Navigation,
  Bot,
  Compass,
  RotateCw,
  X,
  MapPin,
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
  const [autoCloseOnSelect, setAutoCloseOnSelect] = useState<boolean>(false);

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
    if (autoCloseOnSelect && onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 tactical-font">
            Swarm Tele-Ops Roster ({robots.length})
          </h2>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline-block">
            MESH AUTO-SYNC
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Roster Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Auto-Close Toggle & Quick Close Bar */}
      {onClose && (
        <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={autoCloseOnSelect}
              onChange={(e) => setAutoCloseOnSelect(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
            />
            <span>Auto-close when chosen</span>
          </label>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-[10px]"
          >
            <span>Close menu</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-[11px] font-mono overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded transition-colors ${
            filter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({robots.length})
        </button>

        <button
          onClick={() => setFilter('connected')}
          className={`px-2 py-1 rounded transition-colors ${
            filter === 'connected'
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Connected ({robots.filter((r) => r.commsStatus === 'connected').length})
        </button>

        <button
          onClick={() => setFilter('degraded')}
          className={`px-2 py-1 rounded transition-colors ${
            filter === 'degraded'
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Degraded ({robots.filter((r) => r.commsStatus === 'degraded').length})
        </button>

        <button
          onClick={() => setFilter('disconnected')}
          className={`px-2 py-1 rounded transition-colors ${
            filter === 'disconnected'
              ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ghost ({robots.filter((r) => r.commsStatus === 'disconnected').length})
        </button>
      </div>

      {/* Robot Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredRobots.map((bot) => {
          const isSelected = selectedRobotId === bot.id;
          const isDisconnected = bot.commsStatus === 'disconnected';
          const isDegraded = bot.commsStatus === 'degraded';

          return (
            <div
              key={bot.id}
              onClick={() => handleSelectRobot(bot.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : isDisconnected
                  ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700/80'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Robot Name, Type, Comms Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getRobotIcon(bot.type)}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100 font-mono">{bot.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/60 px-1 rounded border border-cyan-800/50">
                        {bot.callsign}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {bot.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Comms Badge */}
                {isDisconnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse">
                    <WifiOff className="w-3 h-3 text-rose-400" />
                    <span>GHOST ({Math.floor(bot.lastContactSecondsAgo / 60)}m)</span>
                  </span>
                ) : isDegraded ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                    <Signal className="w-3 h-3 text-amber-400" />
                    <span>DEGRADED ({bot.latencyMs}ms)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>ONLINE</span>
                  </span>
                )}
              </div>

              {/* Current Task */}
              <p className="text-xs text-slate-300 font-mono mb-2 line-clamp-2 leading-relaxed">
                {bot.currentTask}
              </p>

              {/* Battery & Position Bar */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-2.5 pt-1 border-t border-slate-800/70">
                <div className="flex items-center gap-1.5">
                  <BatteryCharging
                    className={`w-3 h-3 ${
                      bot.battery < 25
                        ? 'text-rose-400'
                        : bot.battery < 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  />
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        bot.battery < 25
                          ? 'bg-rose-500'
                          : bot.battery < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bot.battery}%` }}
                    />
                  </div>
                  <span className="text-slate-300">{Math.round(bot.battery)}%</span>
                </div>

                <div className="flex items-center justify-end gap-1 text-slate-400">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>
                    [{Math.round(bot.position.x)}, {Math.round(bot.position.y)}]
                  </span>
                </div>
              </div>

              {/* Sensor Chips */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {bot.sensors.slice(0, 2).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {s}
                  </span>
                ))}
                {bot.sensors.length > 2 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                    +{bot.sensors.length - 2}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/70">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFpv(bot.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-[11px] font-medium transition-colors"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>FPV Feed</span>
                </button>

                {isDisconnected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreComms(bot.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-[11px] font-medium transition-colors"
                  >
                    <RotateCw className="w-3 h-3 text-emerald-400" />
                    <span>Sync Packets</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deployBeaconAt(bot.position.x, bot.position.y, `Relay by ${bot.name}`);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
                    title="Deploy Breadcrumb Mesh Beacon"
                  >
                    <Radio className="w-3 h-3 text-emerald-400" />
                  </button>
                )}
              </div>

              {/* View on Map & Close Menu Button (Shown when selected) */}
              {isSelected && onClose && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectRobot(bot.id);
                    soundManager.playTacticalClick();
                    onClose();
                  }}
                  className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-[11px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View on Map & Close Menu</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
