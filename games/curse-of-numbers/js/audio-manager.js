/**
 * 音效管理器 (Audio Manager)
 * 基於純原生 Web Audio API 合成，零外部依賴、零網絡延遲、不佔頻寬
 */
class DungeonAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.heartbeatTimer = null;
    this.heartbeatBpm = 60;
    this.isHeartbeatPlaying = false;
    this.initDone = false;
  }

  // 初始化音訊上下文（需由使用者點擊或操作解鎖）
  init() {
    if (this.initDone) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initDone = true;
      this.startAmbientDrone();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.initDone) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // 背景幽暗地牢嗡鳴 (Cavern Drone)
  startAmbientDrone() {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 低音

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82.4, this.ctx.currentTime); // E2 五度低音

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      console.warn('Failed to start ambient drone', e);
    }
  }

  // 機械轉盤喀嗒聲 (Dial Tick)
  playDialTick() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    
    // 短促金屬卡榫衝擊
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 心跳聲 (Heartbeat: Lub-Dub)
  triggerHeartbeatPulse() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 第一次搏動 (Lub)
    this._playThump(now, 65, 0.22, 0.12);
    // 第二次搏動 (Dub)
    this._playThump(now + 0.13, 85, 0.16, 0.1);
  }

  _playThump(time, startFreq, volume, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + duration);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  setHeartbeatBpm(bpm) {
    this.heartbeatBpm = Math.max(50, Math.min(140, bpm));
    if (this.isHeartbeatPlaying) {
      clearInterval(this.heartbeatTimer);
      const intervalMs = (60 / this.heartbeatBpm) * 1000;
      this.heartbeatTimer = setInterval(() => this.triggerHeartbeatPulse(), intervalMs);
    }
  }

  startHeartbeat(bpm = 65) {
    this.ensureContext();
    this.setHeartbeatBpm(bpm);
    if (!this.isHeartbeatPlaying) {
      this.isHeartbeatPlaying = true;
      this.triggerHeartbeatPulse();
      const intervalMs = (60 / this.heartbeatBpm) * 1000;
      this.heartbeatTimer = setInterval(() => this.triggerHeartbeatPulse(), intervalMs);
    }
  }

  stopHeartbeat() {
    this.isHeartbeatPlaying = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 成功解鎖！(Heavy Metallic Lock Opening + Chime)
  playUnlockSuccess() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // 1. 金屬鎖栓彈開聲 (Click-Snap)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(900, now);
    snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
    snapGain.gain.setValueAtTime(0.35, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.13);

    // 2. 神秘神聖破咒音 (Resonant Chord C-G-C-E)
    const freqs = [261.63, 392.00, 523.25, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.05);

      gain.gain.setValueAtTime(0.15, now + 0.1 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + 0.1 + idx * 0.05);
      osc.stop(now + 1.4);
    });
  }

  // 歡樂解鎖大和弦與勝利慶祝鐘聲 (解鎖成功・答對回饋)
  playUnlockSuccess() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // A. 機械鎖閂清脆彈開卡噠聲 (0ms ~ 40ms)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400, t);
    clickOsc.frequency.exponentialRampToValueAtTime(160, t + 0.04);
    clickGain.gain.setValueAtTime(0.35, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.045);

    // B. 歡快慶祝六音階升調琶音 (G4 ➔ C5 ➔ E5 ➔ G5 ➔ C6 ➔ E6)
    const arpeggioNotes = [
      { freq: 392.00, delay: 0.03, dur: 0.25 },
      { freq: 523.25, delay: 0.09, dur: 0.25 },
      { freq: 659.25, delay: 0.15, dur: 0.25 },
      { freq: 783.99, delay: 0.21, dur: 0.28 },
      { freq: 1046.50, delay: 0.27, dur: 0.35 },
      { freq: 1318.51, delay: 0.34, dur: 0.65 }
    ];

    arpeggioNotes.forEach((n, idx) => {
      const noteTime = t + n.delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = (idx >= 4) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(n.freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + n.dur + 0.05);
    });

    // C. 凱旋共鳴大和弦長音 (C5, G5, C6, E6)
    const chordNotes = [523.25, 783.99, 1046.50, 1318.51];
    const chordStart = t + 0.36;
    chordNotes.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordStart);

      gain.gain.setValueAtTime(0.001, chordStart);
      gain.gain.linearRampToValueAtTime(0.16, chordStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(chordStart);
      osc.stop(chordStart + 1.3);
    });

    // D. 晶瑩魔力仙塵閃爍 (C7, E7, G7)
    const sparkleNotes = [
      { freq: 2093.00, delay: 0.46 },
      { freq: 2637.02, delay: 0.54 },
      { freq: 3135.96, delay: 0.62 }
    ];

    sparkleNotes.forEach((s) => {
      const sTime = t + s.delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(s.freq, sTime);

      gain.gain.setValueAtTime(0.001, sTime);
      gain.gain.linearRampToValueAtTime(0.12, sTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, sTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(sTime);
      osc.stop(sTime + 0.38);
    });
  }

  // 向下相容保留方法名
  playStoneDoor() {
    this.playUnlockSuccess();
  }

  // 答錯警報／惡靈低語震懾 (Wrong / Eerie Tritone)
  playWrongAnswer() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // 減五度「魔鬼音程」(Tritone: D3 - Ab3)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(146.83, now); // D3
    osc1.frequency.linearRampToValueAtTime(130, now + 0.4);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(207.65, now); // Ab3 (Tritone)
    osc2.frequency.linearRampToValueAtTime(180, now + 0.4);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.52);
    osc2.stop(now + 0.52);
  }

  // 神智復甦／清澈聖光音效 (Sanity Heal Crystal Chime)
  playSanityHeal() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0.0, d: 0.3 }, // C5
      { f: 659.25, t: 0.12, d: 0.3 }, // E5
      { f: 783.99, t: 0.24, d: 0.4 }, // G5
      { f: 1046.50, t: 0.36, d: 0.6 } // C6
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.2, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    });
  }

  // 終極生還脫出勝利大合奏 (Victory Fanfare)
  playEscapeVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const notes = [
      { f: 261.63, t: 0.0, d: 0.3 }, // C4
      { f: 329.63, t: 0.25, d: 0.3 }, // E4
      { f: 392.00, t: 0.5, d: 0.3 }, // G4
      { f: 523.25, t: 0.75, d: 0.6 }, // C5
      { f: 659.25, t: 1.1, d: 0.8 }, // E5
      { f: 783.99, t: 1.5, d: 1.5 }, // G5
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.25, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.1);
    });
  }
}

// 導出全局實例
window.audioMgr = new DungeonAudioManager();
