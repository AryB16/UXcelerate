import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../../store/MissionContext';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Eye,
  Signal,
  Maximize2,
  Minimize2,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface TacticalMapProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  isExpanded = false,
  onToggleExpand,
}) => {
  const {
    overview,
    sectors,
    robots,
    survivors,
    hazards,
    routes,
    beacons,
    layers,
    selectedRobotId,
    selectedSurvivorId,
    selectedHazardId,
    selectRobot,
    selectSurvivor,
    selectHazard,
    toggleLayer,
    deployBeaconAt,
    openFpv,
    restoreComms,
    dispatchRobotToSurvivor,
  } = useMission();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDeployMode, setIsDeployMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state for sleek, clean tooltip
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'robot' | 'survivor' | 'hazard' | 'beacon';
    id: string;
    x: number;
    y: number;
    title: string;
    subtitle: string;
    badge?: string;
  } | null>(null);

  // Seismic camera shake effect when an aftershock strikes
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const prevAftershockLevelRef = useRef(overview.aftershockRiskLevel);

  useEffect(() => {
    if (overview.aftershockRiskLevel === 'CRITICAL' && prevAftershockLevelRef.current !== 'CRITICAL') {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 850);
      return () => clearTimeout(timer);
    }
    prevAftershockLevelRef.current = overview.aftershockRiskLevel;
  }, [overview.aftershockRiskLevel]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.4, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.75, z - 0.15));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDeployMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDeployMode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    deployBeaconAt(clickX, clickY, `Relay #${beacons.length + 1}`);
    soundManager.playTacticalClick();
    setIsDeployMode(false);
  };

  const getRobotEmoji = (type: string) => {
    switch (type) {
      case 'aerial_drone': return '🛸';
      case 'heavy_quadruped': return '🐕';
      case 'snake_crawler': return '🐍';
      case 'tracked_rover': return '🚜';
      case 'wall_climber': return '🦎';
      case 'amphibious': return '🌊';
      default: return '🤖';
    }
  };

  // Selected entities for the docked inspector panel
  const selectedRobot = robots.find((r) => r.id === selectedRobotId);
  const selectedSurvivor = survivors.find((s) => s.id === selectedSurvivorId);
  const selectedHazard = hazards.find((h) => h.id === selectedHazardId);

  return (
    <div className="relative w-full h-full bg-[#060a13] rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      
      {/* Top Map Toolbar: Clean, intuitive, legible */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a1020]/95 border-b border-slate-800 z-10 text-xs font-mono select-none">
        {/* Layer Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1 hidden sm:flex">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Layers:
          </span>

          <button
            onClick={() => toggleLayer('slam')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              layers.slam
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Blueprint</span>
          </button>

          <button
            onClick={() => toggleLayer('mesh')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              layers.mesh
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>RF Mesh</span>
          </button>

          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              layers.hazards
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Hazards</span>
          </button>

          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              layers.routes
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Corridors</span>
          </button>
        </div>

        {/* Action Tools & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeployMode(!isDeployMode)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold border transition-all ${
              isDeployMode
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/90 text-cyan-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDeployMode ? 'Click Map to Place' : 'Deploy Relay'}</span>
          </button>

          {/* Full-view / Expand Map toggle */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
              title={isExpanded ? 'Restore 3-Column Deck' : 'Expand Map Full Width'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3-Column Deck</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expand Map</span>
                </>
              )}
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/90 rounded border border-slate-700">
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white border-r border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white border-r border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-slate-300 hover:text-white"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Deploy mode alert banner */}
      {isDeployMode && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-cyan-950/95 border-2 border-cyan-400 text-cyan-200 text-xs font-mono font-bold rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Click anywhere on the map to deploy an RF Breadcrumb Relay Beacon</span>
        </div>
      )}

      {/* Aftershock Alert Banner */}
      {overview.aftershockRiskLevel === 'CRITICAL' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-rose-950/95 border-2 border-rose-500 text-rose-200 text-xs font-mono font-bold rounded-full shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>⚠️ 5.2M AFTERSHOCK REGISTERED // SECONDARY COLLAPSE IN SECTOR BETA // REROUTING</span>
        </div>
      )}

      {/* Main Map Canvas */}
      <div
        className={`relative flex-1 w-full h-full overflow-hidden select-none ${
          isShaking ? 'seismic-shake' : ''
        } ${
          isDeployMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredEntity(null);
        }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 620"
          onClick={handleMapClick}
        >
          <defs>
            {/* Rubble / Pancake Collapse Pattern */}
            <pattern
              id="rubblePattern"
              width="20"
              height="20"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" strokeWidth="1.5" opacity="0.15" />
              <circle cx="10" cy="10" r="1.5" fill="#ef4444" opacity="0.3" />
            </pattern>

            {/* Fog of Uncertainty Hatch Pattern */}
            <pattern
              id="cleanFogPattern"
              width="16"
              height="16"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="16" stroke="#334155" strokeWidth="2" opacity="0.45" />
            </pattern>

            {/* Subtle tactical grid pattern */}
            <pattern id="tacGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.5" />
            </pattern>

            {/* Glowing marker filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* Deep Obsidian Background & Tactical Grid */}
            <rect x="0" y="0" width="800" height="620" fill="#060a12" />
            <rect x="0" y="0" width="800" height="620" fill="url(#tacGrid)" />

            {/* ========================================================= */}
            {/* 1. SECTOR BLUEPRINTS (Clear, identifiable building wings) */}
            {/* ========================================================= */}

            {/* SECTOR A: North Wing ER (Top-Left: 30,30 to 380,285) */}
            <g id="sector-a">
              <rect
                x="30"
                y="30"
                width="350"
                height="255"
                rx="8"
                fill="#0a1424"
                stroke="#1e3a5f"
                strokeWidth="2"
              />
              {/* Room partitions */}
              <line x1="30" y1="120" x2="200" y2="120" stroke="#1e3a5f" strokeWidth="1.5" strokeDasharray="6,3" />
              <line x1="200" y1="30" x2="200" y2="200" stroke="#1e3a5f" strokeWidth="1.5" />
              <line x1="30" y1="200" x2="380" y2="200" stroke="#1e3a5f" strokeWidth="1.5" />

              {/* Room labels */}
              <text x="45" y="65" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">Triage Bay A</text>
              <text x="45" y="150" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">Trauma Suite 1</text>
              <text x="215" y="65" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">ER Clean Zone</text>
              <text x="45" y="235" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">Hallway Alpha</text>

              {/* Sector Header Badge */}
              <g transform="translate(42, 38)">
                <rect x="0" y="0" width="240" height="22" rx="4" fill="#071224" stroke="#0284c7" strokeWidth="1.5" />
                <text x="8" y="15" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  🏥 SECTOR A: NORTH WING ER
                </text>
                <text x="175" y="14" fill="#34d399" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  STABLE • 94%
                </text>
              </g>
            </g>

            {/* SECTOR B: Main Tower Collapse (Top-Right: 420,30 to 770,285) */}
            <g id="sector-b">
              <rect
                x="420"
                y="30"
                width="350"
                height="255"
                rx="8"
                fill="#16101c"
                stroke="#4c1d30"
                strokeWidth="2"
              />

              {/* Rubble collapse field */}
              <rect
                x="430"
                y="75"
                width="330"
                height="195"
                rx="6"
                fill="url(#rubblePattern)"
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.8"
              />

              {/* Rubble Field Warning Label */}
              <text x="595" y="95" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚠️ COLLAPSED PANCAKE RUBBLE SLAB
              </text>

              {/* Sector Header Badge */}
              <g transform="translate(432, 38)">
                <rect x="0" y="0" width="260" height="22" rx="4" fill="#1c0f1a" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="8" y="15" fill="#fb7185" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  🏢 SECTOR B: MAIN TOWER COLLAPSE
                </text>
                <text x="195" y="14" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  UNSTABLE • 68%
                </text>
              </g>
            </g>

            {/* SECTOR C: Metro Void & Basement (Bottom-Right: 420,325 to 770,580) */}
            <g id="sector-c">
              <rect
                x="420"
                y="325"
                width="350"
                height="255"
                rx="8"
                fill="#120e18"
                stroke="#3f1a28"
                strokeWidth="2"
              />

              {/* Elevator shafts & voids */}
              <rect x="440" y="375" width="80" height="90" rx="4" fill="#1e1324" stroke="#6b21a8" strokeWidth="1.5" />
              <text x="450" y="420" fill="#a855f7" fontSize="10" fontFamily="JetBrains Mono">Elevator Shaft</text>

              {/* Fog of Uncertainty over unexplored subterranean void */}
              <rect
                x="540"
                y="370"
                width="220"
                height="200"
                rx="6"
                fill="url(#cleanFogPattern)"
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text x="650" y="555" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                🌫️ UNEXPLORED SUBTERRANEAN VOID
              </text>

              {/* Sector Header Badge */}
              <g transform="translate(432, 333)">
                <rect x="0" y="0" width="260" height="22" rx="4" fill="#1b0e1a" stroke="#e11d48" strokeWidth="1.5" />
                <text x="8" y="15" fill="#f43f5e" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  🚇 SECTOR C: METRO BASEMENT VOID
                </text>
                <text x="195" y="14" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  CRITICAL • 35%
                </text>
              </g>
            </g>

            {/* SECTOR D: South Courtyard & Staging (Bottom-Left: 30,325 to 380,580) */}
            <g id="sector-d">
              <rect
                x="30"
                y="325"
                width="350"
                height="255"
                rx="8"
                fill="#081418"
                stroke="#134e4a"
                strokeWidth="2"
              />

              {/* Courtyard staging zones */}
              <rect x="50" y="370" width="130" height="80" rx="4" fill="#042f2e" stroke="#10b981" strokeWidth="1" strokeDasharray="4,2" />
              <text x="65" y="415" fill="#34d399" fontSize="10" fontFamily="JetBrains Mono">Staging Base HQ</text>

              <rect x="210" y="370" width="150" height="180" rx="4" fill="#07232b" stroke="#0e7490" strokeWidth="1" />
              <text x="225" y="415" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono">Basement Sump Area</text>
              <text x="225" y="430" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">(Flooded Drainage)</text>

              {/* Sector Header Badge */}
              <g transform="translate(42, 333)">
                <rect x="0" y="0" width="250" height="22" rx="4" fill="#051c1c" stroke="#10b981" strokeWidth="1.5" />
                <text x="8" y="15" fill="#34d399" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  🌲 SECTOR D: COURTYARD STAGING
                </text>
                <text x="185" y="14" fill="#34d399" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  SAFE • 88%
                </text>
              </g>
            </g>

            {/* CENTRAL CORRIDORS (Connecting all sectors) */}
            <rect x="380" y="100" width="40" height="420" fill="#070d18" stroke="#1e293b" strokeWidth="1" />
            <rect x="120" y="285" width="560" height="40" fill="#070d18" stroke="#1e293b" strokeWidth="1" />
            <text x="400" y="310" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              ATRIUM
            </text>

            {/* ========================================================= */}
            {/* 2. ROUTES & CORRIDORS (Safe vs Blocked paths)             */}
            {/* ========================================================= */}
            {/* ========================================================= */}
            {/* 2. ROUTES & CORRIDORS (Safe vs Blocked paths)             */}
            {/* ========================================================= */}
            {layers.routes && (
              <g id="routes-layer">
                {routes.map((route) => {
                  const pathD = route.points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  const midPoint = route.points[Math.floor(route.points.length / 2)] || route.points[0];
                  const isBlocked = route.status === 'blocked';
                  const isHazardous = route.status === 'hazardous';
                  const isNew = route.status === 'newly_discovered';

                  let strokeColor = '#00e5ff';
                  let strokeDash = undefined;
                  if (isBlocked) {
                    strokeColor = '#ef4444';
                    strokeDash = '6,4';
                  } else if (isHazardous) {
                    strokeColor = '#f59e0b';
                  } else if (isNew) {
                    strokeColor = '#10b981';
                    strokeDash = '5,3';
                  }

                  return (
                    <g key={route.id} className="cursor-pointer">
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isBlocked ? 3.5 : 4}
                        strokeDasharray={strokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.85}
                      />
                      {/* Route Badge at Midpoint */}
                      <g transform={`translate(${midPoint.x - 45}, ${midPoint.y - 10})`}>
                        <rect
                          x="0"
                          y="0"
                          width="90"
                          height="18"
                          rx="4"
                          fill={isBlocked ? '#2d0c13' : isHazardous ? '#261706' : isNew ? '#062e24' : '#071b28'}
                          stroke={strokeColor}
                          strokeWidth="1.2"
                        />
                        <text
                          x="45"
                          y="13"
                          textAnchor="middle"
                          fill={isBlocked ? '#fca5a5' : isHazardous ? '#fde68a' : isNew ? '#34d399' : '#38bdf8'}
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {isBlocked ? '⛔ BLOCKED' : isHazardous ? '⚠️ HAZARDOUS' : isNew ? '✨ NEW VOID' : '🟢 SAFE ROUTE'}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ========================================================= */}
            {/* 3. RF MESH NETWORK & RELAYS                               */}
            {/* ========================================================= */}
            {layers.mesh && (
              <g id="mesh-layer">
                {/* Mesh Link Lines between Beacons */}
                {beacons.map((bcn, idx) => {
                  if (idx === 0) return null;
                  const prevBcn = beacons[idx - 1];
                  return (
                    <line
                      key={`bcn-link-${bcn.id}-${prevBcn.id}`}
                      x1={bcn.x}
                      y1={bcn.y}
                      x2={prevBcn.x}
                      y2={prevBcn.y}
                      stroke="#10b981"
                      strokeWidth="1.8"
                      strokeDasharray="4,4"
                      opacity="0.5"
                    />
                  );
                })}

                {/* Mesh Link Lines from Connected Robots to Nearest Beacon */}
                {robots
                  .filter((r) => r.commsStatus === 'connected')
                  .map((r) => {
                    let closest = beacons[0];
                    let minDist = 99999;
                    beacons.forEach((b) => {
                      const d = Math.hypot(b.x - r.position.x, b.y - r.position.y);
                      if (d < minDist) {
                        minDist = d;
                        closest = b;
                      }
                    });
                    if (!closest || minDist > 280) return null;
                    return (
                      <line
                        key={`robot-mesh-${r.id}`}
                        x1={r.position.x}
                        y1={r.position.y}
                        x2={closest.x}
                        y2={closest.y}
                        stroke="#00f0ff"
                        strokeWidth="1.2"
                        strokeDasharray="3,3"
                        opacity="0.35"
                      />
                    );
                  })}

                {/* RF Mesh Coverage Radii */}
                {beacons.map((bcn) => (
                  <circle
                    key={`rad-${bcn.id}`}
                    cx={bcn.x}
                    cy={bcn.y}
                    r={Math.min(bcn.radius, 100)}
                    fill="rgba(16, 185, 129, 0.04)"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.4"
                  />
                ))}

                {/* Relay Beacon Pins */}
                {beacons.map((bcn) => (
                  <g
                    key={bcn.id}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredEntity({
                        type: 'beacon',
                        id: bcn.id,
                        x: bcn.x,
                        y: bcn.y,
                        title: bcn.label,
                        subtitle: `Battery: ${bcn.batteryHours}h • Uplink: ${bcn.uplinkId}`,
                        badge: 'ACTIVE RF REPEATER',
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    <circle cx={bcn.x} cy={bcn.y} r="10" fill="#042f2e" stroke="#10b981" strokeWidth="2" />
                    <circle cx={bcn.x} cy={bcn.y} r="4" fill="#34d399" />
                    <text x={bcn.x} y={bcn.y + 20} textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                      {bcn.label.split(' ')[0]}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* ========================================================= */}
            {/* 4. HAZARDS (Dynamic list with aftershock reaction)        */}
            {/* ========================================================= */}
            {layers.hazards && (
              <g id="hazards-layer">
                {hazards.map((haz) => {
                  const isSelected = selectedHazardId === haz.id;
                  const isGas = haz.type === 'gas_leak';
                  const isStructural = haz.type === 'structural_collapse';

                  const strokeCol = isGas ? '#ef4444' : isStructural ? '#f59e0b' : '#eab308';
                  const fillCol = isGas
                    ? 'rgba(239, 68, 68, 0.14)'
                    : isStructural
                    ? 'rgba(245, 158, 11, 0.14)'
                    : 'rgba(234, 179, 8, 0.12)';
                  const iconChar = isGas ? '☣' : isStructural ? '⚠' : '⚡';

                  return (
                    <g
                      key={haz.id}
                      className="cursor-pointer"
                      onClick={() => selectHazard(haz.id)}
                      onMouseEnter={() =>
                        setHoveredEntity({
                          type: 'hazard',
                          id: haz.id,
                          x: haz.location.x,
                          y: haz.location.y,
                          title: haz.title,
                          subtitle: haz.readout,
                          badge: `${haz.severity.toUpperCase()} HAZARD`,
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                    >
                      <circle
                        cx={haz.location.x}
                        cy={haz.location.y}
                        r={Math.min(haz.location.radius, 48)}
                        fill={fillCol}
                        stroke={strokeCol}
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                      />
                      <circle
                        cx={haz.location.x}
                        cy={haz.location.y}
                        r="14"
                        fill="#1a0f16"
                        stroke={strokeCol}
                        strokeWidth={isSelected ? '3' : '2'}
                      />
                      <text
                        x={haz.location.x}
                        y={haz.location.y + 4.5}
                        textAnchor="middle"
                        fontSize="13"
                        fill="#ffffff"
                      >
                        {iconChar}
                      </text>

                      {/* Clean Pill Label Below */}
                      <rect
                        x={haz.location.x - 55}
                        y={haz.location.y + 18}
                        width="110"
                        height="18"
                        rx="4"
                        fill="#1c0a12"
                        stroke={strokeCol}
                        strokeWidth="1"
                      />
                      <text
                        x={haz.location.x}
                        y={haz.location.y + 31}
                        textAnchor="middle"
                        fill={isGas ? '#fca5a5' : '#fde68a'}
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {iconChar} {haz.title.split(' ')[0]} {haz.severity === 'critical' ? '[CRITICAL]' : ''}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ========================================================= */}
            {/* 5. SURVIVORS (Pulsing beacons & START triage badges)       */}
            {/* ========================================================= */}
            <g id="survivors-layer">
              {survivors.map((surv) => {
                const isSelected = selectedSurvivorId === surv.id;
                const isCrit = surv.triage === 'immediate';
                const isDelayed = surv.triage === 'delayed';

                const strokeCol = isCrit ? '#ef4444' : isDelayed ? '#f59e0b' : '#10b981';
                const fillCol = isCrit ? '#1c0c14' : isDelayed ? '#1c1608' : '#06221c';
                const textCol = isCrit ? '#fca5a5' : isDelayed ? '#fde68a' : '#6ee7b7';
                const heartEmoji = isCrit ? '❤️' : isDelayed ? '💛' : '💚';
                const tagText = isCrit ? 'CRITICAL' : isDelayed ? 'DELAYED' : 'MINOR';

                return (
                  <g
                    key={surv.id}
                    className="cursor-pointer"
                    onClick={() => {
                      selectSurvivor(surv.id);
                      soundManager.playSonarPing();
                    }}
                    onMouseEnter={() =>
                      setHoveredEntity({
                        type: 'survivor',
                        id: surv.id,
                        x: surv.location.x,
                        y: surv.location.y,
                        title: surv.label,
                        subtitle: `HR: ${surv.vitals.heartRate} BPM • SpO2: ${surv.vitals.spO2}% • Depth: ${surv.location.depthMeters}m`,
                        badge: `${surv.triage.toUpperCase()} // ${tagText}`,
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Soft pulse wave for immediate critical survivors */}
                    {isCrit && (
                      <circle
                        cx={surv.location.x}
                        cy={surv.location.y}
                        r="24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Pin Body */}
                    <circle
                      cx={surv.location.x}
                      cy={surv.location.y}
                      r="15"
                      fill={fillCol}
                      stroke={strokeCol}
                      strokeWidth={isSelected ? '3.5' : '2'}
                      filter={isCrit ? 'url(#redGlow)' : undefined}
                    />
                    <text
                      x={surv.location.x}
                      y={surv.location.y + 5}
                      textAnchor="middle"
                      fontSize="13"
                    >
                      {heartEmoji}
                    </text>

                    {/* Clean Pill Label Above */}
                    <rect
                      x={surv.location.x - 55}
                      y={surv.location.y - 32}
                      width="110"
                      height="19"
                      rx="4"
                      fill={isCrit ? '#200a12' : isDelayed ? '#1f1307' : '#071e19'}
                      stroke={strokeCol}
                      strokeWidth="1.2"
                    />
                    <text
                      x={surv.location.x}
                      y={surv.location.y - 19}
                      textAnchor="middle"
                      fill={textCol}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {heartEmoji} {surv.id} [{tagText}]
                    </text>
                  </g>
                );
              })}
            </g>

            {/* ========================================================= */}
            {/* 6. ROBOTS & GHOST MESH (Reactive live positions & states) */}
            {/* ========================================================= */}
            <g id="robots-layer">
              {robots.map((robot) => {
                const isSelected = selectedRobotId === robot.id;
                const isDisconnected = robot.commsStatus === 'disconnected';
                const isDegraded = robot.commsStatus === 'degraded';

                if (isDisconnected) {
                  // GHOST MODE: Last known position pin + trajectory vector + ghost pin
                  const lkp = robot.lastKnownPosition || {
                    x: robot.position.x - 30,
                    y: robot.position.y - 30,
                  };
                  const minutesLost = Math.max(1, Math.round(robot.lastContactSecondsAgo / 60));

                  return (
                    <g
                      key={robot.id}
                      className="cursor-pointer"
                      onClick={() => selectRobot(robot.id)}
                      onDoubleClick={() => openFpv(robot.id)}
                      onMouseEnter={() =>
                        setHoveredEntity({
                          type: 'robot',
                          id: robot.id,
                          x: robot.position.x,
                          y: robot.position.y,
                          title: `${robot.name} (${robot.callsign})`,
                          subtitle: `GHOST MODE // Lost ${minutesLost}m ago • ${robot.storeAndForwardBacklog} Pkts Buffered Offline`,
                          badge: 'LOST SIGNAL // GHOST',
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                    >
                      {/* Last Known Position Pin */}
                      <circle cx={lkp.x} cy={lkp.y} r="5" fill="#f43f5e" />
                      <text x={lkp.x - 10} y={lkp.y - 8} fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono">
                        Last Contact
                      </text>

                      {/* Projected Dead Reckoning Trajectory Vector */}
                      <line
                        x1={lkp.x}
                        y1={lkp.y}
                        x2={robot.position.x}
                        y2={robot.position.y}
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        strokeDasharray="5,3"
                      />

                      {/* Expanding Uncertainty Ellipse */}
                      <ellipse
                        cx={robot.position.x}
                        cy={robot.position.y}
                        rx={Math.min(45, 20 + Math.round(robot.lastContactSecondsAgo / 15))}
                        ry={Math.min(35, 15 + Math.round(robot.lastContactSecondsAgo / 20))}
                        fill="rgba(244, 63, 94, 0.08)"
                        stroke="#f43f5e"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />

                      {/* Ghost Robot Pin */}
                      {isSelected && (
                        <circle
                          cx={robot.position.x}
                          cy={robot.position.y}
                          r="23"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                          strokeDasharray="4,2"
                          className="animate-spin"
                        />
                      )}
                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r="16"
                        fill="#200d18"
                        stroke="#f43f5e"
                        strokeWidth={isSelected ? '3' : '2'}
                      />
                      <text
                        x={robot.position.x}
                        y={robot.position.y + 5}
                        textAnchor="middle"
                        fontSize="13"
                      >
                        👻
                      </text>

                      {/* High-Visibility Ghost Badge Below */}
                      <rect
                        x={robot.position.x - 65}
                        y={robot.position.y + 22}
                        width="130"
                        height="20"
                        rx="4"
                        fill="#200b14"
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                      />
                      <text
                        x={robot.position.x}
                        y={robot.position.y + 36}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {robot.callsign} ⚠️ LOST ({minutesLost}m)
                      </text>
                    </g>
                  );
                }

                // CONNECTED OR DEGRADED ROBOT
                const strokeColor = isDegraded ? '#f59e0b' : '#00f0ff';
                const bgBadgeColor = isDegraded ? '#191307' : '#071220';
                const textBadgeColor = isDegraded ? '#fde68a' : '#ffffff';

                return (
                  <g
                    key={robot.id}
                    className="cursor-pointer"
                    onClick={() => selectRobot(robot.id)}
                    onDoubleClick={() => openFpv(robot.id)}
                    onMouseEnter={() =>
                      setHoveredEntity({
                        type: 'robot',
                        id: robot.id,
                        x: robot.position.x,
                        y: robot.position.y,
                        title: `${robot.name} (${robot.callsign})`,
                        subtitle: `Battery: ${Math.round(robot.battery)}% • Signal: ${robot.signalStrength}% • ${robot.currentTask}`,
                        badge: isDegraded ? 'DEGRADED RSSI' : 'CONNECTED MESH',
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r="22"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        strokeDasharray="4,2"
                        className="animate-spin"
                      />
                    )}

                    {/* Robot Pin Body */}
                    <circle
                      cx={robot.position.x}
                      cy={robot.position.y}
                      r="16"
                      fill="#071b28"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '3' : '2'}
                    />
                    <text
                      x={robot.position.x}
                      y={robot.position.y + 5}
                      textAnchor="middle"
                      fontSize="13"
                    >
                      {getRobotEmoji(robot.type)}
                    </text>

                    {/* Clean Pill Label Below */}
                    <rect
                      x={robot.position.x - 52}
                      y={robot.position.y + 22}
                      width="104"
                      height="20"
                      rx="4"
                      fill={bgBadgeColor}
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x={robot.position.x}
                      y={robot.position.y + 36}
                      textAnchor="middle"
                      fill={textBadgeColor}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {robot.callsign} {Math.round(robot.battery)}%
                    </text>
                  </g>
                );
              })}
            </g>


            {/* ========================================================= */}
            {/* 7. SLEEK ON-DEMAND HOVER TOOLTIP                          */}
            {/* ========================================================= */}
            {hoveredEntity && (
              <g
                transform={`translate(${
                  hoveredEntity.x > 500 ? hoveredEntity.x - 240 : hoveredEntity.x + 20
                }, ${
                  hoveredEntity.y > 450 ? hoveredEntity.y - 75 : hoveredEntity.y - 45
                })`}
                className="pointer-events-none transition-all duration-150"
              >
                <rect
                  x="0"
                  y="0"
                  width="230"
                  height="56"
                  fill="#07101e"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  rx="6"
                  filter="url(#cyanGlow)"
                />
                {hoveredEntity.badge && (
                  <text
                    x="10"
                    y="16"
                    fill="#38bdf8"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    {hoveredEntity.badge}
                  </text>
                )}
                <text
                  x="10"
                  y="32"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {hoveredEntity.title}
                </text>
                <text
                  x="10"
                  y="46"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                >
                  {hoveredEntity.subtitle}
                </text>
              </g>
            )}

          </g>
        </svg>

        {/* ========================================================= */}
        {/* 8. DOCKED ENTITY INSPECTOR PANEL (At Bottom-Left)         */}
        {/* ========================================================= */}
        {(selectedRobot || selectedSurvivor || selectedHazard) && (
          <div className="absolute bottom-3 left-3 z-30 p-3.5 rounded-xl bg-[#091122]/95 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur max-w-sm font-mono text-xs">
            
            {/* Robot Inspector */}
            {selectedRobot && (
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{getRobotEmoji(selectedRobot.type)}</span>
                    <span className="font-bold text-white text-sm">{selectedRobot.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {selectedRobot.callsign}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        selectedRobot.commsStatus === 'connected'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : selectedRobot.commsStatus === 'degraded'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                      }`}
                    >
                      {selectedRobot.commsStatus.toUpperCase()}
                    </span>
                    <button
                      onClick={() => selectRobot(null)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Close Inspector"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Telemetry stats */}
                <div className="grid grid-cols-2 gap-2 mb-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span>⚡ Battery:</span>
                    <span className={`font-bold ${selectedRobot.battery < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round(selectedRobot.battery)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span>📶 Signal:</span>
                    <span className={`font-bold ${selectedRobot.signalStrength < 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {selectedRobot.signalStrength}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mb-3 leading-relaxed bg-slate-900/50 p-1.5 rounded border border-slate-800/60 line-clamp-2">
                  <strong className="text-cyan-400">Mission:</strong> {selectedRobot.currentTask}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openFpv(selectedRobot.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open FPV Cockpit</span>
                  </button>

                  {selectedRobot.commsStatus === 'disconnected' && (
                    <button
                      onClick={() => restoreComms(selectedRobot.id)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-all"
                    >
                      <Signal className="w-3.5 h-3.5" />
                      <span>Sync Comms</span>
                    </button>
                  )}

                  <button
                    onClick={() => deployBeaconAt(selectedRobot.position.x + 20, selectedRobot.position.y + 20)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                    title="Drop RF Mesh Relay at Robot Spot"
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Survivor Inspector (if survivor selected & no robot) */}
            {!selectedRobot && selectedSurvivor && (
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">❤️</span>
                    <span className="font-bold text-white text-sm">{selectedSurvivor.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse">
                      {selectedSurvivor.triage.toUpperCase()}
                    </span>
                    <button
                      onClick={() => selectSurvivor(null)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Close Inspector"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-[11px] text-slate-300">
                  <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400">Heart Rate: </span>
                    <strong className="text-rose-400">{selectedSurvivor.vitals.heartRate} BPM</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400">Oxygen SpO2: </span>
                    <strong className="text-cyan-400">{selectedSurvivor.vitals.spO2}%</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mb-3 bg-slate-900/50 p-1.5 rounded border border-slate-800/60 leading-relaxed">
                  <strong className="text-amber-400">Entrapment:</strong> Depth {selectedSurvivor.location.depthMeters}m • {selectedSurvivor.notes}
                </p>

                <button
                  onClick={() => dispatchRobotToSurvivor('ROB-02', selectedSurvivor.id)}
                  className="w-full py-1.5 px-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Vulcan-X Life Support</span>
                </button>
              </div>
            )}

            {/* Hazard Inspector */}
            {!selectedRobot && !selectedSurvivor && selectedHazard && (
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedHazard.type === 'gas_leak' ? '☣' : '⚠'}</span>
                    <span className="font-bold text-white text-sm">{selectedHazard.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                      {selectedHazard.severity.toUpperCase()}
                    </span>
                    <button
                      onClick={() => selectHazard(null)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Close Inspector"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-amber-300 font-bold mb-2 bg-amber-950/40 p-2 rounded border border-amber-500/40">
                  {selectedHazard.readout}
                </p>

                <p className="text-[11px] text-slate-400 mb-2">
                  Location: {selectedHazard.location.sector} • Perimeter: {selectedHazard.location.radius}m
                </p>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* 9. TACTICAL MAP LEGEND RIBBON (Bottom-Right)              */}
        {/* ========================================================= */}
        <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#070e1c]/95 border border-slate-700/80 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
            <span>Active Bot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Ghost Bot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Survivor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-cyan-400" />
            <span>Safe Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-rose-500 border border-dashed" />
            <span>Blocked</span>
          </div>
        </div>

      </div>
    </div>
  );
};
