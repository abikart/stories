import { getCachedLensMap } from "@/experience/glass/lens-map";
import { LENS_FRAGMENT_SHADER, QUAD_VERTEX_SHADER } from "@/experience/glass/shaders";
import {
  SourceCompositor,
  createProgram,
  type GlassSource,
} from "@/experience/glass/source-compositor";
import type { LensBounds, LensMap, LensOptics } from "@/experience/glass/types";

const MAX_DPR = 2;
const DIAGNOSTIC_INTERVAL_MS = 250;

export type GlassRendererStatus = "webgl" | "css";

export type RegisteredGlassLens = {
  id: string;
  bounds: LensBounds;
  optics: LensOptics;
  refractionTarget?: string;
  moving?: boolean;
};

export type GlassRefractionTarget = {
  id: string;
  sources: readonly GlassSource[];
  background?: readonly [number, number, number, number];
};

export type GlassRendererDiagnostics = {
  status: GlassRendererStatus;
  frames: number;
  activeLenses: number;
  sourceUploads: number;
  mapUploads: number;
  contextLosses: number;
  restorations: number;
  frameTimeMs: number;
  sleeping: boolean;
  dpr: number;
};

type RendererCallbacks = {
  onStatus?(status: GlassRendererStatus): void;
  onDiagnostics?(diagnostics: Readonly<GlassRendererDiagnostics>): void;
};

function createVertexArray(gl: WebGL2RenderingContext) {
  const vertexArray = gl.createVertexArray();
  const buffer = gl.createBuffer();
  if (!vertexArray || !buffer) throw new Error("Unable to allocate glass quad");
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1,
  ]), gl.STATIC_DRAW);
  return { vertexArray, buffer };
}

