# AEGIS-USAR // Mission Control Deck
> **Adaptive Earthquake Ground & Infrastructure Swarm — Urban Search & Rescue**  
> *Engineered for UXcelerate! — Online UI/UX Competition (IEI BPDC)*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20Mission%20Control-00f0ff?style=for-the-badge&logo=vercel)](https://AryB16.github.io/UXcelerate/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![WCAG](https://img.shields.io/badge/WCAG-2.2%20AAA-10b981?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![INSARAG](https://img.shields.io/badge/INSARAG-Tier--1%20Compliant-f43f5e?style=for-the-badge)](https://www.insarag.org)

---

## 🚀 Live Interactive Demo
👉 **[Launch AEGIS-USAR Mission Control](https://AryB16.github.io/UXcelerate/)**  
*(Double-click any robot to enter FPV Tele-Op mode; click "UX Case Study" in the top bar to view full design research)*

---

## 💡 The Problem Statement
> *"Design an interface for coordinating rescue robots after an earthquake, where maps may be incomplete, communication may be unreliable, and robots continuously discover survivors, blocked paths, structural hazards, and new accessible routes."*

During the **"Golden 72 Hours"** following a catastrophic earthquake, victim survivability drops exponentially. First responders deploying multi-agent robot swarms face severe environmental realities:
1. **Incomplete Maps & Fog of Uncertainty**: Pre-disaster architectural CAD drawings are rendered obsolete by pancake collapses.
2. **Unreliable Communication**: Concrete rebar and subterranean voids attenuate RF signals, causing packet loss and blackouts.
3. **Dynamic Discoveries**: Live survivors, explosive gas leaks, and secondary aftershock collapses require rapid triage and re-routing.
4. **Cognitive Overload**: One human operator cannot pilot 6+ robots simultaneously while managing life-and-death priorities.

---

## 🛡️ Key Innovations in AEGIS-USAR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AEGIS-USAR SYSTEM ARCHITECTURE                           │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. EPISTEMIC MAPPING          │ • 3-Layer Canvas (Pre-CAD, SLAM, Staleness) │
│                               │ • Fog of Uncertainty over unexplored voids  │
│                               │ • Temporal Staleness Decay Gradient         │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. RESILIENT GHOST MESH       │ • Dead-Reckoning Trajectory Projection      │
│                               │ • Store-and-Forward Telemetry Ingest Buffer │
│                               │ • 1-Click Breadcrumb RF Relay Beacon Drop   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. DYNAMIC TRIAGE & CORRIDORS │ • Automated START Protocol (Red/Yellow/Grn) │
│                               │ • Multi-modal Biosignals (Acoustic, FLIR)   │
│                               │ • Dynamic Safe Evacuation Corridor Routing  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. MULTISPECTRAL FPV COCKPIT  │ • FLIR Thermal IR (Body heat hotspot 37°C)  │
│                               │ • 3D LiDAR Mesh with Obstacle Radar         │
│                               │ • Optical NIR Night-Vision & Spectrogram    │
│                               │ • WASD Tele-Op & Emergency Payload Release  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 1. Epistemic 3-Layer Disaster Mapping
* **CAD Blueprint Ghost Layer**: Displays pre-disaster architectural vectors for structural reference.
* **LiDAR SLAM Layer**: Active pointcloud contours mapped in real time as robots explore voids.
* **Fog of Uncertainty**: Uninspected sectors are covered in diagonal caution hatching to prevent false assumptions of safety.
* **Staleness Decay Warning**: When an area hasn't been scanned for >15 minutes, it pulses in amber to indicate that ongoing aftershocks may have compromised the route.

### 2. Resilient Ghost Mesh & Store-and-Forward UX
* **Ghost Mode**: Disconnected robots do not vanish. AEGIS pins their last known position, projects their dead-reckoning trajectory vector, and displays an uncertainty radius.
* **Store-and-Forward Buffer**: Offline robots autonomously buffer SLAM voxels and biosignals. When the link is restored, a melodic chime plays and all data flushes to the central map.
* **Breadcrumb Relay Deployment**: Operators can drop RF repeater beacons anywhere on the map, restoring severed links with 1 click.

### 3. Dynamic START Triage & Route Advisor
* **START Protocol Triage**: Classifies survivors into Immediate (Red), Delayed (Yellow), and Minor (Green).
* **Sensor Fusion Readouts**: Displays heart rate (BPM), blood oxygen (SpO2), respiration, and entrapment depth.
* **Corridor Clearance Engine**: Distinguishes between Clear corridors, Hazardous SCBA-only crawlways, and Blocked pancake collapses.

### 4. Multispectral FPV Tele-Op Cockpit
* Supports 4 distinct sensor views: **FLIR Thermal IR**, **3D LiDAR Radar**, **Night Optical NIR**, and **Gas/Acoustic Spectrogram**.
* Direct drive manual override using `W A S D` keyboard controls, gimbal pitch/yaw, and emergency payload ejector.

---

## 🤖 The Robot Swarm Fleet

| ID | Callsign | Type | Specialty Payload | Comms Status |
| :--- | :--- | :--- | :--- | :--- |
| **ROB-01** | `AERO-SCOUT` | VTOL Aerial Drone | 360° LiDAR, FLIR, RF Repeater Pods | Connected (96% RSSI) |
| **ROB-02** | `K9-TITAN` | Heavy Quadruped | Acoustic Geophone, CO2 Sniffer, Med Kit | Connected (78% RSSI) |
| **ROB-03** | `VOID-SNAKE` | Serpentine Crawler | Borescope, Micro-O2 Delivery, Sonar | **Ghost Mode (Offline)** |
| **ROB-04** | `SHORE-ROVER` | Tracked Heavy Rover | High-Gain 900MHz RF Mast, Hydraulic Jack | Connected (91% RSSI) |
| **ROB-05** | `WALL-CRAWL` | Wall Climber | Laser Inclinometer, Crack Gauge | Degraded (44% RSSI) |
| **ROB-06** | `SUMP-PROBE` | Amphibious Rover | Multibeam Sonar, Sump Pump Tether | Connected (72% RSSI) |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>1</kbd> – <kbd>6</kbd> | Quick-select robot from the Swarm Roster |
| <kbd>SPACE</kbd> | Pause / Resume real-time simulation |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Direct Tele-Op drive / camera tilt (inside FPV Cockpit) |
| <kbd>ESC</kbd> | Exit FPV Cockpit / Return to Swarm Map |
| <kbd>?</kbd> or <kbd>/</kbd> | Open UX Case Study & Design Specification modal |

---

## 🎨 Design System & Accessibility (WCAG 2.2 AAA)

* **Palette**: High-contrast OLED Obsidian (`#06090E`), Tactical Cyan (`#00F0FF`, 12:1 contrast ratio), Alert Rose (`#F43F5E`), Hazard Amber (`#F59E0B`), and Verified Emerald (`#10B981`).
* **Colorblind-Safe Redundancy**: Every critical alert couples color with distinct icons, animated pulses, and plain-text badges (e.g., `[RED // IMMEDIATE]`, `[GHOST // NO CARRIER]`, `[⛔ BLOCKED]`).
* **Procedural Web Audio Engine**: Zero-asset audio synthesizer providing authentic sonar pings, Geiger clicks for gas spikes, radio static for comms drops, and reconnect chimes. Can be muted with 1 click.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# 1. Clone your forked repository
git clone https://github.com/AryB16/UXcelerate.git
cd UXcelerate

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build

# 5. Preview production build
npm run preview
```

---

## 📖 In-Depth UX Research Document
For the complete UX methodology, user journey maps, Nielsen heuristic evaluation, and INSARAG compliance analysis, read the dedicated whitepaper:  
👉 **[UX_CASE_STUDY.md](./UX_CASE_STUDY.md)**

---

*Created with passion by Aryesh Biswas for UXcelerate! 2026.*
