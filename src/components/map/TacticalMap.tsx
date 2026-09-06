import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { useMission } from '../../store/MissionContext';
import {
  Layers,
  Radio,
  Eye,
  Signal,
  Send,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Minus,
  RotateCcw,
  Compass,
  Map as MapIcon,
  Crosshair,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface TacticalMapProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// BITS Pilani Dubai Campus & Sector 4 Collapse Bounds
const CENTER_LAT = 25.1288;
const CENTER_LNG = 55.4186;

// Expanded DIAC / BITS Pilani Dubai Campus Sector 4
const BOUNDS_NORTH = 25.1360;
const BOUNDS_SOUTH = 25.1210;
const BOUNDS_WEST = 55.4080;
const BOUNDS_EAST = 55.4290;

// Converts SVG coords [0..800, 0..620] into geographic [Lat, Lng] within DIAC sector
const svgToGeo = (x: number, y: number): [number, number] => {
  const clampedX = Math.max(0, Math.min(800, x));
  const clampedY = Math.max(0, Math.min(620, y));
  const lat = BOUNDS_NORTH - (clampedY / 620) * (BOUNDS_NORTH - BOUNDS_SOUTH);
  const lng = BOUNDS_WEST + (clampedX / 800) * (BOUNDS_EAST - BOUNDS_WEST);
  return [lat, lng];
};

export const TacticalMap: React.FC<TacticalMapProps> = ({
  isExpanded = false,
  onToggleExpand,
}) => {
  const {
    overview,
    robots,
    survivors,
    hazards,
    routes,
    beacons,
    layers,
    isTourOpen,
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

  // Local state
  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('satellite');
  const [filterSurvivors, setFilterSurvivors] = useState<boolean>(true);
  const [filterHazards, setFilterHazards] = useState<boolean>(true);
  const [filterRoutes, setFilterRoutes] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(16);

  // References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.Layer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const perimeterLayerRef = useRef<L.Rectangle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [CENTER_LAT, CENTER_LNG],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        minZoom: 13,
        maxZoom: 19,
      });

      // Ultra-crisp Satellite Imagery as default basemap
      const satTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: '' }
      );
      const initialGroup = L.layerGroup([satTile]).addTo(map);
      satTile.bringToBack();
      tileLayerRef.current = initialGroup;

      // Disaster Zone Perimeter (Red Dashed Box)
      const disasterBounds: L.LatLngBoundsExpression = [
        [BOUNDS_NORTH, BOUNDS_WEST],
        [BOUNDS_SOUTH, BOUNDS_EAST],
      ];
      const perimeter = L.rectangle(disasterBounds, {
        color: '#ef4444',
        weight: 2,
        dashArray: '8, 8',
        fillColor: '#991b1b',
        fillOpacity: 0.18,
      }).addTo(map);

      perimeter.bindTooltip('DISASTER PERIMETER // SECTOR 4 COLLAPSE ZONE', {
        permanent: false,
        direction: 'top',
        className: 'tactical-tooltip-perimeter',
      });
      perimeterLayerRef.current = perimeter;

      // Layer groups for markers and routes
      routesLayerGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if mapMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapMode === 'satellite') {
      // Ultra-crisp Satellite Imagery
      const satTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: '' }
      );
      const group = L.layerGroup([satTile]).addTo(mapInstanceRef.current);
      satTile.bringToBack();
      tileLayerRef.current = group;
    } else {
      // Tactical Dark Canvas (Esri Base + Reference Labels)
      const baseTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: '' }
      );
      const refLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: '' }
      );
      const group = L.layerGroup([baseTile, refLabels]).addTo(mapInstanceRef.current);
      baseTile.bringToBack();
      tileLayerRef.current = group;
    }
  }, [mapMode]);

  // Invalidate map size whenever container dimensions change (ResizeObserver)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Render Routes and Polylines
  useEffect(() => {
    if (!routesLayerGroupRef.current) return;
    routesLayerGroupRef.current.clearLayers();

    if (!filterRoutes || !layers.routes) return;

    routes.forEach((route) => {
      if (!route.points || route.points.length < 2) return;
      const latlngs: [number, number][] = route.points.map((pt) => svgToGeo(pt.x, pt.y));

      const isClear = route.status === 'clear';
      const polyline = L.polyline(latlngs, {
        color: isClear ? '#06b6d4' : '#ef4444',
        weight: isClear ? 3 : 2.5,
        dashArray: isClear ? undefined : '6, 6',
        opacity: isClear ? 0.85 : 0.75,
      });

      polyline.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">ROUTE: <b>${route.name}</b> (${route.status.toUpperCase()})</div>`,
        { sticky: true }
      );

      routesLayerGroupRef.current?.addLayer(polyline);
    });
  }, [routes, filterRoutes, layers.routes]);

  // Render Markers (Robots, Survivors, Hazards, Beacons)
  useEffect(() => {
    if (!markersLayerGroupRef.current) return;
    markersLayerGroupRef.current.clearLayers();

    // 1. Robots
    robots.forEach((robot) => {
      const [lat, lng] = svgToGeo(robot.position.x, robot.position.y);
      const isSelected = selectedRobotId === robot.id;
      const isGhost = robot.commsStatus === 'disconnected';
      const callsignShort = robot.callsign.replace('CYB-', '').replace('VUL-', '');

      const markerHtml = `
        <div class="tactical-leaflet-marker ${isGhost ? 'ghost' : ''} ${isSelected ? 'selected' : ''}">
          <div class="marker-badge">${callsignShort}</div>
          <div class="marker-callsign">${robot.callsign}</div>
          <div class="tactical-bot-pulse"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'tactical-div-icon',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lat, lng], { icon });

      marker.on('click', () => {
        soundManager.playTacticalClick();
        selectRobot(robot.id);
      });

      marker.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px; line-height: 1.4;">
          <div style="font-weight: bold; color: ${isGhost ? '#f43f5e' : '#38bdf8'}">
            ${robot.name} (${robot.callsign})
          </div>
          <div style="color: #94a3b8;">Status: ${robot.commsStatus.toUpperCase()}</div>
          <div style="color: #94a3b8;">Battery: ${Math.round(robot.battery)}% | Signal: ${robot.signalStrength}%</div>
          <div style="color: #e2e8f0;">${robot.currentTask}</div>
        </div>
      `, { offset: [0, -15], direction: 'top' });

      markersLayerGroupRef.current?.addLayer(marker);
    });

    // 2. Survivors
    if (filterSurvivors) {
      survivors.forEach((survivor) => {
        const [lat, lng] = svgToGeo(survivor.location.x, survivor.location.y);
        const isSelected = selectedSurvivorId === survivor.id;
        const isAssigned = !!survivor.assignedRobotId;

        const markerHtml = `
          <div class="tactical-leaflet-marker survivor ${isSelected ? 'selected' : ''}">
            <div class="marker-badge survivor-badge">♥</div>
            <div class="marker-callsign" style="color: #f87171;">${survivor.label}</div>
            <div class="tactical-surv-pulse"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'tactical-div-icon',
          html: markerHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon });

        marker.on('click', () => {
          soundManager.playTacticalClick();
          selectSurvivor(survivor.id);
        });

        marker.bindTooltip(`
          <div style="font-family: monospace; font-size: 11px; line-height: 1.4;">
            <div style="font-weight: bold; color: #f87171;">
              ♥ ${survivor.label} [${survivor.triage.toUpperCase()}]
            </div>
            <div style="color: #94a3b8;">Depth: ${survivor.location.depthMeters}m | HR: ${survivor.vitals.heartRate} BPM</div>
            <div style="color: #cbd5e1;">${survivor.notes}</div>
            ${isAssigned ? '<div style="color: #34d399; font-weight: bold;">✓ Vulcan-X Dispatched</div>' : '<div style="color: #fb7185;">● Pending Dispatch</div>'}
          </div>
        `, { offset: [0, -15], direction: 'top' });

        markersLayerGroupRef.current?.addLayer(marker);
      });
    }

    // 3. Hazards
    if (filterHazards) {
      hazards.forEach((hazard) => {
        const [lat, lng] = svgToGeo(hazard.location.x, hazard.location.y);
        const isSelected = selectedHazardId === hazard.id;
        const isBio = hazard.type === 'gas_leak';

        const markerHtml = `
          <div class="tactical-leaflet-marker hazard ${isSelected ? 'selected' : ''}">
            <div class="marker-badge hazard-badge">${isBio ? '☣' : '!'}</div>
            <div class="marker-callsign" style="color: #fbbf24;">${hazard.type.replace('_', ' ').toUpperCase()}</div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'tactical-div-icon',
          html: markerHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([lat, lng], { icon });

        marker.on('click', () => {
          soundManager.playTacticalClick();
          selectHazard(hazard.id);
        });

        marker.bindTooltip(`
          <div style="font-family: monospace; font-size: 11px; line-height: 1.4;">
            <div style="font-weight: bold; color: #fbbf24;">
              ${isBio ? '☣' : '⚠'} ${hazard.title} [${hazard.severity.toUpperCase()}]
            </div>
            <div style="color: #fde68a;">${hazard.readout}</div>
            <div style="color: #94a3b8;">Perimeter: ${hazard.location.radius}m | Sector: ${hazard.location.sector}</div>
          </div>
        `, { offset: [0, -15], direction: 'top' });

        markersLayerGroupRef.current?.addLayer(marker);
      });
    }

    // 4. Beacons (Relays)
    beacons.forEach((beacon) => {
      const [lat, lng] = svgToGeo(beacon.x, beacon.y);
      const markerHtml = `
        <div class="tactical-leaflet-marker beacon">
          <div class="marker-badge beacon-badge">RF</div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'tactical-div-icon',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon });
      marker.bindTooltip(`<div style="font-family: monospace; font-size: 11px;">MESH RELAY // ${beacon.id} (${beacon.batteryHours}h BAT)</div>`, {
        offset: [0, -10],
        direction: 'top',
      });
      markersLayerGroupRef.current?.addLayer(marker);
    });
  }, [
    robots,
    survivors,
    hazards,
    beacons,
    selectedRobotId,
    selectedSurvivorId,
    selectedHazardId,
    filterSurvivors,
    filterHazards,
    selectRobot,
    selectSurvivor,
    selectHazard,
  ]);

  // Selected Entities for Inspector Panel
  const selectedRobot = robots.find((r) => r.id === selectedRobotId);
  const selectedSurvivor = survivors.find((s) => s.id === selectedSurvivorId);
  const selectedHazard = hazards.find((h) => h.id === selectedHazardId);

  // Map Controls
  const handleZoomIn = () => {
    soundManager.playTacticalClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    soundManager.playTacticalClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    soundManager.playTacticalClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([CENTER_LAT, CENTER_LNG], 16, { duration: 0.8 });
    }
  };

  const getRobotEmoji = (type: string) => {
    switch (type) {
      case 'snake':
        return '🐍';
      case 'quadruped':
        return '🐕';
      case 'drone':
        return '🛸';
      case 'crawler':
        return '🚜';
      default:
        return '🤖';
    }
  };

  return (
    <div
      data-tour="tactical-map"
      className={`relative flex flex-col w-full h-full bg-[#050914] text-slate-100 overflow-hidden font-sans ${
        ''
      }`}
    >
      {/* Top Tactical Map C2 Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-[#07101e]/90 backdrop-blur z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <MapIcon className="w-3.5 h-3.5" />
            <span>GIS TACTICAL DECK // BITS DUBAI SECTOR 4</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
            LAT: {CENTER_LAT}°N LNG: {CENTER_LNG}°E
          </span>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center gap-2">
          {/* Carto vs Satellite Mode Toggle */}
          <div className="flex items-center rounded bg-slate-900 border border-slate-700/80 p-0.5 font-mono text-xs">
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setMapMode('dark');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                mapMode === 'dark'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => {
                soundManager.playTacticalClick();
                setMapMode('satellite');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                mapMode === 'satellite'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
          </div>


        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full h-full min-h-0">
        {/* Leaflet DOM Node Container */}
        <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#050914' }} />

        {/* Top-Left Floating Filter Buttons */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-[#08101e]/90 p-1 rounded-md border border-cyan-500/30 backdrop-blur shadow-lg font-mono text-[10px]">
          <button
            onClick={() => {
              soundManager.playTacticalClick();
              setFilterSurvivors(!filterSurvivors);
            }}
            className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-all ${
              filterSurvivors
                ? 'bg-rose-950/90 text-rose-300 border border-rose-600/70 shadow'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Survivors Overlay"
          >
            <span>♥</span>
            <span>SURV ({survivors.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTacticalClick();
              setFilterHazards(!filterHazards);
            }}
            className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-all ${
              filterHazards
                ? 'bg-amber-950/90 text-amber-300 border border-amber-600/70 shadow'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Hazards Overlay"
          >
            <span>⚠</span>
            <span>HAZ ({hazards.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTacticalClick();
              setFilterRoutes(!filterRoutes);
            }}
            className={`px-2 py-1 rounded font-bold flex items-center gap-1 transition-all ${
              filterRoutes
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-600/70 shadow'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Ingress Routes"
          >
            <span>NAV</span>
          </button>
        </div>

        {/* Top-Right Tactical Zoom & Recenter Controls */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 bg-[#08101e]/90 p-1 rounded-md border border-cyan-500/30 backdrop-blur shadow-lg font-mono">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded flex items-center justify-center bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded flex items-center justify-center bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-7 h-7 rounded flex items-center justify-center bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 border border-slate-700 hover:border-cyan-500 transition-colors"
            title="Recenter on BITS Dubai Base (25.1288°N, 55.4186°E)"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <div className="text-[9px] text-center text-slate-400 font-bold border-t border-slate-700/60 pt-0.5">
            Z{currentZoom}
          </div>
        </div>

        {/* Bottom-Left Geocode Sector Badge */}
        <div className="absolute bottom-8 left-3 z-20 pointer-events-none hidden sm:block">
          <div className="px-2.5 py-1 rounded bg-[#08101e]/85 border border-cyan-500/30 backdrop-blur text-[9px] font-mono text-cyan-300/90 shadow-md">
            DUBAI • DIAC / BITS PILANI DUBAI CAMPUS • SECTOR 4 COLLAPSE ZONE
          </div>
        </div>

        {/* DOCKED ENTITY INSPECTOR PANEL (At Bottom-Left when entity selected) */}
        {!isTourOpen && (selectedRobot || selectedSurvivor || selectedHazard) && (
          <div className="absolute bottom-9 left-3 z-30 p-3 rounded-md bg-[#08101e]/95 border border-cyan-500/40 shadow-2xl backdrop-blur w-80 max-w-[calc(100%-24px)] max-h-[calc(100%-110px)] overflow-y-auto no-scrollbar font-mono text-xs select-none">
            {/* Robot Inspector */}
            {selectedRobot && (
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">{getRobotEmoji(selectedRobot.type)}</span>
                    <span className="font-bold text-white text-sm truncate">{selectedRobot.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold shrink-0">
                      {selectedRobot.callsign}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
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
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-sm border border-slate-800">
                    <span>⚡ Battery:</span>
                    <span className={`font-bold ${selectedRobot.battery < 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round(selectedRobot.battery)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-sm border border-slate-800">
                    <span>📶 Signal:</span>
                    <span className={`font-bold ${selectedRobot.signalStrength < 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {selectedRobot.signalStrength}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 mb-2.5 leading-relaxed bg-slate-900/50 p-1.5 rounded-sm border border-slate-800/60 break-words">
                  <strong className="text-cyan-400">Mission:</strong> {selectedRobot.currentTask}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openFpv(selectedRobot.id)}
                    className="flex-1 py-1.5 px-3 rounded-md bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open FPV Cockpit</span>
                  </button>

                  {selectedRobot.commsStatus === 'disconnected' && (
                    <button
                      onClick={() => restoreComms(selectedRobot.id)}
                      className="py-1.5 px-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-all shrink-0"
                    >
                      <Signal className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>
                  )}

                  <button
                    onClick={() => deployBeaconAt(selectedRobot.position.x + 20, selectedRobot.position.y + 20)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors shrink-0"
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
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">❤️</span>
                    <span className="font-bold text-white text-sm truncate">{selectedSurvivor.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-rose-950 text-rose-300 border border-rose-700 font-bold animate-pulse">
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
                  <div className="bg-slate-900/80 p-1.5 rounded-sm border border-slate-800">
                    <span className="text-slate-400">Heart Rate: </span>
                    <strong className="text-rose-400">{selectedSurvivor.vitals.heartRate} BPM</strong>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded-sm border border-slate-800">
                    <span className="text-slate-400">Oxygen SpO2: </span>
                    <strong className="text-cyan-400">{selectedSurvivor.vitals.spO2}%</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 mb-2.5 bg-slate-900/50 p-1.5 rounded-sm border border-slate-800/60 leading-relaxed break-words">
                  <strong className="text-amber-400">Entrapment:</strong> Depth {selectedSurvivor.location.depthMeters}m • {selectedSurvivor.notes}
                </div>

                {selectedSurvivor.assignedRobotId ? (
                  <div className="w-full py-2 px-3 rounded-md bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>✓ {selectedSurvivor.assignedRobotId} En Route (Life Support Deployed)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => dispatchRobotToSurvivor('ROB-02', selectedSurvivor.id)}
                    className="w-full py-2 px-3 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Vulcan-X Life Support</span>
                  </button>
                )}
              </div>
            )}

            {/* Hazard Inspector */}
            {!selectedRobot && !selectedSurvivor && selectedHazard && (
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">{selectedHazard.type === 'gas_leak' ? '☣' : '⚠'}</span>
                    <span className="font-bold text-white text-sm truncate">{selectedHazard.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-950 text-amber-300 border border-amber-700 font-bold">
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

                <div className="text-xs text-amber-300 font-bold mb-2 bg-amber-950/40 p-2 rounded-sm border border-amber-500/40 break-words leading-snug">
                  {selectedHazard.readout}
                </div>

                <p className="text-[11px] text-slate-400 mb-1">
                  Location: {selectedHazard.location.sector} • Perimeter: {selectedHazard.location.radius}m
                </p>
              </div>
            )}
          </div>
        )}

        {/* DOCKED TACTICAL MAP LEGEND HUD STRIP */}
        <div className="absolute bottom-0 left-0 right-0 z-20 hidden md:flex items-center justify-between px-3 py-1 bg-[#050914]/90 border-t border-slate-800/90 text-[9px] font-mono text-slate-400 select-none backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider">GIS SYMBOLOGY // INSARAG</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">
              GIS: UTM ZONE 40R (DUBAI) • WGS-84 | BASE: 25.1288° N, 55.4186° E • DIAC BLDG 4 (BPDC) • ELEV: 14m AMSL
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Active Bot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Ghost Bot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Survivor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Hazard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-sm bg-cyan-400" />
              <span>Safe Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-sm bg-rose-500" />
              <span>Blocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
