/**
 * 3D 數學立體群島大冒險 - 相機軌道運鏡與平滑俯衝控制器
 * 使用 TWEEN.js 實現大片感之平滑推鏡、島嶼切換與重返全景視角
 */

export class CameraFlightController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.overviewPos = new THREE.Vector3(0, 80, 115);
    this.overviewTarget = new THREE.Vector3(0, 0, 10);
  }

  // 1. 平滑飛向全景視角
  flyToOverview(duration = 1200) {
    this.animateCamera(this.overviewPos, this.overviewTarget, duration);
  }

  // 2. 平滑俯衝聚焦特定島嶼
  flyToIsland(islandPos, duration = 1400) {
    const targetPos = new THREE.Vector3(
      islandPos[0],
      islandPos[1] + 2,
      islandPos[2]
    );
    const cameraPos = new THREE.Vector3(
      islandPos[0],
      islandPos[1] + 28,
      islandPos[2] + 40
    );

    this.animateCamera(cameraPos, targetPos, duration);
  }

  // 3. 聚焦特定關卡立標
  flyToMarker(markerPos, duration = 1200) {
    const targetPos = new THREE.Vector3(
      markerPos.x,
      markerPos.y,
      markerPos.z
    );
    const cameraPos = new THREE.Vector3(
      markerPos.x,
      markerPos.y + 14,
      markerPos.z + 20
    );

    this.animateCamera(cameraPos, targetPos, duration);
  }

  // 內部平滑插值運鏡
  animateCamera(destCameraPos, destTarget, duration) {
    if (typeof TWEEN === "undefined") {
      this.camera.position.copy(destCameraPos);
      this.controls.target.copy(destTarget);
      this.controls.update();
      return;
    }

    const currentCam = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    const currentTarget = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z
    };

    // 相機本體運動
    new TWEEN.Tween(currentCam)
      .to({ x: destCameraPos.x, y: destCameraPos.y, z: destCameraPos.z }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.set(currentCam.x, currentCam.y, currentCam.z);
      })
      .start();

    // 控制焦點運動
    new TWEEN.Tween(currentTarget)
      .to({ x: destTarget.x, y: destTarget.y, z: destTarget.z }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
      })
      .onComplete(() => {
        this.controls.update();
      })
      .start();
  }

  update() {
    if (typeof TWEEN !== "undefined") {
      TWEEN.update();
    }
  }
}
