/**
 * 3D 數學立體群島大冒險 - 五大主題微縮島嶼精緻化幾何建模引擎
 * 傳承標竿網站理念：不載入任何外掛模型，全以 Three.js 幾何程式動態拼裝
 * 精緻化升級：多層台階、雙齒輪咬合咬轉、閥門水輪、植樹路燈、蒸氣煙囪天秤、黃金同心星環
 */

import { ISLANDS_METADATA } from "../data/questions.js";

export class IslandsBuilder {
  constructor(scene) {
    this.scene = scene;
    this.islandsGroup = new THREE.Group();
    this.islandsMeshes = []; // 供射線檢測點擊島嶼本體
    this.bridges = [];
    this.animatedObjects = [];

    this.initMaterials();
    this.buildArchipelago();
    this.scene.add(this.islandsGroup);
  }

  initMaterials() {
    this.materials = {
      // 島嶼頂層草皮 (不同單元專屬玩具色系)
      grassU1: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6, flatShading: true }), // 砂金神廟
      grassU2: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5, flatShading: true }), // 蔚藍水島
      grassU3: new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6, flatShading: true }), // 翡翠森林
      grassU4: new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.5, flatShading: true }), // 紫晶天秤
      grassU5: new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.5, flatShading: true }), // 緋紅聖域

      soil: new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.9, flatShading: true }),
      stone: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, flatShading: true }),
      stoneDark: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true }),
      stoneCobble: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8, flatShading: true }),
      whiteMarble: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, flatShading: true }),
      wood: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, flatShading: true }),
      woodPlank: new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7, flatShading: true }),

      // 精緻金屬材質
      gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.2 }),
      goldBright: new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.8, roughness: 0.15, emissive: 0xca8a04, emissiveIntensity: 0.2 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 }),
      valveRed: new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.4 }),

      // 半透明水與發光水晶
      waterCyan: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, transparent: true, opacity: 0.85 }),
      crystalGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.15, emissive: 0x15803d, emissiveIntensity: 0.4 }),
      crystalPurple: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.15, emissive: 0x7e22ce, emissiveIntensity: 0.45 }),
      crystalPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.15, emissive: 0xbe123c, emissiveIntensity: 0.5 }),
      fireOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.8 }),
      steamWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.65, roughness: 0.2 }),

      // 植被與花卉
      leavesGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6, flatShading: true }),
      leavesDark: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true }),
      leavesGold: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6, flatShading: true }),
      flowerPink: new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }),
      flowerYellow: new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 })
    };
  }

  buildArchipelago() {
    ISLANDS_METADATA.forEach(meta => {
      const island = this.createThemedIsland(meta);
      this.islandsGroup.add(island);
    });

    this.createConnectingBridges();
  }

  createThemedIsland(meta) {
    const group = new THREE.Group();
    group.position.set(...meta.islandPos);
    group.userData = { meta, isIsland: true };

    const islandRadius = 14.5;
    const islandHeight = 7.5;

    // 1. 八角形基底 (地表草地)
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
    topMesh.userData = { islandId: meta.id, parentGroup: group };
    group.add(topMesh);
    this.islandsMeshes.push(topMesh); // 供點擊島嶼直接平滑放大

    // 中層岩壁 (八角微縮層)
    const rockGeo = new THREE.CylinderGeometry(islandRadius * 0.95, islandRadius * 0.75, islandHeight - 1.4, 8);
    const rockMesh = new THREE.Mesh(rockGeo, this.materials.soil);
    rockMesh.position.y = -(islandHeight - 1.4) / 2;
    rockMesh.receiveShadow = true;
    rockMesh.userData = { islandId: meta.id, parentGroup: group };
    group.add(rockMesh);
    this.islandsMeshes.push(rockMesh);

    // 水下基座
    const baseGeo = new THREE.CylinderGeometry(islandRadius * 0.75, islandRadius * 0.35, 3.2, 8);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.stoneDark);
    baseMesh.position.y = -islandHeight + 1.4 - 1.6;
    group.add(baseMesh);

    // 2. 添加地表碎石塊與鋪石路徑
    this.addGroundDetails(group, islandRadius);

    // 3. 添加低多邊形樹木、花草與灌木
    this.addIslandVegetation(group, islandRadius, meta.id);

    // 4. 根據各單元建造精緻的標誌性建築
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

  // 地表碎石與石階細節
  addGroundDetails(group, radius) {
    // 散落的小岩石
    for (let r = 0; r < 7; r++) {
      const rockSize = 0.5 + Math.random() * 0.6;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rockSize, 0), this.materials.stone);
      const angle = Math.random() * Math.PI * 2;
      const dist = 6 + Math.random() * (radius - 7.5);
      rock.position.set(Math.cos(angle) * dist, 1.4, Math.sin(angle) * dist);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.receiveShadow = true;
      group.add(rock);
    }

    // 圓形鋪石小徑 (引導至中心建築)
    for (let s = 0; s < 8; s++) {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.15, 6), this.materials.stoneCobble);
      stone.position.set(Math.sin(s * 0.4) * 2, 1.42, 4 + s * 1.1);
      stone.receiveShadow = true;
      group.add(stone);
    }
  }

  // 植被與可愛小花
  addIslandVegetation(group, radius, islandId) {
    const treeMat = islandId === 1 ? this.materials.leavesGold :
                   (islandId === 3 ? this.materials.leavesGreen : this.materials.leavesDark);

    const treePositions = [
      [-radius * 0.6, 1.4, -radius * 0.45],
      [-radius * 0.68, 1.4, radius * 0.3],
      [radius * 0.58, 1.4, -radius * 0.52],
      [radius * 0.62, 1.4, radius * 0.38],
      [-radius * 0.25, 1.4, -radius * 0.7]
    ];

    treePositions.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.set(...pos);

      // 樹幹
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 2, 6), this.materials.wood);
      trunk.position.y = 1;
      trunk.castShadow = true;
      tree.add(trunk);

      // 樹冠 (雙層多邊形積木)
      const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 0), treeMat);
      f1.position.y = 2.4;
      f1.castShadow = true;
      tree.add(f1);

      const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), treeMat);
      f2.position.y = 3.3;
      f2.castShadow = true;
      tree.add(f2);

      group.add(tree);
    });

    // 小花群
    for (let f = 0; f < 8; f++) {
      const flower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.1, 5),
        f % 2 === 0 ? this.materials.flowerPink : this.materials.flowerYellow
      );
      const angle = (f / 8) * Math.PI * 2 + 0.3;
      flower.position.set(Math.cos(angle) * 9, 1.45, Math.sin(angle) * 9);
      group.add(flower);
    }
  }

  // ==========================================
  // 【單元一：質源與公倍神廟】
  // 三層階梯、六立柱神廟、雙互鎖齒輪、方尖碑與聖火盆
  // ==========================================
  buildUnit1Features(island) {
    const temple = new THREE.Group();
    temple.position.set(0, 1.4, -1);

    // 三層階梯石台 (三段式階梯)
    for (let st = 0; st < 3; st++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(11.5 - st * 0.8, 0.35, 9.5 - st * 0.8),
        this.materials.whiteMarble
      );
      step.position.y = st * 0.35 + 0.18;
      step.receiveShadow = true;
      step.castShadow = true;
      temple.add(step);
    }

    // 6 根帶柱頭與柱腳的古典神廟立柱
    const colPositions = [
      [-4.2, 2.6, -3], [-4.2, 2.6, 0], [-4.2, 2.6, 3],
      [4.2, 2.6, -3], [4.2, 2.6, 0], [4.2, 2.6, 3]
    ];
    colPositions.forEach(p => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(...p);

      // 柱身
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 3.6, 8), this.materials.whiteMarble);
      shaft.castShadow = true;
      pillarGroup.add(shaft);

      // 柱頭與柱腳裝飾
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), this.materials.whiteMarble);
      cap.position.y = 1.8;
      pillarGroup.add(cap);

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), this.materials.whiteMarble);
      base.position.y = -1.8;
      pillarGroup.add(base);

      temple.add(pillarGroup);
    });

    // 三角山牆屋頂
    const roofBeam = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.8, 9.8), this.materials.whiteMarble);
    roofBeam.position.set(0, 4.8, 0);
    roofBeam.castShadow = true;
    temple.add(roofBeam);

    const pediment = new THREE.Mesh(new THREE.ConeGeometry(6.5, 1.6, 4), this.materials.gold);
    pediment.position.set(0, 6, 0);
    pediment.rotation.y = Math.PI / 4;
    pediment.castShadow = true;
    temple.add(pediment);

    // 雙齒輪咬合聯動系統 (大金齒輪 + 小青銅齒輪)
    const gearLarge = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.4, 16), this.materials.goldBright);
    gearLarge.position.set(0, 7.4, 0);
    gearLarge.rotation.x = Math.PI / 3;
    temple.add(gearLarge);

    const gearSmall = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.35, 10), this.materials.brass);
    gearSmall.position.set(2.4, 8.4, -0.6);
    gearSmall.rotation.x = Math.PI / 3;
    temple.add(gearSmall);

    this.animatedObjects.push({ mesh: gearLarge, rotZ: 0.015 });
    this.animatedObjects.push({ mesh: gearSmall, rotZ: -0.027 }); // 反向咬合自轉

    // 兩側刻印符文的方尖碑
    [-6.5, 6.5].forEach(x => {
      const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 5, 4), this.materials.stone);
      obelisk.position.set(x, 2.5, 3.5);
      obelisk.castShadow = true;
      temple.add(obelisk);

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), this.materials.gold);
      tip.position.set(x, 5.4, 3.5);
      temple.add(tip);
    });

    // 神殿石階兩側聖火盆
    [-2.5, 2.5].forEach(x => {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.6, 8), this.materials.ironDark);
      bowl.position.set(x, 1.2, 4.2);
      temple.add(bowl);

      const fire = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), this.materials.fireOrange);
      fire.position.set(x, 1.7, 4.2);
      temple.add(fire);
      this.animatedObjects.push({ mesh: fire, rotY: 0.05, floatY: 0.08, speed: 4 });
    });

    island.add(temple);
  }

  // ==========================================
  // 【單元二：分數微積分水島】
  // 雙層玻璃水塔、金屬管線與紅閥門、運轉水輪、石造水道
  // ==========================================
  buildUnit2Features(island) {
    const waterWorks = new THREE.Group();
    waterWorks.position.set(0, 1.4, 0);

    // 水塔圓柱水槽 (帶金屬箍環)
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.4, 5.5, 16), this.materials.waterCyan);
    tank.position.set(-2.8, 3, -1.5);
    tank.castShadow = true;
    waterWorks.add(tank);

    // 水塔金屬加固箍環
    [-1.2, 0.5, 2.2].forEach(yOffset => {
      const hoop = new THREE.Mesh(new THREE.CylinderGeometry(2.68, 2.68, 0.2, 16), this.materials.brass);
      hoop.position.set(-2.8, 3 + yOffset, -1.5);
      waterWorks.add(hoop);
    });

    // 水塔八角圓錐銅屋頂
    const coneRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.2, 8), this.materials.brass);
    coneRoof.position.set(-2.8, 6.7, -1.5);
    coneRoof.castShadow = true;
    waterWorks.add(coneRoof);

    // 旋轉水力木輪 (帶 8 片水葉板)
    const wheelHub = new THREE.Group();
    wheelHub.position.set(3.6, 2.6, 0.5);

    const hubCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1, 8), this.materials.brass);
    hubCenter.rotation.x = Math.PI / 2;
    wheelHub.add(hubCenter);

    for (let p = 0; p < 8; p++) {
      const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 0.8), this.materials.woodPlank);
      paddle.position.y = Math.cos((p / 8) * Math.PI * 2) * 1.8;
      paddle.position.z = Math.sin((p / 8) * Math.PI * 2) * 1.8;
      paddle.rotation.x = (p / 8) * Math.PI * 2;
      wheelHub.add(paddle);
    }
    waterWorks.add(wheelHub);
    this.animatedObjects.push({ mesh: wheelHub, rotX: 0.025 });

    // 連接管線與醒目紅色閥門
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.5, 8), this.materials.brass);
    pipe.position.set(0.5, 3.2, -1.5);
    pipe.rotation.z = Math.PI / 2;
    waterWorks.add(pipe);

    const valveWheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 6, 12), this.materials.valveRed);
    valveWheel.position.set(0.5, 3.8, -1.5);
    valveWheel.rotation.x = Math.PI / 2;
    waterWorks.add(valveWheel);
    this.animatedObjects.push({ mesh: valveWheel, rotY: 0.01 });

    // 石造高架水槽與瀑布
    const aqueduct = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.5, 1.4), this.materials.stone);
    aqueduct.position.set(1.5, 2.2, 0.5);
    waterWorks.add(aqueduct);

    const waterFall = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), this.materials.waterCyan);
    waterFall.position.set(4.5, 1.1, 0.5);
    waterFall.rotation.y = Math.PI / 2;
    waterWorks.add(waterFall);

    island.add(waterWorks);
  }

  // ==========================================
  // 【單元三：時光規律與間隔迴廊】
  // 古代日晷石壇、6根高低起伏的綠晶柱、植樹路燈、鳥居神門
  // ==========================================
  buildUnit3Features(island) {
    const shrine = new THREE.Group();
    shrine.position.set(0, 1.4, 0);

    // 圓形三階日晷石壇
    const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 0.9, 16), this.materials.stone);
    dialBase.position.y = 0.45;
    dialBase.receiveShadow = true;
    shrine.add(dialBase);

    // 日晷金色指針與刻度石柱
    const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.8, 4), this.materials.gold);
    gnomon.position.set(0, 2, 0);
    gnomon.rotation.z = 0.28;
    gnomon.castShadow = true;
    shrine.add(gnomon);

    // 6 根正八邊形能量綠晶柱 (高低錯落，象徵數列生長規律)
    const heights = [3.5, 4.8, 6.2, 5.0, 4.2, 5.6];
    for (let c = 0; c < 6; c++) {
      const angle = (c / 6) * Math.PI * 2;
      const h = heights[c];
      const pMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, h, 8),
        this.materials.crystalGreen
      );
      pMesh.position.set(Math.cos(angle) * 6, h / 2, Math.sin(angle) * 6);
      pMesh.castShadow = true;
      shrine.add(pMesh);
    }

    // 4 盞典雅古風植樹路燈 (實體模型：呼應植樹問題間隔情境)
    const lampPositions = [
      [-3.5, 0, 4.2],
      [-1.2, 0, 5.2],
      [1.2, 0, 5.2],
      [3.5, 0, 4.2]
    ];
    lampPositions.forEach((pos, idx) => {
      const lamp = new THREE.Group();
      lamp.position.set(...pos);

      // 燈柱
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.6, 6), this.materials.ironDark);
      post.position.y = 1.3;
      lamp.add(post);

      // 暖黃燈罩
      const glass = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), this.materials.goldBright);
      glass.position.y = 2.7;
      lamp.add(glass);

      shrine.add(lamp);
    });

    island.add(shrine);
  }

  // ==========================================
  // 【單元四：小數精準天秤城】
  // 雙塔蒸氣城堡、冒煙銅煙囪、雙盤傾角黃金天秤、齒輪傳動箱
  // ==========================================
  buildUnit4Features(island) {
    const scaleCity = new THREE.Group();
    scaleCity.position.set(0, 1.4, 0);

    // 城堡主城牆
    const castleBody = new THREE.Mesh(new THREE.BoxGeometry(6, 4.2, 4.5), this.materials.stoneDark);
    castleBody.position.set(-2.5, 2.1, -1.5);
    castleBody.castShadow = true;
    scaleCity.add(castleBody);

    // 圓頂蒸氣堡塔
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 5.5, 12), this.materials.brass);
    tower.position.set(-4.5, 3.5, -2.5);
    tower.castShadow = true;
    scaleCity.add(tower);

    const turretRoof = new THREE.Mesh(new THREE.ConeGeometry(2, 2.2, 12), this.materials.gold);
    turretRoof.position.set(-4.5, 7.3, -2.5);
    scaleCity.add(turretRoof);

    // 銅煙囪與冒煙粒子
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 4.2, 8), this.materials.brass);
    chimney.position.set(-1.2, 4.8, -1.5);
    scaleCity.add(chimney);

    // 飄出煙囪的蒸氣煙圈積木
    const steamGroup = new THREE.Group();
    steamGroup.position.set(-1.2, 7.2, -1.5);
    for (let sm = 0; sm < 3; sm++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + sm * 0.25, 0), this.materials.steamWhite);
      puff.position.set(sm * 0.2, sm * 0.9, sm * 0.15);
      steamGroup.add(puff);
    }
    scaleCity.add(steamGroup);
    this.animatedObjects.push({ mesh: steamGroup, floatY: 0.35, rotY: 0.02, speed: 2 });

    // 巨大黃金精密天秤 (中央立柱與橫樑)
    const scaleBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.2, 8), this.materials.gold);
    scaleBase.position.set(3, 0.6, 1.5);
    scaleCity.add(scaleBase);

    const scalePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 5, 8), this.materials.brass);
    scalePillar.position.set(3, 3.5, 1.5);
    scaleCity.add(scalePillar);

    const scaleBeam = new THREE.Group();
    scaleBeam.position.set(3, 5.8, 1.5);

    const beamBar = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.35), this.materials.gold);
    scaleBeam.add(beamBar);

    // 左托盤 (裝砝碼)
    const panLeft = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.3, 0.35, 12), this.materials.brass);
    panLeft.position.set(-3.2, -1.8, 0);
    scaleBeam.add(panLeft);

    const weight1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.6, 8), this.materials.ironDark);
    weight1.position.set(-3.2, -1.3, 0);
    scaleBeam.add(weight1);

    // 右托盤 (裝紫晶石)
    const panRight = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.3, 0.35, 12), this.materials.brass);
    panRight.position.set(3.2, -1.8, 0);
    scaleBeam.add(panRight);

    const gemRight = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), this.materials.crystalPurple);
    gemRight.position.set(3.2, -1.2, 0);
    scaleBeam.add(gemRight);

    scaleCity.add(scaleBeam);
    this.animatedObjects.push({ mesh: scaleBeam, oscZ: 0.09, speed: 1.4 });

    island.add(scaleCity);
  }

  // ==========================================
  // 【單元五：黃金比例空島】
  // 完美黃金比例凱旋聖門、雙同心金色星軌星環、懸浮榮耀勳章、光柱基座
  // ==========================================
  buildUnit5Features(island) {
    const summit = new THREE.Group();
    summit.position.set(0, 1.4, 0);

    // 三層神聖圓形祭壇
    for (let l = 0; l < 3; l++) {
      const tier = new THREE.Mesh(
        new THREE.CylinderGeometry(8 - l * 1.5, 8.5 - l * 1.5, 0.5, 16),
        this.materials.whiteMarble
      );
      tier.position.y = l * 0.5 + 0.25;
      tier.receiveShadow = true;
      summit.add(tier);
    }

    // 宏偉的黃金比例凱旋門 (高度 8.5, 寬度 8.5/1.618 ≈ 5.25)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 1.5, 0);

    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8, 1.4), this.materials.whiteMarble);
    leftCol.position.set(-3.8, 4, 0);
    leftCol.castShadow = true;
    archGroup.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8, 1.4), this.materials.whiteMarble);
    rightCol.position.set(3.8, 4, 0);
    rightCol.castShadow = true;
    archGroup.add(rightCol);

    const topArchBeam = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.6, 2), this.materials.goldBright);
    topArchBeam.position.set(0, 8.5, 0);
    topArchBeam.castShadow = true;
    archGroup.add(topArchBeam);
    summit.add(archGroup);

    // 拱門中央：雙旋轉同心黃金星軌環 (Astrolabe Rings)
    const ringOuter = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.16, 8, 32), this.materials.gold);
    ringOuter.position.set(0, 5.8, 0);
    summit.add(ringOuter);

    const ringInner = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.14, 8, 24), this.materials.brass);
    ringInner.position.set(0, 5.8, 0);
    summit.add(ringInner);

    this.animatedObjects.push({ mesh: ringOuter, rotY: 0.02, rotX: 0.015 });
    this.animatedObjects.push({ mesh: ringInner, rotY: -0.03, rotZ: 0.02 });

    // 正中央懸浮的「數域宗師徽章」晶鑽
    const grandCrest = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), this.materials.crystalPink);
    grandCrest.position.set(0, 5.8, 0);
    grandCrest.castShadow = true;
    summit.add(grandCrest);
    this.animatedObjects.push({ mesh: grandCrest, rotY: 0.04, floatY: 0.35, speed: 2.2 });

    // 四角光柱基壇
    [-5.5, 5.5].forEach(x => {
      [-5.5, 5.5].forEach(z => {
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2, 8), this.materials.gold);
        beacon.position.set(x, 1.5, z);
        summit.add(beacon);

        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.materials.crystalPink);
        orb.position.set(x, 2.8, z);
        summit.add(orb);
      });
    });

    island.add(summit);
  }

  // 建造連接島嶼的弧形浮石步道
  createConnectingBridges() {
    const pairs = [
      [ISLANDS_METADATA[0], ISLANDS_METADATA[1]],
      [ISLANDS_METADATA[1], ISLANDS_METADATA[2]],
      [ISLANDS_METADATA[2], ISLANDS_METADATA[3]],
      [ISLANDS_METADATA[3], ISLANDS_METADATA[4]]
    ];

    pairs.forEach(([from, to]) => {
      const bridgeGroup = new THREE.Group();
      const p1 = new THREE.Vector3(...from.islandPos);
      const p2 = new THREE.Vector3(...to.islandPos);
      const steps = 8;

      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const currentPos = new THREE.Vector3().lerpVectors(p1, p2, t);
        const arch = Math.sin(t * Math.PI) * 2.2;
        currentPos.y = 0.5 + arch;

        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), this.materials.stoneCobble);
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
        const base = item.mesh.userData.baseY || item.mesh.position.y;
        if (!item.mesh.userData.baseY) item.mesh.userData.baseY = base;
        item.mesh.position.y = item.mesh.userData.baseY + Math.sin(time * item.speed) * item.floatY;
      }
    });
  }
}
