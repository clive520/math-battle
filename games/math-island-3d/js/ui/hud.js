/**
 * 3D 數學立體群島大冒險 - HUD 頂部與底部操作介面
 * 增強功能：附帶當前島嶼 5 個關卡的「快速點擊膠囊按鈕」，確保平板與手機操作 100% 順暢直達！
 */

import { ISLANDS_METADATA, QUESTIONS_DATA } from "../data/questions.js";
import { sound } from "../audio.js";
import { i18n } from "../i18n.js";

export class GameHUD {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentIslandId = 1;

    this.render();
    this.bindEvents();
  }

  render() {
    const lang = i18n.getLang();

    this.container.innerHTML = `
      <!-- 頂部浮動玩具狀態列 -->
      <header class="hud-top-bar toy-pop">
        <div class="hud-brand-group">
          <a href="../../index.html" class="hud-btn hud-btn-home" title="回到遊戲大廳">
            🏠 <span>${i18n.t("home")}</span>
          </a>
          <div class="hud-title-box">
            <h1 class="hud-title">${i18n.t("title")}</h1>
            <span class="hud-subtitle">${i18n.t("subtitle")}</span>
          </div>
        </div>

        <div class="hud-stats-group">
          <!-- 收集星級 -->
          <div class="hud-badge hud-star-badge" title="累計獲得的評量星級">
            ⭐ <span id="hudStarCount">0 / 75</span>
          </div>
          <!-- 通關進度 -->
          <div class="hud-badge hud-progress-badge" title="總通關進度">
            🎯 <span id="hudProgressPercent">0 / 25 ${i18n.t("levelsUnit")}</span>
          </div>

          <!-- 右側功能按鈕群 -->
          <div class="hud-actions">
            <!-- 🌐 中英雙語無縫切換按鈕 -->
            <button id="btnToggleLang" class="hud-lang-btn" title="切換繁體中文 / Switch to English">
              ${i18n.t("langBtn")}
            </button>
            <!-- 視角復位 -->
            <button id="btnResetCamera" class="hud-icon-btn" title="${i18n.t("resetCam")}">
              🗺️
            </button>
            <!-- 晝夜切換 -->
            <button id="btnTimeMode" class="hud-icon-btn" title="${i18n.t("timeMode")}">
              ☀️
            </button>
            <!-- 音效開關 -->
            <button id="btnToggleSound" class="hud-icon-btn" title="${i18n.t("soundOn")}">
              🔊
            </button>
            <!-- 全螢幕 -->
            <button id="btnFullscreen" class="hud-icon-btn" title="${i18n.t("fullscreen")}">
              ⛶
            </button>
          </div>
        </div>
      </header>

      <!-- 底部島嶼與快速關卡導覽 Dock -->
      <nav class="hud-bottom-dock toy-pop">
        <!-- 當前島嶼的 5 個關卡快速點擊膠囊 (手機/平板直達神器) -->
        <div class="dock-quick-levels" id="dockQuickLevels">
          <!-- 動態填充當前島嶼的 5 個關卡按鈕 -->
        </div>

        <!-- 5 座島嶼切換頁籤 -->
        <div class="dock-inner">
          ${ISLANDS_METADATA.map(meta => {
            const islandName = lang === "en" ? (meta.name_en || meta.name) : meta.name;
            return `
            <button class="dock-island-btn ${meta.id === this.currentIslandId ? 'active' : ''}" data-island-id="${meta.id}">
              <span class="dock-island-num">${i18n.t("islandPrefix")} 0${meta.id}</span>
              <span class="dock-island-name">${islandName}</span>
              <div class="dock-stars" id="dockStars_${meta.id}">☆☆☆☆☆</div>
            </button>
            `;
          }).join("")}
        </div>
      </nav>

      <!-- 畫面中央操作提示浮條 (點擊後自動淡出) -->
      <div id="hudWelcomeTip" class="hud-center-tip toy-pop">
        <span>${i18n.t("welcomeTip")}</span>
        <button id="btnCloseWelcomeTip" class="btn-tip-close">✕</button>
      </div>

      <!-- 全域 Toast 訊息浮層 -->
      <div id="hudToast" class="hud-toast"></div>
    `;

    this.renderQuickLevels(this.currentIslandId);
  }

  renderQuickLevels(islandId) {
    const container = document.getElementById("dockQuickLevels");
    if (!container) return;

    const lang = i18n.getLang();
    const islandQuestions = QUESTIONS_DATA.filter(q => q.unitId === islandId);
    container.innerHTML = `
      <div class="quick-levels-label">
        <span>${i18n.t("islandPrefix")} 0${islandId} ${i18n.t("fastTravel")}</span>
      </div>
      <div class="quick-levels-row">
        ${islandQuestions.map(q => {
          const rawTitle = lang === "en" ? (q.title_en || q.title) : q.title;
          const cleanTitle = rawTitle.split('（')[0].split('(')[0].trim();
          return `
          <button class="quick-level-pill" data-level-id="${q.id}">
            <span class="pill-no">${q.unitId}-${q.levelNum}</span>
            <span class="pill-name">${cleanTitle}</span>
            <span class="pill-star" id="pillStar_${q.id}">☆</span>
          </button>
          `;
        }).join("")}
      </div>
    `;

    // 綁定快速進入關卡事件
    container.querySelectorAll(".quick-level-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const levelId = btn.getAttribute("data-level-id");
        if (this.callbacks.onDirectOpenLevel) {
          this.callbacks.onDirectOpenLevel(levelId);
        }
      });
    });
  }

  bindEvents() {
    // 0. 中英雙語即時切換按鈕
    const btnLang = document.getElementById("btnToggleLang");
    if (btnLang) {
      btnLang.addEventListener("click", () => {
        sound.playClick();
        if (this.callbacks.onToggleLanguage) {
          this.callbacks.onToggleLanguage();
        }
      });
    }

    // 1. 重返全景視角
    const btnReset = document.getElementById("btnResetCamera");
    btnReset.addEventListener("click", () => {
      sound.playClick();
      if (this.callbacks.onResetCamera) this.callbacks.onResetCamera();
    });

    // 2. 晝夜切換
    const btnTime = document.getElementById("btnTimeMode");
    const modes = ["day", "sunset", "night"];
    const icons = { day: "☀️", sunset: "🌅", night: "🌙" };
    let curModeIdx = 0;
    btnTime.addEventListener("click", () => {
      sound.playClick();
      curModeIdx = (curModeIdx + 1) % modes.length;
      const newMode = modes[curModeIdx];
      btnTime.innerText = icons[newMode];
      if (this.callbacks.onChangeTimeMode) this.callbacks.onChangeTimeMode(newMode);
    });

    // 3. 音效切換
    const btnSound = document.getElementById("btnToggleSound");
    btnSound.addEventListener("click", () => {
      const isEnabled = sound.toggle();
      btnSound.innerText = isEnabled ? "🔊" : "🔇";
    });

    // 4. 全螢幕切換
    const btnFS = document.getElementById("btnFullscreen");
    btnFS.addEventListener("click", () => {
      sound.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // 5. 鍵盤快速鍵支援
    window.addEventListener("keydown", e => {
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === "m" || e.key === "M") {
        const isEnabled = sound.toggle();
        btnSound.innerText = isEnabled ? "🔊" : "🔇";
      } else if (e.key === "r" || e.key === "R") {
        if (this.callbacks.onResetCamera) this.callbacks.onResetCamera();
      }
    });

    // 6. 底部島嶼切換 Dock
    const islandBtns = document.querySelectorAll(".dock-island-btn");
    islandBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sound.playClick();
        const islandId = parseInt(btn.getAttribute("data-island-id"), 10);
        this.setActiveIsland(islandId);
        if (this.callbacks.onSelectIsland) {
          this.callbacks.onSelectIsland(islandId);
        }
      });
    });

    // 7. 關閉開場提示
    const btnCloseTip = document.getElementById("btnCloseWelcomeTip");
    const tipBox = document.getElementById("hudWelcomeTip");
    if (btnCloseTip && tipBox) {
      btnCloseTip.addEventListener("click", () => {
        tipBox.style.display = "none";
      });
      setTimeout(() => {
        tipBox.classList.add("fade-out");
        setTimeout(() => tipBox.style.display = "none", 800);
      }, 7000);
    }
  }

  setActiveIsland(islandId) {
    this.currentIslandId = islandId;
    document.querySelectorAll(".dock-island-btn").forEach(btn => {
      const id = parseInt(btn.getAttribute("data-island-id"), 10);
      btn.classList.toggle("active", id === islandId);
    });
    this.renderQuickLevels(islandId);
  }

  updateStats(progress) {
    const starEl = document.getElementById("hudStarCount");
    const progEl = document.getElementById("hudProgressPercent");

    const totalStars = progress.getTotalStars();
    const cleared = progress.getClearedCount();

    if (starEl) starEl.innerText = `${totalStars} / 75`;
    if (progEl) progEl.innerText = `${cleared} / 25 ${i18n.t("levelsUnit")}`;

    // 更新底部各島星級顯示
    ISLANDS_METADATA.forEach(meta => {
      const dockStarEl = document.getElementById(`dockStars_${meta.id}`);
      if (dockStarEl) {
        let starsStr = "";
        for (let l = 1; l <= 5; l++) {
          const stars = progress.getLevelStars(`u${meta.id}_l${l}`);
          starsStr += stars > 0 ? "★" : "☆";
        }
        dockStarEl.innerText = starsStr;
      }
    });

    // 更新當前快速關卡按鈕星級
    for (let l = 1; l <= 5; l++) {
      const id = `u${this.currentIslandId}_l${l}`;
      const pillStar = document.getElementById(`pillStar_${id}`);
      if (pillStar) {
        const s = progress.getLevelStars(id);
        pillStar.innerText = s > 0 ? "★".repeat(s) : "☆";
        pillStar.style.color = s > 0 ? "#f59e0b" : "#94a3b8";
      }
    }
  }

  showToast(message, type = "info") {
    const toast = document.getElementById("hudToast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = `hud-toast active ${type}`;
    setTimeout(() => {
      toast.className = "hud-toast";
    }, 2800);
  }
}
