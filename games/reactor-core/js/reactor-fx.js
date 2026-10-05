/**
 * reactor-fx.js - 魔導反應爐動態 Canvas 特效引擎
 * 繪製高解析度魔導核心、旋轉符文齒輪、動態蒸氣微粒、超載火花與指針物理搖擺。
 */
class ReactorFX {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.steamWisps = [];
    this.corePulseAngle = 0;
    this.gearAngle = 0;
    this.state = 'normal'; // 'normal', 'warning', 'critical', 'stabilized'
    this.targetPressure = 45; // 0 ~ 100
    this.currentPressure = 45;
    this.needleJitter = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  setState(state) {
    this.state = state;
  }

  setPressure(val) {
    this.targetPressure = Math.max(0, Math.min(100, val));
  }

  // 觸發強力蒸氣噴發
  triggerSteamBlast() {
    for (let i = 0; i < 40; i++) {
      this.steamWisps.push({
        x: this.width * 0.5 + (Math.random() - 0.5) * 80,
        y: this.height * 0.7,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 3,
        radius: Math.random() * 12 + 6,
        alpha: 0.8,
        growth: Math.random() * 0.4 + 0.2
      });
    }
  }

  // 觸發失誤過載火花
  triggerSparks() {
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 3;
      this.particles.push({
        x: this.width * 0.5,
        y: this.height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? '#ff3b30' : '#ff9500',
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  // 觸發通關翡翠光環
  triggerVictoryWave() {
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: this.width * 0.5,
        y: this.height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? '#30d158' : '#64d2ff',
        size: Math.random() * 5 + 3,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.ctx || !this.width) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 更新核心動態變數
    this.corePulseAngle += 0.04;
    this.gearAngle += 0.015;

    // 指針平滑插值與機械抖動
    this.needleJitter = (Math.random() - 0.5) * (this.state === 'critical' ? 3.5 : 0.8);
    this.currentPressure += (this.targetPressure - this.currentPressure) * 0.08;

    const cx = this.width * 0.5;
    const cy = this.height * 0.5;

    // 1. 繪製蒸氣管道與外環金屬護框
    this._drawReactorFrame(cx, cy);

    // 2. 繪製旋轉魔導齒輪與符文環
    this._drawRotatingGears(cx, cy);

    // 3. 繪製魔導電漿核心
    this._drawPlasmaCore(cx, cy);

    // 4. 繪製蒸氣微粒與火花
    this._updateAndDrawParticles();
  }

  _drawReactorFrame(cx, cy) {
    const ctx = this.ctx;
    const r = Math.min(cx, cy) * 0.82;

    // 外環黃銅陰影
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#2c221b';
    ctx.lineWidth = 14;
    ctx.stroke();

    // 鉚釘點綴 (Rivets)
    const rivetCount = 12;
    for (let i = 0; i < rivetCount; i++) {
      const a = (i / rivetCount) * Math.PI * 2;
      const rx = cx + Math.cos(a) * r;
      const ry = cy + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b38f59';
      ctx.fill();
    }
    ctx.restore();
  }

  _drawRotatingGears(cx, cy) {
    const ctx = this.ctx;
    const r = Math.min(cx, cy) * 0.65;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.gearAngle);

    // 齒輪齒狀外緣
    ctx.strokeStyle = '#4a3b2c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const teeth = 16;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const x1 = Math.cos(a) * (r - 6);
      const y1 = Math.sin(a) * (r - 6);
      const x2 = Math.cos(a) * (r + 6);
      const y2 = Math.sin(a) * (r + 6);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // 符文虛線圈
    ctx.beginPath();
    ctx.arc(0, 0, r - 12, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = this.state === 'critical' ? '#ff453a' : '#00d2ff';
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  _drawPlasmaCore(cx, cy) {
    const ctx = this.ctx;
    const baseR = Math.min(cx, cy) * 0.42;
    const pulse = Math.sin(this.corePulseAngle) * 6;
    const coreR = Math.max(10, baseR + pulse);

    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR);

    if (this.state === 'critical') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ff3b30');
      grad.addColorStop(0.7, '#ff453a88');
      grad.addColorStop(1, 'transparent');
    } else if (this.state === 'warning') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ff9500');
      grad.addColorStop(0.7, '#ff9f0a66');
      grad.addColorStop(1, 'transparent');
    } else if (this.state === 'stabilized') {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#30d158');
      grad.addColorStop(0.7, '#34c75955');
      grad.addColorStop(1, 'transparent');
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, '#00e5ff');
      grad.addColorStop(0.65, '#5e5ce677');
      grad.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    // 內部電漿核心環
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();
  }

  _updateAndDrawParticles() {
    const ctx = this.ctx;

    // 常態背景蒸氣微粒產生
    if (Math.random() < 0.25) {
      this.steamWisps.push({
        x: this.width * 0.5 + (Math.random() - 0.5) * 60,
        y: this.height * 0.5 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 1,
        radius: Math.random() * 8 + 4,
        alpha: 0.45,
        growth: 0.15
      });
    }

    // 繪製蒸氣
    for (let i = this.steamWisps.length - 1; i >= 0; i--) {
      const s = this.steamWisps[i];
      s.x += s.vx;
      s.y += s.vy;
      s.radius += s.growth;
      s.alpha -= 0.012;

      if (s.alpha <= 0) {
        this.steamWisps.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 235, ${s.alpha})`;
      ctx.fill();
      ctx.restore();
    }

    // 繪製火花微粒
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.restore();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactorFX;
}
