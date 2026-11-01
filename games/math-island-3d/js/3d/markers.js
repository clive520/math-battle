/**
 * 3D 數學立體群島大冒險 - 3D 關卡地標標記 (Interactive Pins)
 * 每個島嶼分佈 5 個微縮 3D 關卡立標，支援游標懸停發光、浮動、點擊射線檢測與星級展示
 */

import { QUESTIONS_DATA, ISLANDS_METADATA } from "../data/questions.js";

export class LevelMarkers {
  constructor(scene, camera, domElement, onSelectLevel) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelectLevel = onSelectLevel;

    this.markersGroup = new THREE.Group();
    this.interactiveMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMarker = null;

    this.initMarkers();
    this.scene.add(this.markersGroup);
    this.setupEvents();
  }

  initMarkers() {
    // 預設各島嶼 5 個關卡的局部相對座標 (圍繞島嶼中心分佈)
    const localOffsets = [
      [-6, 1.8, 5],
      [-2, 1.8, 7],
      [3.5, 1.8, 6],
      [6, 1.8, 1.5],
      [1.5, 1.8, -6] // 魔王關卡在島嶼後方/最高處
    ];

    QUESTIONS_DATA.forEach(q => {
      const island = ISLANDS_METADATA.find(i => i.id === q.unitId);
      const offset = localOffsets[q.levelNum - 1];
      const worldPos = new THREE.Vector3(
        island.islandPos[0] + offset[0],
        island.islandPos[1] + offset[1],
        island.islandPos[2] + offset[2]
      );

      const marker = this.createSingleMarker(q, worldPos);
      this.interactiveMeshes.push(marker);
      this.markersGroup.add(marker);
    });
  }

  createSingleMarker(question, worldPos) {
    const group = new THREE.Group();
    group.position.copy(worldPos);
    group.userData = { question, basePosY: worldPos.y };

    // 1. 基座圓盤石環
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6
    });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.3, 12), ringMat);
    group.add(ring);

    // 2. 懸浮能量立標晶石 (立體菱形)
    const gemGeo = new THREE.OctahedronGeometry(0.85, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.2
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.y = 1.6;
    gem.castShadow = true;
    group.add(gem);

    // 3. 標記編號圓板 Sprite
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#0284c7";
    ctx.stroke();

    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${question.unitId}-${question.levelNum}`, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 3.2;
    sprite.scale.set(2, 2, 1);
    group.add(sprite);

    // 引用以便更新狀態外觀
    group.userData.gem = gem;
    group.userData.gemMat = gemMat;
    group.userData.sprite = sprite;

    return group;
  }

  // 根據使用者的存檔數據更新標記顏色與星級
  updateProgress(gameProgress) {
    this.interactiveMeshes.forEach(group => {
      const q = group.userData.question;
      const isUnlocked = gameProgress.isLevelUnlocked(q.id);
      const stars = gameProgress.getLevelStars(q.id);

      if (!isUnlocked) {
        // 未解鎖：暗沉灰色
        group.userData.gemMat.color.setHex(0x64748b);
        group.userData.gemMat.emissive.setHex(0x334155);
        group.userData.gemMat.emissiveIntensity = 0.1;
      } else if (stars > 0) {
        // 已通關：耀眼黃金
        group.userData.gemMat.color.setHex(0xfbbf24);
        group.userData.gemMat.emissive.setHex(0xd97706);
        group.userData.gemMat.emissiveIntensity = 0.6;
      } else {
        // 當前可挑戰：清新水藍
        group.userData.gemMat.color.setHex(0x38bdf8);
        group.userData.gemMat.emissive.setHex(0x0284c7);
        group.userData.gemMat.emissiveIntensity = 0.4;
      }
    });
  }

  setupEvents() {
    this.domElement.addEventListener("mousemove", e => this.onMouseMove(e));
    this.domElement.addEventListener("click", e => this.onClick(e));
    this.domElement.addEventListener("touchstart", e => this.onTouchStart(e), { passive: true });
  }

  onMouseMove(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.checkHover();
  }

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkHover();
    }
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // 檢測標記晶石
    const targets = this.interactiveMeshes.map(m => m.userData.gem);
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
      const hit = intersects[0].object.parent;
      if (this.hoveredMarker !== hit) {
        this.hoveredMarker = hit;
        this.domElement.style.cursor = "pointer";
      }
    } else {
      if (this.hoveredMarker) {
        this.hoveredMarker = null;
        this.domElement.style.cursor = "default";
      }
    }
  }

  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.interactiveMeshes.map(m => m.userData.gem);
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
      const hit = intersects[0].object.parent;
      const question = hit.userData.question;
      if (this.onSelectLevel) {
        this.onSelectLevel(question, hit.position);
      }
    }
  }

  update(time) {
    // 能量晶石上下懸浮與自轉
    this.interactiveMeshes.forEach(marker => {
      const gem = marker.userData.gem;
      if (gem) {
        gem.rotation.y += 0.02;
        gem.position.y = 1.6 + Math.sin(time * 3 + marker.position.x) * 0.2;
      }
    });
  }
}
