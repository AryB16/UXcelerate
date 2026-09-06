import React from 'react';
import { useMission } from '../../store/MissionContext';
import { Eye, Radio, RotateCw, Activity, Cpu, Wifi, WifiOff, Layers } from 'lucide-react';

export const RobotTelemetryInspector: React.FC = () => {
  const {
    robots,
    selectedRobotId,
    openFpv,
    restoreComms,
    deployBeaconAt,
  } = useMission();

  const selectedRobot = robots.find((r) => r.id === selectedRobotId) || robots[0];
  const isDisconnected = selectedRobot.commsStatus === 'disconnected';

  // Sub-sensor readings for defense-grade C2 (NASA Open MCT / ATAK style)
  const getSubSensors = (r: typeof selectedRobot) => {
    switch (r.type) {
      case 'aerial_drone':
        return [
          { label: 'LiDAR SLAM', val: '64 beam • 30 FPS', sub: 'FOV 360° × 45°' },
          { label: 'Thermal FLIR', val: '36.8°C (ε 0.98)', sub: '640×512 Radiometric' },
          { label: 'Gas Sniffer', val: 'CO2: 412 PPM', sub: 'CH4: 0 PPM (Nominal)' },
          { label: 'Geophone', val: '0.4 Hz Baseline', sub: 'Acoustic Void Listening' },
        ];
      case 'heavy_quadruped':
        return [
          { label: 'Flash LiDAR', val: '128k pts/s', sub: 'Depth Variance ±1mm' },
          { label: 'Thermal IR', val: '36.4°C Target', sub: 'SURV-01 Biosignature' },
          { label: 'Gas Sniffer', val: 'CH4: 520 PPM', sub: 'LEL Critical Alert' },
          { label: 'Geophone', val: '180 Hz Tap Ring', sub: 'Rhythmic Voids Verified' },
        ];
      case 'snake_crawler':
        return [
          { label: 'Micro-LiDAR', val: '16 beam • 15 FPS', sub: 'Subterranean Voxel' },
          { label: 'Thermal Needle', val: '37.1°C Contact', sub: 'SURV-02 Heat Trace' },
          { label: 'CO Spectrometer', val: 'CO: 18 PPM', sub: 'Toxic Gas Trace' },
          { label: 'Micro-Sonar', val: '340 Hz Acoustic', sub: 'Elevator Shaft Resonance' },
        ];
      default:
        return [
          { label: 'Multi-LiDAR', val: '64 beam • 25 FPS', sub: 'SLAM Dense Pointcloud' },
          { label: 'FLIR Sensor', val: '36.2°C Ambient', sub: 'Radiometric Core' },
          { label: 'Gas Sniffer', val: 'Air Quality: 94%', sub: 'No Combustible Vapors' },
          { label: 'Geophone', val: '2.1 Hz Structural', sub: 'Load Bearing Stable' },
        ];
    }
  };

  const sensors = getSubSensors(selectedRobot);

  return (
    <div className="flex flex-col h-full bg-[#111622] border-t border-slate-800 text-slate-100 font-mono text-xs select-none min-h-0 overflow-y-auto no-scrollbar p-2.5">
      {/* 1. Header: Selected Unit Callsign + Operational Directive */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/80 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-bold text-slate-100 tracking-wider text-[11px] truncate">
              {selectedRobot.callsign} // {selectedRobot.name}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            DIRECTIVE: <span className="text-slate-200">{selectedRobot.currentTask}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
              isDisconnected
                ? 'bg-rose-950/50 text-rose-400 border-rose-500/40 animate-pulse'
                : selectedRobot.commsStatus === 'degraded'
                ? 'bg-amber-950/50 text-amber-400 border-amber-500/40'
                : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {isDisconnected ? 'OFFLINE NVRAM' : `${selectedRobot.signalStrength}% MESH`}
          </span>
        </div>
      </div>

      {/* 2. Sub-Sensors Grid: 4 Micro-Tiles (LiDAR, Thermal, Gas, Geophone) */}
      <div className="grid grid-cols-2 gap-1.5 mb-2 shrink-0">
        {sensors.map((s, idx) => (
          <div
            key={idx}
            className="p-1.5 rounded bg-[#0b0f19] border border-slate-800/80 flex flex-col justify-between min-h-[46px]"
          >
            <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate">
              {s.label}
            </div>
            <div className="text-[11px] font-bold text-slate-200 truncate leading-tight">
              {s.val}
            </div>
            <div className="text-[8.5px] text-slate-400 truncate leading-none">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Mesh Network Topology Tree */}
      <div className="p-2 rounded bg-[#0b0f19] border border-slate-800/80 mb-2 shrink-0">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>MESH PACKET TOPOLOGY</span>
          </span>
          <span className="text-slate-400">{selectedRobot.firmwareVersion}</span>
        </div>

        {isDisconnected ? (
          <div className="p-1.5 rounded bg-rose-950/30 border border-rose-900/50 text-[10px] text-rose-300 flex items-center gap-1.5 leading-tight">
            <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">BUFFERING IN LOCAL NVRAM</span>
              <div className="text-[9px] text-rose-400/80">
                {selectedRobot.storeAndForwardBacklog} telemetry packets queued • Auto-flushes upon mesh ingress
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono overflow-x-auto no-scrollbar py-0.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold shrink-0">
              {selectedRobot.callsign}
            </span>
            <span className="text-slate-600">➔</span>
            {selectedRobot.id !== 'ROB-04' && (
              <>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-300 shrink-0">
                  SHORE-ROVER (Relay)
                </span>
                <span className="text-slate-600">➔</span>
              </>
            )}
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-200 shrink-0">
              Base Mast
            </span>
            <span className="text-[9px] text-emerald-400 ml-auto shrink-0 font-bold">
              {selectedRobot.latencyMs}ms
            </span>
          </div>
        )}
      </div>

      {/* 4. Action Bar */}
      <div className="flex items-center gap-1.5 mt-auto pt-1 shrink-0">
        <button
          onClick={() => openFpv(selectedRobot.id)}
          className="flex-1 h-7 flex items-center justify-center gap-1.5 px-2 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold shadow transition-colors"
          title={`Watch live camera for ${selectedRobot.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>

        {isDisconnected ? (
          <button
            onClick={() => restoreComms(selectedRobot.id)}
            className="flex-1 h-7 flex items-center justify-center gap-1 px-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold shadow transition-colors"
            title="Reconnect robot and download saved data"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reconnect</span>
          </button>
        ) : (
          <button
            onClick={() => deployBeaconAt(selectedRobot.position.x, selectedRobot.position.y, `Relay by ${selectedRobot.name}`)}
            className="flex-1 h-7 flex items-center justify-center gap-1 px-2 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] font-medium transition-colors"
            title="Drop a signal booster here"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drop Signal Relay</span>
          </button>
        )}
      </div>
    </div>
  );
};
