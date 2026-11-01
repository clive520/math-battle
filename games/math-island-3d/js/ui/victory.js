/**
 * 3D 數學立體群島大冒險 - 全通關「數域宗師」榮譽頒獎典禮
 * 當學生完成全卷 25 個關卡時觸發，附帶五彩禮花特效與老師鼓勵卷軸
 */

import { sound } from "../audio.js";

export class VictoryCelebration {
  constructor(container, onResetGame) {
    this.container = container;
    this.onResetGame = onResetGame;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div id="victoryOverlay" class="victory-overlay">
        <canvas id="victoryConfettiCanvas" class="victory-canvas"></canvas>

        <div class="victory-card toy-pop">
          <div class="trophy-badge">🏆</div>
          <h2 class="victory-title">數域宗師・試煉大圓滿</h2>
          <p class="victory-subtitle">恭喜你突破五芒星數域試煉塔，成功解開五大單元全部 25 道數學封印！</p>

          <div class="stats-showcase">
            <div class="stat-pill">
              <span class="stat-num">5 / 5</span>
              <span class="stat-lbl">探索島嶼</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">25 / 25</span>
              <span class="stat-lbl">解鎖關卡</span>
            </div>
            <div class="stat-pill gold">
              <span class="stat-num" id="victoryTotalStars">75</span>
              <span class="stat-lbl">累計星級</span>
            </div>
          </div>

          <!-- 鹿陽國小高志賢老師的原卷給小勇者感言 (同構重現) -->
          <div class="teacher-letter-box">
            <h4>📜 給完成試煉的小勇者：</h4>
            <p>
              恭喜你一路運用智慧與耐心，解開了質源石門、水力導管、時光規律、小數天秤與黃金比例聖門，成功抵達「數域試煉之塔」的終點！
              數學就像一場精彩的冒險，有時候題目看起來像一座高牆，但只要你靜下心來、看清線索、一步一步推理，沒有任何難關能難倒你！老師為你今天的認真與努力感到無比驕傲！
            </p>
          </div>

          <div class="victory-actions">
            <button id="btnVictoryReplay" class="victory-btn victory-btn-secondary">
              🔄 重新挑戰全島
            </button>
            <a href="../../index.html" class="victory-btn victory-btn-primary">
              🏠 返回遊戲大廳
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById("btnVictoryReplay").addEventListener("click", () => {
      sound.playClick();
      if (confirm("確定要重置所有闖關進度，重新體驗 3D 數學群島大冒險嗎？")) {
        if (this.onResetGame) this.onResetGame();
        this.close();
      }
    });
  }

  show(totalStars) {
    document.getElementById("victoryTotalStars").innerText = `${totalStars} / 75`;
    const overlay = document.getElementById("victoryOverlay");
    overlay.classList.add("active");
    sound.playFanfare();
    this.startConfetti();
  }

  close() {
    const overlay = document.getElementById("victoryOverlay");
    overlay.classList.remove("active");
    this.stopConfetti();
  }

  startConfetti() {
    const canvas = document.getElementById("victoryConfettiCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#f59e0b", "#38bdf8", "#10b981", "#ec4899", "#8b5cf6", "#ef4444"];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6
      });
    }

    this.confettiRunning = true;
    const animate = () => {
      if (!this.confettiRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rot += p.rotSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };
    animate();
  }

  stopConfetti() {
    this.confettiRunning = false;
  }
}
