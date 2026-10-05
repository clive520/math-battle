/**
 * 鍊金工坊沉浸式動畫管理器 (AlchemyFxManager)
 * 提供：
 * 1. 背景懸浮魔導金塵/微光粒子 (HTML5 Canvas 60 FPS)
 * 2. 蒸氣管路排氣與紫色毒氣回火爆發
 * 3. 巨型魔導金屬滑門解鎖光爆動效
 * 4. 聖光治癒粒子爆散動效
 * 5. 全螢幕劇烈震撼
 */
class AlchemyFxManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.mouseX = -1000;
    this.mouseY = -1000;

    if (this.canvas) {
      this._initCanvas();
      this._createParticles(45);
      this._startLoop();
      this._bindMouse();
    }
  }

  _initCanvas() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  _bindMouse() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    });
  }

  _createParticles(count) {
    const colors = [
      'rgba(251, 191, 36, ',  // 金色
      'rgba(56, 189, 248, ',  // 秘銀青藍
      'rgba(52, 211, 153, ',  // 賢者翡翠
      'rgba(168, 85, 247, '   // 以太紫
    ];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas.width || 800),
        y: Math.random() * (this.canvas.height || 600),
        radius: Math.random() * 2.5 + 1.2,
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2, // 緩慢向上漂浮
        pulseSpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  _startLoop() {
    const render = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.pulseSpeed;

        // 游標斥力微擾
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // 邊界循環
        if (p.y < -10) {
          p.y = this.canvas.height + 10;
          p.x = Math.random() * this.canvas.width;
        }
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        const dynamicAlpha = Math.max(0.1, p.alpha + Math.sin(p.angle) * 0.2);

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `${p.baseColor}${dynamicAlpha})`;
        this.ctx.shadowBlur = p.radius * 3;
        this.ctx.shadowColor = `${p.baseColor}0.8)`;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }

      this.animId = requestAnimationFrame(render);
    };

    render();
  }

  // 1. 觸發答錯「劇毒蒸氣回火爆發」
  triggerToxicBurst() {
    const overlay = document.getElementById('toxicBurstOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      void overlay.offsetWidth;
      overlay.classList.add('active');
      setTimeout(() => overlay.classList.remove('active'), 1200);
    }
    this.triggerScreenShake(12);
  }

  // 2. 觸發答對「巨型魔導鋼鐵巨門滑開與光爆」
  triggerVaultOpen(onTransitionDone) {
    const doorOverlay = document.getElementById('vaultDoorOverlay');
    if (!doorOverlay) {
      if (onTransitionDone) onTransitionDone();
      return;
    }

    doorOverlay.classList.add('opening');

    // 播放推進鏡頭與過場
    setTimeout(() => {
      if (onTransitionDone) onTransitionDone();
    }, 1100);

    setTimeout(() => {
      doorOverlay.classList.remove('opening');
    }, 1800);
  }

  // 3. 聖光治癒粒子 (加理智時在理智條周圍噴發)
  triggerHealBurst(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const count = 18;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'heal-sparkle';
      spark.style.left = `${rect.left + rect.width * Math.random()}px`;
      spark.style.top = `${rect.top + rect.height * Math.random()}px`;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 30;
      spark.style.setProperty('--tx', `${Math.cos(angle) * speed}px`);
      spark.style.setProperty('--ty', `${-Math.abs(Math.sin(angle) * speed) - 20}px`);

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  // 4. 震動全螢幕
  triggerScreenShake(intensity = 8) {
    const app = document.getElementById('appContainer');
    if (!app) return;
    app.classList.remove('screen-shake');
    void app.offsetWidth;
    app.classList.add('screen-shake');
    setTimeout(() => app.classList.remove('screen-shake'), 600);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlchemyFxManager;
}
