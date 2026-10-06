/**
 * crucible-fx.js - 元素調和秘境 Canvas 動態光影與粒子特效引擎
 * 繪製古代黃金比例幾何同心光環、漂浮元素靈能光點、注入光流與通關光爆。
 */
class CrucibleFX {
  constructor(canvasId = 'crucible-canvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.sparks = [];
    this.state = 'normal'; // 'normal', 'warning', 'stabilized'
    this.animId = null;
    this.angle = 0;

    if (this.canvas) {
      this._resize();
      window.addEventListener('resize', () => this._resize());
      this._initParticles();
      this._loop();
    }
  }

  _resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 360;
    this.canvas.height = rect.height || 360;
  }

  _initParticles() {
    this.particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? '#ffd60a' : '#4fc3f7',
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  setState(state) {
    this.state = state;
  }

  triggerVictoryWave() {
    this.state = 'stabilized';
    // 噴發大量金色光爆粒子
    for (let i = 0; i < 70; i++) {
      const spAngle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.sparks.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: Math.cos(spAngle) * speed,
        vy: Math.sin(spAngle) * speed,
        r: Math.random() * 3 + 2,
        color: Math.random() > 0.4 ? '#30d158' : '#ffd60a',
        life: 1.0,
        decay: Math.random() * 0.025 + 0.015
      });
    }
  }

  triggerSparks() {
    this.state = 'warning';
    // 噴發紅色短暫警報火花
    for (let i = 0; i < 40; i++) {
      const spAngle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.sparks.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: Math.cos(spAngle) * speed,
        vy: Math.sin(spAngle) * speed,
        r: Math.random() * 2.5 + 1.5,
        color: '#ff453a',
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  _loop() {
    this.animId = requestAnimationFrame(() => this._loop());
    if (!this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.ctx.clearRect(0, 0, w, h);

    // 1. 旋轉古代黃金比例調和同心環
    this.angle += 0.005;
    this.ctx.save();
    this.ctx.translate(cx, cy);

    let ringColor = 'rgba(79, 195, 247, 0.25)';
    if (this.state === 'warning') ringColor = 'rgba(255, 69, 58, 0.4)';
    if (this.state === 'stabilized') ringColor = 'rgba(48, 209, 88, 0.4)';

    // 外環
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.min(w, h) * 0.42, 0, Math.PI * 2);
    this.ctx.strokeStyle = ringColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([8, 8]);
    this.ctx.stroke();

    // 內環 (旋轉)
    this.ctx.rotate(this.angle);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.min(w, h) * 0.32, 0, Math.PI * 2);
    this.ctx.strokeStyle = ringColor;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([12, 6]);
    this.ctx.stroke();

    // 八角芒星同心符紋
    this.ctx.beginPath();
    const starR = Math.min(w, h) * 0.22;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x = Math.cos(a) * starR;
      const y = Math.sin(a) * starR;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = 'rgba(255, 214, 10, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([]);
    this.ctx.stroke();

    // 核心微光發光球
    const glowGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h) * 0.18);
    if (this.state === 'warning') {
      glowGrad.addColorStop(0, 'rgba(255, 69, 58, 0.7)');
      glowGrad.addColorStop(1, 'rgba(255, 69, 58, 0)');
    } else if (this.state === 'stabilized') {
      glowGrad.addColorStop(0, 'rgba(48, 209, 88, 0.7)');
      glowGrad.addColorStop(1, 'rgba(48, 209, 88, 0)');
    } else {
      glowGrad.addColorStop(0, 'rgba(100, 210, 255, 0.6)');
      glowGrad.addColorStop(1, 'rgba(100, 210, 255, 0)');
    }
    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.min(w, h) * 0.18, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // 2. 懸浮靈能光點
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    // 3. 爆炸火花與光芒
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
      this.ctx.fillStyle = sp.color;
      this.ctx.globalAlpha = sp.life;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CrucibleFX;
}
