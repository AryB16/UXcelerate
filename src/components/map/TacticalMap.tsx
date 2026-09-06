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

  // Detail mode: 'simple' (minimalist uncluttered overview) or 'detailed' (deep mission telemetry)
  const [detailMode, setDetailMode] = useState<'simple' | 'detailed'>('simple');

  // When map expands, automatically provide full details!
  // When map is restored to 3-column deck, return to simplified mode for a clean overview.
  useEffect(() => {
    if (isExpanded) {
      setDetailMode('detailed');
    } else {
      setDetailMode('simple');
    }
  }, [isExpanded]);

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
        <div className="flex items-center gap-1.5">
          {/* Detail Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80">
            <button
              onClick={() => setDetailMode('simple')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                detailMode === 'simple'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Clean, simplified overview map"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Simple</span>
            </button>
            <button
              onClick={() => setDetailMode('detailed')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                detailMode === 'detailed'
                  ? 'bg-cyan-400 text-slate-950 font-bold border border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Deep telemetry, RF topology & sensor readouts"
            >
              <Layers className="w-3 h-3" />
              <span>Detailed</span>
            </button>
          </div>

          <button
            onClick={() => setIsDeployMode(!isDeployMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border transition-all ${
              isDeployMode
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800/90 text-cyan-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDeployMode ? 'Click Map' : 'Deploy Relay'}</span>
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
            {/* 1. CLEAN ARCHITECTURAL ZONES (Minimalist & Uncluttered)   */}
            {/* ========================================================= */}
            <g id="architectural-zones">
              {/* Outer Facility Boundary */}
              <rect
                x="30"
                y="30"
                width="740"
                height="560"
                rx="12"
                fill="#080e1b"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Sector B: Rubble Collapse Zone Subtle Tint (Top-Right) */}
              <rect
                x="400"
                y="30"
                width="370"
                height="280"
                rx="8"
                fill="rgba(239, 68, 68, 0.03)"
                stroke="rgba(239, 68, 68, 0.15)"
                strokeDasharray="4,4"
              />

              {/* Sector C: Subterranean Void Tint (Bottom-Right) */}
              <rect
                x="400"
                y="310"
                width="370"
                height="280"
                rx="8"
                fill="rgba(245, 158, 11, 0.02)"
                stroke="rgba(245, 158, 11, 0.12)"
                strokeDasharray="4,4"
              />

              {/* Sector D: Staging & HQ Tint (Bottom-Left) */}
              <rect
                x="30"
                y="310"
                width="370"
                height="280"
                rx="8"
                fill="rgba(16, 185, 129, 0.02)"
                stroke="rgba(16, 185, 129, 0.12)"
                strokeDasharray="4,4"
              />

              {/* Hairline Zone Dividers */}
              <line x1="400" y1="30" x2="400" y2="590" stroke="#152438" strokeWidth="1.5" strokeDasharray="6,4" />
              <line x1="30" y1="310" x2="770" y2="310" stroke="#152438" strokeWidth="1.5" strokeDasharray="6,4" />

              {/* Central Atrium Hub */}
              <circle cx="400" cy="310" r="28" fill="#0b1322" stroke="#1e2d44" strokeWidth="1.5" />
              <text x="400" y="314" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ATRIUM
              </text>

              {/* Sector Watermarks: Minimalist in simple mode vs Rich Structural Diagnostics in detailed mode */}
              {detailMode === 'simple' ? (
                <g id="simple-sector-marks">
                  <text x="50" y="55" fill="#38bdf8" opacity="0.4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                    SEC A // NORTH WING
                  </text>
                  <text x="420" y="55" fill="#f87171" opacity="0.4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                    SEC B // COLLAPSE
                  </text>
                  <text x="50" y="335" fill="#34d399" opacity="0.4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                    SEC D // STAGING HQ
                  </text>
                  <text x="420" y="335" fill="#fbbf24" opacity="0.4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                    SEC C // BASEMENT
                  </text>
                </g>
              ) : (
                <g id="detailed-sector-marks">
                  <g transform="translate(50, 56)">
                    <text fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                      SECTOR A • NORTH WING
                    </text>
                    <text y="16" fill="#64748b" fontSize="9.5" fontFamily="JetBrains Mono">
                      Structure Intact // Stable 94% • 0 Anomalies
                    </text>
                  </g>

                  <g transform="translate(420, 56)">
                    <text fill="#f87171" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                      SECTOR B • MAIN COLLAPSE
                    </text>
                    <text y="16" fill="#ef4444" fontSize="9.5" fontFamily="JetBrains Mono">
                      Pancake Rubble // Unstable 68% • High Debris
                    </text>
                  </g>

                  <g transform="translate(50, 340)">
                    <text fill="#34d399" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                      SECTOR D • STAGING & HQ
                    </text>
                    <text y="16" fill="#64748b" fontSize="9.5" fontFamily="JetBrains Mono">
                      Command Base // Ground Entry • Triaged Safe
                    </text>
                  </g>

                  <g transform="translate(420, 340)">
                    <text fill="#fbbf24" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" letterSpacing="0.5">
                      SECTOR C • METRO BASEMENT
                    </text>
                    <text y="16" fill="#f59e0b" fontSize="9.5" fontFamily="JetBrains Mono">
                      Subterranean Voids // Critical 35% • Moisture
                    </text>
                  </g>
                </g>
              )}
            </g>

            {/* ========================================================= */}
            {/* 2. ROUTES & CORRIDORS                                     */}
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

                  const strokeColor = isBlocked ? '#ef4444' : isHazardous ? '#f59e0b' : isNew ? '#10b981' : '#00e5ff';
                  const strokeDash = isBlocked ? '6,4' : isNew ? '5,3' : undefined;

                  return (
                    <g key={route.id}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={detailMode === 'detailed' ? (isBlocked ? 2.5 : 3.5) : (isBlocked ? 2 : 2.5)}
                        strokeDasharray={strokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={isBlocked ? 0.7 : 0.85}
                      />
                      {/* Badge: in simple mode only if blocked; in detailed mode show clearance tags */}
                      {detailMode === 'simple' ? (
                        isBlocked && (
                          <g transform={`translate(${midPoint.x - 32}, ${midPoint.y - 8})`}>
                            <rect x="0" y="0" width="64" height="16" rx="3" fill="#2d0c13" stroke={strokeColor} strokeWidth="1" />
                            <text x="32" y="11.5" textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                              ⛔ BLOCKED
                            </text>
                          </g>
                        )
                      ) : (
                        (isBlocked || isNew || isHazardous) && (
                          <g transform={`translate(${midPoint.x - 38}, ${midPoint.y - 9})`}>
                            <rect
                              x="0"
                              y="0"
                              width="76"
                              height="18"
                              rx="3"
                              fill={isBlocked ? '#2d0c13' : isHazardous ? '#2a1a06' : '#062e24'}
                              stroke={strokeColor}
                              strokeWidth="1"
                            />
                            <text
                              x="38"
                              y="13"
                              textAnchor="middle"
                              fill={isBlocked ? '#fca5a5' : isHazardous ? '#fde68a' : '#34d399'}
                              fontSize="8"
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              {isBlocked ? '⛔ BLOCKED' : isHazardous ? '⚠️ TIGHT CRAWL' : '✨ NEW VOID'}
                            </text>
                          </g>
                        )
                      )}
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
                {/* Mesh Link Lines between Beacons (Detailed Mode Only) */}
                {detailMode === 'detailed' &&
                  beacons.map((bcn, idx) => {
                    if (idx === 0) return null;
                    const prevBcn = beacons[idx - 1];
                    const midX = (bcn.x + prevBcn.x) / 2;
                    const midY = (bcn.y + prevBcn.y) / 2;
                    return (
                      <g key={`bcn-link-${bcn.id}-${prevBcn.id}`}>
                        <line
                          x1={bcn.x}
                          y1={bcn.y}
                          x2={prevBcn.x}
                          y2={prevBcn.y}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                          opacity="0.5"
                        />
                        <rect x={midX - 22} y={midY - 7} width="44" height="14" rx="2" fill="#04201b" stroke="#10b981" strokeWidth="0.8" />
                        <text x={midX} y={midY + 3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontFamily="JetBrains Mono">
                          -64 dBm
                        </text>
                      </g>
                    );
                  })}

                {/* Mesh Link Lines from Connected Robots to Nearest Beacon (Detailed Mode Only) */}
                {detailMode === 'detailed' &&
                  robots
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
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          opacity="0.35"
                        />
                      );
                    })}

                {/* RF Mesh Coverage Radii (Detailed Mode Only) */}
                {detailMode === 'detailed' &&
                  beacons.map((bcn) => (
                    <circle
                      key={`rad-${bcn.id}`}
                      cx={bcn.x}
                      cy={bcn.y}
                      r={Math.min(bcn.radius, 90)}
                      fill="rgba(16, 185, 129, 0.03)"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity="0.3"
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
                    <circle cx={bcn.x} cy={bcn.y} r={detailMode === 'detailed' ? '8' : '7'} fill="#042f2e" stroke="#10b981" strokeWidth="1.5" />
                    <circle cx={bcn.x} cy={bcn.y} r="3" fill="#34d399" />
                    <text x={bcn.x} y={bcn.y + 16} textAnchor="middle" fill="#6ee7b7" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                      {bcn.label.split(' ')[0]}
                    </text>
                    {detailMode === 'detailed' && (
                      <text x={bcn.x} y={bcn.y + 25} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="JetBrains Mono">
                        {bcn.batteryHours}h
                      </text>
                    )}
                  </g>
                ))}
              </g>
            )}

            {/* ========================================================= */}
            {/* 4. HAZARDS                                                */}
            {/* ========================================================= */}
            {layers.hazards && (
              <g id="hazards-layer">
                {hazards.map((haz) => {
                  const isSelected = selectedHazardId === haz.id;
                  const isGas = haz.type === 'gas_leak';
                  const isStructural = haz.type === 'structural_collapse';

                  const strokeCol = isGas ? '#ef4444' : isStructural ? '#f59e0b' : '#eab308';
                  const fillCol = isGas
                    ? 'rgba(239, 68, 68, 0.08)'
                    : isStructural
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(234, 179, 8, 0.08)';
                  const iconChar = isGas ? '☣' : isStructural ? '⚠' : '⚡';
                  const simpleTitle = isGas ? 'Gas' : isStructural ? 'Collapse' : 'Arc';
                  const detailedTitle = isGas ? 'Methane 520PPM' : isStructural ? 'Column Tilt 18°' : '480V Arc';

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
                      {/* Perimeter radius circle in detailed mode */}
                      {detailMode === 'detailed' && (
                        <circle
                          cx={haz.location.x}
                          cy={haz.location.y}
                          r={Math.min(haz.location.radius, 38)}
                          fill={fillCol}
                          stroke={strokeCol}
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                      )}

                      {/* Pin Center */}
                      <circle
                        cx={haz.location.x}
                        cy={haz.location.y}
                        r={detailMode === 'detailed' ? '12' : '10'}
                        fill="#160c12"
                        stroke={strokeCol}
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                      />
                      <text
                        x={haz.location.x}
                        y={haz.location.y + 4}
                        textAnchor="middle"
                        fontSize={detailMode === 'detailed' ? '11' : '10'}
                        fill="#ffffff"
                      >
                        {iconChar}
                      </text>

                      {/* Pill Label: Minimalist in simple mode vs full specs in detailed mode */}
                      {detailMode === 'simple' ? (
                        <g>
                          <rect
                            x={haz.location.x - 22}
                            y={haz.location.y + 13}
                            width="44"
                            height="14"
                            rx="2.5"
                            fill="#12080e"
                            stroke={strokeCol}
                            strokeWidth="0.8"
                          />
                          <text
                            x={haz.location.x}
                            y={haz.location.y + 23.5}
                            textAnchor="middle"
                            fill={isGas ? '#fca5a5' : '#fde68a'}
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {iconChar} {simpleTitle}
                          </text>
                        </g>
                      ) : (
                        <g>
                          <rect
                            x={haz.location.x - 52}
                            y={haz.location.y + 16}
                            width="104"
                            height="18"
                            rx="3"
                            fill="#12080e"
                            stroke={strokeCol}
                            strokeWidth="1"
                          />
                          <text
                            x={haz.location.x}
                            y={haz.location.y + 28}
                            textAnchor="middle"
                            fill={isGas ? '#fca5a5' : '#fde68a'}
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {iconChar} {detailedTitle}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* ========================================================= */}
            {/* 5. SURVIVORS                                              */}
            {/* ========================================================= */}
            <g id="survivors-layer">
              {survivors.map((surv) => {
                const isSelected = selectedSurvivorId === surv.id;
                const isCrit = surv.triage === 'immediate';
                const isDelayed = surv.triage === 'delayed';

                const strokeCol = isCrit ? '#ef4444' : isDelayed ? '#f59e0b' : '#10b981';
                const fillCol = isCrit ? '#220812' : isDelayed ? '#201406' : '#061e16';
                const textCol = isCrit ? '#fca5a5' : isDelayed ? '#fde68a' : '#6ee7b7';

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
                        badge: `${surv.triage.toUpperCase()} TRIAGE`,
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {/* Pulsing ring for critical */}
                    {isCrit && (
                      <circle
                        cx={surv.location.x}
                        cy={surv.location.y}
                        r={detailMode === 'detailed' ? '20' : '16'}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        opacity="0.45"
                        className="animate-ping"
                      />
                    )}

                    {/* Clean Pin Circle */}
                    <circle
                      cx={surv.location.x}
                      cy={surv.location.y}
                      r={detailMode === 'detailed' ? '13' : '11'}
                      fill={fillCol}
                      stroke={strokeCol}
                      strokeWidth={isSelected ? '2.5' : '1.8'}
                    />
                    <text
                      x={surv.location.x}
                      y={surv.location.y + 4}
                      textAnchor="middle"
                      fontSize={detailMode === 'detailed' ? '11' : '10'}
                    >
                      ❤️
                    </text>

                    {/* Pill Badge: Simple vs Detailed */}
                    {detailMode === 'simple' ? (
                      <g>
                        <rect
                          x={surv.location.x - 20}
                          y={surv.location.y - 21}
                          width="40"
                          height="14"
                          rx="2.5"
                          fill="#0b0f19"
                          stroke={strokeCol}
                          strokeWidth="1"
                        />
                        <text
                          x={surv.location.x}
                          y={surv.location.y - 10.5}
                          textAnchor="middle"
                          fill={textCol}
                          fontSize="8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {surv.id}
                        </text>
                      </g>
                    ) : (
                      <g>
                        <rect
                          x={surv.location.x - 55}
                          y={surv.location.y - 26}
                          width="110"
                          height="20"
                          rx="3"
                          fill="#0b0f19"
                          stroke={strokeCol}
                          strokeWidth="1"
                        />
                        <text
                          x={surv.location.x}
                          y={surv.location.y - 16}
                          textAnchor="middle"
                          fill={textCol}
                          fontSize="8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {surv.id} • HR:{surv.vitals.heartRate} | {surv.vitals.spO2}%
                        </text>
                        <text
                          x={surv.location.x}
                          y={surv.location.y - 8}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="7"
                          fontFamily="JetBrains Mono"
                        >
                          {surv.location.depthMeters}m depth • {surv.triage.toUpperCase()}
                        </text>
                        {surv.id === 'SURV-01' && (
                          <g transform={`translate(${surv.location.x - 42}, ${surv.location.y + 16})`}>
                            <rect width="84" height="13" rx="2" fill="#2d0a14" stroke="#f43f5e" strokeWidth="0.8" />
                            <text x="42" y="9.5" textAnchor="middle" fill="#fda4af" fontSize="7" fontFamily="JetBrains Mono">
                              🔊 180 Hz VOID TAP
                            </text>
                          </g>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* ========================================================= */}
            {/* 6. ROBOTS                                                 */}
            {/* ========================================================= */}
            <g id="robots-layer">
              {robots.map((robot) => {
                const isSelected = selectedRobotId === robot.id;
                const isDisconnected = robot.commsStatus === 'disconnected';
                const isDegraded = robot.commsStatus === 'degraded';
                const shortName = robot.name.split('-')[0] || robot.callsign;

                if (isDisconnected) {
                  // GHOST MODE: Last known pin + clean dashed line + ghost pin
                  const lkp = robot.lastKnownPosition || {
                    x: robot.position.x - 30,
                    y: robot.position.y - 30,
                  };

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
                          subtitle: `GHOST OFFLINE // ${robot.storeAndForwardBacklog} Pkts Buffered`,
                          badge: 'NO CARRIER',
                        })
                      }
                      onMouseLeave={() => setHoveredEntity(null)}
                    >
                      <circle cx={lkp.x} cy={lkp.y} r="4" fill="#f43f5e" />

                      <line
                        x1={lkp.x}
                        y1={lkp.y}
                        x2={robot.position.x}
                        y2={robot.position.y}
                        stroke="#f43f5e"
                        strokeWidth="1.8"
                        strokeDasharray="4,3"
                      />

                      {detailMode === 'detailed' && (
                        <ellipse
                          cx={robot.position.x}
                          cy={robot.position.y}
                          rx="32"
                          ry="22"
                          fill="rgba(244, 63, 94, 0.05)"
                          stroke="#f43f5e"
                          strokeWidth="0.8"
                          strokeDasharray="3,3"
                        />
                      )}

                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r={detailMode === 'detailed' ? '14' : '12'}
                        fill="#1f0a12"
                        stroke="#f43f5e"
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                      />
                      <text
                        x={robot.position.x}
                        y={robot.position.y + 4.5}
                        textAnchor="middle"
                        fontSize={detailMode === 'detailed' ? '12' : '11'}
                      >
                        👻
                      </text>

                      {/* Ghost Pill */}
                      {detailMode === 'simple' ? (
                        <g>
                          <rect
                            x={robot.position.x - 34}
                            y={robot.position.y + 15}
                            width="68"
                            height="15"
                            rx="3"
                            fill="#15050c"
                            stroke="#f43f5e"
                            strokeWidth="1"
                          />
                          <text
                            x={robot.position.x}
                            y={robot.position.y + 26}
                            textAnchor="middle"
                            fill="#fca5a5"
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {shortName} [Lost]
                          </text>
                        </g>
                      ) : (
                        <g>
                          <rect
                            x={robot.position.x - 52}
                            y={robot.position.y + 16}
                            width="104"
                            height="20"
                            rx="3"
                            fill="#15050c"
                            stroke="#f43f5e"
                            strokeWidth="1"
                          />
                          <text
                            x={robot.position.x}
                            y={robot.position.y + 26}
                            textAnchor="middle"
                            fill="#fca5a5"
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {robot.name} ⚠️ GHOST
                          </text>
                          <text
                            x={robot.position.x}
                            y={robot.position.y + 34}
                            textAnchor="middle"
                            fill="#fda4af"
                            fontSize="6.8"
                            fontFamily="JetBrains Mono"
                          >
                            {robot.storeAndForwardBacklog} Pkts Buffered
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }

                // CONNECTED OR DEGRADED ROBOT
                const strokeColor = isDegraded ? '#f59e0b' : '#00f0ff';

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
                        badge: isDegraded ? 'DEGRADED RSSI' : 'ONLINE MESH',
                      })
                    }
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {isSelected && (
                      <circle
                        cx={robot.position.x}
                        cy={robot.position.y}
                        r={detailMode === 'detailed' ? '20' : '17'}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        strokeDasharray="3,2"
                        className="animate-spin"
                      />
                    )}

                    {/* Forward LiDAR fan in detailed mode */}
                    {detailMode === 'detailed' && (
                      <path
                        d={`M ${robot.position.x} ${robot.position.y} L ${robot.position.x + 22} ${robot.position.y - 14} A 26 26 0 0 1 ${robot.position.x + 22} ${robot.position.y + 14} Z`}
                        fill="rgba(0, 240, 255, 0.08)"
                        stroke="#00f0ff"
                        strokeWidth="0.6"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                    )}

                    <circle
                      cx={robot.position.x}
                      cy={robot.position.y}
                      r={detailMode === 'detailed' ? '14' : '12'}
                      fill="#071322"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2.5' : '1.8'}
                    />
                    <text
                      x={robot.position.x}
                      y={robot.position.y + 4.5}
                      textAnchor="middle"
                      fontSize={detailMode === 'detailed' ? '12' : '10.5'}
                    >
                      {getRobotEmoji(robot.type)}
                    </text>

                    {/* Pill Label */}
                    {detailMode === 'simple' ? (
                      <g>
                        <rect
                          x={robot.position.x - 30}
                          y={robot.position.y + 15}
                          width="60"
                          height="14"
                          rx="2.5"
                          fill="#060c18"
                          stroke={strokeColor}
                          strokeWidth="1"
                        />
                        <text
                          x={robot.position.x}
                          y={robot.position.y + 25}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="7.8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {shortName} {Math.round(robot.battery)}%
                        </text>
                      </g>
                    ) : (
                      <g>
                        <rect
                          x={robot.position.x - 48}
                          y={robot.position.y + 17}
                          width="96"
                          height="20"
                          rx="3"
                          fill="#060c18"
                          stroke={strokeColor}
                          strokeWidth="1"
                        />
                        <text
                          x={robot.position.x}
                          y={robot.position.y + 27}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="7.8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {robot.name} • {Math.round(robot.battery)}%
                        </text>
                        <text
                          x={robot.position.x}
                          y={robot.position.y + 35}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="6.8"
                          fontFamily="JetBrains Mono"
                        >
                          {robot.signalStrength}% RSSI • 0.4 m/s
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Detailed Mode HUD overlay watermark */}
            {detailMode === 'detailed' && (
              <g transform="translate(480, 565)">
                <rect x="0" y="0" width="270" height="20" rx="4" fill="#07101e" stroke="#1e3a5f" strokeWidth="1" />
                <text x="135" y="14" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                  🔬 DEEP TELEMETRY // 6 SWARM UNITS // RSSI -64dBm
                </text>
              </g>
            )}


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
