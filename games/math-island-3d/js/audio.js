/**
 * 3D 數學立體群島大冒險 - Web Audio 原生程序化音效合成器
 * 傳承標竿網站理念：不依賴任何外部音效檔案，以純演算法振盪器即時合成清脆玩具風音效
 */

class SoundController {
  constructor() {
    this.audioCtx = null;
    this.enabled = localStorage.getItem("math_island_sound") !== "false";
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("math_island_sound", this.enabled);
    if (this.enabled) {
      this.init();
      this.playClick();
    }
    return this.enabled;
  }

  // 1. 溫暖木質清脆點擊聲 (源自標竿網站演算法)
  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.045);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }

  // 2. 選項選擇晶石音效
  playSelect() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.08); // E5

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // 3. 答對通關悅耳和弦 (C5 -> E5 -> G5 -> C6 琶音)
  playCorrect() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, idx) => {
        const noteStart = t + idx * 0.07;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch (e) {}
  }

  // 4. 答錯低音警示 (溫和不刺耳的下行嗡鳴)
  playWrong() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.18);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    } catch (e) {}
  }

  // 5. 航道解鎖星光音效
  playUnlock() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
        const time = t + i * 0.09;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, time);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.36);
      });
    } catch (e) {}
  }

  // 6. 全通關大勝利慶典音樂 (Fanfare)
  playFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      const t = this.audioCtx.currentTime;
      const melody = [
        { f: 523.25, d: 0.12, wait: 0 },
        { f: 523.25, d: 0.12, wait: 0.14 },
        { f: 523.25, d: 0.12, wait: 0.28 },
        { f: 659.25, d: 0.35, wait: 0.42 },
        { f: 587.33, d: 0.18, wait: 0.8 },
        { f: 659.25, d: 0.18, wait: 1.0 },
        { f: 783.99, d: 0.55, wait: 1.2 }
      ];

      melody.forEach(note => {
        const st = t + note.wait;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.f, st);

        gain.gain.setValueAtTime(0.2, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + note.d);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(st);
        osc.stop(st + note.d + 0.05);
      });
    } catch (e) {}
  }
}

export const sound = new SoundController();
