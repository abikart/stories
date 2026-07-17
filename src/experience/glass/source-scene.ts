import * as THREE from "three";

export type GlassSourceElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export type GlassSourceTarget = { element: HTMLElement; color: string; opacity?: number };

type SourceRecord = {
  element: GlassSourceElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  texture: THREE.Texture;
  uploaded: boolean;
};

function elementReady(element: GlassSourceElement) {
  if (element instanceof HTMLVideoElement) {
    return element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && element.videoWidth > 0;
  }
  if (element instanceof HTMLImageElement) return element.complete && element.naturalWidth > 0;
  return element.width > 0 && element.height > 0;
}

function elementOpacity(element: GlassSourceElement, stage: HTMLElement) {
  let opacity = 1;
  let current: HTMLElement | null = element;
  while (current && current !== stage) {
    const style = getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return 0;
    opacity *= Number.parseFloat(style.opacity) || 0;
    current = current.parentElement;
  }
  return opacity;
}

function textureFor(element: GlassSourceElement) {
  const texture = element instanceof HTMLVideoElement
    ? new THREE.VideoTexture(element)
    : element instanceof HTMLCanvasElement
      ? new THREE.CanvasTexture(element)
      : new THREE.Texture(element);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export class GlassSourceScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 20);
  private readonly records: SourceRecord[] = [];
  private readonly targets: Array<{
    target: GlassSourceTarget;
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  }> = [];

  constructor() {
    this.camera.position.z = 10;
  }

  setElements(elements: readonly GlassSourceElement[]) {
    this.destroyRecords();
    for (const element of elements) {
      const texture = textureFor(element);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      mesh.frustumCulled = false;
      mesh.renderOrder = this.records.length;
      this.records.push({ element, mesh, texture, uploaded: false });
      this.scene.add(mesh);
    }
  }

  setTargets(targets: readonly GlassSourceTarget[]) {
    for (const record of this.targets) {
      this.scene.remove(record.mesh);
      record.mesh.geometry.dispose();
      record.mesh.material.dispose();
    }
    this.targets.length = 0;
    for (const target of targets) {
      const material = new THREE.MeshBasicMaterial({
        color: target.color,
        opacity: target.opacity ?? 0.45,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 10_000 + this.targets.length;
      this.targets.push({ target, mesh });
      this.scene.add(mesh);
    }
  }

  update(stage: HTMLElement, width: number, height: number) {
    const stageRect = stage.getBoundingClientRect();
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.updateProjectionMatrix();

    for (const record of this.records) {
      const { element, mesh, texture } = record;
      const rect = element.getBoundingClientRect();
      const opacity = elementOpacity(element, stage);
      const ready = elementReady(element);
      mesh.visible = ready && opacity > 0.002 && rect.width > 0 && rect.height > 0;
      if (!mesh.visible) continue;
      mesh.position.set(
        rect.left - stageRect.left + rect.width / 2 - width / 2,
        height / 2 - (rect.top - stageRect.top + rect.height / 2),
        0,
      );
      mesh.scale.set(rect.width, rect.height, 1);
      mesh.material.opacity = opacity;
      if (!(element instanceof HTMLVideoElement) && !record.uploaded) {
        texture.needsUpdate = true;
        record.uploaded = true;
      }
      if (element instanceof HTMLCanvasElement) texture.needsUpdate = true;
    }

    for (const { target, mesh } of this.targets) {
      const rect = target.element.getBoundingClientRect();
      mesh.visible = rect.width > 0 && rect.height > 0;
      mesh.position.set(
        rect.left - stageRect.left + rect.width / 2 - width / 2,
        height / 2 - (rect.top - stageRect.top + rect.height / 2),
        0,
      );
      mesh.scale.set(rect.width, rect.height, 1);
    }
  }

  get activeCount() {
    return this.records.filter((record) => record.mesh.visible).length;
  }

  destroy() {
    this.setTargets([]);
    this.destroyRecords();
  }

  private destroyRecords() {
    for (const { mesh, texture } of this.records) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      texture.dispose();
    }
    this.records.length = 0;
  }
}
