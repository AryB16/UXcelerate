import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Robot, Survivor, Hazard, SectorRoute, MeshRelayBeacon, Sector, TacticalLog, MissionOverview, ReroutePromptState } from '../types';
import {
  initialMissionOverview,
  initialSectors,
  initialRobots,
  initialSurvivors,
  initialHazards,
  initialRoutes,
  initialBeacons,
  initialLogs,
} from './initialData';
import { soundManager } from '../utils/sound';

export interface MapLayersState {
  blueprint: boolean;
  slam: boolean;
  mesh: boolean;
  hazards: boolean;
  routes: boolean;
  vitals: boolean;
  staleness: boolean;
}

interface MissionContextType {
  overview: MissionOverview;
  sectors: Sector[];
  robots: Robot[];
  survivors: Survivor[];
  hazards: Hazard[];
  routes: SectorRoute[];
  beacons: MeshRelayBeacon[];
  logs: TacticalLog[];
  layers: MapLayersState;
  selectedRobotId: string | null;
  selectedSurvivorId: string | null;
  selectedHazardId: string | null;
  selectedSectorId: string | null;
  isSimPaused: boolean;
  isAudioMuted: boolean;
  isFpvOpen: boolean;
  fpvRobotId: string | null;
  isCaseStudyOpen: boolean;
  activeCaseStudyTab: string;
  isStoreAndForwardSyncing: boolean;
  isTourOpen: boolean;
  tourStep: number;
  reroutePrompt: ReroutePromptState | null;

  // Actions
  selectRobot: (id: string | null) => void;
  selectSurvivor: (id: string | null) => void;
  selectHazard: (id: string | null) => void;
  selectSector: (id: string | null) => void;
  toggleLayer: (layer: keyof MapLayersState) => void;
  toggleSimPaused: () => void;
  toggleAudio: () => void;
  openFpv: (robotId: string) => void;
  closeFpv: () => void;
  setIsCaseStudyOpen: (open: boolean) => void;
  setActiveCaseStudyTab: (tab: string) => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToTourStep: (step: number) => void;
  endTour: () => void;
  confirmReroute: () => void;
  dismissReroute: () => void;
  
  // Disaster simulation triggers
  triggerAftershock: () => void;
  triggerCommsDrop: (robotId?: string) => void;
  restoreComms: (robotId: string) => void;
  discoverNewSurvivor: () => void;
  deployBeaconAt: (x: number, y: number, label?: string) => void;
  dispatchRobotToSurvivor: (robotId: string, survivorId: string) => void;
  manualMoveRobot: (robotId: string, dx: number, dy: number, newHeading?: number) => void;
  toggleHazardStatus: (hazardId: string) => void;
  setRobotTask: (robotId: string, task: string) => void;
  addTacticalLog: (type: 'emergency' | 'warning' | 'info' | 'success', source: string, message: string, relatedId?: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [overview, setOverview] = useState<MissionOverview>(initialMissionOverview);
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [robots, setRobots] = useState<Robot[]>(initialRobots);
  const [survivors, setSurvivors] = useState<Survivor[]>(initialSurvivors);
  const [hazards, setHazards] = useState<Hazard[]>(initialHazards);
  const [routes, setRoutes] = useState<SectorRoute[]>(initialRoutes);
  const [beacons, setBeacons] = useState<MeshRelayBeacon[]>(initialBeacons);
  const [logs, setLogs] = useState<TacticalLog[]>(initialLogs);

  const [layers, setLayers] = useState<MapLayersState>({
    blueprint: true,
    slam: true,
    mesh: true,
    hazards: true,
    routes: true,
    vitals: true,
    staleness: true,
  });

  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [selectedSurvivorId, setSelectedSurvivorId] = useState<string | null>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(soundManager.getMuted());
  const [isFpvOpen, setIsFpvOpen] = useState<boolean>(false);
  const [fpvRobotId, setFpvRobotId] = useState<string | null>(null);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState<boolean>(false);
  const [activeCaseStudyTab, setActiveCaseStudyTab] = useState<string>('executive_summary');
  const [isStoreAndForwardSyncing, setIsStoreAndForwardSyncing] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);
  const [reroutePrompt, setReroutePrompt] = useState<ReroutePromptState | null>(null);

