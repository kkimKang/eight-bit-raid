export class ChipAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    void this.ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq: number, dur = 0.08, type: OscillatorType = "square", gain = 0.045): void {
    if (this.muted || !this.ctx) {
      return;
    }
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  jump(): void {
    this.tone(480, 0.07);
  }

  hit(): void {
    this.tone(240, 0.05);
  }

  hurt(): void {
    this.tone(90, 0.14, "sawtooth", 0.05);
  }

  skill(): void {
    this.tone(620, 0.08);
  }

  buy(): void {
    this.tone(700, 0.07);
  }

  deny(): void {
    this.tone(120, 0.12, "triangle");
  }

  ultimate(): void {
    this.tone(880, 0.18);
    this.tone(1320, 0.22, "square", 0.03);
  }

  win(): void {
    [523, 659, 784, 1046].forEach((freq, i) => {
      window.setTimeout(() => this.tone(freq, 0.12), i * 90);
    });
  }

  lose(): void {
    [392, 311, 247].forEach((freq, i) => {
      window.setTimeout(() => this.tone(freq, 0.16, "sawtooth", 0.04), i * 110);
    });
  }

  stomp(): void {
    this.tone(70, 0.16, "sawtooth", 0.07);
  }
}

export const audio = new ChipAudio();
