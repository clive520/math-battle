/**
 * 3D 數學立體群島大冒險 - 主程式控制器與狀態中樞
 * 響應用戶需求：
 * 1. 手機/平板全面可點擊
 * 2. 點擊島嶼本體自然平滑飛入放大
 * 3. 毫無順序限制，任意關卡自由作答，全數答完即可獲得結業證書
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
    this.storageKey = "math_3d_island_save_free_v2";
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return {
      levelStars: {} // 記錄各關卡獲得星級 (1~3 星)
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  }

  // ⭐ 無任何順序限制：全部關卡永遠開放自由挑戰！
  isLevelUnlocked(levelId) {
    return true;
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  completeLevel(levelId, stars) {
    const currentStars = this.data.levelStars[levelId] || 0;
    this.data.levelStars[levelId] = Math.max(currentStars, stars);
    this.save();
  }

  getClearedCount() {
    return Object.keys(this.data.levelStars).filter(id => this.data.levelStars[id] > 0).length;
  }

  getTotalStars() {
    return Object.values(this.data.levelStars).reduce((sum, s) => sum + s, 0);
  }

  reset() {
    this.data = { levelStars: {} };
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

    // 2. 構建 5 座精緻主題幾何島嶼
    this.islands = new IslandsBuilder(this.scene.scene);

    // 3. 相機俯衝運鏡控制器
    this.cameraFlight = new CameraFlightController(this.scene.camera, this.scene.controls);

    // 4. 建立關卡 3D 浮標與島嶼點擊放大監聽
    this.markers = new LevelMarkers(
      this.scene.scene,
      this.scene.camera,
      this.scene.renderer.domElement,
      this.islands,
      (question, markerPos) => this.onSelectLevelMarker(question, markerPos),
      islandMeta => this.onSelectIslandMesh(islandMeta)
    );
    this.markers.updateProgress(this.progress);

    // 5. 初始化 HUD 介面 (附帶手機/平板快速關卡切換列)
    this.hud = new GameHUD(hudContainer, {
      onResetCamera: () => this.cameraFlight.flyToOverview(),
      onChangeTimeMode: mode => this.scene.setTimeMode(mode),
      onSelectIsland: islandId => {
        const meta = ISLANDS_METADATA.find(i => i.id === islandId);
        if (meta) {
          this.cameraFlight.flyToIsland(meta.islandPos);
        }
      },
      onDirectOpenLevel: levelId => {
        const q = QUESTIONS_DATA.find(item => item.id === levelId);
        if (q) {
          sound.playClick();
          this.modal.open(q);
        }
      }
    });
    this.hud.updateStats(this.progress);

    // 6. 初始化試煉視窗與結業證書典禮
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

  // 點擊島嶼本體：相機自然平滑飛入放大該島嶼！
  onSelectIslandMesh(islandMeta) {
    sound.playClick();
    this.hud.setActiveIsland(islandMeta.id);
    this.cameraFlight.flyToIsland(islandMeta.islandPos, 1400);
    this.hud.showToast(`🔍 已平滑聚焦到：島嶼 0${islandMeta.id}【${islandMeta.name}】`, "info");
  }

  // 點擊關卡地標：無限制自由進入作答
  onSelectLevelMarker(question, markerPos) {
    sound.playClick();
    this.cameraFlight.flyToMarker(markerPos, 900);

    setTimeout(() => {
      this.modal.open(question);
    }, 380);
  }

  onLevelCompleted(levelId, stars) {
    this.progress.completeLevel(levelId, stars);
    this.markers.updateProgress(this.progress);
    this.hud.updateStats(this.progress);

    const clearedCount = this.progress.getClearedCount();

    // 檢查是否全 25 關全數通關 (頒發結業證書！)
    if (clearedCount >= QUESTIONS_DATA.length) {
      setTimeout(() => {
        this.victory.show(this.progress.getTotalStars());
      }, 500);
    } else {
      this.hud.showToast(`✨ 恭喜通過！獲得 ${stars} 顆星！累計已完成 ${clearedCount} / 25 關！`, "success");
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.cameraFlight.update();
    this.scene.update(delta);
    this.islands.update(elapsedTime);
    this.markers.update(elapsedTime);
    this.scene.render();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
