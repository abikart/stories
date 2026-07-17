import { QUAD_VERTEX_SHADER, SOURCE_FRAGMENT_SHADER } from "@/experience/glass/shaders";

export type GlassSourceElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

export type GlassSource = {
  element: GlassSourceElement;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  dynamic?: boolean;
};

export type CompositorDiagnostics = {
  sourceUploads: number;
};

type TextureRecord = {
  texture: WebGLTexture;
  width: number;
  height: number;
  source: string;
  uploaded: boolean;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate glass shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "unknown shader compile error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to allocate glass program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "unknown glass program link error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

function sourceSize(element: GlassSourceElement) {
  if (element instanceof HTMLVideoElement) return [element.videoWidth, element.videoHeight] as const;
  if (element instanceof HTMLImageElement) return [element.naturalWidth, element.naturalHeight] as const;
  return [element.width, element.height] as const;
}

export function isGlassSourceReady(source: GlassSource) {
  const { element } = source;
  if (source.opacity <= 0 || source.width <= 0 || source.height <= 0) return false;
  if (element instanceof HTMLVideoElement) return element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && element.videoWidth > 0;
  if (element instanceof HTMLImageElement) return element.complete && element.naturalWidth > 0;
  return element.width > 0 && element.height > 0;
}

export function measureGlassSource(element: GlassSourceElement, stage: HTMLElement, dynamic?: boolean): GlassSource {
  const stageRect = stage.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  let opacity = Number.parseFloat(getComputedStyle(element).opacity) || 0;
  let ancestor: HTMLElement | null = element.parentElement;
  while (ancestor && ancestor !== stage) {
    opacity *= Number.parseFloat(getComputedStyle(ancestor).opacity) || 0;
    ancestor = ancestor.parentElement;
  }
  return {
    element,
    x: rect.left - stageRect.left,
    y: rect.top - stageRect.top,
    width: rect.width,
    height: rect.height,
    opacity,
    dynamic,
  };
}

export class SourceCompositor {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vertexArray: WebGLVertexArrayObject;
  private readonly textures = new WeakMap<GlassSourceElement, TextureRecord>();
  private framebuffer: WebGLFramebuffer;
  private outputTexture: WebGLTexture;
  private width = 1;
  private height = 1;
  private logicalWidth = 1;
  private logicalHeight = 1;

  constructor(gl: WebGL2RenderingContext, vertexArray: WebGLVertexArrayObject) {
    this.gl = gl;
    this.vertexArray = vertexArray;
    this.program = createProgram(gl, QUAD_VERTEX_SHADER, SOURCE_FRAGMENT_SHADER);
    const framebuffer = gl.createFramebuffer();
    const outputTexture = gl.createTexture();
    if (!framebuffer || !outputTexture) throw new Error("Unable to allocate glass source buffer");
    this.framebuffer = framebuffer;
    this.outputTexture = outputTexture;
    this.allocateOutput();
  }

  private allocateOutput() {
    const { gl } = this;
    gl.bindTexture(gl.TEXTURE_2D, this.outputTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.outputTexture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Glass source framebuffer is incomplete");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize(width: number, height: number, logicalWidth = width, logicalHeight = height) {
    const outputChanged = width !== this.width || height !== this.height;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.logicalWidth = Math.max(1, logicalWidth);
    this.logicalHeight = Math.max(1, logicalHeight);
    if (outputChanged) this.allocateOutput();
  }

  private textureFor(source: GlassSource, diagnostics: CompositorDiagnostics) {
    const { gl } = this;
    const [width, height] = sourceSize(source.element);
    const sourceIdentity = source.element instanceof HTMLImageElement ? source.element.currentSrc : "";
    let record = this.textures.get(source.element);
    if (!record) {
      const texture = gl.createTexture();
      if (!texture) throw new Error("Unable to allocate glass source texture");
      record = { texture, width: 0, height: 0, source: "", uploaded: false };
      this.textures.set(source.element, record);
    }
    const shouldUpload = source.dynamic
      || source.element instanceof HTMLVideoElement
      || !record.uploaded
      || record.width !== width
      || record.height !== height
      || record.source !== sourceIdentity;
    gl.bindTexture(gl.TEXTURE_2D, record.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (shouldUpload) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source.element);
      record.width = width;
      record.height = height;
      record.source = sourceIdentity;
      record.uploaded = true;
      diagnostics.sourceUploads += 1;
    }
    return record.texture;
  }

  compose(sources: readonly GlassSource[], background: readonly [number, number, number, number], diagnostics: CompositorDiagnostics) {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(background[0] * background[3], background[1] * background[3], background[2] * background[3], background[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vertexArray);
    gl.uniform1i(gl.getUniformLocation(this.program, "uSource"), 0);

    for (const source of sources) {
      if (!isGlassSourceReady(source)) continue;
      const texture = this.textureFor(source, diagnostics);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform4f(
        gl.getUniformLocation(this.program, "uRect"),
        source.x / this.logicalWidth,
        source.y / this.logicalHeight,
        source.width / this.logicalWidth,
        source.height / this.logicalHeight,
      );
      gl.uniform1f(gl.getUniformLocation(this.program, "uOpacity"), source.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.outputTexture;
  }

  destroy() {
    const { gl } = this;
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteTexture(this.outputTexture);
    gl.deleteProgram(this.program);
  }
}
