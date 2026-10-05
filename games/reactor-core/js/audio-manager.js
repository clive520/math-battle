/**
 * audio-manager.js - 魔導反應爐原生 Web Audio API 音效合成引擎
 * 零外接音檔依賴，純代碼即時合成蒸氣噴射、機械拉桿、齒輪閥門、警報蜂鳴與勝利號角。
 */
class ReactorAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.heartbeatTimer = null;
  }

  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientHum();
      this.stopHeartbeat();
    }
    return this.isMuted;
  }

  // 1. 閥門與齒輪微調聲 (Crisp Gear Ratchet Tick)
  playValveTick() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.035);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 2. 加壓推桿機械咬合與彈力重擊聲 (Heavy Lever Pull & Clank)
  playLeverPull() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 金屬槓桿撞擊
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    // 氣壓推進短嘶聲 (Pneumatic Click)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // 3. 高壓蒸氣噴發聲 (Steam Jet Release)
  playSteamRelease(duration = 0.8) {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(450, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // 4. 逆流閥門翻轉旋轉聲 (Reciprocal Invert Switch)
  playInvertSwitch() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  // 5. 警報過載與失誤爆鳴 (Critical Klaxon Alarm & Overload Buzz)
  playWarningAlarm() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // 不諧和三度音頻，引發急促警戒感
    osc1.frequency.setValueAtTime(260, t);
    osc1.frequency.linearRampToValueAtTime(220, t + 0.35);

    osc2.frequency.setValueAtTime(370, t);
    osc2.frequency.linearRampToValueAtTime(310, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  // 6. 成功通關歡慶樂段 (Joyful 4-Layer Victory Fanfare)
  playUnlockSuccess() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Layer 1: 機械開栓脆響
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400, t);
    snapOsc.frequency.exponentialRampToValueAtTime(200, t + 0.06);
    snapGain.gain.setValueAtTime(0.28, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.07);

    // Layer 2: 大調上揚琶音 (G4 -> C5 -> E5 -> G5 -> C6 -> E6)
    const arpeggioNotes = [
      { f: 392.00, start: 0.06, dur: 0.16 }, // G4
      { f: 523.25, start: 0.14, dur: 0.16 }, // C5
      { f: 659.25, start: 0.22, dur: 0.18 }, // E5
      { f: 783.99, start: 0.30, dur: 0.22 }, // G5
      { f: 1046.50, start: 0.40, dur: 0.30 }, // C6
      { f: 1318.51, start: 0.52, dur: 0.55 }  // E6 高潮高音
    ];

    arpeggioNotes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t + note.start);

      gain.gain.setValueAtTime(0.001, t + note.start);
      gain.gain.linearRampToValueAtTime(0.3, t + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.start + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.start);
      osc.stop(t + note.start + note.dur + 0.02);
    });

    // Layer 3: C大調輝煌和弦長延音 (C5, G5, C6)
    const chordStart = 0.52;
    const chordFreqs = [523.25, 783.99, 1046.50];
    chordFreqs.forEach(freq => {
      const chordOsc = this.ctx.createOscillator();
      const chordGain = this.ctx.createGain();
      chordOsc.type = 'triangle';
      chordOsc.frequency.setValueAtTime(freq, t + chordStart);

      chordGain.gain.setValueAtTime(0.001, t + chordStart);
      chordGain.gain.linearRampToValueAtTime(0.2, t + chordStart + 0.04);
      chordGain.gain.exponentialRampToValueAtTime(0.0001, t + chordStart + 1.25);

      chordOsc.connect(chordGain);
      chordGain.connect(this.ctx.destination);
      chordOsc.start(t + chordStart);
      chordOsc.stop(t + chordStart + 1.3);
    });

    // Layer 4: 星塵高頻鐘聲晶亮點綴 (Sparkle Bells)
    const sparkles = [
      { f: 2093.00, start: 0.70 }, // C7
      { f: 2637.02, start: 0.85 }, // E7
      { f: 3135.96, start: 1.00 }  // G7
    ];
    sparkles.forEach(bell => {
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(bell.f, t + bell.start);

      bellGain.gain.setValueAtTime(0.12, t + bell.start);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t + bell.start + 0.45);

      bellOsc.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bellOsc.start(t + bell.start);
      bellOsc.stop(t + bell.start + 0.48);
    });
  }

  // 7. 低頻脈衝心跳/震盪 (Emergency Core Pulse)
  playHeartbeat() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  startHeartbeat(bpm = 110) {
    if (this.heartbeatTimer) return;
    const interval = (60 / bpm) * 1000;
    this.playHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.playHeartbeat();
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 8. 爐心微弱低頻共鳴 (Ambient Core Hum)
  startAmbientHum() {
    if (this.isMuted || this.ambientOsc) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(55, t); // A1 note
    this.ambientGain.gain.setValueAtTime(0.035, t);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    this.ambientOsc.start(t);
  }

  stopAmbientHum() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch (e) {}
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }

  playClick() {
    this.playValveTick();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactorAudio;
}
