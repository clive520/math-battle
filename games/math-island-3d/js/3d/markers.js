/**
 * 3D 數學立體群島大冒險 - 互動地標與點擊放大控制器
 * 解決手機/平板點擊問題：使用超大隱形觸控球 (Hitbox) 與精準 PointerEvent (防拖曳干擾)
 * 解決島嶼放大問題：點擊島嶼本體任意位置時，自動平滑飛入放大該島嶼！
 */

import { QUESTIONS_DATA, ISLANDS_METADATA } from "../data/questions.js";

export class LevelMarkers {
  constructor(scene, camera, domElement, islandsBuilder, onSelectLevel, onSelectIsland) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.islandsBuilder = islandsBuilder;
    this.onSelectLevel = onSelectLevel;
    this.onSelectIsland = onSelectIsland;

    this.markersGroup = new THREE.Group();
    this.interactiveMeshes = [];
    this.interactiveTargets = []; // 包含隱形超大觸控球與立標晶石

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.pointerStartPos = { x: 0, y: 0, time: 0 };

    this.initMarkers();
    this.scene.add(this.markersGroup);
    this.setupEvents();
  }

  initMarkers() {
    const localOffsets = [
      [-6.5, 1.8, 4.5],
      [-2.5, 1.8, 7.2],
      [3.2, 1.8, 6.5],
      [6.5, 1.8, 2.0],
      [2.2, 1.8, -6.5] // 第 5 關在島嶼後方高處
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

    // 1. 基座圓石盤
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.35, 12), ringMat);
    group.add(ring);

    // 2. 懸浮能量立標晶石 (八面體)
    const gemGeo = new THREE.OctahedronGeometry(1.0, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.2
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.y = 1.8;
    gem.castShadow = true;
    group.add(gem);

    // 3. 標記編號圓形 Sprite (1-1, 1-2, etc.)
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#0284c7";
    ctx.stroke();

    ctx.font = "bold 46px sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${question.unitId}-${question.levelNum}`, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 3.6;
    sprite.scale.set(2.4, 2.4, 1);
    group.add(sprite);

    // 4. ⭐ 關鍵：超大隱形觸控球 (Hitbox Radius = 3.5)，讓手機/平板手指極易精準點中！
    const hitGeo = new THREE.SphereGeometry(3.2, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.position.y = 2.0;
    hitBox.userData = { parentMarker: group, question };
    group.add(hitBox);

    this.interactiveTargets.push(hitBox);
    this.interactiveTargets.push(gem);

    group.userData.gem = gem;
    group.userData.gemMat = gemMat;
    group.userData.sprite = sprite;
    group.userData.hitBox = hitBox;

    return group;
  }

  // 更新星級外觀 (不限制順序，全部開放挑戰)
  updateProgress(gameProgress) {
    this.interactiveMeshes.forEach(group => {
      const q = group.userData.question;
      const stars = gameProgress.getLevelStars(q.id);

      if (stars > 0) {
        // 已通關：耀眼純金
        group.userData.gemMat.color.setHex(0xfbbf24);
        group.userData.gemMat.emissive.setHex(0xd97706);
        group.userData.gemMat.emissiveIntensity = 0.65;
      } else {
        // 未作答（可直接點擊挑戰）：清新耀眼水藍
        group.userData.gemMat.color.setHex(0x38bdf8);
        group.userData.gemMat.emissive.setHex(0x0284c7);
        group.userData.gemMat.emissiveIntensity = 0.45;
      }
    });
  }

  setupEvents() {
    // 使用跨平台 Pointer Events 解決手機觸控問題
    this.domElement.addEventListener("pointerdown", e => {
      this.pointerStartPos = { x: e.clientX, y: e.clientY, time: Date.now() };
    });

    this.domElement.addEventListener("pointerup", e => {
      const dist = Math.hypot(e.clientX - this.pointerStartPos.x, e.clientY - this.pointerStartPos.y);
      const elapsed = Date.now() - this.pointerStartPos.time;

      // 若拖曳小於 14px 且耗時小於 400ms，判定為「點擊/輕按」，不是 OrbitControls 視角拖動
      if (dist < 14 && elapsed < 400) {
        this.handlePointerClick(e.clientX, e.clientY);
      }
    });

    // 桌機懸停改變游標
    this.domElement.addEventListener("pointermove", e => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveTargets);
      if (intersects.length > 0) {
        this.domElement.style.cursor = "pointer";
      } else {
        // 若懸停在島嶼本體上也提示可點擊放大
        const islandHits = this.raycaster.intersectObjects(this.islandsBuilder.islandsMeshes);
        this.domElement.style.cursor = islandHits.length > 0 ? "zoom-in" : "default";
      }
    });
  }

  handlePointerClick(clientX, clientY) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 優先檢測：是否點中了關卡立標 (Hitbox)
    const markerHits = this.raycaster.intersectObjects(this.interactiveTargets);
    if (markerHits.length > 0) {
      let hitObj = markerHits[0].object;
      let markerGroup = hitObj.userData.parentMarker || hitObj.parent;
      if (markerGroup && markerGroup.userData.question) {
        const question = markerGroup.userData.question;
        if (this.onSelectLevel) {
          this.onSelectLevel(question, markerGroup.position);
        }
        return;
      }
    }

    // 次級檢測：是否點中了島嶼本體 (實現「點擊島嶼自然放大」需求)
    const islandHits = this.raycaster.intersectObjects(this.islandsBuilder.islandsMeshes);
    if (islandHits.length > 0) {
      const hitMesh = islandHits[0].object;
      const islandId = hitMesh.userData.islandId;
      const islandMeta = ISLANDS_METADATA.find(i => i.id === islandId);
      if (islandMeta && this.onSelectIsland) {
        this.onSelectIsland(islandMeta);
      }
    }
  }

  update(time) {
    this.interactiveMeshes.forEach(marker => {
      const gem = marker.userData.gem;
      if (gem) {
        gem.rotation.y += 0.025;
        gem.position.y = 1.8 + Math.sin(time * 3 + marker.position.x) * 0.22;
      }
    });
  }
}
