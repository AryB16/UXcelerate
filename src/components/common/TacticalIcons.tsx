import React from 'react';
import { RobotType } from '../../types';

interface RobotTypeIconProps {
  type: RobotType | string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Clean tactical vector SVGs for all robot types in AEGIS-USAR.
 * Matches ATAK / Palantir defense-grade C2 aesthetics.
 */
export const RobotTypeIcon: React.FC<RobotTypeIconProps> = ({
  type,
  className = 'w-4 h-4',
  size,
  style,
}) => {
  const sizeStyle = size ? { width: size, height: size, ...style } : style;

  switch (type) {
    case 'aerial_drone':
      // Tactical quadcopter / UAV drone (AERO-SCOUT)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
          <path d="M9.5 9.5L5.5 5.5m13 0l-4 4m0 5l4 4m-13 0l4-4" />
          <circle cx="4.5" cy="4.5" r="2.5" />
          <circle cx="19.5" cy="4.5" r="2.5" />
          <circle cx="4.5" cy="19.5" r="2.5" />
          <circle cx="19.5" cy="19.5" r="2.5" />
          <line x1="12" y1="3" x2="12" y2="6.5" strokeWidth="2.5" />
        </svg>
      );

    case 'heavy_quadruped':
      // Articulated robotic quadruped walker / K9 hound (K9-TITAN)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <rect x="6" y="9" width="11" height="5" rx="1.5" fill="currentColor" fillOpacity="0.25" />
          <path d="M17 10.5l3-2.5v3l-3 1" />
          <path d="M8 14l-2 3.5l1.5 3.5" />
          <path d="M10 14l-1 3.5l1.5 3.5" />
          <path d="M14 14l1 3.5l-1 3.5" />
          <path d="M16 14l2 3.5l-1.5 3.5" />
          <circle cx="19" cy="9.5" r="0.8" fill="currentColor" />
        </svg>
      );

    case 'snake_crawler':
      // Flexible articulated subterranean snake probe (VOID-SNAKE)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <path d="M3 16c2.5-3.5 4.5-3.5 7 0s4.5 3.5 7 0 2.5-4 5-3" />
          <circle cx="21" cy="13" r="2" fill="currentColor" fillOpacity="0.3" />
          <circle cx="3.5" cy="16" r="1.2" fill="currentColor" />
          <circle cx="10" cy="16" r="1.2" fill="currentColor" />
          <circle cx="17" cy="16" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'tracked_rover':
      // Heavy tracked rover / tank chassis with RF mast (SHORE-ROVER)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <path d="M12 7V3m-2 0h4" />
          <path d="M6 12l2-5h8l2 5z" fill="currentColor" fillOpacity="0.25" />
          <rect x="3" y="12" width="18" height="7" rx="3.5" />
          <circle cx="6.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="17.5" cy="15.5" r="1.5" fill="currentColor" />
        </svg>
      );

    case 'wall_climber':
      // Vertical adhesion climber / gecko crawler (WALL-CRAWL)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <rect x="8.5" y="7" width="7" height="10" rx="3" fill="currentColor" fillOpacity="0.25" />
          <path d="M8.5 9L4 6m0 0l-1 2m1-2l2-1" />
          <path d="M15.5 9l4.5-3m0 0l1 2m-1-2l-2-1" />
          <path d="M8.5 15l-4.5 3m0 0l-1-2m1 2l2 1" />
          <path d="M15.5 15l4.5 3m0 0l1-2m-1 2l-2 1" />
          <circle cx="12" cy="10" r="1" fill="currentColor" />
        </svg>
      );

    case 'amphibious':
      // Submersible / amphibious water probe (SUMP-PROBE)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <path d="M5 9h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity="0.25" />
          <path d="M9 9V5h3" />
          <circle cx="17" cy="13" r="1.5" fill="currentColor" />
          <path d="M3 10l-2-2v8l2-2" />
          <path d="M3 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
        </svg>
      );

    default:
      // Generic tactical robotic chassis
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={sizeStyle}
        >
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <circle cx="9" cy="13" r="1.5" fill="currentColor" />
          <circle cx="15" cy="13" r="1.5" fill="currentColor" />
          <path d="M9 4h6M12 4v4" />
        </svg>
      );
  }
};

