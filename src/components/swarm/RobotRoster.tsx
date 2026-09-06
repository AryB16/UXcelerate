import React, { useState } from 'react';
import { useMission } from '../../store/MissionContext';
import { RobotType } from '../../types';
import {
  Eye,
  Radio,
  Bot,
  RotateCw,
  X,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { RobotTelemetryInspector } from './RobotTelemetryInspector';

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

  const getStatusChip = (bot: (typeof robots)[0]) => {
    if (bot.commsStatus === 'disconnected') {
      return { label: 'LOST', bg: 'bg-rose-950/40 text-rose-400 border-rose-500/30' };
    }
    if (bot.status === 'relay_anchor') {
      return { label: 'RELAY', bg: 'bg-slate-800 text-cyan-300 border-cyan-800/50' };
    }
    if (bot.type === 'aerial_drone') {
      return { label: 'MAPPING', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
    if (bot.type === 'heavy_quadruped' || bot.type === 'wall_climber') {
      return { label: 'SCOUTING', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
    return { label: 'PATROL', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const handleSelectRobot = (botId: string) => {
    if (selectedRobotId === botId) {
      selectRobot(null);
    } else {
      selectRobot(botId);
    }
    soundManager.playTacticalClick();
  };

  return (
    <div className="flex flex-col h-full bg-[#0b101b] border border-slate-800 rounded-md overflow-hidden shadow-xl select-none">
      {/* 1. Panel Header with Close Button strictly at top right */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 tactical-font">
            Robots ({robots.length})
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-cyan-300 border border-slate-700 hidden sm:inline-block">
            LIVE SYNC
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Robots Menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Filter Tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-0.5 px-1 rounded-sm transition-colors text-center ${
            filter === 'all'
              ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({robots.length})
        </button>

        <button
          onClick={() => setFilter('connected')}
          className={`flex-1 py-0.5 px-1 rounded-sm transition-colors text-center ${
            filter === 'connected'
              ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Online ({robots.filter((r) => r.commsStatus === 'connected').length})
        </button>

        <button
          onClick={() => setFilter('degraded')}
          className={`flex-1 py-0.5 px-1 rounded-sm transition-colors text-center ${
            filter === 'degraded'
              ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weak ({robots.filter((r) => r.commsStatus === 'degraded').length})
        </button>

        <button
          onClick={() => setFilter('disconnected')}
          className={`flex-1 py-0.5 px-1 rounded-sm transition-colors text-center ${
            filter === 'disconnected'
              ? 'bg-slate-800 text-rose-400 font-bold border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Offline ({robots.filter((r) => r.commsStatus === 'disconnected').length})
        </button>
      </div>

      {/* 3. RTS Squad Unit Tray: All 6 robots fit glanceably without scrolling */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-0 no-scrollbar">
        {filteredRobots.map((bot) => {
          const isSelected = selectedRobotId === bot.id;
          const isDisconnected = bot.commsStatus === 'disconnected';
          const isDegraded = bot.commsStatus === 'degraded';
          const statusChip = getStatusChip(bot);

          return (
            <div
              key={bot.id}
              onClick={() => handleSelectRobot(bot.id)}
              className={`rounded-sm border transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/80 border-cyan-500/70 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-[#0e1320] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Unit Row: 46px standard collapsed row */}
              <div className="flex items-center justify-between px-2 py-1.5 h-11">
                {/* Left: Type icon + Callsign */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{getRobotIcon(bot.type)}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 font-mono tracking-wide truncate">
                      {bot.callsign}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate leading-none">
                      {bot.name}
                    </div>
                  </div>
                </div>

                {/* Center: 1-word status chip + 3px micro-battery bar */}
                <div className="flex flex-col items-center gap-1 shrink-0 w-20">
                  <span
                    className={`text-[8.5px] font-mono font-semibold px-1.5 py-0.2 rounded-sm border ${statusChip.bg}`}
                  >
                    {statusChip.label}
                  </span>
                  <div className="w-14 bg-slate-800 rounded-full h-[3px] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        bot.battery < 25
                          ? 'bg-rose-500'
                          : bot.battery < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${bot.battery}%` }}
                    />
                  </div>
                </div>

                {/* Right: Connection status indicator dot */}
                <div className="flex items-center justify-end w-5 shrink-0">
                  {isDisconnected ? (
                    <span
                      className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-rose-500/30"
                      title="Ghost: Comms Severed"
                    />
                  ) : isDegraded ? (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30"
                      title="Degraded Mesh RSSI"
                    />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30"
                      title="Online Mesh Active"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Live Unit Telemetry & Comms Inspector (50% Split) */}
      <div className="h-[48%] shrink-0 min-h-0">
        <RobotTelemetryInspector />
      </div>
    </div>
  );
};
