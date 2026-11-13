export type DoorMotionSound = { update: (progress: number, speed: number) => void; stop: () => void };

/** Shared Web Audio analysis and a short, original navigation click. Recordings stay in HTMLAudioElement. */
class StudioAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private recordings = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private voices = new Set<AudioScheduledSourceNode>();

  private async unlock(gesture = false) {
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
      if (!gesture && !navigator.userActivation?.hasBeenActive) return false;
      await this.context.resume();
    }
    return this.context.state === "running";
  }

  private track(source: AudioScheduledSourceNode, nodes: AudioNode[]) {
    this.voices.add(source);
    source.onended = () => { this.voices.delete(source); source.disconnect(); nodes.forEach(node => node.disconnect()); };
  }

  prepare(gesture = false) { return this.unlock(gesture).catch(() => false); }

  /** Stick-slip hinge squeaks: short "keet-keet" bursts while the door moves. */
  async startDoorMotion(): Promise<DoorMotionSound|null> {
    if (!(await this.prepare(true)) || !this.context || !this.output) return null;
    const ctx=this.context,now=ctx.currentTime;
    const hinge=ctx.createOscillator(),grain=ctx.createBufferSource();
    const resonance=ctx.createBiquadFilter(),friction=ctx.createBiquadFilter();
    const hingeGain=ctx.createGain(),grainGain=ctx.createGain();
    const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    hinge.type="sawtooth";hinge.frequency.value=240;
    resonance.type="bandpass";resonance.frequency.value=1100;resonance.Q.value=3.2;
    grain.buffer=buffer;grain.loop=true;friction.type="bandpass";friction.frequency.value=1450;friction.Q.value=2.8;
    hingeGain.gain.setValueAtTime(0,now);grainGain.gain.setValueAtTime(0,now);
    hinge.connect(resonance).connect(hingeGain).connect(this.output);
    grain.connect(friction).connect(grainGain).connect(this.output);
    this.track(hinge,[resonance,hingeGain]);this.track(grain,[friction,grainGain]);
    hinge.start(now);grain.start(now);
    let stopped=false,scrapePhase=.08,lastUpdate=now;
    return {
      update: (progress,speed) => {
        if(stopped||ctx.state!=="running")return;
        const time=ctx.currentTime,p=Math.max(0,Math.min(1,progress));
        const moving=speed>.008,motion=moving?.3+.7*Math.sqrt(Math.min(1,speed/1.4)):0;
        // Friction catches, releases, and catches again; faster pulls repeat sooner.
        if(moving)scrapePhase+=Math.min(.1,time-lastUpdate)*(2.6+Math.min(1,speed)*2.2);
        lastUpdate=time;
        const cycle=scrapePhase*Math.PI*2;
        const squeak=Math.pow(Math.max(0,Math.sin(cycle)),.65);
        const pitch=230-p*70+Math.sin(cycle-.5)*55+Math.sin(p*51)*12;
        hinge.frequency.setTargetAtTime(pitch,time,.012);
        resonance.frequency.setTargetAtTime(950+p*500+Math.sin(cycle)*180,time,.018);
        friction.frequency.setTargetAtTime(1250+p*650,time,.025);
        hingeGain.gain.setTargetAtTime(.085*motion*squeak,time,.008);
        grainGain.gain.setTargetAtTime(.16*motion*squeak,time,.01);
      },
      stop: () => {
        if(stopped)return;stopped=true;
        if(ctx.state==="closed")return;
        const time=ctx.currentTime;
        hingeGain.gain.setTargetAtTime(0,time,.02);grainGain.gain.setTargetAtTime(0,time,.02);
        try{hinge.stop(time+.1);grain.stop(time+.1);}catch{ /* Already disposed. */ }
      },
    };
  }

  /** Low pump hum and filtered water noise, stopped when the lever is released. */
  async brew(): Promise<() => void> {
    if (!(await this.prepare()) || !this.context || !this.output) return () => {};
    const ctx = this.context, now = ctx.currentTime;
    const pump = ctx.createOscillator(), water = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter(), hum = ctx.createGain(), hiss = ctx.createGain();
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    pump.type = "triangle"; pump.frequency.value = 74;
    hum.gain.setValueAtTime(0, now); hum.gain.linearRampToValueAtTime(.055, now + .15);
    water.buffer = buffer; water.loop = true;
    filter.type = "lowpass"; filter.frequency.value = 680;
    hiss.gain.setValueAtTime(0, now); hiss.gain.linearRampToValueAtTime(.11, now + .2);
    pump.connect(hum).connect(this.output); water.connect(filter).connect(hiss).connect(this.output);
    this.track(pump, [hum]); this.track(water, [filter, hiss]);
    pump.start(); water.start();
    // A safety stop also bounds playback if a page is interrupted mid-gesture.
    pump.stop(now + 3); water.stop(now + 3);
    let stopped = false;
    return () => {
      if (stopped || ctx.state === "closed") return;
      stopped = true;
      const end = ctx.currentTime;
      hum.gain.cancelScheduledValues(end); hiss.gain.cancelScheduledValues(end);
      hum.gain.setTargetAtTime(0, end, .025); hiss.gain.setTargetAtTime(0, end, .025);
      try { pump.stop(end + .12); water.stop(end + .12); } catch { /* Already stopped. */ }
    };
  }

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

  /** Cached noise for the short, unpitched walking and door cues below. */
  private noiseBuffer: AudioBuffer | null = null;
  private noise(ctx: AudioContext) {
    if(!this.noiseBuffer||this.noiseBuffer.length!==Math.ceil(ctx.sampleRate*.5)){
      this.noiseBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.5),ctx.sampleRate);
      const data=this.noiseBuffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    }
    return this.noiseBuffer;
  }

  /** A padded footstep: filtered noise for the sole, a quiet low body for the weight. */
  async footstep(volume=.5){
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    if(this.voices.size>=8)return;
    const length=.09,vary=.92+Math.random()*.16;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=this.noise(ctx);
    filter.type="bandpass";filter.frequency.value=(430+Math.random()*170)*vary;filter.Q.value=1.1;
    gain.gain.setValueAtTime(.0001,time);
    gain.gain.exponentialRampToValueAtTime(.13*volume,time+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,time+length);
    source.connect(filter).connect(gain).connect(this.output);
    this.track(source,[filter,gain]);source.start(time);source.stop(time+length+.01);
    const body=ctx.createOscillator(),bodyGain=ctx.createGain();
    body.type="sine";body.frequency.setValueAtTime(104*vary,time);body.frequency.exponentialRampToValueAtTime(62*vary,time+.06);
    bodyGain.gain.setValueAtTime(.0001,time);bodyGain.gain.exponentialRampToValueAtTime(.075*volume,time+.006);
    bodyGain.gain.exponentialRampToValueAtTime(.0001,time+.08);
    body.connect(bodyGain).connect(this.output);this.track(body,[bodyGain]);body.start(time);body.stop(time+.09);
  }

  /** Knuckles on hollow wood: a muffled body tone, a dry click and a short low thud. */
  async knock(){
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    if(this.voices.size>=9)return;
    const wood=ctx.createOscillator(),woodFilter=ctx.createBiquadFilter(),woodGain=ctx.createGain();
    wood.type="triangle";
    wood.frequency.setValueAtTime(178,time);wood.frequency.exponentialRampToValueAtTime(126,time+.05);
    woodFilter.type="bandpass";woodFilter.frequency.value=320;woodFilter.Q.value=2.4;
    woodGain.gain.setValueAtTime(.0001,time);woodGain.gain.exponentialRampToValueAtTime(.3,time+.002);
    woodGain.gain.exponentialRampToValueAtTime(.0001,time+.075);
    wood.connect(woodFilter).connect(woodGain).connect(this.output);
    this.track(wood,[woodFilter,woodGain]);wood.start(time);wood.stop(time+.09);
    const click=ctx.createBufferSource(),clickFilter=ctx.createBiquadFilter(),clickGain=ctx.createGain();
    click.buffer=this.noise(ctx);
    clickFilter.type="highpass";clickFilter.frequency.value=1700;
    clickGain.gain.setValueAtTime(.5,time);clickGain.gain.exponentialRampToValueAtTime(.0001,time+.012);
    click.connect(clickFilter).connect(clickGain).connect(this.output);
    this.track(click,[clickFilter,clickGain]);click.start(time);click.stop(time+.02);
    const thud=ctx.createOscillator(),thudGain=ctx.createGain();
    thud.type="sine";thud.frequency.setValueAtTime(82,time);thud.frequency.exponentialRampToValueAtTime(58,time+.06);
    thudGain.gain.setValueAtTime(.0001,time);thudGain.gain.exponentialRampToValueAtTime(.16,time+.004);
    thudGain.gain.exponentialRampToValueAtTime(.0001,time+.07);
    thud.connect(thudGain).connect(this.output);this.track(thud,[thudGain]);thud.start(time);thud.stop(time+.08);
  }

  /** A paper-page lift: airy rising band of noise as the page edge is pulled up. */
  async swoosh(){
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=this.noise(ctx);
    filter.type="bandpass";filter.Q.value=1.1;
    filter.frequency.setValueAtTime(340,time);
    filter.frequency.exponentialRampToValueAtTime(2250,time+.33);
    filter.frequency.exponentialRampToValueAtTime(780,time+.62);
    gain.gain.setValueAtTime(.0001,time);
    gain.gain.exponentialRampToValueAtTime(.13,time+.12);
    gain.gain.exponentialRampToValueAtTime(.0001,time+.68);
    source.connect(filter).connect(gain).connect(this.output);
    this.track(source,[filter,gain]);source.start(time);source.stop(time+.7);
  }

  /** A small paper grip: three dry, quiet crinkles. */
  async rustle(){
    if(!(await this.unlock())||!this.context||!this.output)return;
    const ctx=this.context,time=ctx.currentTime;
    if(this.voices.size>=8)return;
    for(const [delay,level] of [[0,.5],[.07,.32],[.13,.2]] as const){
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=this.noise(ctx);
      filter.type="highpass";filter.frequency.value=1150+Math.random()*700;
      const start=time+delay;
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(.07*level,start+.005);
      gain.gain.exponentialRampToValueAtTime(.0001,start+.05);
      source.connect(filter).connect(gain).connect(this.output);
      this.track(source,[filter,gain]);source.start(start);source.stop(start+.06);
    }
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

export function playFootstep(volume?:number){void studioAudio.footstep(volume).catch(()=>{});}

export function playKnock(){void studioAudio.knock().catch(()=>{});}

export function playPageSwoosh(){void studioAudio.swoosh().catch(()=>{});}

export function playPaperRustle(){void studioAudio.rustle().catch(()=>{});}

export function playHelloGreeting(){return studioAudio.hello().catch(()=>false);}