/**
 * Generates raw inline SVG strings for Leaflet divIcon HTML markers.
 * Perfectly sized to fit cleanly inside .marker-badge (26x26px container).
 */
export function getRobotMarkerSvg(type: RobotType | string, size: number = 16): string {
  switch (type) {
    case 'aerial_drone':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/>
          <path d="M9.5 9.5L5.5 5.5m13 0l-4 4m0 5l4 4m-13 0l4-4"/>
          <circle cx="4.5" cy="4.5" r="2.5"/>
          <circle cx="19.5" cy="4.5" r="2.5"/>
          <circle cx="4.5" cy="19.5" r="2.5"/>
          <circle cx="19.5" cy="19.5" r="2.5"/>
          <line x1="12" y1="3" x2="12" y2="6.5" stroke-width="2.5"/>
        </svg>
      `;

    case 'heavy_quadruped':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="9" width="11" height="5" rx="1.5" fill="currentColor" fill-opacity="0.3"/>
          <path d="M17 10.5l3-2.5v3l-3 1"/>
          <path d="M8 14l-2 3.5l1.5 3.5"/>
          <path d="M10 14l-1 3.5l1.5 3.5"/>
          <path d="M14 14l1 3.5l-1 3.5"/>
          <path d="M16 14l2 3.5l-1.5 3.5"/>
          <circle cx="19" cy="9.5" r="0.8" fill="currentColor"/>
        </svg>
      `;

    case 'snake_crawler':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 16c2.5-3.5 4.5-3.5 7 0s4.5 3.5 7 0 2.5-4 5-3"/>
          <circle cx="21" cy="13" r="2" fill="currentColor" fill-opacity="0.3"/>
          <circle cx="3.5" cy="16" r="1.3" fill="currentColor"/>
          <circle cx="10" cy="16" r="1.3" fill="currentColor"/>
          <circle cx="17" cy="16" r="1.3" fill="currentColor"/>
        </svg>
      `;

    case 'tracked_rover':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 7V3m-2 0h4"/>
          <path d="M6 12l2-5h8l2 5z" fill="currentColor" fill-opacity="0.3"/>
          <rect x="3" y="12" width="18" height="7" rx="3.5"/>
          <circle cx="6.5" cy="15.5" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="15.5" r="1.5" fill="currentColor"/>
          <circle cx="17.5" cy="15.5" r="1.5" fill="currentColor"/>
        </svg>
      `;

    case 'wall_climber':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="8.5" y="7" width="7" height="10" rx="3" fill="currentColor" fill-opacity="0.3"/>
          <path d="M8.5 9L4 6m0 0l-1 2m1-2l2-1"/>
          <path d="M15.5 9l4.5-3m0 0l1 2m-1-2l-2-1"/>
          <path d="M8.5 15l-4.5 3m0 0l-1-2m1 2l2 1"/>
          <path d="M15.5 15l4.5 3m0 0l1-2m-1 2l-2 1"/>
          <circle cx="12" cy="10" r="1" fill="currentColor"/>
        </svg>
      `;

    case 'amphibious':
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 9h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" fill="currentColor" fill-opacity="0.3"/>
          <path d="M9 9V5h3"/>
          <circle cx="17" cy="13" r="1.5" fill="currentColor"/>
          <path d="M3 10l-2-2v8l2-2"/>
          <path d="M3 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="8" width="16" height="12" rx="2"/>
          <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
        </svg>
      `;
  }
}

/**
 * SVG for Survivor Leaflet Marker (Medic/Bio-Heart)
 */
export function getSurvivorMarkerSvg(size: number = 14): string {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" stroke="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;
}

/**
 * SVG for Hazard Leaflet Marker (Biohazard or Warning Alert)
 */
export function getHazardMarkerSvg(type?: string, size: number = 14): string {
  if (type === 'gas_leak') {
    return `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/>
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.4-5.6l-2.1 2.1m-6.8 6.8l-2.1 2.1m0-11l2.1 2.1m6.8 6.8l2.1 2.1"/>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `;
}

/**
 * SVG for Beacon Relay Leaflet Marker (RF broadcast antenna)
 */
export function getBeaconMarkerSvg(size: number = 14): string {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9m14.2 0c3.9 3.9 3.9 10.3 0 14.2M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5m8.4 0c2.3 2.3 2.3 6.1 0 8.5M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    </svg>
  `;
}
