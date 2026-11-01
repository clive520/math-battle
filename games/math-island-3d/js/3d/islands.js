/**
 * 3D 數學立體群島大冒險 - 五大主題微縮島嶼幾何建模引擎
 * 傳承標竿網站理念：不載入任何外掛 GLTF/FBX，全部以 Three.js 基礎幾何 (Box, Cylinder, Sphere, Dodecahedron)
 * 程式動態拼裝，體積小於 50KB，保證極速載入與 60 FPS！
 */

import { ISLANDS_METADATA } from "../data/questions.js";

export class IslandsBuilder {
  constructor(scene) {
    this.scene = scene;
    this.islandsGroup = new THREE.Group();
    this.islandsMeshes = [];
    this.bridges = [];
    this.animatedObjects = []; // 需在 render loop 中自轉/浮動的物件

    this.initMaterials();
    this.buildArchipelago();
    this.scene.add(this.islandsGroup);
  }

  initMaterials() {
    this.materials = {
      // 島嶼土壤與草地
      grassU1: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.6, flatShading: true }), // 晨曦砂金
      grassU2: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5, flatShading: true }), // 蔚藍水島
      grassU3: new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6, flatShading: true }), // 翡翠森林
      grassU4: new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.5, flatShading: true }), // 紫晶天秤
      grassU5: new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.5, flatShading: true }), // 緋紅聖域
      
      soil: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true }),
      stone: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, flatShading: true }),
      whiteMarble: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, flatShading: true }),
      wood: new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8, flatShading: true }),

      // 金屬與能量水晶
      gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.65, roughness: 0.25 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.55, roughness: 0.35 }),
      crystalCyan: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, transparent: true, opacity: 0.85 }),
      crystalGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.1, emissive: 0x15803d, emissiveIntensity: 0.3 }),
      crystalPurple: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.1, emissive: 0x6b21a8, emissiveIntensity: 0.4 }),
      crystalPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.1, emissive: 0xbe123c, emissiveIntensity: 0.5 }),

      // 樹木與植物
      leavesGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6, flatShading: true }),
      leavesDark: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true }),
      leavesGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6, flatShading: true })
    };
  }

  buildArchipelago() {
    ISLANDS_METADATA.forEach(meta => {
      const island = this.createThemedIsland(meta);
      this.islandsMeshes.push(island);
      this.islandsGroup.add(island);
    });

    // 建立島嶼之間的連通空橋/浮石步道
    this.createConnectingBridges();
  }

  createThemedIsland(meta) {
    const group = new THREE.Group();
    group.position.set(...meta.islandPos);
    group.userData = { meta };

    // 1. 八角形微縮基底 (八面圓柱，上寬下窄微縮模型風格)
    const islandRadius = 14;
    const islandHeight = 7;

    // 草皮頂部
    let topMat = this.materials.grassU1;
    if (meta.id === 2) topMat = this.materials.grassU2;
    if (meta.id === 3) topMat = this.materials.grassU3;
    if (meta.id === 4) topMat = this.materials.grassU4;
    if (meta.id === 5) topMat = this.materials.grassU5;

    const topGeo = new THREE.CylinderGeometry(islandRadius, islandRadius * 0.95, 1.4, 8);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.7;
    topMesh.receiveShadow = true;
    topMesh.castShadow = true;
    group.add(topMesh);

    // 中層岩石層
    const rockGeo = new THREE.CylinderGeometry(islandRadius * 0.95, islandRadius * 0.75, islandHeight - 1.4, 8);
    const rockMesh = new THREE.Mesh(rockGeo, this.materials.soil);
    rockMesh.position.y = -(islandHeight - 1.4) / 2;
    rockMesh.receiveShadow = true;
    group.add(rockMesh);

    // 水下基座
    const baseGeo = new THREE.CylinderGeometry(islandRadius * 0.75, islandRadius * 0.3, 3, 8);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.stone);
    baseMesh.position.y = -islandHeight + 1.4 - 1.5;
    group.add(baseMesh);

    // 2. 裝飾低多邊形積木樹木與岩石
    this.addIslandVegetation(group, islandRadius, meta.id);

    // 3. 根據單元特色建造標誌性 3D 幾何建築
    switch (meta.id) {
      case 1:
        this.buildUnit1Features(group);
        break;
      case 2:
        this.buildUnit2Features(group);
        break;
      case 3:
        this.buildUnit3Features(group);
        break;
      case 4:
        this.buildUnit4Features(group);
        break;
      case 5:
        this.buildUnit5Features(group);
        break;
    }

    return group;
  }

  // 【單元一：最大公因數與最小公倍數】遠古神廟、石柱與旋轉黃金齒輪
  buildUnit1Features(island) {
    const temple = new THREE.Group();
    temple.position.set(0, 1.4, -1);

    // 神殿階梯石台
    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 8), this.materials.whiteMarble);
    baseBox.castShadow = true;
    baseBox.receiveShadow = true;
    temple.add(baseBox);

    // 4 根神殿立柱
    const colGeo = new THREE.CylinderGeometry(0.5, 0.55, 4.5, 8);
    const colPositions = [
      [-3.8, 2.5, -2.8],
      [3.8, 2.5, -2.8],
      [-3.8, 2.5, 2.8],
      [3.8, 2.5, 2.8]
    ];
    colPositions.forEach(p => {
      const col = new THREE.Mesh(colGeo, this.materials.whiteMarble);
      col.position.set(...p);
      col.castShadow = true;
      temple.add(col);
    });

    // 三角形山牆屋頂
    const roofBox = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.7, 8.5), this.materials.whiteMarble);
    roofBox.position.set(0, 4.8, 0);
    roofBox.castShadow = true;
    temple.add(roofBox);

    // 屋頂中央旋轉的黃金公倍數齒輪
    const gearGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.4, 12);
    const gear = new THREE.Mesh(gearGeo, this.materials.gold);
    gear.position.set(0, 6.2, 0);
    gear.rotateX(Math.PI / 4);
    gear.castShadow = true;
    temple.add(gear);
    this.animatedObjects.push({ mesh: gear, rotY: 0.015, rotZ: 0.008 });

    island.add(temple);
  }

  // 【單元二：分數除法】水力工坊、水晶魔導管、旋轉水輪
  buildUnit2Features(island) {
    const waterWorks = new THREE.Group();
    waterWorks.position.set(0, 1.4, 0);

    // 水塔圓柱水槽
    const tankGeo = new THREE.CylinderGeometry(2.5, 2.2, 5, 12);
    const tank = new THREE.Mesh(tankGeo, this.materials.crystalCyan);
    tank.position.set(-2.5, 2.8, -2);
    tank.castShadow = true;
    waterWorks.add(tank);

    // 水塔屋頂
    const coneRoof = new THREE.Mesh(new THREE.ConeGeometry(3, 1.8, 12), this.materials.brass);
    coneRoof.position.set(-2.5, 6, -2);
    waterWorks.add(coneRoof);

    // 水力轉輪
    const wheelGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.5, 8);
    const wheel = new THREE.Mesh(wheelGeo, this.materials.wood);
    wheel.position.set(3.2, 2.5, 0);
    wheel.rotateZ(Math.PI / 2);
    wheel.castShadow = true;
    waterWorks.add(wheel);
    this.animatedObjects.push({ mesh: wheel, rotX: 0.02 });

    // 水道木槽
    const trough = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 1.2), this.materials.wood);
    trough.position.set(0.5, 2.2, -1);
    waterWorks.add(trough);

    island.add(waterWorks);
  }

  // 【單元三：數量關係】時光規律、正八邊形能量光柱與古老日晷
  buildUnit3Features(island) {
    const shrine = new THREE.Group();
    shrine.position.set(0, 1.4, 0);

    // 中央日晷石壇
    const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4, 0.8, 12), this.materials.stone);
    dialBase.position.y = 0.4;
    dialBase.receiveShadow = true;
    shrine.add(dialBase);

    // 日晷金色指針
    const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 4), this.materials.gold);
    gnomon.position.set(0, 1.8, 0);
    gnomon.rotateZ(0.25);
    shrine.add(gnomon);

    // 4 根象徵正八邊形規律的相連能量晶柱
    const pillarGeo = new THREE.CylinderGeometry(0.6, 0.6, 4.5, 8);
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    angles.forEach(ang => {
      const pMesh = new THREE.Mesh(pillarGeo, this.materials.crystalGreen);
      pMesh.position.set(Math.cos(ang) * 5.5, 2.5, Math.sin(ang) * 5.5);
      pMesh.castShadow = true;
      shrine.add(pMesh);
    });

    island.add(shrine);
  }

  // 【單元四：小數除法】小數精密天秤城、千分位黃金天平與蒸氣熔爐
  buildUnit4Features(island) {
    const scaleCity = new THREE.Group();
    scaleCity.position.set(0, 1.4, 0);

    // 蒸氣熔爐底座
    const furnace = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 4.5), this.materials.stone);
    furnace.position.set(-3, 1.6, -2);
    furnace.castShadow = true;
    scaleCity.add(furnace);

    // 熔爐金屬煙囪
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5, 8), this.materials.brass);
    chimney.position.set(-3, 4.5, -2);
    scaleCity.add(chimney);

    // 巨大黃金精密天秤
    const scaleBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1, 8), this.materials.gold);
    scaleBase.position.set(2.5, 0.5, 1);
    scaleCity.add(scaleBase);

    const scaleBeam = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 0.3), this.materials.gold);
    scaleBeam.position.set(2.5, 4.5, 1);
    scaleCity.add(scaleBeam);

    // 天秤兩端托盤
    const panGeo = new THREE.CylinderGeometry(1.2, 0.2, 0.4, 8);
    const panLeft = new THREE.Mesh(panGeo, this.materials.brass);
    panLeft.position.set(0, 3.2, 1);
    scaleCity.add(panLeft);

    const panRight = new THREE.Mesh(panGeo, this.materials.brass);
    panRight.position.set(5, 3.4, 1);
    scaleCity.add(panRight);

    this.animatedObjects.push({ mesh: scaleBeam, oscZ: 0.08, speed: 1.5 });

    island.add(scaleCity);
  }

  // 【單元五：比與比值】黃金比例空島、比例聖門與懸浮徽章
  buildUnit5Features(island) {
    const summit = new THREE.Group();
    summit.position.set(0, 1.4, 0);

    // 宏偉的黃金比例拱門 (長寬比 1:1.618)
    const archPillarGeo = new THREE.BoxGeometry(1.2, 7.5, 1.2);
    const leftPillar = new THREE.Mesh(archPillarGeo, this.materials.whiteMarble);
    leftPillar.position.set(-3.5, 3.75, 0);
    leftPillar.castShadow = true;
    summit.add(leftPillar);

    const rightPillar = new THREE.Mesh(archPillarGeo, this.materials.whiteMarble);
    rightPillar.position.set(3.5, 3.75, 0);
    rightPillar.castShadow = true;
    summit.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.4, 1.6), this.materials.gold);
    topBeam.position.set(0, 7.6, 0);
    topBeam.castShadow = true;
    summit.add(topBeam);

    // 拱門中央懸浮旋轉的「數域宗師徽章」
    const crestGeo = new THREE.OctahedronGeometry(1.8, 0);
    const crest = new THREE.Mesh(crestGeo, this.materials.crystalPink);
    crest.position.set(0, 4.2, 0);
    crest.castShadow = true;
    summit.add(crest);
    this.animatedObjects.push({ mesh: crest, rotY: 0.02, rotX: 0.01, floatY: 0.3, speed: 2 });

    island.add(summit);
  }

  // 為島嶼添加多樣化玩具低多邊形樹木
  addIslandVegetation(group, radius, islandId) {
    const treeMat = islandId === 1 ? this.materials.leavesGold :
                   (islandId === 3 ? this.materials.leavesGreen : this.materials.leavesDark);

    const treePositions = [
      [-radius * 0.55, 1.4, -radius * 0.45],
      [-radius * 0.65, 1.4, radius * 0.35],
      [radius * 0.55, 1.4, -radius * 0.5],
      [radius * 0.6, 1.4, radius * 0.4]
    ];

    treePositions.forEach(pos => {
      const tree = new THREE.Group();
      tree.position.set(...pos);

      // 樹幹
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 1.8, 6),
        this.materials.wood
      );
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      tree.add(trunk);

      // 樹冠 (低多邊形積木球體)
      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.3, 0),
        treeMat
      );
      foliage.position.y = 2.2;
      foliage.castShadow = true;
      tree.add(foliage);

      group.add(tree);
    });
  }

  // 建造連接島嶼的弧形浮石步道
  createConnectingBridges() {
    const pairs = [
      [ISLANDS_METADATA[0], ISLANDS_METADATA[1]],
      [ISLANDS_METADATA[1], ISLANDS_METADATA[2]],
      [ISLANDS_METADATA[2], ISLANDS_METADATA[3]],
      [ISLANDS_METADATA[3], ISLANDS_METADATA[4]]
    ];

    pairs.forEach(([from, to], idx) => {
      const bridgeGroup = new THREE.Group();
      const p1 = new THREE.Vector3(...from.islandPos);
      const p2 = new THREE.Vector3(...to.islandPos);
      const steps = 7;

      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const currentPos = new THREE.Vector3().lerpVectors(p1, p2, t);
        // 微小弧度拱起
        const arch = Math.sin(t * Math.PI) * 2;
        currentPos.y = 0.4 + arch;

        // 浮石基木
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.6, 2.4),
          this.materials.stone
        );
        stepMesh.position.copy(currentPos);
        stepMesh.receiveShadow = true;
        bridgeGroup.add(stepMesh);
      }

      this.bridges.push(bridgeGroup);
      this.islandsGroup.add(bridgeGroup);
    });
  }

  update(time) {
    this.animatedObjects.forEach(item => {
      if (item.rotY) item.mesh.rotation.y += item.rotY;
      if (item.rotX) item.mesh.rotation.x += item.rotX;
      if (item.rotZ) item.mesh.rotation.z += item.rotZ;
      if (item.oscZ) {
        item.mesh.rotation.z = Math.sin(time * item.speed) * item.oscZ;
      }
      if (item.floatY) {
        item.mesh.position.y = 4.2 + Math.sin(time * item.speed) * item.floatY;
      }
    });
  }
}
