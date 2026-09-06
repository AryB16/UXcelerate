class TacticalSoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage preference
    const saved = localStorage.getItem('aegis_sound_muted');
    this.isMuted = saved === 'true';

    // Autoplay guard: unlock AudioContext upon first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        try {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        } catch {}
      };
      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Autoplay policy prevented resumption until user gesture; silently ignore
        });
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('aegis_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Sonar ping when a survivor or vital sign is detected
  public playSonarPing() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.75);
    } catch {
      // Audio safety fallback
    }
  }

  // High-tech UI click/beep
  public playTacticalClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // Two-tone emergency alert klaxon (Aftershock / secondary collapse)
  public playEmergencyAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(600, now + 0.15);
      osc.frequency.setValueAtTime(900, now + 0.3);
      osc.frequency.setValueAtTime(600, now + 0.45);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      // Lowpass filter to soften the harsh sawtooth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  // Radio static burst when connection is degraded or lost
  public playRadioStatic() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.2; // 200ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  // Mesh reconnect melodic chime (Store-and-forward telemetry restored)
  public playReconnectChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {}
  }

  // Crisp military radar target acquisition lock (Double high-pitch chirps)
  public playTargetLock() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.12].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + offset;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 1100 : 1760, t);
        osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 1400 : 2200, t + 0.08);

        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {}
  }
}

export const soundManager = new TacticalSoundManager();
