/**
 * 3D 數學立體群島大冒險 - 正式「數域宗師結業證書」頒發系統
 * 當學生完成全卷 25 個關卡（不限順序）時隆重頒發
 * 支援學生即時輸入姓名、班級、座號，並可一鍵列印或截圖留念！
 */

import { sound } from "../audio.js";
import { i18n } from "../i18n.js";

export class VictoryCelebration {
  constructor(container, onResetGame) {
    this.container = container;
    this.onResetGame = onResetGame;
    this.render();
    this.bindEvents();
  }

  render() {
    const today = new Date();
    const lang = i18n.getLang();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dateStr = lang === "en"
      ? `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`
      : `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;

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
                <h1 class="cert-title">${i18n.t("certTitle")}</h1>
                <div class="cert-eng-title">${i18n.t("certEngTitle")}</div>
              </div>

              <!-- 學生姓名班級編輯區 -->
              <div class="cert-student-row">
                <span>${i18n.t("certPrefix")}</span>
                <input type="text" id="certClassName" class="cert-input cert-class" value="${i18n.t("certClassDefault")}" placeholder="${i18n.t("certClassLbl")}" />
                <span>${i18n.t("certSeatLbl")}</span>
                <input type="text" id="certSeatNo" class="cert-input cert-seat" value="${i18n.t("certSeatDefault")}" placeholder="${i18n.t("certSeatLbl")}" />
                <span>${i18n.t("certNameLbl")}</span>
                <input type="text" id="certStudentName" class="cert-input cert-name" value="${i18n.t("certNameDefault")}" placeholder="${i18n.t("certNameLbl")}" />
                ${i18n.t("certSuffix") ? `<span>${i18n.t("certSuffix")}</span>` : ""}
              </div>

              <!-- 褒獎內文 -->
              <div class="cert-body-text">
                ${i18n.t("certBody")}
              </div>

              <!-- 榮譽數據欄 -->
              <div class="cert-stats-row">
                <div class="cert-stat-badge">
                  <span>${i18n.t("certProgressLbl")}</span>
                  <strong>${i18n.t("certFullLevels")}</strong>
                </div>
                <div class="cert-stat-badge gold">
                  <span>${i18n.t("certStarsLbl")}</span>
                  <strong id="certTotalStars">75 / 75 ⭐</strong>
                </div>
                <div class="cert-stat-badge">
                  <span>${i18n.t("certRankLbl")}</span>
                  <strong>${i18n.t("certRankVal")}</strong>
                </div>
              </div>

              <!-- 印信與簽署欄 -->
              <div class="cert-signatures-row">
                <div class="cert-sig-item">
                  <span class="sig-label">${i18n.t("certTeacherLbl")}</span>
                  <div class="sig-name">${i18n.t("certTeacherVal")}</div>
                </div>

                <!-- 官方紅色考核專用章 -->
                <div class="cert-seal">
                  <div class="seal-inner">
                    <span>${i18n.t("certSealLine1")}</span>
                    <span>${i18n.t("certSealLine2")}</span>
                    <span>${i18n.t("certSealLine3")}</span>
                  </div>
                </div>

                <div class="cert-sig-item">
                  <span class="sig-label">${i18n.t("certDateLbl")}</span>
                  <div class="sig-date">${dateStr}</div>
                </div>
              </div>

            </div>
          </div>

          <!-- 操作按鈕列 (列印時自動隱藏) -->
          <div class="cert-actions no-print">
            <button id="btnPrintCertificate" class="cert-btn cert-btn-gold">
              ${i18n.t("certPrintBtn")}
            </button>
            <button id="btnVictoryReplay" class="cert-btn cert-btn-secondary">
              ${i18n.t("certReplayBtn")}
            </button>
            <a href="../../index.html" class="cert-btn cert-btn-dark">
              ${i18n.t("certHomeBtn")}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 列印/存為 PDF
    const printBtn = document.getElementById("btnPrintCertificate");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }

    // 重新遊玩
    const replayBtn = document.getElementById("btnVictoryReplay");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        sound.playClick();
        if (confirm(i18n.t("certResetConfirm"))) {
          if (this.onResetGame) this.onResetGame();
          this.close();
        }
      });
    }
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
