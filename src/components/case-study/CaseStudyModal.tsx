import React, { useState, useEffect } from 'react';
import { useMission } from '../../store/MissionContext';
import {
  X,
  BookOpen,
  Users,
  Layers,
  Palette,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Cpu,
  Heart,
} from 'lucide-react';

export const CaseStudyModal: React.FC = () => {
  const { isCaseStudyOpen, setIsCaseStudyOpen, activeCaseStudyTab } = useMission();

  const [currentTab, setCurrentTab] = useState<string>(activeCaseStudyTab || 'summary');

  useEffect(() => {
    if (!isCaseStudyOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCaseStudyOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCaseStudyOpen, setIsCaseStudyOpen]);

  if (!isCaseStudyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-6xl bg-[#080d1a] border border-cyan-500/50 rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-cyan-950/80 border border-cyan-400 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tactical-font">
                  AEGIS-USAR // COMPREHENSIVE UI/UX CASE STUDY & DESIGN SPEC
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-sm bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  UXCELERATE 2026 SUBMISSION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Post-Earthquake Robot Swarm Coordination Under Extreme Uncertainty
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCaseStudyOpen(false)}
            className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          {[
            { id: 'summary', label: '1. Executive Summary', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'personas', label: '2. Personas & Journey', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'challenges', label: '3. Core Challenges Solved', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'design_system', label: '4. Design System & WCAG', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'heuristics', label: '5. Heuristic Evaluation', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                currentTab === tab.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans text-slate-300 text-sm leading-relaxed">
          
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {currentTab === 'summary' && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-cyan-950/20 border border-cyan-500/30">
                <h3 className="text-base font-bold text-cyan-400 tactical-font mb-2">
                  The Problem Space & The "Golden 72 Hours"
                </h3>
                <p>
                  In the immediate aftermath of a major earthquake, Urban Search and Rescue (USAR) operations operate under the strict biological deadline of the <strong>Golden 72 Hours</strong>, after which victim survivability drops exponentially. Traditional ground rescue teams face extreme hazards: secondary structural collapses, ruptured gas mains, high-voltage ground faults, and inaccessible subterranean voids.
                </p>
                <p className="mt-2">
                  Deploying autonomous and semi-autonomous robot swarms (aerial drones, quadruped scouts, snake crawlers) is the future of USAR. However, existing commercial robotics interfaces fail catastrophically because they:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300 text-xs">
                  <li>Assume continuous, high-bandwidth WiFi or cellular infrastructure (which collapses instantly).</li>
                  <li>Rely on pre-disaster maps that bear zero resemblance to post-collapse rubble topography.</li>
                  <li>Require 1:1 human-to-robot piloting, causing crippling cognitive overload when scaling to swarms.</li>
                  <li>Fail to communicate probabilistic uncertainty, causing operators to mistake stale scans for safe passages.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800">
                  <div className="text-cyan-400 font-bold font-mono text-xs mb-1">SUPERVISORY AUTONOMY</div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">1 Operator to 6+ Robots</h4>
                  <p className="text-xs text-slate-400">
                    High-level directive dispatching (Sector sweep, acoustic listen, relay anchor) with instant 1-click fallback to micro-teleoperation.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800">
                  <div className="text-emerald-400 font-bold font-mono text-xs mb-1">EPISTEMIC MAPPING</div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">Fog of Uncertainty</h4>
                  <p className="text-xs text-slate-400">
                    Visual differentiation between pre-disaster blueprints, real-time verified LiDAR pointclouds, and decaying stale scans subject to aftershock collapse.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800">
                  <div className="text-amber-400 font-bold font-mono text-xs mb-1">RESILIENT MESH UX</div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">Ghost Telemetry & Relay Drop</h4>
                  <p className="text-xs text-slate-400">
                    Dead-reckoning trajectory projection when robots lose signal, store-and-forward telemetry buffering, and 1-click RF beacon deployment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAS & JOURNEY */}
          {currentTab === 'personas' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-cyan-400 tactical-font">
                Target User Personas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Persona 1 */}
                <div className="p-5 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold font-mono">
                      EV
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Captain Elena Vance</h4>
                      <p className="text-xs text-cyan-400 font-mono">USAR Incident Commander // Macro Strategy</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Environment:</strong> Mobile Command Tent, glaring daylight / dusty screens, high noise level.
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    <strong>Key Needs:</strong> Sector-wide bird's-eye view, total survivor triage tally, safe extraction corridors for human fire & rescue squads, and aftershock risk alerts.
                  </p>
                  <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2 rounded-sm border border-cyan-900/50">
                    "I cannot afford to send my human firefighters into Sector Beta without knowing if the bearing columns have sheared."
                  </div>
                </div>

                {/* Persona 2 */}
                <div className="p-5 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold font-mono">
                      TM
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Tariq Al-Mansoor</h4>
                      <p className="text-xs text-emerald-400 font-mono">Swarm Tele-Ops Specialist // Micro Control</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    <strong>Environment:</strong> Dual-screen field console, wearing tactical gloves, multi-tasking 6+ robots.
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    <strong>Key Needs:</strong> Instant battery and RF link status, dead-reckoning ghost tracking when robots crawl into basements, FPV borescope control, and breadcrumb relay dropping.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-2 rounded-sm border border-emerald-900/50">
                    "When Serpens-3 dives into an elevator shaft, I need to know its dead-reckoning trajectory and when to drop a repeater."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CORE CHALLENGES SOLVED */}
          {currentTab === 'challenges' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-cyan-400 tactical-font">
                Addressing the 4 Core Competition Constraints
              </h3>

              <div className="space-y-4">
                {/* Challenge 1 */}
                <div className="p-4 rounded-md bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-cyan-400 font-mono font-bold text-xs">
                    <Layers className="w-4 h-4" />
                    <span>CHALLENGE 1: INCOMPLETE MAPS & FOG OF UNCERTAINTY</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Design Solution:</strong> We implement a 3-Layer Epistemic Mapping Engine:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1">
                    <li><strong>CAD Ghost Grid:</strong> Faded blueprint baseline showing where walls originally stood before collapse.</li>
                    <li><strong>Live LiDAR SLAM Layer:</strong> Active pointclouds rendered in bright cyan as robots physically traverse voids.</li>
                    <li><strong>Staleness Decay Heatmap:</strong> Areas not re-scanned within 15 minutes turn amber/pulsing to alert commanders that ongoing aftershocks may have triggered secondary collapses.</li>
                  </ul>
                </div>

                {/* Challenge 2 */}
                <div className="p-4 rounded-md bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-rose-400 font-mono font-bold text-xs">
                    <Radio className="w-4 h-4" />
                    <span>CHALLENGE 2: UNRELIABLE / INTERMITTENT COMMUNICATIONS</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Design Solution:</strong> "Ghost Telemetry" & Breadcrumb Relay Architecture:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1">
                    <li><strong>Ghost Markers:</strong> When a robot drops below RF threshold, it doesn't vanish. A ghost marker displays its last confirmed position, an elapsed timer (`Lost: 05m 12s ago`), and a projected dead-reckoning trajectory.</li>
                    <li><strong>Store-and-Forward Buffer:</strong> Offline robots continue autonomous exploration, queueing LiDAR voxels and biosignals. When link is restored, a single burst flushes all telemetry to the central map.</li>
                    <li><strong>Breadcrumb Relay Deployer:</strong> Operators can drop RF repeater beacons onto the map with 1 click, bridging the comms gap.</li>
                  </ul>
                </div>

                {/* Challenge 3 */}
                <div className="p-4 rounded-md bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-mono font-bold text-xs">
                    <Heart className="w-4 h-4" />
                    <span>CHALLENGE 3: CONTINUOUS DYNAMIC DISCOVERIES & TRIAGE</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Design Solution:</strong> Sensor Fusion Triage & Automated Route Advisor:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1">
                    <li><strong>START Protocol Triage:</strong> Automatic classification into Immediate (Red), Delayed (Yellow), Minor (Green).</li>
                    <li><strong>Biosignal Fusion:</strong> Merges acoustic geophone rhythm (tapping), thermal IR FLIR body heat (37°C), and CO2 sniffer data.</li>
                    <li><strong>Dynamic Corridor Clearance:</strong> When snakebots find new crawlways or aftershocks block existing stairwells, corridors update dynamically with calculated width and risk score.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESIGN SYSTEM & WCAG */}
          {currentTab === 'design_system' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-cyan-400 tactical-font">
                Design System Tokens & Accessibility (WCAG 2.2 AAA)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-md bg-[#06090e] border border-cyan-500/40">
                  <div className="w-full h-8 rounded-sm bg-[#06090e] border border-slate-700 mb-2" />
                  <div className="font-bold text-white">Obsidian Base</div>
                  <div className="text-slate-500">#06090E</div>
                  <div className="text-[10px] text-cyan-400 mt-1">OLED Battery Save & Glare Shield</div>
                </div>

                <div className="p-3 rounded-md bg-slate-900 border border-cyan-500/40">
                  <div className="w-full h-8 rounded-sm bg-[#00F0FF] mb-2" />
                  <div className="font-bold text-white">Tactical Cyan</div>
                  <div className="text-slate-500">#00F0FF</div>
                  <div className="text-[10px] text-cyan-400 mt-1">11.4:1 Contrast Ratio (AAA)</div>
                </div>

                <div className="p-3 rounded-md bg-slate-900 border border-rose-500/40">
                  <div className="w-full h-8 rounded-sm bg-[#F43F5E] mb-2" />
                  <div className="font-bold text-white">Immediate Alert</div>
                  <div className="text-slate-500">#F43F5E</div>
                  <div className="text-[10px] text-rose-400 mt-1">START Red & Seismic Warning</div>
                </div>

                <div className="p-3 rounded-md bg-slate-900 border border-emerald-500/40">
                  <div className="w-full h-8 rounded-sm bg-[#10B981] mb-2" />
                  <div className="font-bold text-white">Mesh Verified</div>
                  <div className="text-slate-500">#10B981</div>
                  <div className="text-[10px] text-emerald-400 mt-1">RF Connected & Safe Corridor</div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-slate-900/60 border border-slate-800 text-xs">
                <h4 className="font-bold text-slate-100 mb-2 font-mono">COLORBLIND-SAFE REDUNDANCY</h4>
                <p className="text-slate-300">
                  In accordance with Universal Design and WCAG guidelines, no critical piece of information relies solely on color:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 font-mono text-[11px]">
                  <div className="p-2 rounded-sm bg-slate-950 border border-slate-800">
                    <span className="text-rose-400 font-bold">Immediate Triage:</span> Red color + Pulsing animation + Text badge "[RED // IMMEDIATE]" + Warning icon.
                  </div>
                  <div className="p-2 rounded-sm bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-bold">Comms Loss:</span> Amber color + "GHOST" text + Last known timestamp + WiFi-Off icon.
                  </div>
                  <div className="p-2 rounded-sm bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold">Route Block:</span> Red color + Dashed line + Red cross barrier + "⛔ BLOCKED" label.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HEURISTICS EVALUATION */}
          {currentTab === 'heuristics' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-cyan-400 tactical-font">
                Nielsen's 10 Usability Heuristics in Disaster Contexts
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="font-bold text-slate-100 font-mono mb-1">
                    1. Visibility of System Status
                  </div>
                  <p className="text-slate-300">
                    Continuous feedback on Golden Hour timer, mesh RF integrity percentage, robot battery gauges, and dead reckoning elapsed time for offline units.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="font-bold text-slate-100 font-mono mb-1">
                    2. Match Between System and the Real World
                  </div>
                  <p className="text-slate-300">
                    Adopts official United Nations INSARAG (International Search and Rescue Advisory Group) standard markings, START triage categorization, and real-world sensor terminology (FLIR, LiDAR, PPM, Geophone).
                  </p>
                </div>

                <div className="p-3 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="font-bold text-slate-100 font-mono mb-1">
                    3. User Control and Freedom
                  </div>
                  <p className="text-slate-300">
                    Full keyboard navigation (WASD tele-op, ESC to exit cockpit, Space to pause simulation), modal dismissals, and quick layer toggling to strip clutter during high-stress decisions.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-slate-900/70 border border-slate-800">
                  <div className="font-bold text-slate-100 font-mono mb-1">
                    4. Error Prevention & Recovery
                  </div>
                  <p className="text-slate-300">
                    Safe corridor routing automatically excludes areas with active explosive gas leaks or structural tilt above 80% stress threshold. Beacon drop allows immediate recovery of lost robots.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            AEGIS-USAR • Created for UXcelerate 2026 Competition
          </span>
          <button
            onClick={() => setIsCaseStudyOpen(false)}
            className="px-4 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Close Case Study
          </button>
        </div>

      </div>
    </div>
  );
};
