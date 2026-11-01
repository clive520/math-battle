/**
 * 3D 數學立體群島大冒險 - 正式「數域宗師結業證書」頒發系統
 * 當學生完成全卷 25 個關卡（不限順序）時隆重頒發
 * 支援學生即時輸入姓名、班級、座號，並可一鍵列印或截圖留念！
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
    const today = new Date();
    const dateStr = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

    this.container.innerHTML = `
      <div id="victoryOverlay" class="victory-overlay">
        <canvas id="victoryConfettiCanvas" class="victory-canvas"></canvas>

        <div class="certificate-container toy-pop" id="printableCertificate">
          <!-- 證書外框古典邊條 -->
          <div class="cert-border-outer">
            <div class="cert-border-inner">
              
              <!-- 頂部徽章與榮譽標題 -->
              <div class="cert-header">
                <div class="cert-crown-icon">👑</div>
                <h1 class="cert-title">數域宗師・結業證書</h1>
                <div class="cert-eng-title">CERTIFICATE OF MATHEMATICS MASTERY</div>
              </div>

              <!-- 學生姓名班級編輯區 -->
              <div class="cert-student-row">
                <span>茲證明</span>
                <input type="text" id="certClassName" class="cert-input cert-class" value="六年一班" placeholder="班級" />
                <span>座號</span>
                <input type="text" id="certSeatNo" class="cert-input cert-seat" value="01" placeholder="座號" />
                <span>姓名</span>
                <input type="text" id="certStudentName" class="cert-input cert-name" value="數學小勇者" placeholder="姓名" />
                <span>同學</span>
              </div>

              <!-- 褒獎內文 -->
              <div class="cert-body-text">
                於本學期<strong>「五芒星數域試煉塔」3D 群島立體闖關</strong>評量中，憑藉卓越的邏輯思維與不懈毅力，
                成功解開<strong>最大公因數與最小公倍數、分數除法、數量關係、小數除法與比和比值</strong>五大單元全部 25 道數學封印，
                思維敏銳，融會貫通，成績優異，特頒此證，以茲嘉勉！
              </div>

              <!-- 榮譽數據欄 -->
              <div class="cert-stats-row">
                <div class="cert-stat-badge">
                  <span>完成進度</span>
                  <strong>25 / 25 全關卡</strong>
                </div>
                <div class="cert-stat-badge gold">
                  <span>榮譽星級</span>
                  <strong id="certTotalStars">75 / 75 ⭐</strong>
                </div>
                <div class="cert-stat-badge">
                  <span>數域稱號</span>
                  <strong>鑽石級數域宗師</strong>
                </div>
              </div>

              <!-- 印信與簽署欄 -->
              <div class="cert-signatures-row">
                <div class="cert-sig-item">
                  <span class="sig-label">命題評量導師</span>
                  <div class="sig-name">高志賢 老師 ✍️</div>
                </div>

                <!-- 官方紅色考核專用章 -->
                <div class="cert-seal">
                  <div class="seal-inner">
                    <span>鹿陽國小</span>
                    <span>數域試煉</span>
                    <span>考核合格</span>
                  </div>
                </div>

                <div class="cert-sig-item">
                  <span class="sig-label">頒發日期</span>
                  <div class="sig-date">${dateStr}</div>
                </div>
              </div>

            </div>
          </div>

          <!-- 操作按鈕列 (列印時自動隱藏) -->
          <div class="cert-actions no-print">
            <button id="btnPrintCertificate" class="cert-btn cert-btn-gold">
              🖨️ 列印 / 另存 PDF 證書
            </button>
            <button id="btnVictoryReplay" class="cert-btn cert-btn-secondary">
              🔄 重新挑戰全島
            </button>
            <a href="../../index.html" class="cert-btn cert-btn-dark">
              🏠 返回遊戲大廳
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 列印/存為 PDF
    document.getElementById("btnPrintCertificate").addEventListener("click", () => {
      window.print();
    });

    // 重新遊玩
    document.getElementById("btnVictoryReplay").addEventListener("click", () => {
      sound.playClick();
      if (confirm("確定要重置目前的所有闖關進度，重新體驗 3D 數學立體群島大冒險嗎？")) {
        if (this.onResetGame) this.onResetGame();
        this.close();
      }
    });
  }

  show(totalStars) {
    document.getElementById("certTotalStars").innerText = `${totalStars} / 75 ⭐`;
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
    const colors = ["#f59e0b", "#38bdf8", "#10b981", "#ec4899", "#8b5cf6", "#ef4444", "#eab308"];

    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3.5 + 2,
        speedX: (Math.random() - 0.5) * 2.5,
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
