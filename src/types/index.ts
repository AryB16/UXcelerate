export type RobotType = 
  | 'aerial_drone' 
  | 'heavy_quadruped' 
  | 'snake_crawler' 
  | 'tracked_rover' 
  | 'wall_climber' 
  | 'amphibious';

export type CommsStatus = 'connected' | 'degraded' | 'disconnected';

export type TriageCategory = 'immediate' | 'delayed' | 'minor' | 'expectant';

export type HazardType = 'gas_leak' | 'structural_collapse' | 'fire' | 'high_voltage' | 'flood';

export type HazardSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface Position {
  x: number;
  y: number;
  z?: number;
  sectorId: string;
}

export interface Robot {
  id: string;
  name: string;
  callsign: string;
  type: RobotType;
  status: 'patrol' | 'triage_standby' | 'relay_anchor' | 'disconnected' | 'charging' | 'manual_override';
  commsStatus: CommsStatus;
  signalStrength: number; // percentage 0-100
  latencyMs: number;
  battery: number; // percentage 0-100
  position: Position;
  heading: number; // degrees 0-360
  lastContactSecondsAgo: number;
  lastKnownPosition: { x: number; y: number; timestamp: number };
  deadReckoningVector: { dx: number; dy: number; speed: number }; // meters/sec
  sensors: string[];
  activeSensorFeed: 'flir' | 'lidar' | 'optical' | 'spectrogram';
  currentTask: string;
  payload: string;
  storeAndForwardBacklog: number; // queued telemetry packets while offline
  breadcrumbsPlaced: number;
  firmwareVersion: string;
}

export interface Survivor {
  id: string;
  label: string;
  discoveredBy: string;
  discoveredAt: string;
  location: { x: number; y: number; sector: string; depthMeters: number };
  triage: TriageCategory;
  confidence: number; // percentage 0-100
  vitals: {
    heartRate: number; // bpm
    spO2: number; // %
    respirationRate: number; // breaths/min
    acousticFreqHz: number;
    thermalSigC: number;
  };
  entrapmentType: 'void_space' | 'heavy_rubble' | 'confined_crawlway' | 'surface_debris';
  hazardsNearby: string[];
  assignedRobotId?: string;
  survivabilityWindowHours: number;
  notes: string;
}

export interface Hazard {
  id: string;
  type: HazardType;
  severity: HazardSeverity;
  title: string;
  location: { x: number; y: number; radius: number; sector: string };
  readout: string;
  status: 'active' | 'contained' | 'cleared';
  timestamp: string;
}

export interface SectorRoute {
  id: string;
  name: string;
  status: 'clear' | 'hazardous' | 'blocked' | 'newly_discovered';
  points: { x: number; y: number }[];
  widthCm: number;
  riskScore: number; // 0-100
  discoveredByRobotId?: string;
  description: string;
}

export interface MeshRelayBeacon {
  id: string;
  label: string;
  deployedBy: string;
  x: number;
  y: number;
  radius: number;
  batteryHours: number;
  uplinkId: string;
  status: 'active' | 'low_battery' | 'offline';
}

export interface Sector {
  id: string;
  name: string;
  code: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  structuralRating: 'unstable' | 'moderate' | 'stabilized' | 'critical_tilt';
  scannedPercentage: number;
  stalenessMinutes: number; // minutes since last LiDAR update
  activeHazardsCount: number;
  survivorsCount: number;
}

export interface TacticalLog {
  id: string;
  timestamp: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  source: string;
  message: string;
  relatedEntityId?: string;
}

export interface MissionOverview {
  missionClock: string; // e.g. "04:22:15"
  goldenHourRemainingMinutes: number;
  overallMeshIntegrity: number; // percentage
  activeRobotsCount: number;
  totalRobotsCount: number;
  survivorsFound: number;
  survivorsExtracted: number;
  activeHazards: number;
  clearedRoutesCount: number;
  aftershockRiskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}
