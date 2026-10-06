/**
 * audio-manager.js - 純 Web Audio API 合成音效引擎
 * 零外部音效檔案依賴，相容離線與 GitHub Pages
 * 具備歡樂大調勝利琶音、水滴滴管注水聲、晶化槓桿、警告警報與環境音。
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  _initCtx() {
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
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  // 1. 歡樂勝利和弦 (C5 -> E5 -> G5 -> C6 大調琶音 + 水晶鐘鳴)
  playUnlockSuccess() {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00 }, // C5
      { freq: 659.25, time: 0.09 }, // E5
      { freq: 783.99, time: 0.18 }, // G5
      { freq: 1046.50, time: 0.28 } // C6
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.25, now + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + 0.65);
    });

    // 水晶諧音風鈴 (高頻水晶亮光感)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(2093.00, now + 0.28); // C7
    bellGain.gain.setValueAtTime(0, now + 0.28);
    bellGain.gain.linearRampToValueAtTime(0.18, now + 0.30);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    bellOsc.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bellOsc.start(now + 0.28);
    bellOsc.stop(now + 1.25);
  }

  // 2. 元素水滴滴管聲 (調整前項/後項注水時觸發)
  playDrop(freqScale = 1) {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 600 * freqScale;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 3. 晶化槓桿拉動聲 (機械阻尼咔噠聲)
  playLeverPull() {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 粗糙白噪音濾波喀嚓
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // 4. 失誤警告音 (不和諧警報音)
  playWarningAlarm() {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [220, 233.08].forEach(freq => { // 半音不和諧
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // 5. 輕量點擊聲
  playClick() {
    if (this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // 6. 神殿環境低頻微光共振
  startAmbientHum() {
    if (this.ambientOsc || this.isMuted) return;
    this._initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(92.5, now); // F#2

    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, now);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientOsc.start();
  }

  stopAmbientHum() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch (e) {}
      this.ambientOsc = null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
