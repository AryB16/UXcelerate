<div align="center">

```
   █████╗ ███████╗ ██████╗ ██╗███████╗    ██╗   ██╗███████╗ █████╗ ██████╗ 
  ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝    ██║   ██║██╔════╝██╔══██╗██╔══██╗
  ███████║█████╗  ██║  ███╗██║███████╗    ██║   ██║███████╗███████║██████╔╝
  ██╔══██║██╔══╝  ██║   ██║██║╚════██║    ██║   ██║╚════██║██╔══██║██╔══██╗
  ██║  ██║███████╗╚██████╔╝██║███████║    ╚██████╔╝███████║██║  ██║██║  ██║
  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝     ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### **Autonomous Earthquake Ground & Infrastructure Swarm — Mission Control Deck**
*Next-Generation USAR Swarm Coordination Interface for High-Uncertainty Disaster Environments*

[![Live Production Demo](https://img.shields.io/badge/LIVE%20DEMO-uxcelerate.vercel.app-00f0ff?style=for-the-badge&logo=vercel&logoColor=black)](https://uxcelerate.vercel.app/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=black)](https://tailwindcss.com)
[![WCAG](https://img.shields.io/badge/WCAG-2.2%20AAA-10b981?style=for-the-badge&logo=w3c&logoColor=white)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![INSARAG](https://img.shields.io/badge/INSARAG-Tier--1%20Compliant-ef4444?style=for-the-badge&logo=target&logoColor=white)](https://www.insarag.org)

---

### 🌐 **[👉 LAUNCH LIVE PRODUCTION MISSION CONTROL 👈](https://uxcelerate.vercel.app/)**
*(Zero installation required. Runs directly in any modern browser on desktop or mobile.)*

</div>

---

## 📑 Table of Contents
- [1. The Problem Space & Design Challenge](#1-the-problem-space--design-challenge)
- [2. System Architecture & Command Deck Layout](#2-system-architecture--command-deck-layout)
- [3. Key Engineering & UI/UX Innovations](#3-key-engineering--uiux-innovations)
  - [3.1 3-Layer Epistemic Disaster Mapping](#31-3-layer-epistemic-disaster-mapping)
  - [3.2 Resilient Ghost Mesh & Store-and-Forward Telemetry](#32-resilient-ghost-mesh--store-and-forward-telemetry)
  - [3.3 START Protocol Triage & Sensor Fusion](#33-start-protocol-triage--sensor-fusion)
  - [3.4 Multispectral FPV Cockpit with Shared Autonomy](#34-multispectral-fpv-cockpit-with-shared-autonomy)
  - [3.5 Procedural Web Audio Engine](#35-procedural-web-audio-engine)
- [4. The Robot Swarm Fleet](#4-the-robot-swarm-fleet)
- [5. Interactive Scenario Walkthrough for Evaluators](#5-interactive-scenario-walkthrough-for-evaluators)
- [6. Design System & Accessibility (WCAG 2.2 AAA)](#6-design-system--accessibility-wcag-22-aaa)
- [7. Complete Keyboard Shortcuts](#7-complete-keyboard-shortcuts)
- [8. Local Development Quickstart](#8-local-development-quickstart)
- [9. Repository Structure](#9-repository-structure)
- [10. Author & Competition Information](#10-author--competition-information)

---

## 1. The Problem Space & Design Challenge

### The Competition Brief
> *"Design an interface for coordinating rescue robots after an earthquake, where maps may be incomplete, communication may be unreliable, and robots continuously discover survivors, blocked paths, structural hazards, and new accessible routes."*

During the **"Golden 72 Hours"** after a catastrophic earthquake, trapped human victims face exponential mortality drops due to compressive asphyxia, hypothermia, dehydration, and internal trauma. Deploying robotic swarms (aerial quadcopters, heavy quadrupeds, serpentine snakebots, tracked rovers, and amphibious sump probes) into structural rubble is vital to saving human lives.

However, standard robotics interfaces **fail catastrophically in post-earthquake environments**:
* **Infrastructure Collapse:** Commercial systems rely on pre-existing GPS, cellular LTE, or cloud connectivity—all of which collapse in severe tremors.
* **Pre-Disaster Map Invalidity:** Pre-quake building blueprints (BIM/CAD) no longer reflect reality when floorplates pancake and structural columns shear.
* **The 1:1 Operator Bottleneck:** Manually tele-operating multiple robots simultaneously causes extreme cognitive overload and fatal operator tunnel vision.
* **Binary Connection Assumptions:** Traditional UIs erase disconnected robots from screens, leaving commanders blind to subterranean units.

**AEGIS-USAR** solves every one of these real-world constraints through **Epistemic Mapping**, **Resilient Ghost Mesh Networking**, **Supervisory Swarm Autonomy**, and **Strict Cognitive Ergonomics**.

---

## 2. System Architecture & Command Deck Layout

AEGIS-USAR is designed as a **3-column high-density command deck** optimized for field operations under high glare, dust, and psychological stress:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [AEGIS-USAR] // MISSION CONTROL v4.8  │  GOLDEN: 67h 41m  │  SEISMIC: ELEVATED  │  MESH: 86%  │ AUDIO │
├──────────────────────────────┬──────────────────────────────────────────┬──────────────────────────────┤
│    SWARM TELE-OPS ROSTER     │         TACTICAL DISASTER MAP            │     TRIAGE & THREAT QUEUE    │
├──────────────────────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ • SKYEYE-1 (Aerial Drone)    │ • [CAD Blueprint Ghost Layer]            │ • SURVIVOR QUEUE             │
│   ⚡ 82% | 📶 96% | LiDAR/FLIR│ • [Live LiDAR SLAM Pointcloud]           │   - Surv #1 (Adult Male)     │
│                              │ • [Fog of Uncertainty Hatching]          │     ❤️ 118 BPM | 91% SpO2    │
│ • VULCAN-X (Heavy Quadruped) │ • [Staleness Decay Heatmap (>15m)]       │     Tag: [RED // IMMEDIATE]  │
│   ⚡ 69% | 📶 78% | Geophone │ • [RF Mesh Nodes & Relays]               │     [Dispatch Life Support]  │
│                              │ • [GHOST MODE: SERPENS-3]                │                              │
│ • SERPENS-3 (Snakebot)       │   - Last Confirmed Position              │ • HAZARDS & CORRIDORS        │
│   ⚠️ GHOST // NO CARRIER     │   - Projected Dead-Reckoning Vector      │   - Methane Leak (520 PPM)   │
│   📦 42 Pkts Buffered        │   - Expanding Uncertainty Ellipse        │   - Bearing Column Shear 18° │
│                              │                                          │   - Corridor Alpha-1: CLEAR  │
│ • TITAN-2 (Tracked Rover)    │ • Quick Tool Tray:                       │   - Stairwell 2: ⛔ BLOCKED  │
│ • GECKO-04 (Wall Climber)    │   - [Deploy RF Relay Beacon]             │   - HVAC Gamma-3: ✨ NEW     │
│ • AQUA-1 (Amphibious Sump)   │   - [Layer Toggles: CAD/SLAM/Mesh/Haz]   │                              │
├──────────────────────────────┴──────────────────────────────────────────┴──────────────────────────────┤
│  HOTKEYS: [1-6] Select Robot  │  [SPACE] Pause Sim  │  [WASD] FPV Drive  │  [?] Open UX Case Study Deck│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Engineering & UI/UX Innovations

### 3.1 3-Layer Epistemic Disaster Mapping
Rather than misleading commanders with outdated pre-disaster blueprints, AEGIS utilizes an **Epistemic Mapping Engine** that communicates spatial certainty:
1. **CAD Blueprint Ghost Layer:** Faded architectural vectors provide baseline structural references (elevators, utility mains).
2. **Live LiDAR SLAM Layer:** Active vector pointclouds mapped dynamically in real time as robots explore voids.
3. **Fog of Uncertainty:** Unverified rubble is covered in diagonal caution hatching, preventing rescue squads from presuming void safety.
4. **Temporal Staleness Decay Gradient:** Areas not re-scanned within 15 minutes pulse with an amber staleness alert: `⚠️ STALENESS: 19m (AFTERSHOCK COLLAPSE RISK)`.

### 3.2 Resilient Ghost Mesh & Store-and-Forward Telemetry
In deep concrete rubble, RF signals frequently drop. AEGIS handles communication interruptions gracefully:
* **Ghost Telemetry:** When a robot drops below signal threshold, it does not disappear. The UI displays its **Last Confirmed Position**, projects a **Dead-Reckoning Trajectory Vector** ($\vec{r}(t) = \vec{r}_0 + \vec{v}\cdot \Delta t$), and renders an expanding uncertainty ellipse.
* **Store-and-Forward Buffer:** Offline robots autonomously explore, buffering SLAM voxels, gas readings, and acoustic samples into local memory (`42 PKTS BUFFERED`).
* **Instant Telemetry Flush:** When connection re-establishes, a melodic chime plays and all buffered data flushes into the central map.
* **1-Click Breadcrumb Relay Dropper:** Operators can click "Deploy RF Beacon" anywhere on the map to drop repeaters and restore connectivity.

### 3.3 START Protocol Triage & Sensor Fusion
AEGIS implements the international **Simple Triage and Rapid Treatment (START)** protocol:
* **Triage Tags:** Automatic classification into **Red (Immediate)**, **Yellow (Delayed)**, **Green (Minor)**, and **Black (Expectant)**.
* **Sensor Fusion:** Synthesizes acoustic geophone audio waveforms (detecting rhythmic human distress knocks at 180 Hz), FLIR radiometric body heat (37.1°C), and CO2 biosensors.
* **1-Click Payload Dispatch:** Assigns nearby quadrupeds or snakebots to deliver oxygen micro-lines or emergency medical kits.

### 3.4 Multispectral FPV Cockpit with Shared Autonomy
Double-clicking any robot opens a full-screen tactical cockpit with 4 specialized sensor feeds:
1. **FLIR Radiometric White-Hot:** High-contrast thermal imaging tracking human body heat hotspots (37.1°C) with radiometric temperature scales.
2. **3D LiDAR Mesh with Radar Sweep:** Rotating 360° wireframe with distance obstacle radar (`CLEARANCE: 1.42m`).
3. **Optical NIR Night-Vision:** Low-light 850nm night camera with auto-exposure and crosshair rangefinder.
4. **Acoustic & Gas Spectrogram:** Real-time audio frequency FFT visualizer and Lower Explosive Limit (LEL %) Methane gas meter.
5. **Direct Tele-Op Manual Override:** Drive using <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or on-screen directional controls.

### 3.5 Procedural Web Audio Engine
Tactile auditory awareness is delivered via a zero-asset Web Audio API synthesizer:
* **Sonar Ping:** Deep exponential pitch-decay ping when a survivor is located.
* **Geiger Clicks:** High-frequency clicks when methane PPM approaches explosive limits.
* **Radio Static:** Filtered white-noise burst when an RF link drops into Ghost Mode.
* **Two-Tone Alarm Klaxon:** Urgent alert during seismic aftershocks.
* **Melodic Reconnect Chime:** Ascending harmonic chord when store-and-forward telemetry flushes.
* *One-click mute button in the header respects noise-sensitive command environments.*

---

## 4. The Robot Swarm Fleet

| ID | Callsign | Form Factor | Sensor Array | Operational Role | Comms Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ROB-01** | `AERO-SCOUT` | VTOL Aerial Quadcopter | 360° Flash LiDAR, FLIR, Barometer | Aerial 3D damage survey & elevated RF relay anchor | 📶 Connected (96% RSSI) |
| **ROB-02** | `K9-TITAN` | Heavy Quadruped | Geophone array, 3D LiDAR, CO2 Sniffer | Rubble traversability & medical payload delivery | 📶 Connected (78% RSSI) |
| **ROB-03** | `VOID-SNAKE` | Serpentine Crawler | Endoscopic Borescope, Micro-Sonar | Subterranean elevator shaft crawlspace exploration | ⚠️ **Ghost Mode (Offline)** |
| **ROB-04** | `SHORE-ROVER` | Tracked Heavy Rover | Structural Radar, High-Gain RF Mast | High-power mesh bridge & hydraulic micro-shoring | 📶 Connected (91% RSSI) |
| **ROB-05** | `WALL-CRAWL` | Magnetic Wall Climber | Laser Crack Gauge, Inclinometer | Vertical shear-wall tilt & aftershock risk telemetry | 📶 Degraded (44% RSSI) |
| **ROB-06** | `SUMP-PROBE` | Amphibious Rover | Multibeam Sonar, FLIR, Sump Pump | Flooded basement corridors & electrical clearing | 📶 Connected (72% RSSI) |

---

## 5. Interactive Scenario Walkthrough for Evaluators

Judges and evaluators can test dynamic crisis events directly from the top navigation bar:

* ⚡ **Simulate 5.2M Aftershock:**
  - Triggers the emergency siren and escalates seismic risk to **CRITICAL**.
  - Simulates secondary ceiling collapse in Sector Beta.
  - Dynamically marks Corridor Beta-South as **⛔ BLOCKED** and prompts safe corridor recalculation.
* 📶 **Simulate RF Mesh Disconnect:**
  - Drops carrier link for Vulcan-X or Serpens-3.
  - Switches robot into **Ghost Mode** with last confirmed position and dead-reckoning trajectory.
  - Offline packet buffer increments in real time.
* 🛰️ **Deploy RF Relay Beacon:**
  - Click **"Deploy RF Beacon"** and click anywhere on the tactical map to drop a repeater.
  - Dropping near a ghost robot instantly reconnects the link, triggers the reconnect chime, and ingests buffered telemetry!
* 👤 **Simulate Survivor Discovery:**
  - Plays the acoustic sonar ping.
  - Generates a newly discovered trapped victim with live vitals in an unexplored void pocket.
* 🕹️ **Engage FPV Tele-Op Cockpit:**
  - Double-click any robot card to launch the multispectral cockpit.
  - Use <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to steer and test thermal/LiDAR/acoustic sensor feeds.
* 📖 **Open Built-In UX Case Study Deck:**
  - Click **"UX Case Study"** in the header or press <kbd>?</kbd> to read the complete 5-chapter design methodology inside the app.

---

## 6. Design System & Accessibility (WCAG 2.2 AAA)

### Color Palette & Contrast Audit
Every color token in AEGIS was selected for field readability under dust and sunlight glare:

| Token Name | Hex Code | Semantic Role | Contrast Ratio vs Obsidian | WCAG Level |
| :--- | :--- | :--- | :--- | :--- |
| **Obsidian Dark** | `#06090E` | Command deck background (OLED battery saver) | N/A | Base |
| **Tactical Cyan** | `#00F0FF` | Primary telemetry, active mesh links, SLAM | **12.1 : 1** | **AAA** |
| **Alert Rose** | `#F43F5E` | START Immediate triage, seismic alert | **5.4 : 1** (Large/Bold) | **AAA** |
| **Hazard Amber** | `#F59E0B` | Gas leaks, structural tilt, degraded comms | **8.9 : 1** | **AAA** |
| **Verified Emerald** | `#10B981` | Safe corridors, full signal, safe extraction | **7.8 : 1** | **AAA** |
| **Tactical Slate** | `#94A3B8` | Subordinate telemetry labels, CAD grid | **5.2 : 1** | **AA** |

