import React, { useState, useRef } from 'react';
import { useMission } from '../../store/MissionContext';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Eye,
  AlertTriangle,
  Flame,
  Heart,
  Navigation,
  Sparkles,
  Signal,
  Compass,
  MapPin,
  Shield,
} from 'lucide-react';

export const TacticalMap: React.FC = () => {
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
  } = useMission();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDeployMode, setIsDeployMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.4, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, z - 0.15));
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

    deployBeaconAt(clickX, clickY, `Beacon #${beacons.length + 1} (Tactical Drop)`);
    setIsDeployMode(false);
  };

  return (
    <div className="relative w-full h-full bg-[#070c16] rounded-xl border-2 border-cyan-500/30 overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Top Map Action & Layer Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#0a1120] border-b border-cyan-500/30 z-10 gap-2">
        
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-cyan-400 font-bold flex items-center gap-1 mr-1 text-xs">
            <Layers className="w-4 h-4 text-cyan-400" /> LAYERS:
          </span>

          <button
            onClick={() => toggleLayer('blueprint')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.blueprint
                ? 'bg-blue-500/25 text-blue-200 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            Pre-CAD Grid
          </button>

          <button
            onClick={() => toggleLayer('slam')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.slam
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            LiDAR SLAM
          </button>

          <button
            onClick={() => toggleLayer('mesh')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.mesh
                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            RF Mesh Links
          </button>

          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.hazards
                ? 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            Hazards
          </button>

          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.routes
                ? 'bg-sky-500/25 text-sky-200 border-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            Corridors
          </button>

          <button
            onClick={() => toggleLayer('staleness')}
            className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
              layers.staleness
                ? 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            Staleness Decay
          </button>
        </div>

        {/* Map Tool Actions: Zoom, Reset, Deploy Beacon */}
        <div className="flex items-center gap-2 text-xs font-mono ml-auto">
          <button
            onClick={() => setIsDeployMode(!isDeployMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isDeployMode
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
                : 'bg-slate-800 text-cyan-300 border-cyan-500/40 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isDeployMode ? 'Click Map to Drop Beacon' : 'Deploy RF Beacon'}</span>
          </button>

          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-cyan-300 border-r border-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-cyan-300 border-r border-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-bold text-cyan-300 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
            {Math.round(zoom * 100)}%
          </div>
        </div>

      </div>

      {/* Deploy mode alert banner */}
      {isDeployMode && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 px-5 py-2 bg-cyan-950 border-2 border-cyan-400 text-cyan-100 text-xs font-mono font-bold rounded-full shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2">
          <Radio className="w-4 h-4 animate-spin text-cyan-400" />
          <span>BEACON DEPLOY ACTIVE: Click anywhere in the disaster rubble to drop a Mesh Relay Node</span>
        </div>
      )}

      {/* Main Interactive SVG Map Viewport */}
      <div
        className={`relative flex-1 w-full h-full overflow-hidden select-none ${
          isDeployMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 650"
          onClick={handleMapClick}
        >
          <defs>
            {/* Fog of uncertainty diagonal hatch pattern - high contrast dark charcoal */}
            <pattern
              id="fogOfUncertainty"
              width="20"
              height="20"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="#03060a" />
              <line x1="0" y1="0" x2="0" y2="20" stroke="#1e293b" strokeWidth="4" opacity="0.9" />
            </pattern>

            {/* Pre-disaster CAD Grid Pattern - clean blue architectural lines */}
            <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 58, 138, 0.4)" strokeWidth="1" />
            </pattern>

            {/* Radial hazard pulse */}
            <radialGradient id="hazardPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.55)" />
              <stop offset="70%" stopColor="rgba(239, 68, 68, 0.2)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>

            {/* Staleness pulse gradient */}
            <radialGradient id="staleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.28)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>
          </defs>

          {/* Transform group for Pan & Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* Deep Tactical Canvas Background */}
            <rect x="0" y="0" width="800" height="650" fill="#060a13" />

            {/* Pre-disaster CAD Blueprint Layer */}
            {layers.blueprint && (
              <rect x="0" y="0" width="800" height="650" fill="url(#cadGrid)" />
            )}

            {/* SECTOR POLYGONS & HIGH-CONTRAST LABELS */}
            {sectors.map((sec) => {
              const width = sec.bounds.maxX - sec.bounds.minX;
              const height = sec.bounds.maxY - sec.bounds.minY;
              const isStale = sec.stalenessMinutes > 10;
              const isCritical = sec.structuralRating === 'critical_tilt';
              const isUnstable = sec.structuralRating === 'unstable';

              const sectorStroke = isCritical ? '#ef4444' : isUnstable ? '#f59e0b' : '#38bdf8';
              const sectorFill = isCritical
                ? 'rgba(239, 68, 68, 0.08)'
                : isUnstable
                ? 'rgba(245, 158, 11, 0.06)'
                : 'rgba(56, 189, 248, 0.04)';

              return (
                <g key={sec.id}>
                  {/* Sector Boundary Box - Thick & High Contrast */}
                  <rect
                    x={sec.bounds.minX}
                    y={sec.bounds.minY}
                    width={width}
                    height={height}
                    fill={sectorFill}
                    stroke={sectorStroke}
                    strokeWidth="2.5"
                    strokeDasharray={isCritical ? '8,4' : undefined}
                    rx="8"
                  />

                  {/* Corner Accent Brackets for High-Tech Military C2 Look */}
                  <path
                    d={`M ${sec.bounds.minX} ${sec.bounds.minY + 20} L ${sec.bounds.minX} ${sec.bounds.minY} L ${sec.bounds.minX + 20} ${sec.bounds.minY}`}
                    fill="none"
                    stroke={sectorStroke}
                    strokeWidth="4"
                  />
                  <path
                    d={`M ${sec.bounds.maxX - 20} ${sec.bounds.minY} L ${sec.bounds.maxX} ${sec.bounds.minY} L ${sec.bounds.maxX} ${sec.bounds.minY + 20}`}
                    fill="none"
                    stroke={sectorStroke}
                    strokeWidth="4"
                  />

                  {/* Fog of uncertainty for uninspected rubble voids */}
                  {sec.scannedPercentage < 100 && (
                    <g>
                      <rect
                        x={sec.bounds.minX + (width * sec.scannedPercentage) / 100}
                        y={sec.bounds.minY}
                        width={width * (1 - sec.scannedPercentage / 100)}
                        height={height}
                        fill="url(#fogOfUncertainty)"
                        rx="8"
                      />
                      {/* Unexplored Void Warning Stamp */}
                      <text
                        x={sec.bounds.minX + (width * sec.scannedPercentage) / 100 + 15}
                        y={sec.bounds.minY + height / 2}
                        fill="#64748b"
                        fontSize="12"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        letterSpacing="0.1em"
                        opacity="0.8"
                      >
                        [UNVERIFIED VOID // FOG OF UNCERTAINTY]
                      </text>
                    </g>
                  )}

                  {/* Staleness Decay Warning Glow */}
                  {layers.staleness && isStale && (
                    <rect
                      x={sec.bounds.minX}
                      y={sec.bounds.minY}
                      width={width}
                      height={height}
                      fill="url(#staleGlow)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Prominent High-Contrast Sector Header Nameplate */}
                  <g transform={`translate(${sec.bounds.minX + 10}, ${sec.bounds.minY + 10})`}>
                    <rect
                      x="0"
                      y="0"
                      width="280"
                      height="26"
                      fill="#0b1324"
                      stroke={sectorStroke}
                      strokeWidth="1.5"
                      rx="4"
                    />
                    <text
                      x="10"
                      y="18"
                      fill="#ffffff"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      {sec.name.toUpperCase()}
                    </text>
                    <rect
                      x="215"
                      y="4"
                      width="58"
                      height="18"
                      fill={sec.scannedPercentage > 80 ? '#065f46' : '#78350f'}
                      rx="3"
                    />
                    <text
                      x="244"
                      y="16"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {sec.scannedPercentage}% SLAM
                    </text>
                  </g>

                  {/* High-Visibility Staleness Warning Badge */}
                  {layers.staleness && isStale && (
                    <g transform={`translate(${sec.bounds.minX + 10}, ${sec.bounds.minY + 42})`}>
                      <rect
                        x="0"
                        y="0"
                        width="260"
                        height="22"
                        fill="#451a03"
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        rx="4"
                      />
                      <text
                        x="8"
                        y="15"
                        fill="#fef08a"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        ⚠️ STALENESS: {sec.stalenessMinutes}m (AFTERSHOCK DRIFT RISK)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* SLAM Simulated LiDAR Pointcloud Vectors */}
            {layers.slam && (
              <g opacity="0.85">
                {/* Sector Alpha mapped walls */}
                <path
                  d="M 60 80 L 360 80 M 60 140 L 220 140 M 60 220 L 360 220 M 180 80 L 180 220"
                  stroke="#00f0ff"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
                {/* Sector Beta collapsed pancake slabs */}
                <path
                  d="M 440 80 L 520 140 L 610 110 L 740 90 M 450 200 L 550 230 L 720 190"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6,3"
                />
                {/* Rubble scatter points - larger and distinct */}
                <circle cx="490" cy="120" r="3" fill="#00f0ff" />
                <circle cx="510" cy="135" r="2.5" fill="#38bdf8" />
                <circle cx="560" cy="170" r="3.5" fill="#00f0ff" />
                <circle cx="630" cy="140" r="4" fill="#38bdf8" />
                <circle cx="670" cy="180" r="3" fill="#00f0ff" />
                <circle cx="700" cy="110" r="2.5" fill="#38bdf8" />
              </g>
            )}

            {/* CORRIDORS & EVACUATION PATHS - THICK, VIBRANT, HIGH VISIBILITY */}
            {layers.routes &&
              routes.map((rte) => {
                const pathD = rte.points.reduce(
                  (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  ''
                );

                const isBlocked = rte.status === 'blocked';
                const isNew = rte.status === 'newly_discovered';
                const isHazardous = rte.status === 'hazardous';

                const strokeColor = isBlocked
                  ? '#ef4444'
                  : isNew
                  ? '#10b981'
                  : isHazardous
                  ? '#f59e0b'
                  : '#00e5ff';

                const midPt = rte.points[Math.floor(rte.points.length / 2)];

                return (
                  <g key={rte.id}>
                    {/* High-visibility glowing background path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isBlocked ? 4 : 6}
                      strokeOpacity={isBlocked ? 0.4 : 0.3}
                      strokeLinecap="round"
                    />
                    {/* Core Path Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isBlocked ? 3 : 3.5}
                      strokeDasharray={isBlocked ? '8,6' : isNew ? '8,4' : undefined}
                      strokeLinecap="round"
                    />

                    {/* Blocked Barrier Marker if impassable */}
                    {isBlocked && (
                      <g transform={`translate(${midPt.x - 12}, ${midPt.y - 12})`}>
                        <rect x="0" y="0" width="24" height="24" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
                        <line x1="4" y1="4" x2="20" y2="20" stroke="#ffffff" strokeWidth="3" />
                        <line x1="20" y1="4" x2="4" y2="20" stroke="#ffffff" strokeWidth="3" />
                      </g>
                    )}

                    {/* Route Nameplate Tag */}
                    <g transform={`translate(${midPt.x + 16}, ${midPt.y - 14})`}>
                      <rect
                        x="0"
                        y="0"
                        width="180"
                        height="24"
                        fill="#070d18"
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        rx="4"
                      />
                      <text
                        x="8"
                        y="16"
                        fill={strokeColor}
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {isBlocked ? '⛔ BLOCKED: ' : isNew ? '✨ NEW VOID: ' : 'CORRIDOR: '}
                        {rte.name.split(' ')[0]} ({rte.widthCm}cm)
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* RF MESH TOPOLOGY & RELAY BEACONS */}
            {layers.mesh && (
              <g>
                {/* Inter-beacon connection trunks */}
                {beacons.map((bcn, idx) => {
                  if (idx === 0) return null;
                  const parent = beacons[idx - 1];
                  return (
                    <line
                      key={`mesh-link-${bcn.id}`}
                      x1={parent.x}
                      y1={parent.y}
                      x2={bcn.x}
                      y2={bcn.y}
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                      opacity="0.8"
                    />
                  );
                })}

                {/* Beacon Nodes with Large Coverage Radii */}
                {beacons.map((bcn) => (
                  <g key={bcn.id}>
                    <circle
                      cx={bcn.x}
                      cy={bcn.y}
                      r={bcn.radius}
                      fill="rgba(16, 185, 129, 0.05)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="6,6"
                      opacity="0.6"
                    />
                    <circle cx={bcn.x} cy={bcn.y} r="12" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
                    <circle cx={bcn.x} cy={bcn.y} r="4" fill="#6ee7b7" className="animate-ping" />
                    
                    {/* Beacon Tag */}
                    <g transform={`translate(${bcn.x + 16}, ${bcn.y - 12})`}>
                      <rect x="0" y="0" width="130" height="22" fill="#062e24" stroke="#10b981" strokeWidth="1" rx="4" />
                      <text
                        x="8"
                        y="15"
                        fill="#6ee7b7"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        📡 {bcn.label.split(' ')[0]} ({bcn.batteryHours}h)
                      </text>
                    </g>
                  </g>
                ))}

                {/* Active Robot Mesh Links */}
                {robots
                  .filter((r) => r.commsStatus === 'connected')
                  .map((r) => {
                    const closestBcn = beacons.reduce((prev, curr) => {
                      const dPrev = Math.hypot(prev.x - r.position.x, prev.y - r.position.y);
                      const dCurr = Math.hypot(curr.x - r.position.x, curr.y - r.position.y);
                      return dCurr < dPrev ? curr : prev;
                    }, beacons[0]);

                    return (
                      <line
                        key={`bot-link-${r.id}`}
                        x1={r.position.x}
                        y1={r.position.y}
                        x2={closestBcn.x}
                        y2={closestBcn.y}
                        stroke="#00f0ff"
                        strokeWidth="1.5"
                        strokeDasharray="4,3"
                        opacity={0.7}
                      />
                    );
                  })}
              </g>
            )}

            {/* HAZARDS - BOLD DANGER ZONES & NUMERICAL READOUTS */}
            {layers.hazards &&
              hazards.map((haz) => {
                const isSelected = selectedHazardId === haz.id;
                const isGas = haz.type === 'gas_leak';
                const isCollapse = haz.type === 'structural_collapse';
                const hazColor = isGas ? '#ef4444' : isCollapse ? '#f97316' : '#eab308';

                return (
                  <g
                    key={haz.id}
                    className="cursor-pointer"
                    onClick={() => selectHazard(haz.id)}
                  >
                    {/* Danger Radius Pulse */}
                    <circle
                      cx={haz.location.x}
                      cy={haz.location.y}
                      r={haz.location.radius}
                      fill="url(#hazardPulse)"
                      stroke={hazColor}
                      strokeWidth={isSelected ? '3' : '2'}
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />

                    {/* Hazard Center Badge - Large & Distinct */}
                    <circle
                      cx={haz.location.x}
                      cy={haz.location.y}
                      r="16"
                      fill={isGas ? '#450a0a' : isCollapse ? '#431407' : '#422006'}
                      stroke={hazColor}
                      strokeWidth="2.5"
                    />

                    <text
                      x={haz.location.x}
                      y={haz.location.y + 5}
                      textAnchor="middle"
                      fontSize="14"
                      fill="#ffffff"
                      fontWeight="bold"
                    >
                      {isGas ? '☣' : isCollapse ? '⚠' : '⚡'}
                    </text>

                    {/* High-Visibility Hazard Tag */}
                    <g transform={`translate(${haz.location.x + 22}, ${haz.location.y - 18})`}>
                      <rect
                        x="0"
                        y="0"
                        width="210"
                        height="42"
                        fill="#090e18"
                        stroke={hazColor}
                        strokeWidth="1.8"
                        rx="5"
                      />
                      <text
                        x="10"
                        y="17"
                        fill={hazColor}
                        fontSize="11"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {haz.title}
                      </text>
                      <text
                        x="10"
                        y="32"
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="600"
                      >
                        {haz.readout}
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* DISCOVERED SURVIVORS - HIGH CONTRAST TRIAGE BEACONS */}
            {layers.vitals &&
              survivors.map((surv) => {
                const isSelected = selectedSurvivorId === surv.id;
                const isImmediate = surv.triage === 'immediate';
                const ringColor = isImmediate ? '#ef4444' : '#f59e0b';
                const ringBg = isImmediate ? '#450a0a' : '#451a03';

                return (
                  <g
                    key={surv.id}
                    className="cursor-pointer"
                    onClick={() => selectSurvivor(surv.id)}
                  >
                    {/* Concentric Pulse Rings */}
                    <circle
                      cx={surv.location.x}
                      cy={surv.location.y}
                      r="28"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="2"
                      opacity="0.4"
                      className="animate-ping"
                    />
                    <circle
                      cx={surv.location.x}
                      cy={surv.location.y}
                      r="18"
                      fill={ringBg}
                      stroke={ringColor}
                      strokeWidth={isSelected ? '3.5' : '2.5'}
                    />

                    {/* Center Heartbeat Icon */}
                    <circle cx={surv.location.x} cy={surv.location.y} r="7" fill={ringColor} />

                    {/* High-Visibility Vital Signs Tag */}
                    <g transform={`translate(${surv.location.x + 24}, ${surv.location.y - 20})`}>
                      <rect
                        x="0"
                        y="0"
                        width="175"
                        height="44"
                        fill="#0a0f1d"
                        stroke={ringColor}
                        strokeWidth="2"
                        rx="5"
                      />
                      <rect
                        x="6"
                        y="6"
                        width="163"
                        height="16"
                        fill={isImmediate ? '#7f1d1d' : '#78350f'}
                        rx="3"
                      />
                      <text
                        x="87"
                        y="18"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {surv.label.split(' ')[0]} [{surv.triage.toUpperCase()}]
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill="#ffffff"
                        fontSize="11"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        ❤️ {surv.vitals.heartRate} BPM • {surv.vitals.spO2}% SpO2
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* ROBOT SWARM FLEET (BOLD, CRISP, HIGH-VISIBILITY MARKERS) */}
            {robots.map((bot) => {
              const isSelected = selectedRobotId === bot.id;
              const isDisconnected = bot.commsStatus === 'disconnected';
              const isDegraded = bot.commsStatus === 'degraded';

              // GHOST MODE FOR DISCONNECTED ROBOTS (e.g. SERPENS-3)
              if (isDisconnected) {
                const projectedX = bot.lastKnownPosition.x + bot.deadReckoningVector.dx * 35;
                const projectedY = bot.lastKnownPosition.y + bot.deadReckoningVector.dy * 35;

                return (
                  <g key={bot.id} className="cursor-pointer" onClick={() => selectRobot(bot.id)}>
                    {/* Last confirmed position anchor */}
                    <circle
                      cx={bot.lastKnownPosition.x}
                      cy={bot.lastKnownPosition.y}
                      r="14"
                      fill="rgba(244, 63, 94, 0.3)"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                    />
                    <circle cx={bot.lastKnownPosition.x} cy={bot.lastKnownPosition.y} r="6" fill="#f43f5e" />

                    {/* Projected Dead Reckoning Vector Line */}
                    <line
                      x1={bot.lastKnownPosition.x}
                      y1={bot.lastKnownPosition.y}
                      x2={projectedX}
                      y2={projectedY}
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeDasharray="6,4"
                    />

                    {/* Uncertainty Ellipse */}
                    <circle
                      cx={projectedX}
                      cy={projectedY}
                      r="32"
                      fill="rgba(244, 63, 94, 0.15)"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />

                    {/* Ghost Icon Box */}
                    <g transform={`translate(${projectedX - 14}, ${projectedY - 14})`}>
                      <rect
                        x="0"
                        y="0"
                        width="28"
                        height="28"
                        fill="#1e1b4b"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        rx="6"
                      />
                      <text x="14" y="19" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                        👻
                      </text>
                    </g>

                    {/* High-Visibility Ghost Telemetry Tag */}
                    <g transform={`translate(${projectedX + 22}, ${projectedY - 24})`}>
                      <rect
                        x="0"
                        y="0"
                        width="190"
                        height="50"
                        fill="#0b0f19"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        rx="6"
                      />
                      <text x="10" y="18" fill="#f43f5e" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                        ⚠️ {bot.name} [GHOST MODE]
                      </text>
                      <text x="10" y="32" fill="#cbd5e1" fontSize="10" fontFamily="JetBrains Mono">
                        LOST: {Math.floor(bot.lastContactSecondsAgo / 60)}m {bot.lastContactSecondsAgo % 60}s AGO
                      </text>
                      <text x="10" y="44" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                        📦 {bot.storeAndForwardBacklog} PKTS BUFFERED
                      </text>
                    </g>
                  </g>
                );
              }

              // CONNECTED OR DEGRADED ACTIVE ROBOT
              const botColor = isDegraded ? '#f59e0b' : '#00f0ff';
              const botBg = isSelected ? '#083344' : '#0f172a';

              return (
                <g
                  key={bot.id}
                  className="cursor-pointer transition-transform duration-300"
                  onClick={() => selectRobot(bot.id)}
                  onDoubleClick={() => openFpv(bot.id)}
                >
                  {/* Selected halo */}
                  {isSelected && (
                    <circle
                      cx={bot.position.x}
                      cy={bot.position.y}
                      r="28"
                      fill="none"
                      stroke={botColor}
                      strokeWidth="2.5"
                      strokeDasharray="6,3"
                      className="animate-spin"
                    />
                  )}

                  {/* Heading Direction Arrow */}
                  <line
                    x1={bot.position.x}
                    y1={bot.position.y}
                    x2={bot.position.x + Math.cos((bot.heading * Math.PI) / 180) * 22}
                    y2={bot.position.y + Math.sin((bot.heading * Math.PI) / 180) * 22}
                    stroke={botColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Robot Center Body - Larger (26x26) */}
                  <rect
                    x={bot.position.x - 13}
                    y={bot.position.y - 13}
                    width="26"
                    height="26"
                    fill={botBg}
                    stroke={botColor}
                    strokeWidth={isSelected ? '3' : '2'}
                    rx="6"
                  />

                  {/* Inner glyph */}
                  <circle cx={bot.position.x} cy={bot.position.y} r="4.5" fill={botColor} />

                  {/* High-Visibility Robot Telemetry Tag */}
                  <g transform={`translate(${bot.position.x + 18}, ${bot.position.y - 18})`}>
                    <rect
                      x="0"
                      y="0"
                      width="115"
                      height="34"
                      fill="#070c18"
                      stroke={botColor}
                      strokeWidth="1.5"
                      rx="5"
                    />
                    <text
                      x="8"
                      y="15"
                      fill="#ffffff"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {bot.name}
                    </text>
                    <text
                      x="8"
                      y="27"
                      fill={bot.battery < 30 ? '#ef4444' : '#34d399'}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="600"
                    >
                      ⚡ {Math.round(bot.battery)}% • 📶 {bot.signalStrength}%
                    </text>
                  </g>
                </g>
              );
            })}

          </g>
        </svg>

        {/* Tactical On-Screen Legend Bar at Bottom of Map */}
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#080d1a]/95 border border-slate-700 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span>Active Bot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Ghost Bot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Immediate Red</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>RF Relay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded bg-cyan-400" />
            <span>Safe Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded bg-rose-500 border border-dashed" />
            <span>Blocked</span>
          </div>
        </div>

        {/* Selected Robot Quick Telemetry Widget */}
        {selectedRobotId && (
          <div className="absolute bottom-3 left-3 z-20 p-3.5 rounded-xl bg-[#080e1c]/95 border-2 border-cyan-400 shadow-2xl backdrop-blur max-w-sm">
            {(() => {
              const bot = robots.find((r) => r.id === selectedRobotId);
              if (!bot) return null;
              return (
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold text-slate-100 tactical-font text-sm">{bot.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {bot.callsign}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-300 capitalize">{bot.type.replace('_', ' ')}</span>
                  </div>

                  <p className="text-xs text-slate-200 font-mono mb-3 line-clamp-2 leading-relaxed">
                    {bot.currentTask}
                  </p>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      onClick={() => openFpv(bot.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>FPV Cockpit</span>
                    </button>

                    {bot.commsStatus === 'disconnected' && (
                      <button
                        onClick={() => restoreComms(bot.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow transition-colors flex items-center gap-1"
                      >
                        <Signal className="w-3.5 h-3.5" />
                        <span>Force Sync</span>
                      </button>
                    )}

                    <button
                      onClick={() => deployBeaconAt(bot.position.x + 20, bot.position.y + 20)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                      title="Drop Mesh Relay Beacon Here"
                    >
                      <Radio className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
};
