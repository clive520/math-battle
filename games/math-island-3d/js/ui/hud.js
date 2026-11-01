/**
 * 3D 數學立體群島大冒險 - HUD 頂部與底部玩具風操作介面
 */

import { ISLANDS_METADATA } from "../data/questions.js";
import { sound } from "../audio.js";

export class GameHUD {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentIslandId = 1;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <!-- 頂部浮動玩具狀態列 -->
      <header class="hud-top-bar toy-pop">
        <div class="hud-brand-group">
          <a href="../../index.html" class="hud-btn hud-btn-home" title="回到遊戲大廳">
            🏠 <span>大廳</span>
          </a>
          <div class="hud-title-box">
            <h1 class="hud-title">🏝️ 3D 數學立體群島大冒險</h1>
            <span class="hud-subtitle">國小六年級第一次定期評量・五芒星數域試煉</span>
          </div>
        </div>

        <div class="hud-stats-group">
          <!-- 收集星級 -->
          <div class="hud-badge hud-star-badge" title="累計獲得的評量星級">
            ⭐ <span id="hudStarCount">0 / 75</span>
          </div>
          <!-- 通關進度 -->
          <div class="hud-badge hud-progress-badge" title="總通關進度">
            🎯 <span id="hudProgressPercent">0%</span>
          </div>

          <!-- 右側功能按鈕群 -->
          <div class="hud-actions">
            <!-- 視角復位 -->
            <button id="btnResetCamera" class="hud-icon-btn" title="重返群島全景視角 (快捷鍵 R)">
              🗺️
            </button>
            <!-- 晝夜切換 -->
            <button id="btnTimeMode" class="hud-icon-btn" title="切換白天/夕陽/星空氛圍">
              ☀️
            </button>
            <!-- 音效開關 -->
            <button id="btnToggleSound" class="hud-icon-btn" title="開啟/關閉音效 (快捷鍵 M)">
              🔊
            </button>
            <!-- 全螢幕 -->
            <button id="btnFullscreen" class="hud-icon-btn" title="切換全螢幕模式 (快捷鍵 F)">
              ⛶
            </button>
          </div>
        </div>
      </header>

      <!-- 底部島嶼航行 Dock 快捷導覽列 -->
      <nav class="hud-bottom-dock toy-pop">
        <div class="dock-inner">
          ${ISLANDS_METADATA.map(meta => `
            <button class="dock-island-btn ${meta.id === 1 ? 'active' : ''}" data-island-id="${meta.id}">
              <span class="dock-island-num">島嶼 0${meta.id}</span>
              <span class="dock-island-name">${meta.name}</span>
              <div class="dock-stars" id="dockStars_${meta.id}">☆☆☆☆☆</div>
            </button>
          `).join("")}
        </div>
      </nav>

      <!-- 畫面中央操作提示浮條 (點擊後自動淡出) -->
      <div id="hudWelcomeTip" class="hud-center-tip toy-pop">
        <span>🎮 拖曳滑鼠可 360° 旋轉視角、滾輪縮放；點擊島嶼上的「發光立標」即可進入考題試煉！</span>
        <button id="btnCloseWelcomeTip" class="btn-tip-close">✕</button>
      </div>

      <!-- 全域 Toast 訊息浮層 -->
      <div id="hudToast" class="hud-toast"></div>
    `;
  }

  bindEvents() {
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
  }

  updateStats(progress) {
    const starEl = document.getElementById("hudStarCount");
    const progEl = document.getElementById("hudProgressPercent");

    const totalStars = progress.getTotalStars();
    const percent = Math.round((progress.getClearedCount() / 25) * 100);

    if (starEl) starEl.innerText = `${totalStars} / 75`;
    if (progEl) progEl.innerText = `${percent}%`;

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
