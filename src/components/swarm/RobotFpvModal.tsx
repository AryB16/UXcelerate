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
    deployBeaconAt,
    restoreComms,
  } = useMission();

  const [activeFeed, setActiveFeed] = useState<'flir' | 'lidar' | 'optical' | 'spectrogram'>('flir');
  const [teleopHeading, setTeleopHeading] = useState<number>(180);
  const [gimbalPitch, setGimbalPitch] = useState<number>(-12);
  const [isArmExtended, setIsArmExtended] = useState<boolean>(false);

  const robot = robots.find((r) => r.id === fpvRobotId);

  // Keyboard shortcut listener for tele-op
  useEffect(() => {
    if (!isFpvOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFpv();
      if (e.key === 'w' || e.key === 'ArrowUp') {
        soundManager.playTacticalClick();
        setGimbalPitch((p) => Math.min(30, p + 5));
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        soundManager.playTacticalClick();
        setGimbalPitch((p) => Math.max(-45, p - 5));
      }
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        soundManager.playTacticalClick();
        setTeleopHeading((h) => (h - 10 + 360) % 360);
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        soundManager.playTacticalClick();
        setTeleopHeading((h) => (h + 10) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFpvOpen, closeFpv]);

  if (!isFpvOpen || !robot) return null;

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
          
          {/* Main Simulated Camera / Sensor Stream (3 Columns) */}
          <div className="lg:col-span-3 relative bg-black flex flex-col items-center justify-center min-h-[380px] p-4 border-r border-slate-800/80 scanline">
            
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

            {/* Simulated Multispectral Visualizations */}
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-md">
              
              {/* FLIR THERMAL RADIOMETRIC VIEW (Real-World White-Hot / Ironbow) */}
              {activeFeed === 'flir' && (
                <div className="w-full h-full bg-[#080c14] relative flex items-center justify-center">
                  {/* Rubble structural contours */}
                  <div className="absolute inset-6 border border-slate-700/50 rounded pointer-events-none" />
                  <div className="absolute top-10 left-12 w-64 h-32 border-b border-r border-slate-800 pointer-events-none" />
                  
                  {/* Real Radiometric White-Hot Human Body Heat Signature */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full bg-amber-500/20 blur-2xl" />
                    <div className="w-24 h-24 rounded-full bg-amber-300/40 blur-xl" />
                    <div className="w-12 h-12 rounded-full bg-white/95 blur-xs animate-pulse" />
                    <div className="absolute -top-10 px-2.5 py-1 rounded bg-black/90 border border-amber-400 text-amber-300 text-[10px] font-mono tracking-wide">
                      SPOT [37.1°C] // BIO-THERMAL SIGNATURE
                    </div>
                  </div>

                  {/* FLIR Radiometric Calibration Overlay (Top-Right) */}
                  <div className="absolute top-4 right-14 text-right font-mono text-[10px] text-slate-300 bg-black/80 p-2 rounded-md border border-slate-800 leading-tight backdrop-blur shadow-lg">
                    <div>T_MAX: <span className="text-white font-bold">38.4°C</span></div>
                    <div>T_MIN: <span className="text-slate-400">14.1°C</span></div>
                    <div>EMISSIVITY: <span className="text-cyan-400">ε 0.98</span></div>
                    <div>PALETTE: <span className="text-amber-400">WHITE-HOT</span></div>
                  </div>

                  {/* Technical Radiometric Scale Bar */}
                  <div className="absolute right-4 top-14 bottom-14 w-3.5 rounded-sm bg-gradient-to-t from-slate-900 via-amber-700 to-white flex flex-col justify-between items-center text-[7px] font-mono text-slate-950 font-bold p-0.5 border border-slate-700">
                    <span className="text-black">40°</span>
                    <span className="text-amber-300">37°</span>
                    <span className="text-white">25°</span>
                    <span className="text-white">10°</span>
                  </div>
                </div>
              )}

              {/* 3D LIDAR MESH VIEW */}
              {activeFeed === 'lidar' && (
                <div className="w-full h-full bg-[#030712] relative flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border border-cyan-500/20 flex items-center justify-center">
                    <div className="w-56 h-56 rounded-full border border-cyan-500/30 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-cyan-500/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      </div>
                    </div>
                  </div>
                  {/* Radar sweep beam */}
                  <div className="absolute w-80 h-80 rounded-full border-t-2 border-cyan-400 radar-sweep opacity-60" />
                  
                  {/* Obstacle point clouds */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-cyan-400 blur-[1px]" />
                  <div className="absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-cyan-300 blur-[1px]" />
                  <div className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full bg-cyan-400 blur-[1px]" />
                  <div className="absolute bottom-6 left-6 text-cyan-300 font-mono text-xs bg-black/80 px-2.5 py-1 rounded-sm border border-slate-800 backdrop-blur">
                    OBSTACLE RADAR: FORWARD CLEARANCE 1.42m
                  </div>
                </div>
              )}

              {/* OPTICAL NIGHT VISION VIEW */}
              {activeFeed === 'optical' && (
                <div className="w-full h-full bg-[#041209] relative flex items-center justify-center">
                  <div className="text-emerald-500/20 text-7xl select-none font-mono tracking-widest">NV-NIR 850nm</div>
                  <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color-dodge pointer-events-none" />
                  <div className="absolute top-4 right-6 px-2.5 py-1.5 bg-black/80 border border-emerald-500/60 text-emerald-400 text-xs font-mono rounded-md backdrop-blur shadow-lg">
                    OPTICAL GAIN: +18dB // AUTO-EXPOSURE
                  </div>
                </div>
              )}

              {/* ACOUSTIC & GAS SPECTROGRAM VIEW (Phosphor Green / Amber) */}
              {activeFeed === 'spectrogram' && (
                <div className="w-full h-full bg-[#050912] relative flex flex-col justify-center items-center p-6">
                  <div className="w-full max-w-md h-32 flex items-end gap-1 px-4 py-2 border border-emerald-500/30 rounded-sm bg-slate-950/90 shadow-inner">
                    {[28, 42, 65, 88, 100, 76, 52, 28, 38, 58, 82, 94, 68, 42, 18].map((val, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          i === 4 || i === 11 ? 'bg-amber-400' : 'bg-emerald-500/80'
                        }`}
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between w-full max-w-md mt-3 text-xs font-mono">
                    <span className="text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      GEOPHONE: 180 Hz VOID TAPPING (INSARAG PATTERN)
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded-sm border border-amber-500/40">
                      CH4: 520 PPM (10.4% LEL)
                    </span>
                  </div>
                </div>
              )}

              {/* HUD Crosshairs Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <Crosshair className="w-14 h-14 text-cyan-400/60" />
                
                {/* Clean Top-Left Recording & Live Stream Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-xs text-rose-400 bg-black/80 px-3 py-1.5 rounded-md border border-rose-500/50 backdrop-blur shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold text-white tracking-wider">REC</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300 text-[11px] font-semibold">LIVE SLAM FEED</span>
                </div>

                <div className="absolute bottom-4 right-4 text-slate-300 bg-black/75 px-2.5 py-1 rounded-md border border-slate-800 font-mono text-[10px] backdrop-blur">
                  FOV: 110° // RANGE: 40m
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

              <div className="flex flex-col items-center gap-1.5 my-2">
                <button
                  onClick={() => {
                    soundManager.playTacticalClick();
                    setGimbalPitch((p) => Math.min(30, p + 5));
                  }}
                  className="w-12 h-10 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-colors"
                >
                  W
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setTeleopHeading((h) => (h - 10 + 360) % 360);
                    }}
                    className="w-12 h-10 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-colors"
                  >
                    A
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setGimbalPitch(0);
                    }}
                    className="w-12 h-10 rounded bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center text-[10px]"
                    title="Center Gimbal"
                  >
                    CTR
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playTacticalClick();
                      setTeleopHeading((h) => (h + 10) % 360);
                    }}
                    className="w-12 h-10 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-colors"
                  >
                    D
                  </button>
                </div>
                <button
                  onClick={() => {
                    soundManager.playTacticalClick();
                    setGimbalPitch((p) => Math.max(-45, p - 5));
                  }}
                  className="w-12 h-10 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700 flex items-center justify-center font-bold transition-colors"
                >
                  S
                </button>
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
