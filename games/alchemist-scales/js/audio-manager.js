/**
 * Web Audio API 原生音效合成器 (AudioManager)
 * 零外部音效檔相依性，完全由程式動態合成音頻震盪，相容於所有現代瀏覽器
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.heartbeatTimer = null;
    this.isHeartbeatPlaying = false;
  }

  // 延遲初始化 AudioContext (遵守瀏覽器使用者點擊後才啟動音效規範)
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
      this.stopHeartbeat();
    }
    return this.isMuted;
  }

  // 1. 齒輪轉動喀噠聲 (黃銅輪盤撥動)
  playDialTick() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 2. 賢者之眼・發光小數點晶石共鳴聲
  playGemResonate() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, t); // C6
    osc.frequency.exponentialRampToValueAtTime(1567.98, t + 0.15); // G6

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 3. 歡樂解鎖大和弦與勝利慶祝鐘聲 (解鎖成功・答對回饋)
  playUnlockSuccess() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // A. 機械鎖閂清脆彈開卡噠聲 (Crisp Mechanical Unlatch Click, 0ms ~ 40ms)
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

    // B. 歡快慶祝六音階升調琶音 (Joyful Ascending Arpeggio Fanfare)
    // 音高：G4 (392), C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50), E6 (1318.51)
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

      // 主旋律音色：正弦波混高八度泛音產生水晶鈴鐺質感
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

    // C. 凱旋共鳴大和弦長音 (Triumphant Resonance Chord Climax, ~0.36s ~ 1.6s)
    // C 大調輝煌和弦：C5 (523.25), G5 (783.99), C6 (1046.50), E6 (1318.51)
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

    // D. 晶瑩剔透魔力仙塵閃爍 (Sparkling Magic Stardust Tingles, 0.45s ~ 0.85s)
    // 快速清脆的三連閃音：C7 (2093), E7 (2637), G7 (3136)
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

  // 4. 毒氣回火爆散與金屬卡榫警報聲 (答錯)
  playWrongAlarm() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 金屬沉重撞擊聲
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, t);
    osc1.frequency.exponentialRampToValueAtTime(50, t + 0.35);

    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.36);

    // 毒氣嘶嘶洩氣聲
    const bufferSize = this.ctx.sampleRate * 0.4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.4);
  }

  // 5. 聖光水晶升調和弦鐘聲 (理智值恢復加成)
  playSanityHeal() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }

  // 6. 115 BPM 急促心跳聲 (理智 ≤ 30% 啟動)
  startHeartbeat() {
    if (this.isHeartbeatPlaying || this.isMuted) return;
    this.isHeartbeatPlaying = true;

    const beatInterval = 60000 / 115; // ~521ms
    this.heartbeatTimer = setInterval(() => {
      this._playSingleHeartbeat();
    }, beatInterval);

    this._playSingleHeartbeat();
  }

  _playSingleHeartbeat() {
    if (this.isMuted || !this.isHeartbeatPlaying) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 第一下心跳 (Lub)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.13);

    // 第二下心跳 (Dub, 延遲 140ms)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(65, t + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.24);

    gain2.gain.setValueAtTime(0.28, t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.14);
    osc2.stop(t + 0.25);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.isHeartbeatPlaying = false;
  }

  // 7. 通關勝利神聖大和弦
  playVictory() {
    if (this.isMuted) return;
    this._init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [349.23, 440.00, 523.25, 698.46], // F major
      [392.00, 493.88, 587.33, 783.99], // G major
      [523.25, 659.25, 783.99, 1046.50] // C major oct up
    ];

    chords.forEach((chord, step) => {
      const stepTime = t + (step * 0.45);
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, stepTime);

        gain.gain.setValueAtTime(0.001, stepTime);
        gain.gain.linearRampToValueAtTime(0.18, stepTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, stepTime + (step === 3 ? 1.6 : 0.5));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(stepTime);
        osc.stop(stepTime + (step === 3 ? 1.7 : 0.55));
      });
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
