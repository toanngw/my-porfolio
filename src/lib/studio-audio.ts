/** Shared Web Audio analysis and a short, original navigation click. Recordings stay in HTMLAudioElement. */
class StudioAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recordings = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private voices = new Set<AudioScheduledSourceNode>();
  clicksEnabled = true;

  private async unlock() {
    if (typeof window === "undefined" || !window.AudioContext) return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.output = this.context.createGain();
      this.output.gain.value = 0.55;
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.output.connect(this.analyser).connect(this.context.destination);
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
    envelope.gain.exponentialRampToValueAtTime(0.32, time + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
    tone.connect(envelope).connect(this.output);
    this.track(tone, [envelope]); tone.start(time); tone.stop(time + 0.04);
  }

  readSpectrum(data: Uint8Array<ArrayBuffer>) {
    if (this.analyser) this.analyser.getByteFrequencyData(data);
    else data.fill(0);
  }

  async connectRecording(element: HTMLMediaElement) {
    if (!(await this.unlock()) || !this.context || !this.analyser) return;
    if (!this.recordings.has(element)) {
      const source = this.context.createMediaElementSource(element);
      source.connect(this.analyser);
      this.recordings.set(element, source);
    }
  }

  dispose() {
    this.voices.forEach(source => {try {source.stop();} catch { /* Already ended. */ }});
    if (this.context) void this.context.close();
    this.voices.clear();
    this.context = null; this.output = null; this.analyser = null;
    this.recordings = new WeakMap();
  }
}

export const studioAudio = new StudioAudio();
export function playNavigationClick() { void studioAudio.click().catch(() => { /* Navigation remains usable without audio. */ }); }
