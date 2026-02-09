
class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private initialized: boolean = false;
  private isMuted: boolean = false;
  private bgmNodes: AudioNode[] = [];

  private init() {
    if (this.initialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.setMuted(this.isMuted); // Apply initial mute state

        // Sub Channels
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.4; // Music volume relative to master
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.6; // SFX volume relative to master
        this.sfxGain.connect(this.masterGain);

        this.initialized = true;
      }
    } catch (e) {
      console.warn('AudioContext not supported or failed to initialize', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      // Smooth fade
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, now, 0.1);
    }
    // Attempt to suspend/resume context to save resources if muted
    if (this.ctx) {
        if (muted && this.ctx.state === 'running') {
            // Optional: this.ctx.suspend(); 
        } else if (!muted && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
  }

  public async resume() {
    this.init();
    
    // CRITICAL FIX: Ensure BGM starts regardless of whether context was already running or not.
    // Previously, if a UI sound triggered resume() implicitly, BGM wouldn't start because
    // it was inside the suspended check.
    this.startBGM();

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('Failed to resume AudioContext', e);
      }
    }
  }

  public startBGM() {
    if (!this.initialized || !this.ctx || !this.musicGain || this.bgmNodes.length > 0) return;

    // Synthwave Drone Generator
    const now = this.ctx.currentTime;
    const rootFreq = 65.41; // C2

    // 1. Deep Bass Drone (Sawtooth)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = rootFreq;
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.value = 400;
    
    // Simple LFO for filter
    const lfo1 = this.ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.value = 0.1; // Slow sweep
    const lfoGain1 = this.ctx.createGain();
    lfoGain1.gain.value = 200;
    lfo1.connect(lfoGain1);
    lfoGain1.connect(filter1.frequency);
    
    osc1.connect(filter1);
    filter1.connect(this.musicGain);

    // 2. Atmospheric Sine (Fifth)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = rootFreq * 1.5; // G2
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.3;
    osc2.connect(osc2Gain);
    osc2Gain.connect(this.musicGain);

    // 3. High Pad (Octave)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = rootFreq * 2; // C3
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.value = 0.1;
    // Stereo spread simulation (basic)
    osc3.connect(osc3Gain);
    osc3Gain.connect(this.musicGain);

    // Start all
    osc1.start(now);
    lfo1.start(now);
    osc2.start(now);
    osc3.start(now);

    this.bgmNodes = [osc1, lfo1, osc2, osc3, filter1, lfoGain1, osc2Gain, osc3Gain];
  }

  public play(type: 'start' | 'crash' | 'score' | 'highscore' | 'pickup' | 'ui_click' | 'ui_hover') {
    if (!this.initialized) this.init();
    if (!this.ctx || !this.sfxGain) return;

    // If play is called while suspended (e.g. first interaction), try to resume
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'start':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'crash':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'score':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      
      case 'pickup':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'highscore':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'ui_click':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'ui_hover':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
    }
  }
}

export const SoundManager = new AudioController();
