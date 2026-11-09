/** Original, locally synthesized instrumental. No downloads, samples, or lyrics. */
class StudioAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private music: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private voices = new Set<AudioScheduledSourceNode>();
  private nextBeat = 0;
  private beat = 0;
  private volume = 0.35;
  private musicEnabled = false;
  clicksEnabled = true;

  private async unlock() {
    if (typeof window === "undefined" || !window.AudioContext) return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.output = this.context.createGain();
      this.output.gain.value = this.volume * 0.35;
      this.output.connect(this.context.destination);
      this.music = this.context.createGain();
      this.music.gain.value = 0;
      const filter = this.context.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 2500;
      this.music.connect(filter).connect(this.output);
      this.noise = this.context.createBuffer(1, this.context.sampleRate * 0.3, this.context.sampleRate);
      const samples = this.noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    if (this.context.state === "suspended") await this.context.resume();
    return this.context.state === "running";
  }

  private track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    this.voices.add(source);
    source.onended = () => { this.voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  }

  async click() {
    if (!this.clicksEnabled || !(await this.unlock()) || !this.context || !this.output) return;
    const time = this.context.currentTime;
    const tone = this.context.createOscillator();
    const envelope = this.context.createGain();
    tone.type = "sine";
    tone.frequency.setValueAtTime(1100, time);
    tone.frequency.exponentialRampToValueAtTime(520, time + 0.027);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.2, time + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
    tone.connect(envelope).connect(this.output);
    this.track(tone, [envelope]); tone.start(time); tone.stop(time + 0.04);
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.context && this.output) this.output.gain.setTargetAtTime(this.volume * 0.35, this.context.currentTime, 0.04);
  }

  private note(midi: number, time: number, duration: number, level: number, type: OscillatorType = "sine") {
    if (!this.context || !this.music) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(level, time + 0.025);
    envelope.gain.exponentialRampToValueAtTime(level * 0.5, time + Math.min(0.65, duration * 0.45));
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(envelope).connect(this.music);
    this.track(oscillator, [envelope]); oscillator.start(time); oscillator.stop(time + duration + 0.04);
  }

  private percussion(time: number, hat: boolean) {
    if (!this.context || !this.music || !this.noise) return;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    source.buffer = this.noise;
    filter.type = "highpass"; filter.frequency.value = hat ? 6000 : 1200;
    const duration = hat ? 0.035 : 0.12;
    envelope.gain.setValueAtTime(hat ? 0.065 : 0.12, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter).connect(envelope).connect(this.music);
    this.track(source, [filter, envelope]); source.start(time); source.stop(time + duration + 0.01);
  }

  private schedule = () => {
    if (!this.context || !this.musicEnabled || document.hidden) return;
    if (this.nextBeat < this.context.currentTime - 0.1) this.nextBeat = this.context.currentTime + 0.04;
    const eighth = 60 / 74 / 2;
    while (this.nextBeat < this.context.currentTime + 0.12) {
      const step = this.beat % 8;
      const bar = Math.floor(this.beat / 8) % 4;
      const time = this.nextBeat + (step % 2 ? eighth * 0.12 : 0);
      const chords = [[53, 57, 60, 64], [50, 53, 57, 60], [45, 52, 55, 60], [48, 52, 55, 59]];
      const chord = chords[bar];
      if (step === 0 || step === 5) chord.forEach((note, i) => {
        this.note(note + 12, time + i * 0.012, step === 0 ? 2.3 : 1.1, 0.095, "triangle");
        this.note(note + 12.025, time + i * 0.012, step === 0 ? 2 : 0.9, 0.035);
      });
      if (step === 0 || step === 4) { this.note(chord[0] - 12, time, 0.55, 0.3); this.note(30, time, 0.14, 0.43); }
      if (step === 2 || step === 6) this.percussion(time, false);
      this.percussion(time, true);
      if (step === 3 || step === 7) this.note(chord[(bar + step) % 4] + 24, time, 0.75, 0.045);
      this.beat++; this.nextBeat += eighth;
    }
  };

  async startMusic() {
    if (!(await this.unlock()) || !this.context || !this.music) return false;
    this.musicEnabled = true;
    this.music.gain.cancelScheduledValues(this.context.currentTime);
    this.music.gain.setTargetAtTime(1, this.context.currentTime, 0.22);
    if (!this.timer) {
      this.nextBeat = this.context.currentTime + 0.04; this.beat = 0;
      this.schedule(); this.timer = setInterval(this.schedule, 30);
    }
    return true;
  }

  stopMusic() {
    this.musicEnabled = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.context && this.music) {
      const now = this.context.currentTime;
      this.music.gain.cancelScheduledValues(now);
      this.music.gain.setTargetAtTime(0, now, 0.07);
      this.voices.forEach(source => { try { source.stop(now + 0.3); } catch { /* Already ended. */ } });
    }
  }

  dispose() {
    this.stopMusic();
    if (this.context) void this.context.close();
    this.voices.clear();
    this.context = null; this.output = null; this.music = null; this.noise = null;
  }
}

export const studioAudio = new StudioAudio();
export function playNavigationClick() { void studioAudio.click().catch(() => { /* Navigation remains usable without audio. */ }); }