export class GlassRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly callbacks: RendererCallbacks;
  private readonly matte: readonly [number, number, number, number];
  private gl: WebGL2RenderingContext | null = null;
  private loseContextExtension: WEBGL_lose_context | null = null;
  private program: WebGLProgram | null = null;
  private vertexArray: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private compositor: SourceCompositor | null = null;
  private targetCompositors = new Map<string, SourceCompositor>();
  private mapTextures = new Map<string, WebGLTexture>();
  private sources: readonly GlassSource[] = [];
  private sourceResolver: (() => readonly GlassSource[]) | null = null;
  private lenses: readonly (RegisteredGlassLens & { map: LensMap })[] = [];
  private targets: readonly GlassRefractionTarget[] = [];
  private targetTextures = new Map<string, WebGLTexture>();
  private observedVideos = new Set<HTMLVideoElement>();
  private cssWidth = 1;
  private cssHeight = 1;
  private visible = true;
  private transitionActive = false;
  private animationFrame: number | null = null;
  private destroyed = false;
  private lastDiagnosticAt = 0;
  private status: GlassRendererStatus = "css";
  private diagnostics: GlassRendererDiagnostics = {
    status: "css",
    frames: 0,
    activeLenses: 0,
    sourceUploads: 0,
    mapUploads: 0,
    contextLosses: 0,
    restorations: 0,
    frameTimeMs: 0,
    sleeping: true,
    dpr: 1,
  };

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: RendererCallbacks = {},
    matte: readonly [number, number, number, number] = [1, 1, 1, 1],
  ) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.matte = matte;
    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);
    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    this.initialize();
  }

  private initialize() {
    if (this.destroyed) return;
    try {
      const gl = this.canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
      });
      if (!gl) throw new Error("WebGL2 is unavailable");
      this.gl = gl;
      this.loseContextExtension = gl.getExtension("WEBGL_lose_context");
      const quad = createVertexArray(gl);
      this.vertexArray = quad.vertexArray;
      this.vertexBuffer = quad.buffer;
      this.program = createProgram(gl, QUAD_VERTEX_SHADER, LENS_FRAGMENT_SHADER);
      const position = gl.getAttribLocation(this.program, "aPosition");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      this.compositor = new SourceCompositor(gl, quad.vertexArray);
      this.targetCompositors.clear();
      this.targetTextures.clear();
      this.mapTextures.clear();
      this.setStatus("webgl");
      this.resize(this.cssWidth, this.cssHeight);
      this.wake();
    } catch {
      this.releaseResources();
      this.setStatus("css");
    }
  }

  private setStatus(status: GlassRendererStatus) {
    if (this.status === status && this.diagnostics.status === status) return;
    this.status = status;
    this.diagnostics.status = status;
    this.callbacks.onStatus?.(status);
    this.publishDiagnostics(true);
  }

  resize(width: number, height: number, requestedDpr = window.devicePixelRatio || 1) {
    this.cssWidth = Math.max(1, width);
    this.cssHeight = Math.max(1, height);
    const dpr = Math.min(MAX_DPR, Math.max(1, requestedDpr));
    const pixelWidth = Math.max(1, Math.round(this.cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(this.cssHeight * dpr));
    if (this.canvas.width === pixelWidth && this.canvas.height === pixelHeight && this.diagnostics.dpr === dpr) return;
    this.canvas.width = pixelWidth;
    this.canvas.height = pixelHeight;
    this.diagnostics.dpr = dpr;
    this.compositor?.resize(pixelWidth, pixelHeight, this.cssWidth, this.cssHeight);
    for (const compositor of this.targetCompositors.values()) {
      compositor.resize(pixelWidth, pixelHeight, this.cssWidth, this.cssHeight);
    }
    this.wake();
  }

  setSources(sources: readonly GlassSource[]) {
    this.sources = sources;
    const nextVideos = new Set(sources.flatMap(({ element }) => element instanceof HTMLVideoElement ? [element] : []));
    for (const video of this.observedVideos) {
      if (nextVideos.has(video)) continue;
      video.removeEventListener("play", this.wakeBound);
      video.removeEventListener("loadeddata", this.wakeBound);
      video.removeEventListener("seeked", this.wakeBound);
    }
    for (const video of nextVideos) {
      video.addEventListener("play", this.wakeBound);
      video.addEventListener("loadeddata", this.wakeBound);
      video.addEventListener("seeked", this.wakeBound);
    }
    this.observedVideos = nextVideos;
    this.wake();
  }

  setSourceResolver(resolver: (() => readonly GlassSource[]) | null) {
    this.sourceResolver = resolver;
  }

  setLenses(lenses: readonly RegisteredGlassLens[]) {
    this.lenses = lenses.map((lens) => ({
      ...lens,
      map: getCachedLensMap(lens.bounds, lens.optics),
    }));
    this.diagnostics.activeLenses = lenses.length;
    this.wake();
  }

  setRefractionTargets(targets: readonly GlassRefractionTarget[]) {
    this.targets = targets;
    this.wake();
  }

  setTransitionActive(active: boolean) {
    this.transitionActive = active;
    if (active) this.wake();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.wake();
    else this.sleep();
  }

  requestRender() {
    this.wake();
  }

  private readonly wakeBound = () => this.wake();

  private wake() {
    if (this.destroyed || this.status !== "webgl" || !this.visible || document.hidden) return;
    if (this.animationFrame !== null) return;
    this.diagnostics.sleeping = false;
    this.animationFrame = requestAnimationFrame((time) => this.render(time));
  }

  private sleep() {
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.diagnostics.sleeping = true;
    this.publishDiagnostics(true);
  }

  private hasAdvancingVideo() {
    return this.sources.some(({ element, opacity }) =>
      opacity > 0
      && element instanceof HTMLVideoElement
      && !element.paused
      && !element.ended
      && element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
    );
  }

  private textureForMap(map: LensMap) {
    const { gl } = this;
    if (!gl) return null;
    const existing = this.mapTextures.get(map.key);
    if (existing) return existing;
    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, map.width, map.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, map.data);
    this.mapTextures.set(map.key, texture);
    this.diagnostics.mapUploads += 1;
    return texture;
  }

  private composeTargets() {
    const { gl, vertexArray } = this;
    if (!gl || !vertexArray) return;
    const activeIds = new Set(this.targets.map((target) => target.id));
    for (const [id, compositor] of this.targetCompositors) {
      if (activeIds.has(id)) continue;
      compositor.destroy();
      this.targetCompositors.delete(id);
      this.targetTextures.delete(id);
    }
    for (const target of this.targets) {
      let compositor = this.targetCompositors.get(target.id);
      if (!compositor) {
        compositor = new SourceCompositor(gl, vertexArray);
        compositor.resize(this.canvas.width, this.canvas.height, this.cssWidth, this.cssHeight);
        this.targetCompositors.set(target.id, compositor);
      }
      this.targetTextures.set(
        target.id,
        compositor.compose(target.sources, target.background ?? this.matte, this.diagnostics),
      );
    }
  }

  private render(_time: number) {
    this.animationFrame = null;
    const { gl, program, vertexArray, compositor } = this;
    if (!gl || !program || !vertexArray || !compositor || !this.visible || document.hidden) {
      this.sleep();
      return;
    }
    const started = performance.now();
    try {
      if (this.transitionActive && this.sourceResolver) this.setSources(this.sourceResolver());
      const sceneTexture = compositor.compose(this.sources, this.matte, this.diagnostics);
      this.composeTargets();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.SCISSOR_TEST);
      gl.useProgram(program);
      gl.bindVertexArray(vertexArray);
      gl.uniform1i(gl.getUniformLocation(program, "uScene"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "uMap"), 1);
      gl.uniform2f(gl.getUniformLocation(program, "uStageSize"), this.cssWidth, this.cssHeight);

      for (const lens of this.lenses) {
        const { bounds, optics } = lens;
        if (bounds.width <= 0 || bounds.height <= 0) continue;
        const mapTexture = this.textureForMap(lens.map);
        if (!mapTexture) continue;
        const sourceTexture = lens.refractionTarget
          ? this.targetTextures.get(lens.refractionTarget) ?? sceneTexture
          : sceneTexture;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, mapTexture);
        gl.uniform4f(
          gl.getUniformLocation(program, "uRect"),
          bounds.x / this.cssWidth,
          bounds.y / this.cssHeight,
          bounds.width / this.cssWidth,
          bounds.height / this.cssHeight,
        );
        gl.uniform1f(gl.getUniformLocation(program, "uStrength"), optics.displacementStrength);
        gl.uniform1f(gl.getUniformLocation(program, "uChroma"), optics.chromaticFringe);
        gl.uniform1f(gl.getUniformLocation(program, "uSpecularDirection"), optics.specularDirection);
        gl.uniform1f(gl.getUniformLocation(program, "uSpecularWidth"), optics.specularWidth);
        gl.uniform1f(gl.getUniformLocation(program, "uSpecularIntensity"), optics.specularIntensity);
        gl.uniform4f(gl.getUniformLocation(program, "uTint"), ...optics.tint);
        const dpr = this.diagnostics.dpr;
        const scissorX = Math.max(0, Math.floor(bounds.x * dpr));
        const scissorY = Math.max(0, Math.floor(this.canvas.height - (bounds.y + bounds.height) * dpr));
        const scissorWidth = Math.min(this.canvas.width - scissorX, Math.ceil(bounds.width * dpr));
        const scissorHeight = Math.min(this.canvas.height - scissorY, Math.ceil(bounds.height * dpr));
        if (scissorWidth <= 0 || scissorHeight <= 0) continue;
        gl.scissor(scissorX, scissorY, scissorWidth, scissorHeight);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      gl.disable(gl.SCISSOR_TEST);
      gl.bindVertexArray(null);
      this.diagnostics.frames += 1;
      this.diagnostics.frameTimeMs = performance.now() - started;
      this.publishDiagnostics(false);
    } catch {
      this.setStatus("css");
      this.sleep();
      return;
    }

    const keepRunning = this.transitionActive
      || this.lenses.some((lens) => lens.moving)
      || this.hasAdvancingVideo();
    if (keepRunning) this.wake();
    else this.sleep();
  }

  private publishDiagnostics(force: boolean) {
    const now = performance.now();
    if (!force && now - this.lastDiagnosticAt < DIAGNOSTIC_INTERVAL_MS) return;
    this.lastDiagnosticAt = now;
    this.callbacks.onDiagnostics?.({ ...this.diagnostics });
  }

  private handleContextLost(event: Event) {
    event.preventDefault();
    this.diagnostics.contextLosses += 1;
    this.setStatus("css");
    this.sleep();
  }

  private handleContextRestored() {
    this.diagnostics.restorations += 1;
    this.abandonLostResources();
    this.initialize();
  }

  simulateContextLoss() {
    if (this.loseContextExtension) this.loseContextExtension.loseContext();
    else this.canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  }

  simulateContextRestore() {
    if (this.loseContextExtension) this.loseContextExtension.restoreContext();
    else this.canvas.dispatchEvent(new Event("webglcontextrestored"));
  }

  getDiagnostics() {
    return { ...this.diagnostics };
  }

  readPixelsForDiagnostics(x: number, y: number, width: number, height: number) {
    const { gl } = this;
    if (!gl || this.status !== "webgl") return null;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.render(performance.now());
    const clampedX = Math.max(0, Math.min(this.canvas.width - 1, Math.floor(x)));
    const clampedY = Math.max(0, Math.min(this.canvas.height - 1, Math.floor(y)));
    const clampedWidth = Math.max(1, Math.min(this.canvas.width - clampedX, Math.floor(width)));
    const clampedHeight = Math.max(1, Math.min(this.canvas.height - clampedY, Math.floor(height)));
    const pixels = new Uint8Array(clampedWidth * clampedHeight * 4);
    gl.readPixels(
      clampedX,
      this.canvas.height - clampedY - clampedHeight,
      clampedWidth,
      clampedHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );
    return { width: clampedWidth, height: clampedHeight, pixels };
  }

  private releaseResources() {
    const { gl } = this;
    this.compositor?.destroy();
    this.compositor = null;
    for (const compositor of this.targetCompositors.values()) compositor.destroy();
    this.targetCompositors.clear();
    if (gl) {
      for (const texture of this.mapTextures.values()) gl.deleteTexture(texture);
      if (this.program) gl.deleteProgram(this.program);
      if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
      if (this.vertexArray) gl.deleteVertexArray(this.vertexArray);
    }
    this.mapTextures.clear();
    this.targetTextures.clear();
    this.program = null;
    this.vertexBuffer = null;
    this.vertexArray = null;
  }

  private abandonLostResources() {
    this.compositor = null;
    this.targetCompositors.clear();
    this.mapTextures.clear();
    this.targetTextures.clear();
    this.program = null;
    this.vertexBuffer = null;
    this.vertexArray = null;
  }

  destroy() {
    this.destroyed = true;
    this.sleep();
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored);
    for (const video of this.observedVideos) {
      video.removeEventListener("play", this.wakeBound);
      video.removeEventListener("loadeddata", this.wakeBound);
      video.removeEventListener("seeked", this.wakeBound);
    }
    this.observedVideos.clear();
    this.releaseResources();
    this.gl = null;
    this.loseContextExtension = null;
  }
}
