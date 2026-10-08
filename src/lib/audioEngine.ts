/**
 * Procedural Web Audio API Sound Engine for WORD QUEST
 * High-fidelity, zero-latency synthesizer requiring no external audio file downloads.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private soundVolume: number = 0.8;
  private musicVolume: number = 0.4;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    } else if (!muted && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Crisp tactile button click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.12 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Correct Answer Chime - dynamic pitch rising with combo level
   */
  public playCorrect(combo: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = Math.min(880, 440 + (combo - 1) * 60);
      const notes = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983, baseFreq * 2];

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = now + index * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.22 * this.soundVolume, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.35);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Critical Strike Lightning Sound
   */
  public playCriticalHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  /**
   * Boss Damage Impact Sound
   */
  public playBossHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  /**
   * Wheel Ticker Click
   */
  public playWheelTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

      gain.gain.setValueAtTime(0.15 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  /**
   * Relic Equip Clink
   */
  public playRelicEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1174.66];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2 * this.soundVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Wrong Answer Thud
   */
  public playWrong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

      gain.gain.setValueAtTime(0.18 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Streak sound with sizzling harmonic flare
   */
  public playStreak(streakCount: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const root = 523.25; // C5
      const notes = [root, root * 1.122, root * 1.259, root * 1.498, root * 1.681, root * 2.0];

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2 * this.soundVolume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Sparkling metallic coin clink
   */
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [987.77, 1318.51];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2 * this.soundVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Clock tick for countdown tension
   */
  public playTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 500, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);

      gain.gain.setValueAtTime((isUrgent ? 0.2 : 0.08) * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Grand Level Complete & Victory Fanfare
   */
  public playLevelComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        { freqs: [392, 493.88, 587.33], duration: 0.2, delay: 0 },
        { freqs: [440, 554.37, 659.25], duration: 0.2, delay: 0.22 },
        { freqs: [523.25, 659.25, 783.99], duration: 0.25, delay: 0.44 },
        { freqs: [587.33, 739.99, 880, 1174.66], duration: 0.9, delay: 0.72 }
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const time = now + chord.delay;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.18 * this.soundVolume, time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, time + chord.duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(time);
          osc.stop(time + chord.duration);
        });
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Celestial Achievement Unlocked Shimmer
   */
  public playAchievement() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.22 * this.soundVolume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.6);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Powerup activation whoosh sound
   */
  public playPowerup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);

      gain.gain.setValueAtTime(0.05 * this.soundVolume, now);
      gain.gain.linearRampToValueAtTime(0.25 * this.soundVolume, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Subtle ambient background music
   */
  public startMusic() {
    if (this.isMusicMuted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const scale = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.isMusicMuted) return;

      try {
        const now = this.ctx.currentTime;
        const note = scale[step % scale.length];
        step++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04 * this.musicVolume, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.9);
      } catch (err) {}
    }, 1200);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  /**
   * Miracle Activation - Heavenly Chime
   */
  public playMiracleActivate() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [587.33, 739.99, 880.00, 1174.66, 1479.98]; // D major celestial arpeggio
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25 * this.soundVolume, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.9);
      });
    } catch (e) {}
  }

  /**
   * Pentecostal Fire Sound - Sizzling flame whoosh with warm undertones
   */
  public playPentecostFire() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.7);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(2500, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);

      gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {}
  }

  /**
   * Manna Blessing - Gentle rain shimmer
   */
  public playMannaBlessing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 830.61, 987.77];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, time);

        gain.gain.setValueAtTime(0.18 * this.soundVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.5);
      });
    } catch (e) {}
  }

  /**
   * Part The Waters - Deep ocean surge
   */
  public playPartWaters() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

      gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  }
}

export const audioEngine = new AudioEngine();
