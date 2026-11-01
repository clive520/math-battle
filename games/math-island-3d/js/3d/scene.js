/**
 * 3D 數學立體群島大冒險 - Three.js 場景、海面、雲朵與動態光影
 * 傳承標竿網站理念：極致效能、清新玩具風格調色、動態起伏海浪與晝夜切換
 */

export class WorldScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.time = 0;
    this.timeMode = "day"; // 'day', 'sunset', 'night'
    this.clouds = [];

    this.init();
  }

  init() {
    // 1. 建立 Three.js 場景
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xbfe3f2, 0.007);

    // 2. 建立透視相機 (俯視玩具微縮角度 45度)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 600);
    this.camera.position.set(0, 75, 110);
    this.camera.lookAt(0, 0, 10);

    // 3. 建立 WebGL 渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. 軌道相機控制
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.15; // 防止穿透水面以下
    this.controls.minDistance = 20;
    this.controls.maxDistance = 220;
    this.controls.target.set(0, 0, 10);

    // 5. 設定光照與大氣
    this.setupLighting();

    // 6. 建立動態微波海洋
    this.createOcean();

    // 7. 建立漂浮低多邊形積木白雲
    this.createClouds();

    // 8. 視窗尺寸改變監聽
    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupLighting() {
    // 半球環境光 (天空藍與地面溫暖反射)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x4488aa, 0.75);
    this.scene.add(this.hemiLight);

    // 主陽光 (投射柔和微縮陰影)
    this.dirLight = new THREE.DirectionalLight(0xfff7e6, 1.15);
    this.dirLight.position.set(60, 100, 50);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 280;
    this.dirLight.shadow.camera.left = -90;
    this.dirLight.shadow.camera.right = 90;
    this.dirLight.shadow.camera.top = 90;
    this.dirLight.shadow.camera.bottom = -90;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // 輔助側光 (避免背光面過暗)
    this.fillLight = new THREE.DirectionalLight(0x90c5e8, 0.4);
    this.fillLight.position.set(-60, 40, -40);
    this.scene.add(this.fillLight);
  }

  createOcean() {
    // 建立具備頂點動畫的大型低多邊形水面
    const oceanGeo = new THREE.PlaneGeometry(360, 360, 64, 64);
    oceanGeo.rotateX(-Math.PI / 2);

    // 儲存原始頂點以便計算波動
    this.oceanBaseVertices = [];
    const pos = oceanGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      this.oceanBaseVertices.push({
        x: pos.getX(i),
        y: pos.getY(i),
        z: pos.getZ(i)
      });
    }

    this.oceanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });

    this.oceanMesh = new THREE.Mesh(oceanGeo, this.oceanMat);
    this.oceanMesh.position.y = -2;
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
  }

  createClouds() {
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      flatShading: true
    });

    for (let c = 0; c < 14; c++) {
      const singleCloud = new THREE.Group();
      const puffs = 4 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffs; p++) {
        const size = 3 + Math.random() * 4;
        const puffGeo = new THREE.DodecahedronGeometry(size, 0);
        const puffMesh = new THREE.Mesh(puffGeo, cloudMat);
        puffMesh.position.set(
          (p - puffs / 2) * 4 + (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4
        );
        puffMesh.castShadow = true;
        singleCloud.add(puffMesh);
      }

      // 散佈在空中
      const angle = (c / 14) * Math.PI * 2;
      const radius = 60 + Math.random() * 60;
      singleCloud.position.set(
        Math.cos(angle) * radius,
        32 + Math.random() * 14,
        Math.sin(angle) * radius
      );
      singleCloud.userData = { speed: 0.02 + Math.random() * 0.03 };

      this.clouds.push(singleCloud);
      this.cloudGroup.add(singleCloud);
    }

    this.scene.add(this.cloudGroup);
  }

  // 晝夜氛圍切換
  setTimeMode(mode) {
    this.timeMode = mode;
    if (mode === "day") {
      this.renderer.setClearColor(0xbfe3f2);
      this.scene.fog.color.setHex(0xbfe3f2);
      this.dirLight.color.setHex(0xfff7e6);
      this.dirLight.intensity = 1.15;
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x4488aa);
      this.oceanMat.color.setHex(0x38bdf8);
    } else if (mode === "sunset") {
      this.renderer.setClearColor(0xfdba74);
      this.scene.fog.color.setHex(0xfdba74);
      this.dirLight.color.setHex(0xf97316);
      this.dirLight.intensity = 1.35;
      this.hemiLight.color.setHex(0xfecdd3);
      this.hemiLight.groundColor.setHex(0x9a3412);
      this.oceanMat.color.setHex(0x0284c7);
    } else if (mode === "night") {
      this.renderer.setClearColor(0x0f172a);
      this.scene.fog.color.setHex(0x0f172a);
      this.dirLight.color.setHex(0x60a5fa);
      this.dirLight.intensity = 0.5;
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x090d16);
      this.oceanMat.color.setHex(0x1e3a5f);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  update(delta) {
    this.time += delta;

    // 海洋微動波紋運算
    if (this.oceanMesh) {
      const pos = this.oceanMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = this.oceanBaseVertices[i];
        const wave = Math.sin(u.x * 0.08 + this.time * 2.2) * 0.6 +
                     Math.cos(u.z * 0.08 + this.time * 1.8) * 0.6;
        pos.setY(i, u.y + wave);
      }
      pos.needsUpdate = true;
      this.oceanMesh.geometry.computeVertexNormals();
    }

    // 白雲緩緩飄動
    this.clouds.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 140) cloud.position.x = -140;
    });

    // 控制器平滑阻尼更新
    if (this.controls) {
      this.controls.update();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
