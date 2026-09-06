import React, { useState, useEffect } from 'react';
import { useMission } from '../../store/MissionContext';
import {
  X,
  Radio,
  Wifi,
  WifiOff,
  Battery,
  Compass,
  Crosshair,
  Shield,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const RobotFpvModal: React.FC = () => {
  const {
    isFpvOpen,
    fpvRobotId,
    closeFpv,
    robots,
    survivors,
    hazards,
    deployBeaconAt,
    restoreComms,
    manualMoveRobot,
  } = useMission();

  const [activeFeed, setActiveFeed] = useState<'flir' | 'lidar' | 'optical' | 'spectrogram'>('flir');
  const [teleopHeading, setTeleopHeading] = useState<number>(180);
  const [gimbalPitch, setGimbalPitch] = useState<number>(-12);
  const [lastAction, setLastAction] = useState<string>('SYSTEM READY');
  const [isArmExtended, setIsArmExtended] = useState<boolean>(false);

  const robot = robots.find((r) => r.id === fpvRobotId);

  // Sync teleopHeading with robot's initial heading on mount
  useEffect(() => {
    if (robot) {
      setTeleopHeading(robot.heading);
    }
  }, [robot?.id]);

  // Keyboard shortcut listener for tele-op: W = front, S = back, A = left, D = right
  useEffect(() => {
    if (!isFpvOpen || !robot) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === 'Escape') {
        closeFpv();
        return;
      }

      const moveStep = 12;
      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        soundManager.playTacticalClick();
        setTeleopHeading(0);
        setLastAction('MOVING FRONT');
        manualMoveRobot(robot.id, 0, -moveStep, 0);
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        soundManager.playTacticalClick();
        setTeleopHeading(180);
        setLastAction('MOVING BACK');
        manualMoveRobot(robot.id, 0, moveStep, 180);
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        soundManager.playTacticalClick();
        setTeleopHeading(270);
        setLastAction('MOVING LEFT');
        manualMoveRobot(robot.id, -moveStep, 0, 270);
      } else if (key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        soundManager.playTacticalClick();
        setTeleopHeading(90);
        setLastAction('MOVING RIGHT');
        manualMoveRobot(robot.id, moveStep, 0, 90);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFpvOpen, closeFpv, robot, manualMoveRobot]);

  if (!isFpvOpen || !robot) return null;

  const nearestSurvivor = survivors[0] || { id: 'SURV-01', label: 'Survivor #1', location: { x: 530, y: 160 } };
  const distPx = Math.hypot(nearestSurvivor.location.x - robot.position.x, nearestSurvivor.location.y - robot.position.y);
  const distMeters = (distPx * 0.15).toFixed(1);

  const getCompassDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  const thermalScale = Math.max(0.7, Math.min(1.8, 28 / Math.max(10, Number(distMeters))));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#060a12] border border-cyan-500/40 rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Cockpit Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-cyan-500/30 font-mono select-none">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 tactical-font">{robot.name}</span>
                <span className="text-xs text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded-sm border border-cyan-700">
                  {robot.callsign}
                </span>
                <span className="text-xs text-slate-400 capitalize">[{robot.type.replace('_', ' ')}]</span>
              </div>
            </div>
          </div>

          {/* Center telemetry chips */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span>{Math.round(robot.battery)}% BATT</span>
            </div>

            <div className="flex items-center gap-1.5">
              {robot.commsStatus === 'disconnected' ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <WifiOff className="w-4 h-4 text-rose-500 animate-ping" />
                  GHOST OFFLINE ({robot.storeAndForwardBacklog} PKTS BUFFERED)
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  {robot.signalStrength}% RSSI ({robot.latencyMs}ms)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>HDG {teleopHeading}° // TILT {gimbalPitch}°</span>
            </div>
          </div>

          <button
            onClick={closeFpv}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Return to Tactical Map (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Sensor Feed Mode Toolbar Strip (Zero overlap with video HUD) */}
        <div className="px-4 py-2 bg-[#050b14] border-b border-slate-800 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 font-semibold mr-1 hidden sm:inline">MULTISPECTRAL SENSORS:</span>
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setActiveFeed('flir');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                activeFeed === 'flir'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              FLIR Thermal (37.1°C)
            </button>
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setActiveFeed('lidar');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                activeFeed === 'lidar'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              3D LiDAR Radar
            </button>
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setActiveFeed('optical');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                activeFeed === 'optical'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              Night Optical (NIR)
            </button>
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setActiveFeed('spectrogram');
              }}
              className={`px-3 py-1 rounded-sm text-xs font-bold transition-all ${
                activeFeed === 'spectrogram'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              Acoustic & Hazmat
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden md:inline">ENCODER: HEVC/H.265</span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              1080p @ 60 FPS
            </span>
          </div>
        </div>

        {/* Cockpit Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-0 overflow-y-auto">
          
          {/* Main Tactical Map Display (3 Columns) */}
          <div className="lg:col-span-3 relative bg-[#040813] flex flex-col items-center justify-center min-h-[420px] p-2 border-r border-slate-800/80">
            
            {/* Offline Simulation Overlay if Disconnected */}
            {robot.commsStatus === 'disconnected' && (
              <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center border border-rose-500/30">
                <WifiOff className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-rose-400 font-mono tracking-wider">
                  DIRECT VIDEO CARRIER SEVERED
                </h3>
                <p className="text-xs text-slate-300 font-mono max-w-md mt-1 mb-4">
                  Robot operating under Autonomous Void Protocol (INSARAG-AVP). Local LiDAR & FLIR frames are continuously buffered to on-board flash NVRAM.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => restoreComms(robot.id)}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all"
                  >
                    Restore Mesh Link (Flush {robot.storeAndForwardBacklog} Pkts)
                  </button>
                </div>
              </div>
            )}

            {/* Main Overhead Tactical Blueprint Map Canvas */}
            <div className="w-full h-full relative bg-[#040813] overflow-hidden flex items-center justify-center select-none rounded-md border border-slate-800/60 shadow-inner">
              
              {/* Full Tactical SVG Floorplan */}
              <svg viewBox="0 0 800 640" className="w-full h-full">
                {/* Blueprint Background Grid */}
                <defs>
                  <pattern id="tacticalGridMain" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="800" height="640" fill="url(#tacticalGridMain)" />

                {/* Blueprint Sectors */}
                <g id="sectors">
                  {/* Sector Alpha - North Wing ER */}
                  <rect x="40" y="40" width="340" height="260" fill="rgba(6, 182, 212, 0.05)" stroke="#0e7490" strokeWidth="1.5" strokeDasharray="5,5" />
                  <text x="52" y="60" fill="#22d3ee" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    SECTOR ALPHA // NORTH WING ER (STABILIZED)
                  </text>

                  {/* Sector Beta - Main Tower Collapse */}
                  <rect x="420" y="40" width="340" height="260" fill="rgba(244, 63, 94, 0.05)" stroke="#be123c" strokeWidth="1.5" strokeDasharray="5,5" />
                  <text x="432" y="60" fill="#fb7185" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    SECTOR BETA // MAIN TOWER COLLAPSE (UNSTABLE)
                  </text>

                  {/* Sector Gamma - Metro Void & Basement */}
                  <rect x="420" y="340" width="340" height="260" fill="rgba(245, 158, 11, 0.05)" stroke="#b45309" strokeWidth="1.5" strokeDasharray="5,5" />
                  <text x="432" y="360" fill="#fcd34d" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    SECTOR GAMMA // METRO VOID & BASEMENT (CRITICAL TILT)
                  </text>

                  {/* Sector Delta - South Courtyard / Staging */}
                  <rect x="40" y="340" width="340" height="260" fill="rgba(16, 185, 129, 0.05)" stroke="#047857" strokeWidth="1.5" strokeDasharray="5,5" />
                  <text x="52" y="360" fill="#6ee7b7" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    SECTOR DELTA // SOUTH COURTYARD (STAGING)
                  </text>
                </g>

                {/* Main Structural Corridors & Voids */}
                <g id="corridors">
                  {/* Corridor Alpha-1 */}
                  <line x1="260" y1="150" x2="450" y2="170" stroke="#00e5ff" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
                  <line x1="260" y1="150" x2="450" y2="170" stroke="#080e1b" strokeWidth="4" strokeLinecap="round" />
                  <text x="355" y="154" textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="JetBrains Mono">
                    CORRIDOR ALPHA-1 [CLEARED]
                  </text>

                  {/* Corridor Beta (Partially Blocked) */}
                  <line x1="450" y1="170" x2="530" y2="160" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
                  <line x1="450" y1="170" x2="530" y2="160" stroke="#080e1b" strokeWidth="4" strokeLinecap="round" />
                  <text x="490" y="152" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="JetBrains Mono">
                    ⛔ BLOCKED (JOIST COLLAPSE)
                  </text>

                  {/* Vertical Conduits */}
                  <line x1="450" y1="170" x2="450" y2="320" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
                  <line x1="450" y1="320" x2="590" y2="440" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
                </g>

                {/* Hazards */}
                <g id="hazards">
                  {hazards?.map((haz) => (
                    <g key={haz.id} transform={`translate(${haz.location.x}, ${haz.location.y})`}>
                      <circle r="16" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                      <circle r="8" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fontSize="9">
                        {haz.type === 'gas_leak' ? '☣' : '⚠'}
                      </text>
                      <rect x="-35" y="12" width="70" height="13" rx="2" fill="#0b0f19" stroke="#f59e0b" strokeWidth="0.8" />
                      <text y="21.5" textAnchor="middle" fill="#fde68a" fontSize="7" fontFamily="JetBrains Mono" fontWeight="bold">
                        {haz.title}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Survivors */}
                <g id="survivors">
                  {survivors?.map((surv) => {
                    const isCrit = surv.triage === 'immediate';
                    const strokeCol = isCrit ? '#ef4444' : '#f59e0b';
                    return (
                      <g key={surv.id} transform={`translate(${surv.location.x}, ${surv.location.y})`}>
                        {isCrit && (
                          <circle r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
                        )}
                        <circle r="12" fill={isCrit ? '#2a0c16' : '#221606'} stroke={strokeCol} strokeWidth="1.8" />
                        <text y="4" textAnchor="middle" fontSize="10">❤️</text>
                        <rect x="-24" y="-21" width="48" height="13" rx="2" fill="#0b0f19" stroke={strokeCol} strokeWidth="0.8" />
                        <text y="-12" textAnchor="middle" fill={isCrit ? '#fca5a5' : '#fde68a'} fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">
                          {surv.id}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Other Swarm Robots */}
                <g id="other-robots">
                  {robots
                    .filter((r) => r.id !== robot.id)
                    .map((r) => (
                      <g key={r.id} transform={`translate(${r.position.x}, ${r.position.y})`}>
                        <circle r="11" fill="#081426" stroke="#475569" strokeWidth="1.5" />
                        <text y="3.5" textAnchor="middle" fontSize="9">🤖</text>
                        <rect x="-24" y="14" width="48" height="12" rx="2" fill="#0b0f19" stroke="#475569" strokeWidth="0.8" />
                        <text y="22.5" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono">
                          {r.name.split('-')[0]}
                        </text>
                      </g>
                    ))}
                </g>

                {/* Active Controllable Robot */}
                {(() => {
                  const rad = (teleopHeading * Math.PI) / 180;
                  const coneRadius = 75;
                  const angleSpan = Math.PI / 3.5;
                  const x1 = robot.position.x + coneRadius * Math.sin(rad - angleSpan);
                  const y1 = robot.position.y - coneRadius * Math.cos(rad - angleSpan);
                  const x2 = robot.position.x + coneRadius * Math.sin(rad + angleSpan);
                  const y2 = robot.position.y - coneRadius * Math.cos(rad + angleSpan);

                  return (
                    <g id="active-robot-teleop">
                      {/* Active Heading / Sensor Vision Cone */}
                      <path
                        d={`M ${robot.position.x} ${robot.position.y} L ${x1} ${y1} A ${coneRadius} ${coneRadius} 0 0 1 ${x2} ${y2} Z`}
                        fill="rgba(6, 182, 212, 0.28)"
                        stroke="#06b6d4"
                        strokeWidth="1.8"
                        strokeDasharray="4,2"
                      />
                      {/* Direction Center Beam */}
                      <line
                        x1={robot.position.x}
                        y1={robot.position.y}
                        x2={robot.position.x + 48 * Math.sin(rad)}
                        y2={robot.position.y - 48 * Math.cos(rad)}
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />

                      {/* Concentric Pulse Rings */}
                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r="24"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="1"
                        opacity="0.35"
                        className="animate-pulse"
                      />

                      {/* Robot Main Chassis Pin */}
                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r="15"
                        fill="#0284c7"
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        className="shadow-lg"
                      />
                      <text
                        x={robot.position.x}
                        y={robot.position.y + 4.5}
                        textAnchor="middle"
                        fontSize="11"
                      >
                        🤖
                      </text>

                      {/* Prominent Active Callsign Badge */}
                      <g transform={`translate(${robot.position.x - 38}, ${robot.position.y - 34})`}>
                        <rect width="76" height="17" rx="3" fill="#041224" stroke="#22d3ee" strokeWidth="1.5" />
                        <text x="38" y="11.5" textAnchor="middle" fill="#e0f2fe" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                          {robot.name} [DRIVE]
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>

              {/* Top HUD Telemetry Banner */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/85 border border-cyan-500/60 px-4 py-1.5 rounded-md font-mono text-[11px] text-cyan-300 backdrop-blur shadow-xl z-10 pointer-events-none select-none">
                <span className="font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  C2 DIRECT DRIVE
                </span>
                <span className="text-slate-600">|</span>
                <span>HDG: {teleopHeading}° {getCompassDirection(teleopHeading)}</span>
                <span className="text-slate-600">|</span>
                <span>COORD: [{robot.position.x}, {robot.position.y}]</span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 font-bold">BIO-PROX: {distMeters}m</span>
              </div>

              {/* Picture-in-Picture Multispectral Sensor Feed Monitor */}
              <div className="absolute bottom-4 left-4 z-20 w-72 h-52 bg-[#050912]/95 border-2 border-cyan-500/70 rounded-md shadow-2xl overflow-hidden backdrop-blur flex flex-col select-none scanline">
                {/* Monitor Header */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/90 border-b border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>REC // {activeFeed.toUpperCase()} CAMERA</span>
                  </div>
                  <span className="text-slate-400 font-normal">1080p @ 60 FPS</span>
                </div>

                {/* Monitor Display Body */}
                <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                  {/* FLIR THERMAL RADIOMETRIC VIEW */}
                  {activeFeed === 'flir' && (
                    <div className="w-full h-full bg-[#080c14] relative flex items-center justify-center">
                      <div className="absolute inset-2 border border-slate-700/40 rounded pointer-events-none" />
                      {/* Real Radiometric White-Hot Human Body Heat Signature */}
                      <div
                        className="relative flex items-center justify-center transition-transform duration-200"
                        style={{ transform: `scale(${thermalScale})` }}
                      >
                        <div className="w-24 h-24 rounded-full bg-amber-500/20 blur-xl" />
                        <div className="w-16 h-16 rounded-full bg-amber-300/40 blur-lg" />
                        <div className="w-8 h-8 rounded-full bg-white/95 blur-xs animate-pulse" />
                        <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/90 border border-amber-400 text-amber-300 text-[8px] font-mono">
                          SPOT [37.1°C] ({distMeters}m)
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 text-right font-mono text-[8px] text-slate-300 bg-black/80 p-1 rounded border border-slate-800">
                        <div>T_MAX: 38.4°C</div>
                        <div>PAL: WHITE-HOT</div>
                      </div>
                    </div>
                  )}

                  {/* 3D LIDAR MESH VIEW */}
                  {activeFeed === 'lidar' && (
                    <div className="w-full h-full bg-[#030712] relative flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border border-cyan-500/20 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full border border-cyan-500/30 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-cyan-500/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute w-40 h-40 rounded-full border-t-2 border-cyan-400 radar-sweep opacity-60" />
                      <div className="absolute bottom-2 left-2 text-cyan-300 font-mono text-[9px] bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                        CLEARANCE: {Math.max(0.5, (Number(distMeters) * 0.35)).toFixed(2)}m
                      </div>
                    </div>
                  )}

                  {/* OPTICAL NIGHT VISION VIEW */}
                  {activeFeed === 'optical' && (
                    <div className="w-full h-full bg-[#041209] relative flex items-center justify-center">
                      <div className="text-emerald-500/20 text-3xl select-none font-mono tracking-widest">NV-NIR 850nm</div>
                      <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color-dodge pointer-events-none" />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 border border-emerald-500/60 text-emerald-400 text-[8px] font-mono rounded">
                        OPTICAL GAIN +18dB
                      </div>
                    </div>
                  )}

                  {/* ACOUSTIC & GAS SPECTROGRAM VIEW */}
                  {activeFeed === 'spectrogram' && (
                    <div className="w-full h-full bg-[#050912] relative flex flex-col justify-center items-center p-3">
                      <div className="w-full h-20 flex items-end gap-1 px-2 py-1 border border-emerald-500/30 rounded bg-slate-950/90">
                        {[28, 42, 65, 88, 100, 76, 52, 28, 38, 58, 82, 94, 68, 42, 18].map((val, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t ${
                              i === 4 || i === 11 ? 'bg-amber-400' : 'bg-emerald-500/80'
                            }`}
                            style={{ height: `${val}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between w-full mt-1.5 text-[8px] font-mono">
                        <span className="text-emerald-300">180 Hz TAPPING</span>
                        <span className="text-amber-400 font-bold">CH4: 520 PPM</span>
                      </div>
                    </div>
                  )}

                  {/* Crosshair Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-cyan-400/50" />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Tele-Op Controls Panel (1 Column) */}
          <div className="p-4 bg-[#070d18] flex flex-col justify-between font-mono text-xs space-y-4">
            
            {/* Direct Drive D-Pad */}
            <div>
              <div className="flex items-center justify-between text-slate-400 font-bold mb-3 border-b border-slate-800 pb-1">
                <span>MANUAL OVERRIDE</span>
                <span className="text-[10px] text-cyan-400">[WASD KEYS]</span>
              </div>

              {/* Status pill of last action */}
              <div className="flex items-center justify-between px-2 py-1 mb-2 rounded bg-slate-950 border border-slate-800 text-[10px]">
                <span className="text-slate-400">TELE-OP STATUS:</span>
                <span className="text-cyan-300 font-bold tracking-wider">{lastAction}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 my-2">
                <button
                  onClick={() => {
                    soundManager.playTacticalClick();
                    setTeleopHeading(0);
                    setLastAction('MOVING FRONT');
                    manualMoveRobot(robot.id, 0, -12, 0);
                  }}
                  className="w-14 h-10 rounded bg-slate-800 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-all shadow"
                  title="Move Front (W / Up)"
                >
                  W (FRONT)
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setTeleopHeading(270);
                      setLastAction('MOVING LEFT');
                      manualMoveRobot(robot.id, -12, 0, 270);
                    }}
                    className="w-14 h-10 rounded bg-slate-800 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-all shadow"
                    title="Move Left (A / Left)"
                  >
                    A (LEFT)
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setTeleopHeading(0);
                      setGimbalPitch(0);
                      setLastAction('RESET HEADING');
                    }}
                    className="w-10 h-10 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] active:scale-95 transition-all"
                    title="Center / Reset"
                  >
                    CTR
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setTeleopHeading(90);
                      setLastAction('MOVING RIGHT');
                      manualMoveRobot(robot.id, 12, 0, 90);
                    }}
                    className="w-14 h-10 rounded bg-slate-800 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-all shadow"
                    title="Move Right (D / Right)"
                  >
                    D (RIGHT)
                  </button>
                </div>
                <button
                  onClick={() => {
                    soundManager.playTacticalClick();
                    setTeleopHeading(180);
                    setLastAction('MOVING BACK');
                    manualMoveRobot(robot.id, 0, 12, 180);
                  }}
                  className="w-14 h-10 rounded bg-slate-800 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-all shadow"
                  title="Move Back (S / Down)"
                >
                  S (BACK)
                </button>
              </div>

              <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800 space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>POSITION:</span>
                  <span className="text-cyan-300 font-bold">X: {robot.position.x} • Y: {robot.position.y}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>HEADING:</span>
                  <span className="text-white font-bold">{teleopHeading}° ({getCompassDirection(teleopHeading)})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TARGET DIST:</span>
                  <span className="text-rose-400 font-bold">{distMeters}m</span>
                </div>
              </div>
            </div>

            {/* Payload Actions */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-slate-400 font-bold block mb-1">PAYLOAD & TOOLS</span>
              
              <button
                onClick={() => {
                  deployBeaconAt(robot.position.x + 10, robot.position.y + 10, `Beacon by ${robot.name}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-colors"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Eject RF Mesh Relay</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playTacticalClick();
                  setIsArmExtended(!isArmExtended);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded border transition-colors ${
                  isArmExtended
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{isArmExtended ? 'Retract Borescope Arm' : 'Extend Borescope / O2 Line'}</span>
              </button>
            </div>

            {/* Robot Diagnostic Status */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>FIRMWARE:</span>
                <span className="text-slate-200">{robot.firmwareVersion}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PAYLOAD:</span>
                <span className="text-cyan-300 truncate max-w-[120px]">{robot.payload}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>BEACONS DEPLOYED:</span>
                <span className="text-emerald-400">{robot.breadcrumbsPlaced}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closeFpv}
              className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Return to Swarm Map (ESC)
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
