import React, { useState, useRef } from 'react';
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
  Heart,
  AlertTriangle,
  Send,
  WifiOff,
  Navigation,
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

      {/* Main Map Canvas */}
      <div
        className={`relative flex-1 w-full h-full overflow-hidden select-none ${
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
            {layers.routes && (
              <g id="routes-layer">
                {/* Safe Corridor Alpha (Staging to ER) */}
                <path
                  d="M 120 400 L 120 305 L 290 305 L 290 190"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.85"
                />
                <rect x="130" y="293" width="90" height="18" rx="4" fill="#071b28" stroke="#00e5ff" strokeWidth="1" />
                <text x="175" y="306" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  🟢 SAFE ROUTE
                </text>

                {/* Hazardous Crawlway to Survivor #1 */}
                <path
                  d="M 290 190 L 420 190 L 480 175 L 535 140"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />

                {/* Blocked Atrium Corridor (Pancake Collapse) */}
                <path
                  d="M 430 250 L 520 250 L 580 250"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <rect x="475" y="240" width="85" height="18" rx="4" fill="#2d0c13" stroke="#ef4444" strokeWidth="1.5" />
                <text x="517" y="253" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  ⛔ BLOCKED
                </text>

                {/* Discovered Subterranean Crawlway (Snakebot) */}
                <path
                  d="M 480 340 L 530 400 L 630 460"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <rect x="525" y="390" width="85" height="18" rx="4" fill="#062e24" stroke="#10b981" strokeWidth="1" />
                <text x="567" y="403" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  ✨ NEW VOID
                </text>
              </g>
            )}

            {/* ========================================================= */}
            {/* 3. RF MESH NETWORK & RELAYS                               */}
            {/* ========================================================= */}
            {layers.mesh && (
              <g id="mesh-layer">
                {/* Mesh Link Lines */}
                <line x1="200" y1="200" x2="440" y2="260" stroke="#10b981" strokeWidth="1.8" strokeDasharray="4,4" opacity="0.5" />
                <line x1="440" y1="260" x2="520" y2="380" stroke="#10b981" strokeWidth="1.8" strokeDasharray="4,4" opacity="0.5" />

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
            {/* 4. HAZARDS (Methane leak, 18° tilt, electrical)          */}
            {/* ========================================================= */}
            {layers.hazards && (
              <g id="hazards-layer">
                {/* HAZ-01: Methane Gas Leak in Sector Beta */}
                <g
                  className="cursor-pointer"
                  onClick={() => selectHazard('HAZ-01')}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      type: 'hazard',
                      id: 'HAZ-01',
                      x: 580,
                      y: 220,
                      title: 'Methane Gas Rupture (CH4)',
                      subtitle: '520 PPM • Lower Explosive Limit Alert',
                      badge: 'CRITICAL HAZARD',
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <circle cx="580" cy="220" r="45" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
                  <circle cx="580" cy="220" r="14" fill="#1e101a" stroke="#ef4444" strokeWidth="2" />
                  <text x="580" y="224.5" textAnchor="middle" fontSize="13" fill="#ffffff">☣</text>
                  
                  {/* Clean pill label below */}
                  <rect x="525" y="238" width="110" height="18" rx="4" fill="#1c0a10" stroke="#ef4444" strokeWidth="1" />
                  <text x="580" y="251" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                    ☣ CH4 GAS 520 PPM
                  </text>
                </g>

                {/* HAZ-02: Structural Column Shear in Sector Gamma */}
                <g
                  className="cursor-pointer"
                  onClick={() => selectHazard('HAZ-02')}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      type: 'hazard',
                      id: 'HAZ-02',
                      x: 600,
                      y: 365,
                      title: 'Bearing Column Shear Rupture',
                      subtitle: '18.4° Deflection Tilt • 92% Yield Stress',
                      badge: 'COLLAPSE RISK',
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <circle cx="600" cy="365" r="40" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                  <circle cx="600" cy="365" r="14" fill="#1a1409" stroke="#f59e0b" strokeWidth="2" />
                  <text x="600" y="369.5" textAnchor="middle" fontSize="13" fill="#ffffff">⚠</text>
                  
                  {/* Clean pill label above */}
                  <rect x="545" y="335" width="110" height="18" rx="4" fill="#1a1206" stroke="#f59e0b" strokeWidth="1" />
                  <text x="600" y="348" textAnchor="middle" fill="#fde68a" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                    ⚠ 18° COLUMN TILT
                  </text>
                </g>

                {/* HAZ-03: Substation Transformer in Sector Beta */}
                <g
                  className="cursor-pointer"
                  onClick={() => selectHazard('HAZ-03')}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      type: 'hazard',
                      id: 'HAZ-03',
                      x: 735,
                      y: 255,
                      title: 'Substation Transformer Feeder Short',
                      subtitle: '480V Arc Flash Hazard • Water Intrusion',
                      badge: 'ELECTRICAL',
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <circle cx="735" cy="255" r="28" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" />
                  <circle cx="735" cy="255" r="13" fill="#1a1409" stroke="#f59e0b" strokeWidth="1.8" />
                  <text x="735" y="259" textAnchor="middle" fontSize="11" fill="#ffffff">⚡</text>
                </g>
              </g>
            )}

            {/* ========================================================= */}
            {/* 5. SURVIVORS (Pulsing beacons & clear triage tags)        */}
            {/* ========================================================= */}
            <g id="survivors-layer">
              {/* SURV-01: Adult Male in Sector Beta (Trapped in Rubble) */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  selectSurvivor('SURV-01');
                  soundManager.playSonarPing();
                }}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'survivor',
                    id: 'SURV-01',
                    x: 535,
                    y: 140,
                    title: 'Survivor #1 (Adult Male)',
                    subtitle: 'HR: 118 BPM • SpO2: 91% • Depth: 2.1m (Pinned)',
                    badge: 'RED // IMMEDIATE',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Soft pulse wave */}
                <circle cx="535" cy="140" r="24" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" className="animate-ping" />
                {/* Pin Body */}
                <circle
                  cx="535"
                  cy="140"
                  r="15"
                  fill="#1c0c14"
                  stroke="#ef4444"
                  strokeWidth={selectedSurvivorId === 'SURV-01' ? '3.5' : '2'}
                  filter="url(#redGlow)"
                />
                <text x="535" y="145" textAnchor="middle" fontSize="13">❤️</text>
                
                {/* Clean pill label above (zero collision!) */}
                <rect x="475" y="108" width="120" height="20" rx="4" fill="#200a12" stroke="#ef4444" strokeWidth="1.2" />
                <text x="535" y="122" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ❤️ S-1 [CRITICAL]
                </text>
              </g>

              {/* SURV-02: Child in Sector Gamma (Subterranean Shaft) */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  selectSurvivor('SURV-02');
                  soundManager.playSonarPing();
                }}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'survivor',
                    id: 'SURV-02',
                    x: 650,
                    y: 410,
                    title: 'Survivor #2 (Child)',
                    subtitle: 'HR: 132 BPM • SpO2: 94% • Depth: 4.8m (Void)',
                    badge: 'RED // IMMEDIATE',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <circle cx="650" cy="410" r="24" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" className="animate-ping" />
                <circle
                  cx="650"
                  cy="410"
                  r="15"
                  fill="#1c0c14"
                  stroke="#ef4444"
                  strokeWidth={selectedSurvivorId === 'SURV-02' ? '3.5' : '2'}
                  filter="url(#redGlow)"
                />
                <text x="650" y="415" textAnchor="middle" fontSize="13">❤️</text>

                {/* Clean pill label above */}
                <rect x="590" y="378" width="120" height="20" rx="4" fill="#200a12" stroke="#ef4444" strokeWidth="1.2" />
                <text x="650" y="392" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ❤️ S-2 [CRITICAL]
                </text>
              </g>

              {/* SURV-04: Confined crawlway survivor */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  selectSurvivor('SURV-04');
                  soundManager.playSonarPing();
                }}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'survivor',
                    id: 'SURV-04',
                    x: 715,
                    y: 165,
                    title: 'Survivor #4 (Adult Female)',
                    subtitle: 'HR: 72 BPM • SpO2: 96% • Stable Void Pocket',
                    badge: 'GREEN // MINOR',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <circle
                  cx="715"
                  cy="165"
                  r="14"
                  fill="#06221c"
                  stroke="#10b981"
                  strokeWidth={selectedSurvivorId === 'SURV-04' ? '3' : '1.8'}
                />
                <text x="715" y="170" textAnchor="middle" fontSize="12">💚</text>
                
                {/* Clean pill label above */}
                <rect x="665" y="135" width="100" height="18" rx="4" fill="#071e19" stroke="#10b981" strokeWidth="1" />
                <text x="715" y="148" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                  💚 S-4 [MINOR]
                </text>
              </g>
            </g>

            {/* ========================================================= */}
            {/* 6. ROBOTS & GHOST MODE (Clean pins with no clutter)       */}
            {/* ========================================================= */}
            <g id="robots-layer">
              
              {/* ROB-01: SkyEye-1 (Aerial Drone over Sector Alpha) */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-01')}
                onDoubleClick={() => openFpv('ROB-01')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-01',
                    x: 260,
                    y: 140,
                    title: 'SkyEye-1 (AERO-SCOUT)',
                    subtitle: 'Battery: 82% • Signal: 96% • Aerial LiDAR Survey',
                    badge: 'CONNECTED',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {selectedRobotId === 'ROB-01' && (
                  <circle cx="260" cy="140" r="22" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="260" cy="140" r="16" fill="#071b28" stroke="#00f0ff" strokeWidth={selectedRobotId === 'ROB-01' ? '3' : '2'} />
                <text x="260" y="145" textAnchor="middle" fontSize="13">🛸</text>
                
                {/* Clean Pill Label Below */}
                <rect x="210" y="162" width="100" height="20" rx="4" fill="#071220" stroke="#00f0ff" strokeWidth="1" />
                <text x="260" y="176" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ROB-01 SkyEye
                </text>
              </g>

              {/* ROB-02: Vulcan-X (Heavy Quadruped searching Sector Beta rubble) */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-02')}
                onDoubleClick={() => openFpv('ROB-02')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-02',
                    x: 480,
                    y: 175,
                    title: 'Vulcan-X (K9-TITAN)',
                    subtitle: 'Battery: 69% • Signal: 78% • Acoustic Geophone Sweep',
                    badge: 'CONNECTED',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {selectedRobotId === 'ROB-02' && (
                  <circle cx="480" cy="175" r="22" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="480" cy="175" r="16" fill="#071b28" stroke="#00f0ff" strokeWidth={selectedRobotId === 'ROB-02' ? '3' : '2'} />
                <text x="480" y="180" textAnchor="middle" fontSize="13">🐕</text>
                
                {/* Clean Pill Label Below */}
                <rect x="430" y="198" width="100" height="20" rx="4" fill="#071220" stroke="#00f0ff" strokeWidth="1" />
                <text x="480" y="212" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ROB-02 Vulcan
                </text>
              </g>

              {/* ROB-03: Serpens-3 (Snake Crawler // GHOST MODE SHOWCASE) */}
              {/* Concrete blocks radio: pins last known spot + draws dead reckoning vector */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-03')}
                onDoubleClick={() => openFpv('ROB-03')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-03',
                    x: 630,
                    y: 470,
                    title: 'Serpens-3 (VOID-SNAKE)',
                    subtitle: 'GHOST MODE // Lost 5m ago • 42 Pkts Buffered Offline',
                    badge: 'LOST SIGNAL',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {/* Last Known Position Pin (590, 430) */}
                <circle cx="590" cy="430" r="5" fill="#f43f5e" />
                <text x="580" y="420" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono">Last Contact</text>

                {/* Projected Dead Reckoning Trajectory Vector to (630, 470) */}
                <line x1="590" y1="430" x2="630" y2="470" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5,3" />
                
                {/* Estimated Robot Position */}
                {selectedRobotId === 'ROB-03' && (
                  <circle cx="630" cy="470" r="23" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="630" cy="470" r="16" fill="#200d18" stroke="#f43f5e" strokeWidth={selectedRobotId === 'ROB-03' ? '3' : '2'} />
                <text x="630" y="475" textAnchor="middle" fontSize="13">👻</text>

                {/* High-Visibility Ghost Badge Below */}
                <rect x="565" y="493" width="130" height="20" rx="4" fill="#200b14" stroke="#f43f5e" strokeWidth="1.2" />
                <text x="630" y="507" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  Serpens-3 ⚠️ LOST (5m)
                </text>
              </g>

              {/* ROB-04: Titan-2 (Tracked Rover Mast Anchor at 440, 310) */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-04')}
                onDoubleClick={() => openFpv('ROB-04')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-04',
                    x: 440,
                    y: 310,
                    title: 'Titan-2 (SHORE-ROVER)',
                    subtitle: 'Battery: 88% • Signal: 91% • High-Gain RF Mast Bridge',
                    badge: 'CONNECTED',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {selectedRobotId === 'ROB-04' && (
                  <circle cx="440" cy="310" r="22" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="440" cy="310" r="16" fill="#071b28" stroke="#00f0ff" strokeWidth={selectedRobotId === 'ROB-04' ? '3' : '2'} />
                <text x="440" y="315" textAnchor="middle" fontSize="13">🚜</text>
                
                {/* Clean Pill Label Below */}
                <rect x="395" y="333" width="90" height="20" rx="4" fill="#071220" stroke="#00f0ff" strokeWidth="1" />
                <text x="440" y="347" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ROB-04 Titan
                </text>
              </g>

              {/* ROB-05: Gecko-04 (Wall Climber at 675, 215) */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-05')}
                onDoubleClick={() => openFpv('ROB-05')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-05',
                    x: 675,
                    y: 215,
                    title: 'Gecko-04 (WALL-CRAWL)',
                    subtitle: 'Battery: 48% • Signal: 44% (Degraded) • Vertical Shear Wall Scan',
                    badge: 'DEGRADED',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {selectedRobotId === 'ROB-05' && (
                  <circle cx="675" cy="215" r="22" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="675" cy="215" r="16" fill="#1c1609" stroke="#f59e0b" strokeWidth={selectedRobotId === 'ROB-05' ? '3' : '2'} />
                <text x="675" y="220" textAnchor="middle" fontSize="13">🦎</text>

                {/* Clean Pill Label Below */}
                <rect x="630" y="238" width="90" height="20" rx="4" fill="#191307" stroke="#f59e0b" strokeWidth="1" />
                <text x="675" y="252" textAnchor="middle" fill="#fde68a" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ROB-05 Gecko
                </text>
              </g>

              {/* ROB-06: Aqua-1 (Amphibious Sump Rover at 210, 480) */}
              <g
                className="cursor-pointer"
                onClick={() => selectRobot('ROB-06')}
                onDoubleClick={() => openFpv('ROB-06')}
                onMouseEnter={() =>
                  setHoveredEntity({
                    type: 'robot',
                    id: 'ROB-06',
                    x: 210,
                    y: 480,
                    title: 'Aqua-1 (SUMP-PROBE)',
                    subtitle: 'Battery: 76% • Signal: 72% • Basement Water Runoff Inspection',
                    badge: 'CONNECTED',
                  })
                }
                onMouseLeave={() => setHoveredEntity(null)}
              >
                {selectedRobotId === 'ROB-06' && (
                  <circle cx="210" cy="480" r="22" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4,2" className="animate-spin" />
                )}
                <circle cx="210" cy="480" r="16" fill="#071b28" stroke="#00f0ff" strokeWidth={selectedRobotId === 'ROB-06' ? '3' : '2'} />
                <text x="210" y="485" textAnchor="middle" fontSize="13">🌊</text>

                {/* Clean Pill Label Below */}
                <rect x="165" y="503" width="90" height="20" rx="4" fill="#071220" stroke="#00f0ff" strokeWidth="1" />
                <text x="210" y="517" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  ROB-06 Aqua
                </text>
              </g>

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
