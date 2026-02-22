"use client"
import { useEffect, useRef } from "react"
import type { ArtUniforms } from "@/lib/schemas"

const VERT_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_phase, u_sep, u_width, u_wobble, u_gain;

// Quantum field interference patterns
float quantumField(vec2 p, float t) {
  float r = length(p);
  
  // Multiple wave sources for complex interference
  float wave1 = sin(10.0 * r - 0.8 * t + u_phase);
  float wave2 = sin(12.0 * r - 1.2 * t + u_phase * 1.3);
  float wave3 = cos(8.0 * r - 0.6 * t + u_phase * 0.7);
  
  // Coherence envelope affected by wobble
  float coherence = exp(-u_wobble * r * r * 0.5);
  
  return (wave1 + 0.7 * wave2 + 0.5 * wave3) * coherence / 2.2;
}

// Double-slit mask with smooth transitions
float maskSlits(vec2 p, float sep, float w) {
  float slit1 = smoothstep(w, 0.0, abs(p.x - sep));
  float slit2 = smoothstep(w, 0.0, abs(p.x + sep));
  return clamp(slit1 + slit2, 0.0, 1.0);
}

// Holographic scanlines for sci-fi effect
float scanlines(vec2 uv) {
  float lines = sin(uv.y * 3.14159 * u_res.y / 3.0);
  return 0.88 + 0.12 * lines;
}

// Emergence glow when approaching phi
float emergenceHalo(vec2 p, float phiProximity) {
  float r = length(p);
  float halo = smoothstep(0.4, 0.0, r) * phiProximity;
  float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
  return halo * pulse * 0.8;
}

// Chromatic aberration for depth
vec3 chromaticShift(vec2 uv, float intensity) {
  float r = length(uv);
  vec2 offset = normalize(uv) * r * intensity * 0.01;
  
  float red = quantumField(uv + offset, u_time);
  float green = quantumField(uv, u_time);
  float blue = quantumField(uv - offset, u_time);
  
  return vec3(red, green, blue);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float r = length(uv);
  
  // Camera shake for low coherence
  vec2 shake = vec2(
    sin(u_time * 8.0 + uv.x * 15.0),
    cos(u_time * 6.0 + uv.y * 12.0)
  ) * u_wobble * 0.02;
  uv += shake;
  
  // Quantum field calculation
  vec3 field = chromaticShift(uv, u_wobble);
  
  // Double-slit interference mask
  float mask = maskSlits(uv, u_sep, u_width);
  
  // φ-lock detection and emergence effects
  float phiProximity = smoothstep(1.5, 1.618, u_phase / 3.14159);
  float emergence = emergenceHalo(uv, phiProximity);
  
  // Base intensity with gain control
  float intensity = u_gain * mask * (0.5 + 0.5 * field.g);
  intensity *= scanlines(uv);
  
  // Stability-based color mapping
  float stability = clamp(1.0 - u_wobble, 0.0, 1.0);
  vec3 baseColor = vec3(
    intensity * (0.8 + 0.4 * field.r),
    intensity * mix(0.6, 1.2, stability) * (0.9 + 0.3 * field.g),
    (1.0 - intensity * 0.7) * (0.9 + 0.4 * field.b)
  );
  
  // Add emergence glow
  vec3 emergenceColor = vec3(1.0, 0.9, 0.3) * emergence;
  
  // Quantum glow enhancement
  float quantumGlow = smoothstep(0.3, 0.0, r) * stability * 0.3;
  vec3 glowColor = vec3(0.2, 0.4, 0.8) * quantumGlow;
  
  // Final composition
  vec3 finalColor = baseColor + emergenceColor + glowColor;
  
  // Subtle vignette
  float vignette = smoothstep(0.8, 0.2, r);
  finalColor *= 0.3 + 0.7 * vignette;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

export function Canvas({ uniforms }: { uniforms: ArtUniforms }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const progRef = useRef<WebGLProgram | null>(null)
  const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const startRef = useRef<number>(performance.now())

  useEffect(() => {
    let mounted = true
    const canvas = canvasRef.current!

    const gl = canvas.getContext("webgl", {
      antialias: true,
      preserveDrawingBuffer: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    })
    if (!gl) {
      console.error("[v0] WebGL not supported")
      return
    }

    glRef.current = gl

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader)
        console.error(`[v0] Shader compilation error (${type === gl.VERTEX_SHADER ? "vertex" : "fragment"}):`, log)
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl.VERTEX_SHADER, VERT_SRC)
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAG_SRC)

    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[v0] Program linking error:", gl.getProgramInfoLog(prog))
      return
    }

    progRef.current = prog

    // Setup geometry
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(prog, "a_pos")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    locsRef.current = {
      u_res: gl.getUniformLocation(prog, "u_res"),
      u_time: gl.getUniformLocation(prog, "u_time"),
      u_phase: gl.getUniformLocation(prog, "u_phase"),
      u_sep: gl.getUniformLocation(prog, "u_sep"),
      u_width: gl.getUniformLocation(prog, "u_width"),
      u_wobble: gl.getUniformLocation(prog, "u_wobble"),
      u_gain: gl.getUniformLocation(prog, "u_gain"),
    }

    let resizeTimeout: NodeJS.Timeout
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const rect = canvas.getBoundingClientRect()
        const w = Math.floor(rect.width * dpr)
        const h = Math.floor(rect.height * dpr)

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
          gl.viewport(0, 0, w, h)
        }
      }, 16)
    }

    let frameCount = 0
    let lastFpsTime = performance.now()

    const loop = () => {
      if (!mounted) return

      onResize()
      const currentTime = performance.now()
      const t = (currentTime - startRef.current) / 1000

      // FPS monitoring (optional debug info)
      frameCount++
      if (currentTime - lastFpsTime > 1000) {
        // console.log(`[v0] FPS: ${frameCount}`)
        frameCount = 0
        lastFpsTime = currentTime
      }

      const webglContext = glRef.current!
      const shaderProgram = progRef.current!
      webglContext["useProgram"](shaderProgram)

      // Set uniforms with validation
      const locs = locsRef.current
      if (locs.u_res) webglContext.uniform2f(locs.u_res, canvas.width, canvas.height)
      if (locs.u_time) webglContext.uniform1f(locs.u_time, t)
      if (locs.u_phase) webglContext.uniform1f(locs.u_phase, uniforms.phase)
      if (locs.u_sep) webglContext.uniform1f(locs.u_sep, uniforms.sep)
      if (locs.u_width) webglContext.uniform1f(locs.u_width, uniforms.width)
      if (locs.u_wobble) webglContext.uniform1f(locs.u_wobble, uniforms.wobble)
      if (locs.u_gain) webglContext.uniform1f(locs.u_gain, uniforms.gain)

      // Clear and draw
      webglContext.clearColor(0.02, 0.02, 0.08, 1.0)
      webglContext.clear(webglContext.COLOR_BUFFER_BIT)
      webglContext.drawArrays(webglContext.TRIANGLES, 0, 6)

      requestAnimationFrame(loop)
    }

    // Initial resize and start loop
    onResize()
    loop()

    return () => {
      mounted = false
      clearTimeout(resizeTimeout)
    }
  }, [uniforms])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block bg-gray-950 quantum-field"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
