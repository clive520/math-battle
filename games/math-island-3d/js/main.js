/**
 * 3D 數學立體群島大冒險 - 主程式控制器與狀態中樞
 */

import { WorldScene } from "./3d/scene.js";
import { IslandsBuilder } from "./3d/islands.js";
import { CameraFlightController } from "./3d/camera-controls.js";
import { LevelMarkers } from "./3d/markers.js";
import { GameHUD } from "./ui/hud.js";
import { QuizModal } from "./ui/modal.js";
import { VictoryCelebration } from "./ui/victory.js";
import { QUESTIONS_DATA, ISLANDS_METADATA } from "./data/questions.js";
import { sound } from "./audio.js";

class GameProgress {
  constructor() {
    this.storageKey = "math_3d_island_save_v1";
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // 初始存檔：第一島第 1 關預設解鎖
    return {
      unlockedLevels: ["u1_l1"],
      levelStars: {}
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  }

  isLevelUnlocked(levelId) {
    return this.data.unlockedLevels.includes(levelId);
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  completeLevel(levelId, stars) {
    // 記錄或覆蓋更高星級
    const currentStars = this.data.levelStars[levelId] || 0;
    this.data.levelStars[levelId] = Math.max(currentStars, stars);

    // 解鎖下一關
    const currentIndex = QUESTIONS_DATA.findIndex(q => q.id === levelId);
    if (currentIndex >= 0 && currentIndex + 1 < QUESTIONS_DATA.length) {
      const nextId = QUESTIONS_DATA[currentIndex + 1].id;
      if (!this.data.unlockedLevels.includes(nextId)) {
        this.data.unlockedLevels.push(nextId);
        sound.playUnlock();
      }
    }

    this.save();
  }

  getClearedCount() {
    return Object.keys(this.data.levelStars).filter(id => this.data.levelStars[id] > 0).length;
  }

  getTotalStars() {
    return Object.values(this.data.levelStars).reduce((sum, s) => sum + s, 0);
  }

  reset() {
    this.data = {
      unlockedLevels: ["u1_l1"],
      levelStars: {}
    };
    this.save();
  }
}

class App {
  constructor() {
    this.progress = new GameProgress();
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const canvasContainer = document.getElementById("canvasContainer");
    const hudContainer = document.getElementById("hudContainer");
    const modalContainer = document.getElementById("modalContainer");
    const victoryContainer = document.getElementById("victoryContainer");

    // 1. 啟動 Three.js 場景
    this.scene = new WorldScene(canvasContainer);

    // 2. 構建 5 座主題幾何島嶼
    this.islands = new IslandsBuilder(this.scene.scene);

    // 3. 相機俯衝運鏡控制器
    this.cameraFlight = new CameraFlightController(this.scene.camera, this.scene.controls);

    // 4. 建立關卡 3D 浮標
    this.markers = new LevelMarkers(
      this.scene.scene,
      this.scene.camera,
      this.scene.renderer.domElement,
      (question, markerPos) => this.onSelectLevelMarker(question, markerPos)
    );
    this.markers.updateProgress(this.progress);

    // 5. 初始化 HUD 介面
    this.hud = new GameHUD(hudContainer, {
      onResetCamera: () => this.cameraFlight.flyToOverview(),
      onChangeTimeMode: mode => this.scene.setTimeMode(mode),
      onSelectIsland: islandId => {
        const meta = ISLANDS_METADATA.find(i => i.id === islandId);
        if (meta) {
          this.cameraFlight.flyToIsland(meta.islandPos);
        }
      }
    });
    this.hud.updateStats(this.progress);

    // 6. 初始化試煉視窗與通關典禮
    this.modal = new QuizModal(modalContainer, (levelId, stars) => {
      this.onLevelCompleted(levelId, stars);
    });

    this.victory = new VictoryCelebration(victoryContainer, () => {
      this.progress.reset();
      this.markers.updateProgress(this.progress);
      this.hud.updateStats(this.progress);
      this.cameraFlight.flyToOverview();
    });

    // 7. 開啟動畫渲染迴圈
    this.animate();
  }

  onSelectLevelMarker(question, markerPos) {
    if (!this.progress.isLevelUnlocked(question.id)) {
      sound.playWrong();
      this.hud.showToast(`🔒 關卡 ${question.unitId}-${question.levelNum} 尚未解鎖！請先突破前方試煉。`, "warning");
      return;
    }

    sound.playClick();
    // 相機平滑推鏡聚焦該立標
    this.cameraFlight.flyToMarker(markerPos, 1000);

    // 稍候 0.4 秒彈出試煉視窗，體驗絕佳推鏡儀式感
    setTimeout(() => {
      this.modal.open(question);
    }, 450);
  }

  onLevelCompleted(levelId, stars) {
    this.progress.completeLevel(levelId, stars);
    this.markers.updateProgress(this.progress);
    this.hud.updateStats(this.progress);

    // 檢查是否全 25 關全數通關
    if (this.progress.getClearedCount() >= QUESTIONS_DATA.length) {
      setTimeout(() => {
        this.victory.show(this.progress.getTotalStars());
      }, 600);
    } else {
      this.hud.showToast(`✨ 恭喜通過！獲得 ${stars} 顆星！通往下一關的航道已開啟！`, "success");
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 更新相機飛行插值
    this.cameraFlight.update();

    // 更新海洋、雲朵與控制器
    this.scene.update(delta);

    // 更新島嶼動態組件 (齒輪、水輪、天平)
    this.islands.update(elapsedTime);

    // 更新 3D 地標晶石自轉浮動
    this.markers.update(elapsedTime);

    // 渲染場景
    this.scene.render();
  }
}

// 頁面載入完成後啟動
window.addEventListener("DOMContentLoaded", () => {
  new App();
});
