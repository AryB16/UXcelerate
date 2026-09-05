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
    isStoreAndForwardSyncing,
  } = useMission();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDeployMode, setIsDeployMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.2, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.7, z - 0.15));
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
    <div className="relative w-full h-full bg-[#05080f] rounded-xl border border-slate-800/80 overflow-hidden flex flex-col shadow-2xl">
      {/* Top Map Action & Layer Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 z-10 gap-2">
        
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-slate-500 flex items-center gap-1 mr-1 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> LAYERS:
          </span>

          <button
            onClick={() => toggleLayer('blueprint')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.blueprint
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            Pre-CAD Grid
          </button>

          <button
            onClick={() => toggleLayer('slam')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.slam
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            SLAM LiDAR
          </button>

          <button
            onClick={() => toggleLayer('mesh')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.mesh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            RF Mesh Links
          </button>

          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.hazards
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            Hazards
          </button>

          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.routes
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            Corridors
          </button>

          <button
            onClick={() => toggleLayer('staleness')}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              layers.staleness
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
            }`}
          >
            Staleness Decay
          </button>
        </div>

        {/* Map Tool Actions: Zoom, Reset, Deploy Beacon */}
        <div className="flex items-center gap-1.5 text-xs font-mono ml-auto">
          <button
            onClick={() => setIsDeployMode(!isDeployMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
              isDeployMode
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse'
                : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isDeployMode ? 'Click Map to Drop Beacon' : 'Deploy RF Beacon'}</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded border border-slate-700">
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-cyan-300 border-r border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-cyan-300 border-r border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-slate-300 hover:text-cyan-300"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
            {Math.round(zoom * 100)}%
          </div>
        </div>

      </div>

      {/* Deploy mode alert banner */}
      {isDeployMode && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20 px-4 py-1.5 bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-mono rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-spin" />
          <span>BEACON DEPLOY MODE: Click anywhere in the disaster field to deploy an RF Mesh Relay</span>
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
            {/* Fog of uncertainty diagonal hatch pattern */}
            <pattern
              id="fogOfUncertainty"
              width="16"
              height="16"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="16" stroke="#1e293b" strokeWidth="3" opacity="0.6" />
            </pattern>

            {/* Pre-disaster CAD Grid Pattern */}
            <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 58, 138, 0.25)" strokeWidth="0.75" />
            </pattern>

            {/* Radial glow filter for survivors */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Hazard radial gradient */}
            <radialGradient id="hazardPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
              <stop offset="70%" stopColor="rgba(239, 68, 68, 0.15)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>

            {/* Staleness pulse gradient */}
            <radialGradient id="staleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.2)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>
          </defs>

          {/* Transform group for Pan & Zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* Background Grid */}
            <rect x="0" y="0" width="800" height="650" fill="#06090e" />

            {/* Pre-disaster CAD Blueprint Layer */}
            {layers.blueprint && (
              <rect x="0" y="0" width="800" height="650" fill="url(#cadGrid)" />
            )}

            {/* Sector Polygons & Staleness Heatmaps */}
            {sectors.map((sec) => {
              const width = sec.bounds.maxX - sec.bounds.minX;
              const height = sec.bounds.maxY - sec.bounds.minY;
              const isStale = sec.stalenessMinutes > 10;

              return (
                <g key={sec.id}>
                  {/* Sector Boundary Box */}
                  <rect
                    x={sec.bounds.minX}
                    y={sec.bounds.minY}
                    width={width}
                    height={height}
                    fill={sec.structuralRating === 'critical_tilt' ? 'rgba(239, 68, 68, 0.04)' : 'rgba(15, 23, 42, 0.3)'}
                    stroke={sec.structuralRating === 'critical_tilt' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(71, 85, 105, 0.4)'}
                    strokeWidth="1.5"
                    strokeDasharray={sec.structuralRating === 'critical_tilt' ? '6,3' : undefined}
                    rx="6"
                  />

                  {/* Fog of uncertainty for partially scanned sectors */}
                  {sec.scannedPercentage < 100 && (
                    <rect
                      x={sec.bounds.minX + (width * sec.scannedPercentage) / 100}
                      y={sec.bounds.minY}
                      width={width * (1 - sec.scannedPercentage / 100)}
                      height={height}
                      fill="url(#fogOfUncertainty)"
                      rx="6"
                    />
                  )}

                  {/* Staleness Decay Warning Glow for old scan data */}
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

                  {/* Sector Header Label */}
                  <text
                    x={sec.bounds.minX + 12}
                    y={sec.bounds.minY + 22}
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                    letterSpacing="0.05em"
                  >
                    {sec.name.toUpperCase()} [{sec.scannedPercentage}% SCANNED]
                  </text>

                  {/* Staleness notice badge */}
                  {layers.staleness && isStale && (
                    <text
                      x={sec.bounds.minX + 12}
                      y={sec.bounds.minY + 38}
                      fill="#f59e0b"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                    >
                      ⚠️ STALENESS: {sec.stalenessMinutes}m (AFTERSHOCK DRIFT RISK)
                    </text>
                  )}
                </g>
              );
            })}

            {/* SLAM Simulated LiDAR Pointcloud Scatter Dots */}
            {layers.slam && (
              <g opacity="0.6">
                {/* Sector Alpha scanned walls */}
                <path
                  d="M 60 80 L 360 80 M 60 140 L 220 140 M 60 220 L 360 220 M 180 80 L 180 220"
                  stroke="#00f0ff"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
                {/* Sector Beta collapsed pancake slabs */}
                <path
                  d="M 440 80 L 520 140 L 610 110 L 740 90 M 450 200 L 550 230 L 720 190"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                {/* Rubble scatter points */}
                <circle cx="490" cy="120" r="1.5" fill="#38bdf8" />
                <circle cx="510" cy="135" r="1" fill="#38bdf8" />
                <circle cx="560" cy="170" r="1.5" fill="#38bdf8" />
                <circle cx="630" cy="140" r="2" fill="#38bdf8" />
                <circle cx="670" cy="180" r="1.5" fill="#38bdf8" />
                <circle cx="700" cy="110" r="1" fill="#38bdf8" />
              </g>
            )}

            {/* Routes and Corridors */}
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
                  : '#00f0ff';

                return (
                  <g key={rte.id}>
                    {/* Outer glow line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isBlocked ? 2 : 4}
                      strokeOpacity={isBlocked ? 0.3 : 0.25}
                      strokeLinecap="round"
                    />
                    {/* Inner core line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isBlocked ? 2 : 2.5}
                      strokeDasharray={isBlocked ? '5,4' : isNew ? '6,3' : undefined}
                      strokeLinecap="round"
                      className={!isBlocked ? 'animate-pulse' : undefined}
                    />

                    {/* Route Label */}
                    <text
                      x={rte.points[Math.floor(rte.points.length / 2)].x + 8}
                      y={rte.points[Math.floor(rte.points.length / 2)].y - 8}
                      fill={strokeColor}
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      className="bg-black"
                    >
                      {isBlocked ? '⛔ BLOCKED: ' : isNew ? '✨ NEW CRAWLWAY: ' : 'CORRIDOR: '}
                      {rte.name.split(' ')[0]} ({rte.widthCm}cm)
                    </text>
                  </g>
                );
              })}

            {/* RF Mesh Links & Breadcrumb Beacons */}
            {layers.mesh && (
              <g>
                {/* Inter-beacon lines */}
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
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  );
                })}

                {/* Beacon Coverage Circles & Icons */}
                {beacons.map((bcn) => (
                  <g key={bcn.id}>
                    <circle
                      cx={bcn.x}
                      cy={bcn.y}
                      r={bcn.radius}
                      fill="rgba(16, 185, 129, 0.04)"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="4,6"
                      opacity="0.4"
                    />
                    <circle cx={bcn.x} cy={bcn.y} r="8" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                    <circle cx={bcn.x} cy={bcn.y} r="3" fill="#34d399" className="animate-ping" />
                    <text
                      x={bcn.x + 10}
                      y={bcn.y + 4}
                      fill="#34d399"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                    >
                      {bcn.label.split(' ')[0]} ({bcn.batteryHours}h)
                    </text>
                  </g>
                ))}

                {/* Robot-to-Mesh links for connected robots */}
                {robots
                  .filter((r) => r.commsStatus === 'connected')
                  .map((r) => {
                    // Find closest beacon
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
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity={r.signalStrength / 120}
                      />
                    );
                  })}
              </g>
            )}

            {/* Hazards Overlay */}
            {layers.hazards &&
              hazards.map((haz) => {
                const isSelected = selectedHazardId === haz.id;
                const isGas = haz.type === 'gas_leak';
                const isCollapse = haz.type === 'structural_collapse';

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
                      stroke={isGas ? '#ef4444' : isCollapse ? '#f97316' : '#eab308'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />

                    {/* Hazard Center Badge */}
                    <circle
                      cx={haz.location.x}
                      cy={haz.location.y}
                      r="12"
                      fill={isGas ? '#450a0a' : isCollapse ? '#431407' : '#422006'}
                      stroke={isGas ? '#ef4444' : isCollapse ? '#f97316' : '#eab308'}
                      strokeWidth="2"
                    />

                    {/* Hazard Icon */}
                    <text
                      x={haz.location.x}
                      y={haz.location.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#ffffff"
                    >
                      {isGas ? '☣' : isCollapse ? '⚠' : '⚡'}
                    </text>

                    {/* Hazard Label */}
                    <text
                      x={haz.location.x + 16}
                      y={haz.location.y - 4}
                      fill={isGas ? '#ef4444' : '#f97316'}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {haz.title}
                    </text>
                    <text
                      x={haz.location.x + 16}
                      y={haz.location.y + 10}
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                    >
                      {haz.readout}
                    </text>
                  </g>
                );
              })}

            {/* Discovered Survivors Layer */}
            {layers.vitals &&
              survivors.map((surv) => {
                const isSelected = selectedSurvivorId === surv.id;
                const isImmediate = surv.triage === 'immediate';
                const ringColor = isImmediate ? '#ef4444' : '#f59e0b';

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
                      r="22"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="1.5"
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      cx={surv.location.x}
                      cy={surv.location.y}
                      r="14"
                      fill={isImmediate ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}
                      stroke={ringColor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Heart/Cross Icon */}
                    <circle cx={surv.location.x} cy={surv.location.y} r="5" fill={ringColor} />

                    {/* Vital Sign HUD Badge */}
                    <g transform={`translate(${surv.location.x + 18}, ${surv.location.y - 12})`}>
                      <rect
                        x="0"
                        y="0"
                        width="120"
                        height="36"
                        fill="rgba(10, 15, 26, 0.92)"
                        stroke={ringColor}
                        strokeWidth="1"
                        rx="4"
                      />
                      <text
                        x="8"
                        y="14"
                        fill={ringColor}
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {surv.label.split(' ')[0]} [{surv.triage.toUpperCase()}]
                      </text>
                      <text
                        x="8"
                        y="27"
                        fill="#e2e8f0"
                        fontSize="8"
                        fontFamily="JetBrains Mono"
                      >
                        ❤️ {surv.vitals.heartRate} BPM • {surv.vitals.spO2}% SpO2
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* ROBOT SWARM LAYER (Including Ghost Mode for Disconnected Bots) */}
            {robots.map((bot) => {
              const isSelected = selectedRobotId === bot.id;
              const isDisconnected = bot.commsStatus === 'disconnected';
              const isDegraded = bot.commsStatus === 'degraded';

              // GHOST MODE RENDERING FOR DISCONNECTED ROBOTS
              if (isDisconnected) {
                const projectedX = bot.lastKnownPosition.x + bot.deadReckoningVector.dx * 35;
                const projectedY = bot.lastKnownPosition.y + bot.deadReckoningVector.dy * 35;

                return (
                  <g key={bot.id} className="cursor-pointer" onClick={() => selectRobot(bot.id)}>
                    {/* Last confirmed position anchor */}
                    <circle
                      cx={bot.lastKnownPosition.x}
                      cy={bot.lastKnownPosition.y}
                      r="10"
                      fill="rgba(244, 63, 94, 0.2)"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={bot.lastKnownPosition.x}
                      cy={bot.lastKnownPosition.y}
                      r="4"
                      fill="#f43f5e"
                    />

                    {/* Projected Dead Reckoning Vector (Dashed Trajectory) */}
                    <line
                      x1={bot.lastKnownPosition.x}
                      y1={bot.lastKnownPosition.y}
                      x2={projectedX}
                      y2={projectedY}
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />

                    {/* Uncertainty Ellipse / Circle around estimated location */}
                    <circle
                      cx={projectedX}
                      cy={projectedY}
                      r="26"
                      fill="rgba(244, 63, 94, 0.1)"
                      stroke="#f43f5e"
                      strokeWidth="1"
                      strokeDasharray="2,3"
                      className="animate-pulse"
                    />

                    {/* Ghost Icon at Projected Position */}
                    <g transform={`translate(${projectedX - 10}, ${projectedY - 10})`}>
                      <rect
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        fill="rgba(30, 41, 59, 0.85)"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        rx="4"
                      />
                      <text x="10" y="14" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">
                        👻
                      </text>
                    </g>

                    {/* Ghost Status Chip */}
                    <g transform={`translate(${projectedX + 16}, ${projectedY - 18})`}>
                      <rect
                        x="0"
                        y="0"
                        width="155"
                        height="42"
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                        rx="4"
                      />
                      <text x="8" y="14" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                        ⚠️ {bot.name} [GHOST MODE]
                      </text>
                      <text x="8" y="26" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">
                        LOST: {Math.floor(bot.lastContactSecondsAgo / 60)}m {bot.lastContactSecondsAgo % 60}s AGO
                      </text>
                      <text x="8" y="37" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">
                        📦 {bot.storeAndForwardBacklog} PKTS BUFFERED
                      </text>
                    </g>
                  </g>
                );
              }

              // CONNECTED OR DEGRADED ROBOT RENDERING
              const botColor = isDegraded ? '#f59e0b' : '#00f0ff';

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
                      r="22"
                      fill="none"
                      stroke={botColor}
                      strokeWidth="2"
                      strokeDasharray="4,2"
                      className="animate-spin"
                    />
                  )}

                  {/* Heading Direction Arrow */}
                  <line
                    x1={bot.position.x}
                    y1={bot.position.y}
                    x2={bot.position.x + Math.cos((bot.heading * Math.PI) / 180) * 16}
                    y2={bot.position.y + Math.sin((bot.heading * Math.PI) / 180) * 16}
                    stroke={botColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Robot Center Body */}
                  <rect
                    x={bot.position.x - 9}
                    y={bot.position.y - 9}
                    width="18"
                    height="18"
                    fill={isSelected ? '#083344' : '#0f172a'}
                    stroke={botColor}
                    strokeWidth={isSelected ? '2.5' : '1.8'}
                    rx="4"
                  />

                  {/* Inner glyph */}
                  <circle cx={bot.position.x} cy={bot.position.y} r="3" fill={botColor} />

                  {/* Mini floating label */}
                  <g transform={`translate(${bot.position.x + 12}, ${bot.position.y - 12})`}>
                    <rect
                      x="0"
                      y="0"
                      width="80"
                      height="24"
                      fill="rgba(6, 11, 20, 0.9)"
                      stroke={botColor}
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x="6"
                      y="11"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {bot.name}
                    </text>
                    <text
                      x="6"
                      y="20"
                      fill={bot.battery < 30 ? '#ef4444' : '#34d399'}
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                    >
                      ⚡ {Math.round(bot.battery)}% • 📶 {bot.signalStrength}%
                    </text>
                  </g>
                </g>
              );
            })}

          </g>
        </svg>

        {/* Floating Quick Action Widget for Selected Entity */}
        {selectedRobotId && (
          <div className="absolute bottom-4 left-4 z-20 p-3 rounded-lg bg-slate-900/95 border border-cyan-500/40 shadow-xl backdrop-blur max-w-sm">
            {(() => {
              const bot = robots.find((r) => r.id === selectedRobotId);
              if (!bot) return null;
              return (
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold text-slate-100 tactical-font text-sm">{bot.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {bot.callsign}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 capitalize">{bot.type.replace('_', ' ')}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono mb-3 line-clamp-2">
                    {bot.currentTask}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openFpv(bot.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>FPV Tele-Op</span>
                    </button>

                    {bot.commsStatus === 'disconnected' && (
                      <button
                        onClick={() => restoreComms(bot.id)}
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-colors flex items-center gap-1"
                      >
                        <Signal className="w-3.5 h-3.5" />
                        <span>Force Reconnect</span>
                      </button>
                    )}

                    <button
                      onClick={() => deployBeaconAt(bot.position.x + 20, bot.position.y + 20)}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs transition-colors"
                      title="Drop Mesh Relay Beacon Here"
                    >
                      <Radio className="w-3.5 h-3.5" />
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
