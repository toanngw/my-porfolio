/** Shared Web Audio analysis and a short, original navigation click. Recordings stay in HTMLAudioElement. */
class StudioAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private recordings = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private voices = new Set<AudioScheduledSourceNode>();

  private async unlock() {
    if (typeof window === "undefined" || !window.AudioContext) return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.output = this.context.createGain();
      this.output.gain.value = 0.85;
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.limiter=this.context.createDynamicsCompressor();
      this.limiter.threshold.value=-8;this.limiter.knee.value=8;this.limiter.ratio.value=8;
      this.limiter.attack.value=.002;this.limiter.release.value=.075;
      this.output.connect(this.limiter).connect(this.analyser).connect(this.context.destination);
    }
    if (this.context.state === "suspended") {
      if (!navigator.userActivation?.hasBeenActive) return false;
      await this.context.resume();
    }
    return this.context.state === "running";
  }

  private track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    this.voices.add(source);
    source.onended = () => { this.voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  }

  prepare() { return this.unlock().catch(() => false); }

  /** A tiny two-syllable voxel voice, synthesized locally rather than downloaded. */
  private lastHello = -Infinity;
  async hello() {
    if (!(await this.unlock()) || !this.context || !this.output) return false;
    const ctx=this.context,time=ctx.currentTime;
    if(time-this.lastHello<1.2)return true;
    this.lastHello=time;
    // Soft formant-like filters make the rising greeting warmer than a UI beep.
    for(const [delay,duration,pitch,formant] of [[0,.16,205,850],[.18,.30,245,600]]){
      const source=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      const start=time+delay,end=start+duration;
      source.type="triangle";
      source.frequency.setValueAtTime(pitch*.92,start);
      source.frequency.exponentialRampToValueAtTime(pitch*1.12,start+duration*.55);
      source.frequency.exponentialRampToValueAtTime(pitch,end);
      filter.type="lowpass";filter.frequency.setValueAtTime(formant,start);filter.Q.value=1.6;
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(.25,start+.025);
      gain.gain.exponentialRampToValueAtTime(.17,start+duration*.6);
      gain.gain.exponentialRampToValueAtTime(.0001,end);
      source.connect(filter).connect(gain).connect(this.output);
      this.track(source,[filter,gain]);source.start(start);source.stop(end+.015);
    }
    return true;
  }

  private lastClick = -1;
  private lastClack = -1;
  private clickBuffer: AudioBuffer | null = null;
  async click(steps = 1) {
    if (!(await this.unlock()) || !this.context || !this.output) return;
    const time = this.context.currentTime;
    if(time-this.lastClick<0.04||time-this.lastClack<.075||this.voices.size>=6)return;
    this.lastClick=time;
    if(!this.clickBuffer){
      this.clickBuffer=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*0.055),this.context.sampleRate);
      const data=this.clickBuffer.getChannelData(0);
      for(let i=0;i<data.length;i++){
        const t=i/this.context.sampleRate;
        // Two dry impacts: no oscillator or pitched musical tone.
        data[i]=(Math.random()*2-1)*(Math.exp(-t*62)+0.5*Math.exp(-Math.abs(t-0.008)*850));
      }
    }
    for (let step=0;step<steps;step++) {
    const start=time+step*0.085;
    const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),body=this.context.createBiquadFilter(),envelope=this.context.createGain();
    source.buffer=this.clickBuffer;
    filter.type="lowpass";filter.frequency.value=3200;filter.Q.value=0.45;
    body.type="lowshelf";body.frequency.value=650;body.gain.value=5;
    envelope.gain.setValueAtTime(0.63,start);
    envelope.gain.exponentialRampToValueAtTime(0.0001,start+0.055);
    source.connect(filter).connect(body).connect(envelope).connect(this.output);
    this.track(source,[filter,body,envelope]);source.start(start);source.stop(start+0.06);
    }
  }

  /** A dry latch impact plus a short low-frequency noise thump, never a musical note. */
  async clack() {
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    if(time-this.lastClack<.1||this.voices.size>=6)return;
    this.lastClack=time;this.lastClick=time;
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.085),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++){const t=i/ctx.sampleRate;data[i]=(Math.random()*2-1)*(Math.exp(-t*68)+.4*Math.exp(-Math.abs(t-.009)*650));}
    for(const [frequency,volume,decay] of [[2600,.95,.06],[230,2.2,.08]]){
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=buffer;filter.type="lowpass";filter.frequency.value=frequency;filter.Q.value=.55;
      gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.0001,time+decay);
      source.connect(filter).connect(gain).connect(this.output);this.track(source,[filter,gain]);source.start(time);source.stop(time+.085);
    }
  }

  /** Soft, unpitched cartoon desk contact. Separate from music and wheel effects. */
  async thump(){
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.13),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/ctx.sampleRate*42);
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=buffer;filter.type="lowpass";filter.frequency.value=380;filter.Q.value=.65;
    gain.gain.setValueAtTime(.8,time);gain.gain.exponentialRampToValueAtTime(.0001,time+.13);
    source.connect(filter).connect(gain).connect(this.output);this.track(source,[filter,gain]);source.start(time);source.stop(time+.14);
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
    this.context = null; this.output = null; this.analyser = null;this.limiter=null;this.clickBuffer=null;this.lastClick=-1;this.lastClack=-1;
    this.recordings = new WeakMap();this.lastHello=-Infinity;
  }
}

export const studioAudio = new StudioAudio();

export function playScrollTick() { void studioAudio.click().catch(() => {}); }

export function playBoundaryClack() { void studioAudio.clack().catch(() => {}); }

export function playDeskThump(){void studioAudio.thump().catch(()=>{});}

export function playHelloGreeting(){return studioAudio.hello().catch(()=>false);}
