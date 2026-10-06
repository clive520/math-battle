/**
 * 星門與發條鐘樓動態視覺特效 (ClockworkFx)
 * 1. Canvas 背景：深空懸浮星塵粒子與緩慢咬合旋轉的古代黃銅齒輪光影
 * 2. 螢幕震動 (Screen Shake) 與 迷霧光爆轉場
 * 3. 瀕危暗黑手電筒遮罩光暈跟隨 (Torchlight Vignette Tracker)
 */

class ClockworkFx {
  constructor(canvasId = 'clockworkCanvas', torchMaskId = 'torchMask') {
    this.canvas = document.getElementById(canvasId);
    this.torchMask = document.getElementById(torchMaskId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.gears = [];
    this.animId = null;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.canvas) {
      this._initCanvas();
      this._bindEvents();
      this.start();
    }
  }

  _initCanvas() {
    this._resize();
    // 產生 50 顆深空微光星塵
    this.particles = [];
    for (let i = 0; i < 55; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.4 - 0.1,
        color: ['#60a5fa', '#facc15', '#a78bfa', '#38bdf8'][Math.floor(Math.random() * 4)]
      });
    }

    // 產生 3 座背景巨大齒輪
    this.gears = [
      { x: this.width * 0.15, y: this.height * 0.85, r: 180, teeth: 18, angle: 0, speed: 0.0015, color: 'rgba(217, 119, 6, 0.07)' },
      { x: this.width * 0.88, y: this.height * 0.25, r: 240, teeth: 24, angle: 0, speed: -0.0012, color: 'rgba(56, 189, 248, 0.06)' },
      { x: this.width * 0.5, y: this.height * 0.5, r: 320, teeth: 32, angle: 0, speed: 0.0008, color: 'rgba(245, 158, 11, 0.04)' }
    ];
  }

  _resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resize());

    // 手電筒聚光燈跟隨滑鼠 / 觸控
    const updateTorch = (clientX, clientY) => {
      if (this.torchMask) {
        this.torchMask.style.setProperty('--torch-x', `${clientX}px`);
        this.torchMask.style.setProperty('--torch-y', `${clientY}px`);
      }
    };

    window.addEventListener('mousemove', (e) => updateTorch(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updateTorch(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  start() {
    if (this.animId) return;
    const loop = () => {
      this._render();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  _render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 繪製背景旋轉齒輪
    this.gears.forEach(g => {
      g.angle += g.speed;
      this._drawGear(g.x, g.y, g.r, g.teeth, g.angle, g.color);
    });

    // 繪製星塵粒子
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < 0) p.y = this.height;
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  _drawGear(cx, cy, radius, teeth, angle, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    const toothHeight = radius * 0.18;
    const toothAngle = (Math.PI * 2) / teeth;

    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      const x1 = Math.cos(a) * (radius - toothHeight);
      const y1 = Math.sin(a) * (radius - toothHeight);
      const x2 = Math.cos(a) * (radius + toothHeight);
      const y2 = Math.sin(a) * (radius + toothHeight);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.restore();
  }

  triggerScreenShake() {
    const app = document.getElementById('appContainer');
    if (app) {
      app.classList.remove('screen-shake');
      void app.offsetWidth;
      app.classList.add('screen-shake');
      setTimeout(() => app.classList.remove('screen-shake'), 600);
    }
  }

  triggerDoorOpen(onHalfway = null) {
    const overlay = document.getElementById('stargateOverlay');
    if (!overlay) {
      if (onHalfway) onHalfway();
      return;
    }

    overlay.classList.add('active');
    setTimeout(() => {
      if (typeof onHalfway === 'function') onHalfway();
    }, 600);

    setTimeout(() => {
      overlay.classList.remove('active');
    }, 1300);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockworkFx;
}