  const addTacticalLog = useCallback((
    type: 'emergency' | 'warning' | 'info' | 'success',
    source: string,
    message: string,
    relatedId?: string
  ) => {
    const time = new Date().toTimeString().split(' ')[0];
    const newLog: TacticalLog = {
      id: `LOG-${Date.now()}`,
      timestamp: time,
      type,
      source,
      message,
      relatedEntityId: relatedId,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  }, []);

  // Periodic heartbeat simulation: updates elapsed comms timers, gentle robot wander, telemetry jitter
  useEffect(() => {
    if (isSimPaused) return;

    const interval = setInterval(() => {
      setRobots((prevRobots) =>
        prevRobots.map((robot) => {
          if (robot.commsStatus === 'disconnected') {
            return {
              ...robot,
              lastContactSecondsAgo: robot.lastContactSecondsAgo + 2,
              storeAndForwardBacklog: robot.storeAndForwardBacklog + 1,
            };
          }

          // Small natural movement for active patrolling robots
          const wanderSpeed = 0.5;
          const dx = (Math.random() - 0.5) * wanderSpeed;
          const dy = (Math.random() - 0.5) * wanderSpeed;

          // Random slight signal jitter
          const signalJitter = Math.floor((Math.random() - 0.5) * 3);
          const newSignal = Math.max(20, Math.min(100, robot.signalStrength + signalJitter));

          return {
            ...robot,
            position: {
              ...robot.position,
              x: Math.max(50, Math.min(750, robot.position.x + dx)),
              y: Math.max(50, Math.min(610, robot.position.y + dy)),
            },
            signalStrength: newSignal,
            battery: Math.max(5, robot.battery - 0.005),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimPaused]);

  const selectRobot = (id: string | null) => {
    soundManager.playTacticalClick();
    setSelectedRobotId(id);
    if (id) {
      setSelectedSurvivorId(null);
      setSelectedHazardId(null);
    }
  };

  const selectSurvivor = (id: string | null) => {
    soundManager.playTacticalClick();
    setSelectedSurvivorId(id);
    if (id) {
      setSelectedRobotId(null);
      setSelectedHazardId(null);
    }
  };

  const selectHazard = (id: string | null) => {
    soundManager.playTacticalClick();
    setSelectedHazardId(id);
    if (id) {
      setSelectedRobotId(null);
      setSelectedSurvivorId(null);
    }
  };

  const selectSector = (id: string | null) => {
    soundManager.playTacticalClick();
    setSelectedSectorId(id);
  };

  const toggleLayer = (layer: keyof MapLayersState) => {
    soundManager.playTacticalClick();
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const toggleSimPaused = () => {
    soundManager.playTacticalClick();
    setIsSimPaused((prev) => !prev);
  };

  const toggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
  };

  const openFpv = (robotId: string) => {
    soundManager.playTacticalClick();
    setFpvRobotId(robotId);
    setIsFpvOpen(true);
  };

  const closeFpv = () => {
    soundManager.playTacticalClick();
    setIsFpvOpen(false);
  };

  const syncEntitiesForTourStep = (step: number) => {
    if (step === 0) {
      // Step 1: Test Bench Controls
      setSelectedRobotId(null);
      setSelectedSurvivorId(null);
      setSelectedHazardId(null);
    } else if (step === 1) {
      // Step 2: Robot Roster & Telemetry
      setSelectedRobotId('ROB-02'); // Select K9-TITAN
      setSelectedSurvivorId(null);
      setSelectedHazardId(null);
    } else if (step === 2) {
      // Step 3: Tactical Map
      setSelectedRobotId('ROB-01'); // SkyEye-1 aerial drone
      setSelectedSurvivorId(null);
      setSelectedHazardId(null);
    } else if (step === 3) {
      // Step 4: Offline Radio (Ghost Mode)
      setSelectedRobotId('ROB-03'); // Serpens-3 crawler (disconnected ghost mode)
      setSelectedSurvivorId(null);
      setSelectedHazardId(null);
    } else if (step === 4) {
      // Step 5: Survivor Rescue & START Triage
      setSelectedSurvivorId('SURV-01'); // Select Survivor #1
      setSelectedRobotId(null);
      setSelectedHazardId(null);
    }
  };

  const startTour = () => {
    soundManager.playTacticalClick();
    setTourStep(0);
    setIsTourOpen(true);
    syncEntitiesForTourStep(0);
  };

  const nextTourStep = () => {
    soundManager.playTacticalClick();
    setTourStep((prev) => {
      const next = prev + 1;
      if (next > 4) {
        setIsTourOpen(false);
        return 0;
      }
      syncEntitiesForTourStep(next);
      return next;
    });
  };

  const prevTourStep = () => {
    soundManager.playTacticalClick();
    setTourStep((prev) => {
      const next = Math.max(0, prev - 1);
      syncEntitiesForTourStep(next);
      return next;
    });
  };

  const goToTourStep = (step: number) => {
    soundManager.playTacticalClick();
    const clamped = Math.max(0, Math.min(4, step));
    setTourStep(clamped);
    syncEntitiesForTourStep(clamped);
  };

  const endTour = () => {
    soundManager.playTacticalClick();
    setIsTourOpen(false);
  };

  const confirmReroute = () => {
    soundManager.playTacticalClick();
    // Update RTE-01 to indicate confirmed active reroute
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === 'RTE-01'
          ? {
              ...r,
              status: 'clear',
              description: 'ACTIVE EVAC CORRIDOR: Rerouted rescue team and swarm safe transit confirmed via North Wing void.',
            }
          : r
      )
    );
    setReroutePrompt(null);
    addTacticalLog(
      'success',
      'AUTOPATH_REROUTE',
      'RE-ROUTE CONFIRMED: Human rescue team & swarm diverted to Corridor Alpha-1. Hazard bypass established.'
    );
  };

  const dismissReroute = () => {
    soundManager.playTacticalClick();
    setReroutePrompt(null);
    addTacticalLog(
      'warning',
      'AUTOPATH_REROUTE',
      'RE-ROUTE DEFERRED: Operator acknowledged Corridor Beta blockage. Manual squad navigation active.'
    );
  };

  // TRIGGER AFTERSHOCK SCENARIO
  const triggerAftershock = () => {
    soundManager.playEmergencyAlarm();

    // Block Corridor Beta
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === 'RTE-02'
          ? {
              ...r,
              status: 'blocked',
              riskScore: 92,
              description: 'AFTERSHOCK COLLAPSE: 8-ton ceiling joist fell across void threshold. RE-ROUTE REQUIRED.',
            }
          : r
      )
    );

    // Hazard escalation
    setHazards((prev) => [
      {
        id: `HAZ-${Date.now().toString().slice(-4)}`,
        type: 'structural_collapse',
        severity: 'critical',
        title: 'Secondary Floor Inversion — Sector Beta',
        location: { x: 500, y: 240, radius: 50, sector: 'Sector Beta' },
        readout: 'Post-Shock Tremor 5.2M / Unstable Slab Movement',
        status: 'active',
        timestamp: new Date().toTimeString().split(' ')[0],
      },
      ...prev,
    ]);

    setOverview((prev) => ({
      ...prev,
      aftershockRiskLevel: 'CRITICAL',
      activeHazards: prev.activeHazards + 1,
    }));

    addTacticalLog(
      'emergency',
      'SEISMIC_ALERT',
      'SEISMIC EVENT DETECTED: Magnitude 5.2 Aftershock. Secondary collapse in Sector Beta. Auto-rerouting swarm!'
    );

    // High-visibility reactive reroute prompt
    setReroutePrompt({
      isOpen: true,
      blockedRouteId: 'RTE-02',
      alternateRouteId: 'RTE-01',
      title: '⚠️ CORRIDOR BETA BLOCKED BY JOIST COLLAPSE',
      message: 'Secondary structural collapse rendered Corridor Beta impassable. Reroute human rescue squad & swarm via Corridor Alpha-1 (Safe Void)?',
    });
  };

  // TRIGGER COMMS BLACKOUT SCENARIO
  const triggerCommsDrop = (targetRobotId?: string) => {
    soundManager.playRadioStatic();
    const idToDrop = targetRobotId || 'ROB-02';

    setRobots((prev) =>
      prev.map((r) => {
        if (r.id === idToDrop) {
          return {
            ...r,
            status: 'disconnected',
            commsStatus: 'disconnected',
            signalStrength: 0,
            latencyMs: 9999,
            lastKnownPosition: { x: r.position.x, y: r.position.y, timestamp: Date.now() },
            lastContactSecondsAgo: 1,
            deadReckoningVector: { dx: 0.4, dy: -0.2, speed: 0.8 },
          };
        }
        return r;
      })
    );

    setOverview((prev) => ({
      ...prev,
      overallMeshIntegrity: Math.max(40, prev.overallMeshIntegrity - 22),
    }));

    addTacticalLog(
      'emergency',
      'MESH_CORE',
      `RF CARRIER LOST: ${idToDrop} dropped below threshold. Autonomous dead reckoning engaged. Packets buffered.`,
      idToDrop
    );
  };

  // RESTORE COMMS SCENARIO (Store-and-Forward sync)
  const restoreComms = (robotId: string) => {
    setIsStoreAndForwardSyncing(true);
    soundManager.playReconnectChime();

    setTimeout(() => {
      setRobots((prev) =>
        prev.map((r) => {
          if (r.id === robotId) {
            return {
              ...r,
              status: 'patrol',
              commsStatus: 'connected',
              signalStrength: 85,
              latencyMs: 28,
              lastContactSecondsAgo: 0,
              storeAndForwardBacklog: 0,
            };
          }
          return r;
        })
      );

      setOverview((prev) => ({
        ...prev,
        overallMeshIntegrity: Math.min(96, prev.overallMeshIntegrity + 18),
      }));

      setIsStoreAndForwardSyncing(false);

      addTacticalLog(
        'success',
        'STORE_AND_FORWARD',
        `TELEMETRY SYNC COMPLETE: ${robotId} reconnected. Ingested all buffered SLAM voxels and biosignals.`,
        robotId
      );
    }, 1200);
  };

  // DISCOVER NEW SURVIVOR SCENARIO
  const discoverNewSurvivor = () => {
    soundManager.playSonarPing();

    const newId = `SURV-0${survivors.length + 1}`;
    const newSurv: Survivor = {
      id: newId,
      label: `Survivor #${survivors.length + 1} (Acoustic Void)`,
      discoveredBy: 'ROB-01',
      discoveredAt: new Date().toTimeString().split(' ')[0],
      location: { x: 340, y: 120, sector: 'Sector Alpha', depthMeters: 1.4 },
      triage: 'immediate',
      confidence: 94,
      vitals: {
        heartRate: 124,
        spO2: 93,
        respirationRate: 28,
        acousticFreqHz: 260,
        thermalSigC: 36.9,
      },
      entrapmentType: 'void_space',
      hazardsNearby: [],
      survivabilityWindowHours: 11.2,
      notes: 'New acoustic distress frequency identified via SkyEye-1 aerial sensor sweep. Stable thermal signature.',
    };

    setSurvivors((prev) => [newSurv, ...prev]);
    setSelectedSurvivorId(newId);

    setOverview((prev) => ({
      ...prev,
      survivorsFound: prev.survivorsFound + 1,
    }));

    addTacticalLog(
      'emergency',
      'AI_TRIAGE',
      `NEW SURVIVOR LOCATED: Acoustic distress detected in Sector Alpha void pocket. Immediate Triage Tag assigned.`,
      newId
    );
  };

  // DEPLOY BREADCRUMB BEACON
  const deployBeaconAt = (x: number, y: number, label?: string) => {
    soundManager.playTacticalClick();

    const newBeaconId = `BCN-0${beacons.length + 1}`;
    const newBeacon: MeshRelayBeacon = {
      id: newBeaconId,
      label: label || `Relay Node #${beacons.length + 1}`,
      deployedBy: selectedRobotId || 'TACTICAL_OPERATOR',
      x,
      y,
      radius: 130,
      batteryHours: 24,
      uplinkId: 'BCN-02',
      status: 'active',
    };

    setBeacons((prev) => [...prev, newBeacon]);

    // Check if any disconnected robot is now in beacon radius
    robots.forEach((r) => {
      if (r.commsStatus === 'disconnected') {
        const dist = Math.hypot(r.position.x - x, r.position.y - y);
        if (dist <= 130) {
          restoreComms(r.id);
        }
      }
    });

    addTacticalLog(
      'success',
      'MESH_DEPLOYER',
      `RF BREADCRUMB RELAY DEPLOYED: Beacon ${newBeaconId} online at coordinates [${Math.round(x)}, ${Math.round(y)}]. Extended coverage area by 130m.`
    );
  };

  const dispatchRobotToSurvivor = (robotId: string, survivorId: string) => {
    soundManager.playSonarPing();

    const targetSurvivor = survivors.find((s) => s.id === survivorId);
    const targetRobot = robots.find((r) => r.id === robotId);
    const robotName = targetRobot?.name || robotId;
    const survLabel = targetSurvivor?.label || survivorId;

    setSurvivors((prev) =>
      prev.map((s) => (s.id === survivorId ? { ...s, assignedRobotId: robotId } : s))
    );

    // Update robot status immediately to dispatched
    setRobots((prev) =>
      prev.map((r) =>
        r.id === robotId
          ? {
              ...r,
              status: 'triage_standby',
              currentTask: `DISPATCHED: En route with life-support payload to ${survLabel}`,
            }
          : r
      )
    );

    addTacticalLog(
      'success',
      'C2_DISPATCH',
      `DISPATCH ORDER CONFIRMED: ${robotName} deployed to ${survLabel}. Delivering emergency life-support payload.`,
      survivorId
    );

    // Animate robot approaching survivor on the map in smooth incremental steps
    if (targetSurvivor) {
      let step = 0;
      const totalSteps = 16;
      const moveInterval = setInterval(() => {
        step += 1;
        setRobots((prev) =>
          prev.map((r) => {
            if (r.id !== robotId) return r;
            const curX = r.position.x;
            const curY = r.position.y;
            const destX = targetSurvivor.location.x + (Math.random() * 20 - 10);
            const destY = targetSurvivor.location.y + (Math.random() * 20 - 10);
            const newX = curX + (destX - curX) * 0.18;
            const newY = curY + (destY - curY) * 0.18;
            const angleDeg = Math.round((Math.atan2(destY - curY, destX - curX) * 180) / Math.PI);
            return {
              ...r,
              heading: (angleDeg + 360) % 360,
              position: {
                ...r.position,
                x: Math.round(newX),
                y: Math.round(newY),
              },
            };
          })
        );

        if (step >= totalSteps) {
          clearInterval(moveInterval);
          addTacticalLog(
            'success',
            'TRIAGE_ARRIVAL',
            `${robotName} arrived on-site at ${survLabel}. Life-support line attached. Vitals stabilized.`,
            survivorId
          );
        }
      }, 250);
    }
  };

  const manualMoveRobot = (robotId: string, dx: number, dy: number, newHeading?: number) => {
    setRobots((prev) =>
      prev.map((r) => {
        if (r.id !== robotId) return r;
        const nextX = Math.max(40, Math.min(760, r.position.x + dx));
        const nextY = Math.max(40, Math.min(620, r.position.y + dy));
        return {
          ...r,
          position: {
            ...r.position,
            x: Math.round(nextX),
            y: Math.round(nextY),
          },
          heading: newHeading !== undefined ? newHeading : r.heading,
          battery: Math.max(1, r.battery - 0.05),
        };
      })
    );
  };

  const toggleHazardStatus = (hazardId: string) => {
    soundManager.playTacticalClick();
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const nextStatus = h.status === 'active' ? 'contained' : h.status === 'contained' ? 'cleared' : 'active';
          return { ...h, status: nextStatus };
        }
        return h;
      })
    );