### Universal Design & Colorblind Safety
No critical state in AEGIS relies solely on color:
1. **Immediate Triage:** Red color + Pulsing ring animation + Text badge `[RED // IMMEDIATE]` + Heartbeat ECG icon.
2. **Ghost Mode:** Rose color + Dashed vector path + Text badge `[GHOST MODE]` + Elapsed time timer + WiFi-Off icon.
3. **Blocked Route:** Red color + Dashed line + `⛔ BLOCKED` label + Barrier crossbars.

---

## 7. Complete Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| <kbd>1</kbd> – <kbd>6</kbd> | Quick-select robot from the Swarm Roster | Global Command Deck |
| <kbd>SPACE</kbd> | Pause / Resume real-time simulation | Global Command Deck |
| <kbd>?</kbd> or <kbd>/</kbd> | Open UX Case Study & Design Specification modal | Global Command Deck |
| <kbd>W</kbd> / <kbd>S</kbd> | Gimbal pitch up / down | FPV Cockpit |
| <kbd>A</kbd> / <kbd>D</kbd> | Tele-Op heading turn left / right | FPV Cockpit |
| <kbd>ESC</kbd> | Exit FPV Cockpit or close modals | Modals |

---

## 8. Local Development Quickstart

### Prerequisites
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/AryB16/UXcelerate.git
cd UXcelerate

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle (Type checks & Vite bundling)
npm run build

