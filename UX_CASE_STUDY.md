# AEGIS-USAR: Comprehensive UI/UX Case Study & Design Specification
**Adaptive Earthquake Ground & Infrastructure Swarm — Urban Search & Rescue Mission Control**

*Official Submission for UXcelerate! — Online UI/UX Competition (IEI BPDC)*  
**Author:** Aryesh Biswas  
**Date:** September 2026  
**Live Demo:** [https://uxcelerate.vercel.app/](https://uxcelerate.vercel.app/)  
**Repository:** [https://github.com/AryB16/UXcelerate](https://github.com/AryB16/UXcelerate)

---

## 1. Executive Summary & Design Challenge

### The Problem Brief
> *"Design an interface for coordinating rescue robots after an earthquake, where maps may be incomplete, communication may be unreliable, and robots continuously discover survivors, blocked paths, structural hazards, and new accessible routes."*

In post-earthquake disaster zones, every second counts during the **"Golden 72 Hours"**—the biological window during which trapped victims have the highest probability of survival. Traditional human search squads face lethal hazards: sudden secondary collapses from aftershocks, pockets of explosive methane gas, toxic dust, severed high-voltage mains, and collapsed crawlspaces inaccessible to human physiology.

While specialized robot swarms (aerial quadcopters, heavy quadrupeds, serpentine snakebots, and amphibious sump rovers) offer unprecedented penetration into disaster rubble, **existing human-robot interfaces fail dramatically in crisis conditions**.

### Why Traditional Robotics UIs Fail in Earthquakes
1. **The Infrastructure Fallacy**: Commercial drone/robot cockpits assume stable high-bandwidth WiFi, LTE/5G, or persistent GPS. In an earthquake, cellular towers are collapsed, subterranean voids block radio frequencies, and GPS signals cannot penetrate 5 meters of reinforced rebar concrete.
2. **The 1:1 Tele-Operation Bottleneck**: Requiring one dedicated human operator per robot creates catastrophic cognitive overload. In a 6-to-12 robot swarm, human operators cannot manually steer while simultaneously analyzing telemetry, watching for gas spikes, and tracking survivors.
3. **The Pre-Disaster Map Delusion**: Displaying pre-disaster CAD blueprints or satellite imagery misleads rescue teams. Floorplates pancake, shear walls deflect, and stairs collapse into impassable dead-ends.
4. **Binary Connectivity Assumptions**: Most software represents connection as a binary "Online/Offline" toggle. When an offline robot is erased from the map, operators lose situational awareness, often abandoning robots or double-searching hazardous voids.

---

## 2. The AEGIS Design Philosophy: The 4 Tenets

AEGIS-USAR (*Adaptive Earthquake Ground & Infrastructure Swarm*) was engineered around four core tenets of crisis ergonomics:

```
                  ┌────────────────────────────────────────┐
                  │          AEGIS-USAR PARADIGM           │
                  └────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│     EPISTEMIC     │        │  RESILIENT GHOST  │        │    SUPERVISORY    │
│      MAPPING      │        │     MESH U/X      │        │   SWARM CONTROL   │
├───────────────────┤        ├───────────────────┤        ├───────────────────┤
│ Multi-layer decay │        │ Store-and-Forward │        │ 1 Operator to 6+  │
│ Fog of Uncertainty│        │ Dead-reckoning    │        │ 1-Click fallback  │
│ Real-time SLAM    │        │ Breadcrumb repeat │        │ to direct FPV     │
└───────────────────┘        └───────────────────┘        └───────────────────┘
                                      │
                                      ▼
                             ┌───────────────────┐
                             │  STRESS-TESTED    │
                             │   ACCESSIBILITY   │
                             ├───────────────────┤
                             │ WCAG 2.2 AAA      │
                             │ Multimodal Cues   │
                             │ START Triage Tags │
                             └───────────────────┘
```

1. **Epistemic Mapping (Representing What is Known, Unknown, and Decaying)**: Rather than presenting a static map, AEGIS visualizes the *confidence level* and *temporal freshness* of spatial data.
2. **Resilient Ghost Mesh UX (Graceful Degradation)**: Disconnected robots do not vanish; they enter "Ghost Mode" with last-known positions, dead-reckoning trajectories, and store-and-forward packet counters.
3. **Supervisory Autonomy with Instant Micro-Intervention**: Operators command swarms at a macro policy level (Sector Sweep, Acoustic Listen, Relay Anchor), with 1-click transition to multispectral First-Person View (FPV) teleoperation.
4. **Stress-Tested Accessibility & Cognitive Load Reduction**: Glare-resistant dark obsidian palette, colorblind-safe shape redundancy, procedural audio feedback, and full keyboard navigation.

---

## 3. Target User Personas & Crisis Journey

### Persona 1: Captain Elena Vance — USAR Incident Commander
* **Role:** Macro Strategic Command, Resource Allocation, Inter-Agency Coordination (FEMA / INSARAG).
* **Environment:** Mobile command tent, intense glare, background engine noise, extreme psychological pressure.
* **Pain Point:** *"I need to know which sectors are safe to send human firefighters into right now. If an aftershock has compromised a bearing column, I need that flagged immediately."*
* **AEGIS Feature:** Golden Hour countdown HUD, real-time Aftershock Risk meter, Sector Structural Ratings, and Safe Evacuation Corridor Pathfinder.

### Persona 2: Tariq Al-Mansoor — Swarm Tele-Ops Specialist
* **Role:** Fleet health monitoring, RF mesh maintenance, subterranean borescope piloting.
* **Environment:** Dual-monitor tactical field station, wearing nitrile gloves.
* **Pain Point:** *"When Serpens-3 dives into the elevator shaft, RF will drop. I need to know its projected path and exactly where to drop a repeater rover to re-establish the link."*
* **AEGIS Feature:** Swarm Roster with battery/RSSI meters, Ghost Mode dead-reckoning vectors, 1-Click RF Relay Beacon Deployer, and Store-and-Forward Telemetry Ingest.

### Persona 3: Dr. Marcus Chen — Field Paramedic & Triage Lead
* **Role:** Victim triage, survivability window estimation, extraction prioritization.
* **Environment:** Triage medical staging tent.
* **Pain Point:** *"I need objective biosignals—heart rate, respiration, entrapment depth—so I can prioritize who gets extricated first according to the START protocol."*
* **AEGIS Feature:** START Protocol Survivor Queue (Red/Yellow/Green), live simulated ECG pulse readouts, entrapment depth meters, and 1-Click Life Support Payload Dispatch.

---

## 4. In-Depth Solutions to the 4 Core Competition Challenges

### Challenge A: Incomplete & Dynamic Maps
* **3-Layer Epistemic Canvas:**
  1. *CAD/Blueprint Ghost Layer:* Faded architectural vectors showing original pre-quake layout.
  2. *Real-Time LiDAR SLAM Layer:* Active pointclouds rendered in glowing cyan as robots physically traverse voids.
  3. *Fog of Uncertainty:* Uninspected rubble is covered with diagonal caution hatching, preventing premature assumptions of safety.
* **Temporal Staleness Decay Gradient:**
  - When an area has not been swept by a robot for >15 minutes, the interface applies an amber pulsing staleness warning: `⚠️ STALENESS: 19m (AFTERSHOCK DRIFT RISK)`. This reflects real-world geotechnical realities where aftershocks shift rubble piles over time.

### Challenge B: Unreliable & Intermittent Communications
* **Ghost Mode & Dead Reckoning:**
  - When a robot's RF signal drops below carrier threshold, it does not disappear from the screen.
  - The UI pins its **Last Known Confirmed Position**, extends a **Dashed Projected Vector** based on its last velocity, and renders an **Expanding Uncertainty Ellipse** ($\pm \Delta r = v \cdot \Delta t$).
* **Store-and-Forward Telemetry Buffer:**
  - Offline robots switch to autonomous exploration, buffering SLAM voxels, gas readings, and acoustic samples into local memory.
  - The UI displays a live counter: `42 PKTS BUFFERED`.
  - When the link is restored, a melodic reconnect chime plays, and all buffered data instantly ingests and updates the master map.
* **Breadcrumb Relay Deployment:**
  - The operator can click "Deploy RF Beacon" and drop a repeater node at any point in the field, immediately expanding the mesh footprint and bringing ghost robots back online.

### Challenge C: Continuous Discovery of Survivors, Hazards & Routes
* **START Triage Classification:**
  - Automatic categorization of survivors into:
    - **Red (Immediate):** Critical vitals, active compression, survivability window < 12 hours.
    - **Yellow (Delayed):** Stable vitals, superficial rubble.
    - **Green (Minor):** Ambulatory or minor entrapment.
* **Multi-Modal Sensor Fusion:**
  - Merges acoustic geophone data (rhythmic tapping detection at 180 Hz), FLIR thermal signatures (37.1°C body heat hotspot), and barometric depth gauges.
* **Dynamic Corridor Pathfinding:**
  - Corridors are color-coded:
    - **Cyan Solid:** Clear route (passable for human rescue teams).
    - **Yellow Dashed:** Hazardous route (confined space or SCBA gear required).
    - **Red Crossbar:** Blocked route (pancake collapse or heavy joist blockage).
    - **Neon Green:** Newly discovered route (recently crawled by snakebot or drone).

### Challenge D: Operator Cognitive Ergonomics Under Crisis Stress
* **Supervisory Dashboard Architecture:**
  - 3-column layout: Fleet Roster on the left, Tactical Map in the center (60% screen width), Triage & Hazards on the right.
  - Global status bar pinned to top with high-glanceability vital statistics.
* **Procedural Web Audio Alerts:**
  - Sonar pings on biosignal detection, geiger clicks on gas threshold spikes, radio static on RF link degradation, and two-tone sirens on seismic aftershock warnings. Audio is toggleable with one click.
* **Full Keyboard Accessibility:**
  - `1`-`6` hotkeys for quick-selecting robots.
  - `Space` to pause/resume simulation.
  - `W A S D` directional tele-op when inside the FPV Cockpit.
  - `?` or `/` to open the UX Case Study modal.

---

## 5. Design System & WCAG 2.2 AAA Accessibility Audit

### Color Palette & Contrast Ratios
| Token Name | Hex Code | Role | Contrast Ratio vs Background | WCAG Level |
| :--- | :--- | :--- | :--- | :--- |
| **Obsidian Dark** | `#06090E` | Canvas / Base Background | N/A | N/A |
| **Tactical Cyan** | `#00F0FF` | Primary telemetry, active mesh | **12.1 : 1** | **AAA** |
| **Emergency Rose** | `#F43F5E` | Immediate triage, seismic alert | **5.4 : 1** (Large/Bold) | **AAA** |
| **Hazard Amber** | `#F59E0B` | Gas leaks, structural tilt, degraded comms | **8.9 : 1** | **AAA** |
| **Verified Emerald** | `#10B981` | Safe corridors, full signal, safe extraction | **7.8 : 1** | **AAA** |
| **Slate Fog** | `#94A3B8` | Subordinate labels, CAD blueprint | **5.2 : 1** | **AA** |

### Colorblind-Safe Redundant Coding
Every safety-critical state in AEGIS uses at least **three redundant sensory channels**:
1. **Immediate Triage:** Red hue + Pulsing animation + START `[RED // IMMEDIATE]` text label + Heartbeat ECG icon.
2. **Ghost Mode:** Rose hue + Dashed trajectory trail + `GHOST MODE` text + Elapsed time timer + WiFi-Off icon.
3. **Blocked Corridor:** Red hue + Broken line pattern + `⛔ BLOCKED` text + Concrete barrier symbol.

---

## 6. Heuristic Evaluation (Nielsen's 10 Heuristics for Disaster UI)

1. **Visibility of System Status:** The mission clock, Golden Window timer, mesh integrity percentage, robot battery, and RSSI latency are continuously visible.
2. **Match Between System and Real World:** Conforms to UN INSARAG markings, START triage protocols, and standard USAR engineering units (PPM, BPM, SpO2, tilt degrees).
3. **User Control and Freedom:** Operators can abort tele-op instantly via `ESC`, pause the simulation with `SPACE`, or manually re-route swarm priorities.
4. **Consistency and Standards:** Uniform visual hierarchy, standardized iconography from Lucide React, and consistent typography (`Chakra Petch` for HUD headers, `JetBrains Mono` for telemetry, `Inter` for prose).
5. **Error Prevention:** Prohibits routing human teams through corridors intersecting active gas leaks or critical-tilt columns.
6. **Recognition Rather than Recall:** All robot sensor payloads and current tasks are exposed directly on the card without nested drill-downs.
7. **Flexibility and Efficiency of Use:** Novice commanders can rely on the macro map; expert operators can use WASD keyboard tele-operation.
8. **Aesthetic and Minimalist Design:** Information density is high, but visual clutter is reduced through collapsible panels and layer toggles.
9. **Help Users Recognize, Diagnose, and Recover from Errors:** When a comms drop occurs, the UI immediately suggests a corrective action: *"Deploy RF Relay Beacon at coordinates [X, Y] to restore mesh link."*
10. **Help and Documentation:** Built-in interactive UX Case Study and Design System specification accessible directly via the top navigation bar.

---

## 7. Conclusion & Impact

AEGIS-USAR demonstrates how thoughtful, research-grounded UI/UX design can transform raw robotic hardware into an intuitive, life-saving mission control deck. By directly addressing the real-world constraints of **incomplete maps**, **unreliable mesh communication**, and **dynamic hazard discovery**, AEGIS equips first responders to maximize survivor extraction during the Golden 72 Hours.