    addTacticalLog('info', 'HAZMAT', `Hazard status updated for ${hazardId}.`);
  };

  const setRobotTask = (robotId: string, task: string) => {
    setRobots((prev) =>
      prev.map((r) => (r.id === robotId ? { ...r, currentTask: task } : r))
    );
  };

  return (
    <MissionContext.Provider
      value={{
        overview,
        sectors,
        robots,
        survivors,
        hazards,
        routes,
        beacons,
        logs,
        layers,
        selectedRobotId,
        selectedSurvivorId,
        selectedHazardId,
        selectedSectorId,
        isSimPaused,
        isAudioMuted,
        isFpvOpen,
        fpvRobotId,
        isCaseStudyOpen,
        activeCaseStudyTab,
        isStoreAndForwardSyncing,
        isTourOpen,
        tourStep,

        selectRobot,
        selectSurvivor,
        selectHazard,
        selectSector,
        toggleLayer,
        toggleSimPaused,
        toggleAudio,
        openFpv,
        closeFpv,
        setIsCaseStudyOpen,
        setActiveCaseStudyTab,
        startTour,
        nextTourStep,
        prevTourStep,
        goToTourStep,
        endTour,

        triggerAftershock,
        triggerCommsDrop,
        restoreComms,
        discoverNewSurvivor,
        deployBeaconAt,
        dispatchRobotToSurvivor,
        manualMoveRobot,
        toggleHazardStatus,
        setRobotTask,
        addTacticalLog,

        reroutePrompt,
        confirmReroute,
        dismissReroute,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = (): MissionContextType => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