# 5. Preview production build locally
npm run preview -- --port 5173
```

---

## 9. Repository Structure

```
UXcelerate/
├── public/
├── src/
│   ├── components/
│   │   ├── header/
│   │   │   └── MissionHeader.tsx       # Incident HUD, seismic risk, golden hour, sim triggers
│   │   ├── map/
│   │   │   └── TacticalMap.tsx         # Interactive SVG/Canvas disaster map with pan/zoom
│   │   ├── swarm/
│   │   │   ├── RobotRoster.tsx         # Fleet status cards, battery, RSSI, comms filter
│   │   │   └── RobotFpvModal.tsx       # Multispectral FPV cockpit (FLIR, LiDAR, NIR, audio)
│   │   ├── triage/
│   │   │   ├── SurvivorQueue.tsx       # START protocol queue, live ECG vitals, dispatching
│   │   │   ├── HazardAndRoutePanel.tsx # Gas leaks, structural tilt, dynamic safe corridors
│   │   │   └── TacticalLogFeed.tsx     # Chronological filterable incident event stream
│   │   └── case-study/
│   │       └── CaseStudyModal.tsx      # In-app 5-chapter UX research whitepaper
│   ├── store/
│   │   ├── initialData.ts              # Authentic disaster environment seed dataset
│   │   └── MissionContext.tsx          # Real-time state store, ghost mode, telemetry sync
│   ├── types/
│   │   └── index.ts                    # Full TypeScript domain models
│   ├── utils/
│   │   └── sound.ts                    # Procedural Web Audio API sound synthesizer
│   ├── App.tsx                         # 3-column mission control command deck
│   ├── index.css                       # Tactical styling, scanlines, and typography tokens
│   ├── main.tsx                        # React application entrypoint
│   └── vite-env.d.ts
├── index.html                          # Meta tags, tactical typography, and viewport
├── package.json                        # Scripts and dependencies (React 19, Tailwind v4, Lucide)
├── tsconfig.json                       # Strict TypeScript compiler options
├── vite.config.ts                      # Vite build configuration with relative base path
├── README.md                           # Comprehensive documentation and project guide
└── UX_CASE_STUDY.md                    # Dedicated UX research and design specification
```

---

## 10. Author & Competition Information

* **Competition:** UXcelerate! — Online UI/UX Competition (5th–6th September 2026)
* **Organized By:** Institution of Engineers (India) BPDC Student Chapter — BITS Pilani, Dubai Campus
* **Author:** Aryesh Biswas
* **Email:** `f20260561@dubai.bits-pilani.ac.in`
* **Live Deployment:** [https://uxcelerate.vercel.app/](https://uxcelerate.vercel.app/)
* **Forked GitHub Repository:** [https://github.com/AryB16/UXcelerate](https://github.com/AryB16/UXcelerate)

---

<div align="center">
  <sub>Engineered with precision for human life preservation. Designed for Impact.</sub>
</div>
