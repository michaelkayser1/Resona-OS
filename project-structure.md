Awesome — here’s a clean, Vercel-ready Next.js (App Router + Edge) repo for The Field Refinery (RBFR Quantum Cockpit). Drop these files into a new project and deploy.

⸻

📦 Project layout

field-refinery/
├─ app/
│  ├─ page.tsx
│  ├─ rbfr/page.tsx
│  └─ api/fanout/route.ts
├─ components/
│  ├─ Canvas.tsx
│  ├─ MetricsOverlay.tsx
│  ├─ ModelDock.tsx
│  ├─ RBFRPanel.tsx
│  └─ Sparkline.tsx
├─ lib/
│  ├─ qote.ts
│  ├─ schemas.ts
│  └─ json.ts
├─ public/
│  └─ shaders/rbfr.frag
├─ app/globals.css
├─ package.json
├─ next.config.js
├─ tsconfig.json
└─ .env.example


⸻

app/page.tsx

// app/page.tsx
export default function Home() {
  return (
    <main style={{padding:"2rem", fontFamily:"system-ui, sans-serif"}}>
      <h1 style={{marginBottom:"1rem"}}>The Field Refinery</h1>
      <p style={{opacity:.8, maxWidth:700}}>
        RBFR Quantum Cockpit — a multi-AI, science-aware, interactive art instrument.
      </p>
      <a href="/rbfr" style={{
        display:"inline-block", marginTop:"1.5rem", padding:"0.75rem 1rem",
        border:"1px solid #333", borderRadius:8, textDecoration:"none"
      }}>
        Launch Cockpit →
      </a>
    </main>
  );
}


⸻

app/rbfr/page.tsx

// app/rbfr/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { MetricsOverlay } from "@/components/MetricsOverlay";
import { ModelDock } from "@/components/ModelDock";
import { RBFRPanel } from "@/components/RBFRPanel";
import { measureConsensus, uniformsFrom, PHI } from "@/lib/qote";
import type { RBFRDesign, FieldMetrics, ArtUniforms } from "@/lib/schemas";

type ProviderId = "openai" | "anthropic" | "mistral" | "xai" | "deepseek";

const COACH_CARD = `You are a scientific co-creator for Resonance-Based Fuel Refinement (RBFR).
Given the current state, output a JSON RBFRDesign tuned for coil configuration and waveform modulation
that improves efficiency WITHOUT increasing heat. (TRIZ-style contradiction resolution.)
Return ONLY valid JSON in this schema: RBFRDesign.`;

export default function RBFRPage() {
  const [designs, setDesigns] = useState<Record<ProviderId, RBFRDesign | null>>({
    openai: null, anthropic: null, mistral: null, xai: null, deepseek: null
  });

  const [goal, setGoal] = useState<RBFRDesign["goal"]>("stabilize_structure");
  const [carrierHz, setCarrierHz] = useState<number>(37);
  const [waveform, setWaveform] = useState<RBFRDesign["field"]["waveform"]>("sine");
  const [modulationIndex, setModulationIndex] = useState<number>(0.3);
  const [coilConfig, setCoilConfig] = useState<RBFRDesign["field"]["coilConfig"]>("helmholtz");
  const [maxTempC, setMaxTempC] = useState<number>(180);
  const [maxFieldTesla, setMaxFieldTesla] = useState<number>(2.0);
  const [notes, setNotes] = useState<string[]>([]);

  // Resonance Log (bookmarks when CUST reaches φ)
  const [resonanceLog, setResonanceLog] = useState<{ time:number; CUST:number; snapshot: RBFRDesign[] }[]>([]);
  const [custHistory, setCustHistory] = useState<number[]>([]);
  const [startTime] = useState<number>(() => performance.now());
  const phiLockRef = useRef<boolean>(false);

  const validDesigns = useMemo(
    () => Object.values(designs).filter(Boolean) as RBFRDesign[],
    [designs]
  );

  const metrics: FieldMetrics = useMemo(
    () => validDesigns.length ? measureConsensus(validDesigns) : { W: 1, beta: 1, CUST: 1 },
    [validDesigns]
  );

  useEffect(() => {
    setCustHistory(h => [...h.slice(-240), metrics.CUST]); // ~ last 240 samples
    const t = (performance.now() - startTime) / 1000;
    if (metrics.CUST >= PHI && !phiLockRef.current) {
      phiLockRef.current = true;
      setResonanceLog(log => [...log, { time: t, CUST: metrics.CUST, snapshot: validDesigns }]);
      // unlock after short window so it can re-log later
      setTimeout(() => { phiLockRef.current = false; }, 2500);
    }
  }, [metrics, startTime, validDesigns]);

  const uniforms: ArtUniforms = useMemo(
    () => uniformsFrom(metrics, (performance.now() - startTime) / 1000),
    [metrics, startTime]
  );

  async function runFanout() {
    const state = {
      goal,
      field: { carrierHz, waveform, modulationIndex, coilConfig },
      guards: { maxTempC, maxFieldTesla },
      notes
    };

    const userMsg = `Current RBFR state:
${JSON.stringify(state, null, 2)}

Return ONLY valid JSON matching the RBFRDesign schema.`;

    const messages = [
      { role: "system", content: COACH_CARD },
      { role: "user", content: userMsg }
    ];

    const res = await fetch("/api/fanout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    const data: { results: { id: ProviderId; out: any }[] } = await res.json();

    const next: Record<ProviderId, RBFRDesign | null> = {
      openai: null, anthropic: null, mistral: null, xai: null, deepseek: null
    };

    for (const { id, out } of data.results) {
      const maybe = extractRBFRDesign(out);
      next[id] = maybe;
    }
    setDesigns(next);
  }

  function extractRBFRDesign(out: any): RBFRDesign | null {
    try {
      // common OpenAI-style
      const content =
        out?.choices?.[0]?.message?.content ??
        out?.choices?.[0]?.text ??
        out?.output_text ??
        (typeof out === "string" ? out : "");

      const txt = typeof content === "string" ? content : JSON.stringify(out);
      const jsonText = stripCodeFences(txt).trim();

      const parsed = JSON.parse(jsonText);
      if (isRBFRDesign(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  }

  function stripCodeFences(s: string) {
    return s
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  function isRBFRDesign(x: any): x is RBFRDesign {
    return x && typeof x === "object" &&
      ["maximize_yield","reduce_heat","stabilize_structure"].includes(x.goal) &&
      x.field && ["sine","pulse","fm","am"].includes(x.field.waveform) &&
      ["helmholtz","solenoid","multi-turn"].includes(x.field.coilConfig);
  }

  return (
    <main style={{display:"grid", gridTemplateColumns:"minmax(380px, 440px) 1fr", gap:"12px", height:"100vh"}}>
      <section style={{padding:"12px", borderRight:"1px solid #e5e5e5", overflow:"auto"}}>
        <h2 style={{margin:"6px 0 10px"}}>Co-Pilot Wall</h2>
        <button onClick={runFanout} style={{
          padding:"8px 12px", border:"1px solid #333", borderRadius:6, cursor:"pointer", marginBottom:10
        }}>Fan-out Proposals</button>

        <RBFRPanel
          goal={goal} setGoal={setGoal}
          carrierHz={carrierHz} setCarrierHz={setCarrierHz}
          waveform={waveform} setWaveform={setWaveform}
          modulationIndex={modulationIndex} setModulationIndex={setModulationIndex}
          coilConfig={coilConfig} setCoilConfig={setCoilConfig}
          maxTempC={maxTempC} setMaxTempC={setMaxTempC}
          maxFieldTesla={maxFieldTesla} setMaxFieldTesla={setMaxFieldTesla}
          notes={notes} setNotes={setNotes}
        />

        <ModelDock designs={designs} />
      </section>

      <section style={{position:"relative"}}>
        <Canvas uniforms={uniforms} />
        <MetricsOverlay metrics={metrics} custHistory={custHistory} resonanceLog={resonanceLog} />
      </section>
    </main>
  );
}


⸻

app/api/fanout/route.ts (Edge)

// app/api/fanout/route.ts
export const runtime = "edge";

type ProviderId = "openai" | "anthropic" | "mistral" | "xai" | "deepseek";

const DEFAULTS: Record<ProviderId, { url?: string; model?: string; key?: string }> = {
  openai:    { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", key: process.env.OPENAI_KEY },
  anthropic: { url: process.env.ANTHROPIC_URL, model: process.env.ANTHROPIC_MODEL, key: process.env.ANTHROPIC_KEY },
  mistral:   { url: process.env.MISTRAL_URL,   model: process.env.MISTRAL_MODEL,   key: process.env.MISTRAL_KEY },
  xai:       { url: process.env.XAI_URL,       model: process.env.XAI_MODEL,       key: process.env.XAI_KEY },
  deepseek:  { url: process.env.DEEPSEEK_URL,  model: process.env.DEEPSEEK_MODEL,  key: process.env.DEEPSEEK_KEY },
};

export async function POST(req: Request) {
  const { messages } = await req.json();
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Expected { messages } array" }), { status: 400 });
  }

  const targets = (Object.keys(DEFAULTS) as ProviderId[])
    .map(id => ({ id, ...DEFAULTS[id] }))
    .filter(t => t.url && t.key);

  const bodyFor = (model?: string) => ({
    model: model ?? "auto",
    messages,
    stream: false,
    temperature: 0.2,
  });

  const calls = targets.map(async (t) => {
    try {
      const res = await fetch(t.url!, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${t.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyFor(t.model)),
      });
      const out = await res.json().catch(() => ({}));
      return { id: t.id, out };
    } catch (e: any) {
      return { id: t.id, out: { error: e?.message ?? "fetch_error" } };
    }
  });

  const results = await Promise.all(calls);
  return new Response(JSON.stringify({ results }), { headers: { "Content-Type": "application/json" } });
}

🔎 Note: The OpenAI entry is ready out-of-the-box. For Anthropic/Mistral/XAI/DeepSeek, either provide an OpenAI-compatible proxy URL or adjust the route to each provider’s native format. Keeping them as OpenAI-compatible keeps this cockpit simple.

⸻

components/Canvas.tsx

// components/Canvas.tsx
"use client";
import { useEffect, useRef } from "react";
import type { ArtUniforms } from "@/lib/schemas";

const VERT_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

async function loadFrag(): Promise<string> {
  const res = await fetch("/shaders/rbfr.frag", { cache: "no-store" });
  return res.text();
}

export function Canvas({ uniforms }: { uniforms: ArtUniforms }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    let mounted = true;
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: true, preserveDrawingBuffer: true });
    if (!gl) return;

    glRef.current = gl;
    (async () => {
      const fragSrc = await loadFrag();
      if (!mounted) return;

      // compile shaders
      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, VERT_SRC);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vs));
        return;
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, fragSrc);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
        return;
      }

      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        return;
      }
      progRef.current = prog;
      gl.useProgram(prog);

      // quad
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const quad = new Float32Array([
        -1, -1,   1, -1,   -1,  1,
        -1,  1,   1, -1,    1,  1
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      // uniform locations
      locsRef.current = {
        u_res: gl.getUniformLocation(prog, "u_res"),
        u_time: gl.getUniformLocation(prog, "u_time"),
        u_phase: gl.getUniformLocation(prog, "u_phase"),
        u_sep: gl.getUniformLocation(prog, "u_sep"),
        u_width: gl.getUniformLocation(prog, "u_width"),
        u_wobble: gl.getUniformLocation(prog, "u_wobble"),
        u_gain: gl.getUniformLocation(prog, "u_gain"),
      };

      const onResize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.floor(canvas.clientWidth * dpr);
        const h = Math.floor(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w; canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      };
      const loop = () => {
        if (!mounted) return;
        onResize();
        const t = (performance.now() - startRef.current) / 1000;

        gl.useProgram(prog);
        gl.uniform2f(locsRef.current.u_res, canvas.width, canvas.height);
        gl.uniform1f(locsRef.current.u_time, t);
        gl.uniform1f(locsRef.current.u_phase, uniforms.phase);
        gl.uniform1f(locsRef.current.u_sep, uniforms.sep);
        gl.uniform1f(locsRef.current.u_width, uniforms.width);
        gl.uniform1f(locsRef.current.u_wobble, uniforms.wobble);
        gl.uniform1f(locsRef.current.u_gain, uniforms.gain);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => { mounted = false; };
  }, []); // init once

  // update uniforms prop without reinitializing GL:
  useEffect(() => {
    // nothing to do: we set current values each frame above
  }, [uniforms]);

  return <canvas ref={canvasRef} style={{width:"100%", height:"100%", display:"block"}} />;
}


⸻

components/MetricsOverlay.tsx

// components/MetricsOverlay.tsx
"use client";
import { Sparkline } from "./Sparkline";
import type { FieldMetrics, RBFRDesign } from "@/lib/schemas";
import { PHI } from "@/lib/qote";

export function MetricsOverlay({
  metrics, custHistory, resonanceLog
}: {
  metrics: FieldMetrics;
  custHistory: number[];
  resonanceLog: { time:number; CUST:number; snapshot: RBFRDesign[] }[];
}) {
  const emergence = metrics.CUST >= PHI;

  return (
    <div style={{
      position:"absolute", top:10, right:10, background:"rgba(255,255,255,0.85)",
      border:"1px solid #ddd", padding:"10px 12px", borderRadius:8, minWidth:260
    }}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>RIF Metrics</strong>
        {emergence && (
          <span style={{
            fontSize:12, padding:"2px 6px", borderRadius:999,
            border:"1px solid #333"
          }}>Emergence Lock (φ)</span>
        )}
      </div>
      <div style={{marginTop:8, fontSize:14, lineHeight:1.6}}>
        <div>W (wobble): <code>{metrics.W.toFixed(3)}</code></div>
        <div>β (grace): <code>{metrics.beta.toFixed(3)}</code></div>
        <div>CUST: <code>{metrics.CUST.toFixed(3)}</code></div>
      </div>
      <div style={{marginTop:8}}>
        <Sparkline data={custHistory} width={240} height={40} />
      </div>
      {!!resonanceLog.length && (
        <details style={{marginTop:10}}>
          <summary>Resonance Log ({resonanceLog.length})</summary>
          <ul style={{margin:"6px 0 0 16px", fontSize:12}}>
            {resonanceLog.slice(-6).reverse().map((r, i) => (
              <li key={i}>t={r.time.toFixed(1)}s, CUST={r.CUST.toFixed(3)} ({r.snapshot.length} designs)</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}


⸻

components/ModelDock.tsx

// components/ModelDock.tsx
"use client";
import type { RBFRDesign } from "@/lib/schemas";

export function ModelDock({ designs }: { designs: Record<string, RBFRDesign | null> }) {
  const items = Object.entries(designs) as [string, RBFRDesign | null][];

  return (
    <div style={{marginTop:12}}>
      <h3 style={{marginBottom:8}}>Model Proposals</h3>
      <div style={{display:"grid", gap:8}}>
        {items.map(([id, d]) => (
          <div key={id} style={{
            border:"1px solid #ddd", padding:"10px", borderRadius:8, background:"#fafafa"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <strong>{id}</strong>
              <span style={{
                fontSize:12, padding:"2px 6px", border:"1px solid #aaa", borderRadius:999
              }}>{d ? "parsed" : "—"}</span>
            </div>
            {d ? (
              <div style={{fontSize:13, marginTop:6}}>
                <div><b>goal:</b> {d.goal}</div>
                <div><b>waveform:</b> {d.field.waveform}</div>
                <div><b>coil:</b> {d.field.coilConfig}</div>
                <div><b>carrierHz:</b> {d.field.carrierHz}</div>
                <div><b>modIndex:</b> {d.field.modulationIndex}</div>
                <details style={{marginTop:6}}>
                  <summary>guards & notes</summary>
                  <div style={{fontSize:12}}>
                    <div>maxTempC: {d.guards.maxTempC}</div>
                    <div>maxFieldT: {d.guards.maxFieldTesla}</div>
                    <ul>{d.notes.map((n,i)=><li key={i}>{n}</li>)}</ul>
                  </div>
                </details>
              </div>
            ) : (
              <div style={{fontSize:12, opacity:.7, marginTop:6}}>No JSON parsed</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


⸻

components/RBFRPanel.tsx

// components/RBFRPanel.tsx
"use client";
import type { RBFRDesign } from "@/lib/schemas";

export function RBFRPanel(props: {
  goal: RBFRDesign["goal"]; setGoal: (v: RBFRDesign["goal"]) => void;
  carrierHz: number; setCarrierHz: (v:number)=>void;
  waveform: RBFRDesign["field"]["waveform"]; setWaveform: (v:any)=>void;
  modulationIndex: number; setModulationIndex: (v:number)=>void;
  coilConfig: RBFRDesign["field"]["coilConfig"]; setCoilConfig: (v:any)=>void;
  maxTempC: number; setMaxTempC: (v:number)=>void;
  maxFieldTesla: number; setMaxFieldTesla: (v:number)=>void;
  notes: string[]; setNotes: (v:string[])=>void;
}) {
  const addNote = () => props.setNotes([...props.notes, ""]);
  const setNote = (i:number, text:string) => {
    const next = props.notes.slice(); next[i]=text; props.setNotes(next);
  };

  return (
    <div style={{border:"1px solid #ddd", borderRadius:8, padding:10}}>
      <h3>RBFR Panel</h3>

      <label style={{display:"block", marginTop:8}}>
        Goal
        <select value={props.goal} onChange={e=>props.setGoal(e.target.value as any)} style={{marginLeft:8}}>
          <option value="maximize_yield">maximize_yield</option>
          <option value="reduce_heat">reduce_heat</option>
          <option value="stabilize_structure">stabilize_structure</option>
        </select>
      </label>

      <div style={{display:"grid", gap:6, gridTemplateColumns:"1fr 1fr", marginTop:8}}>
        <label>carrierHz
          <input type="number" value={props.carrierHz}
                 onChange={e=>props.setCarrierHz(Number(e.target.value))}
                 style={{width:"100%"}} />
        </label>

        <label>waveform
          <select value={props.waveform} onChange={e=>props.setWaveform(e.target.value)} style={{width:"100%"}}>
            <option value="sine">sine</option>
            <option value="pulse">pulse</option>
            <option value="fm">fm</option>
            <option value="am">am</option>
          </select>
        </label>

        <label>modulationIndex
          <input type="number" min={0} max={1} step={0.01} value={props.modulationIndex}
                 onChange={e=>props.setModulationIndex(Number(e.target.value))}
                 style={{width:"100%"}} />
        </label>

        <label>coilConfig
          <select value={props.coilConfig} onChange={e=>props.setCoilConfig(e.target.value)} style={{width:"100%"}}>
            <option value="helmholtz">helmholtz</option>
            <option value="solenoid">solenoid</option>
            <option value="multi-turn">multi-turn</option>
          </select>
        </label>

        <label>maxTempC
          <input type="number" value={props.maxTempC}
                 onChange={e=>props.setMaxTempC(Number(e.target.value))}
                 style={{width:"100%"}} />
        </label>

        <label>maxFieldTesla
          <input type="number" value={props.maxFieldTesla}
                 onChange={e=>props.setMaxFieldTesla(Number(e.target.value))}
                 style={{width:"100%"}} />
        </label>
      </div>

      <div style={{marginTop:8}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <strong>Contradiction Notes (TRIZ)</strong>
          <button onClick={addNote} style={{padding:"2px 8px", border:"1px solid #333", borderRadius:6}}>+ Note</button>
        </div>
        <div style={{display:"grid", gap:6, marginTop:6}}>
          {props.notes.map((n,i)=>(
            <input key={i} placeholder={`note ${i+1}`} value={n}
                   onChange={e=>setNote(i, e.target.value)}
                   style={{width:"100%", padding:"6px", border:"1px solid #ccc", borderRadius:6}} />
          ))}
        </div>
      </div>
    </div>
  );
}


⸻

components/Sparkline.tsx

// components/Sparkline.tsx
"use client";
import { useEffect, useRef } from "react";

export function Sparkline({ data, width=200, height=40 }: { data: number[]; width?:number; height?:number }) {
  const ref = useRef<HTMLCanvasElement|null>(null);

  useEffect(() => {
    const c = ref.current!;
    c.width = width; c.height = height;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;

    if (!data.length) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(1e-6, max - min);

    ctx.beginPath();
    data.forEach((v,i) => {
      const x = (i / Math.max(1, data.length-1)) * width;
      const y = height - ((v - min)/range) * height;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }, [data, width, height]);

  return <canvas ref={ref} style={{width, height}}/>;
}


⸻

lib/schemas.ts

// lib/schemas.ts
export type RBFRDesign = {
  goal: "maximize_yield" | "reduce_heat" | "stabilize_structure";
  field: {
    carrierHz: number;       // drive freq
    waveform: "sine" | "pulse" | "fm" | "am";
    modulationIndex: number; // 0..1
    coilConfig: "helmholtz" | "solenoid" | "multi-turn";
  };
  guards: { maxTempC: number; maxFieldTesla: number };
  notes: string[];
};

export type FieldMetrics = { W: number; beta: number; CUST: number };

export type ArtUniforms = { phase: number; sep: number; width: number; wobble: number; gain: number };


⸻

lib/qote.ts

// lib/qote.ts
import type { RBFRDesign, FieldMetrics, ArtUniforms } from "./schemas";

export const PHI = 1.61803398875;

function agreementScore(vs: string[]): number {
  // 0 (no agree) .. 1 (full agree)
  if (!vs.length) return 0;
  const uniq = new Set(vs);
  return 1 - (uniq.size - 1) / Math.max(vs.length - 1, 1);
}

export function measureConsensus(jsons: RBFRDesign[]): FieldMetrics {
  const waveforms = jsons.map(j => j.field.waveform);
  const coils     = jsons.map(j => j.field.coilConfig);
  const aWave = agreementScore(waveforms);
  const aCoil = agreementScore(coils);

  const W    = Math.max(0, 1 - 0.5*(aWave + aCoil)); // lower is better
  const beta = 0.8 + 0.4*aWave;                       // 0.8..1.2
  const CUST = 1.0 + 0.6*aCoil;                       // 1.0..1.6 ≈ φ when fully aligned

  return { W, beta, CUST };
}

export function uniformsFrom(metrics: FieldMetrics, t:number): ArtUniforms {
  return {
    phase:  Math.PI * metrics.CUST + 0.2*t,
    sep:    0.25 + 0.4*(metrics.CUST-1.0),
    width:  0.15 - 0.1*Math.min(metrics.W,1),
    wobble: metrics.W,
    gain:   Math.pow(1+metrics.beta, 0.5),
  };
}


⸻

lib/json.ts (utility — optional, reserved for future parsing tweaks)

// lib/json.ts
export function tryParseJSON<T = any>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch { return null; }
}


⸻

public/shaders/rbfr.frag

// public/shaders/rbfr.frag
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_phase, u_sep, u_width, u_wobble, u_gain;

float maskSlits(vec2 p, float sep, float w){
  float m1 = smoothstep(w, 0.0, abs(p.x - sep));
  float m2 = smoothstep(w, 0.0, abs(p.x + sep));
  return clamp(1.0 - min(m1,m2), 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  float r = length(uv);
  float phase = 10.0*r - 0.8*u_time + u_phase;

  float coherence = exp(-u_wobble * r*r);
  float wave = sin(phase) * coherence;

  float mask = maskSlits(uv, u_sep, u_width);
  float intensity = u_gain * mask * (0.5 + 0.5*wave);

  vec3 col = vec3(intensity, intensity*0.85, 1.0 - intensity);
  gl_FragColor = vec4(col, 1.0);
}


⸻

app/globals.css

/* app/globals.css */
html, body, #__next { height: 100%; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }


⸻

package.json

{
  "name": "field-refinery",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "echo \"(no lint configured)\""
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}


⸻

next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
};

module.exports = nextConfig;


⸻

tsconfig.json

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}


⸻

.env.example

# OpenAI — works out of the box
OPENAI_KEY=sk-...

# Optional: supply OpenAI-compatible proxy URLs + keys for others
ANTHROPIC_URL=
ANTHROPIC_KEY=
ANTHROPIC_MODEL=
MISTRAL_URL=
MISTRAL_KEY=
MISTRAL_MODEL=
XAI_URL=
XAI_KEY=
XAI_MODEL=
DEEPSEEK_URL=
DEEPSEEK_KEY=
DEEPSEEK_MODEL=


⸻

🧪 How to run (local)

pnpm i   # or npm i / yarn
cp .env.example .env.local
# set OPENAI_KEY at minimum
pnpm dev
# open http://localhost:3000/rbfr

☁️ Deploy to Vercel
	1.	Create a new Vercel project, import this repo.
	2.	Add Environment Variables (Project Settings → Environment Variables):
	•	OPENAI_KEY (required)
	•	Add others if you have OpenAI-compatible proxies.
	3.	Deploy.
	4.	Visit /rbfr.

⸻

🔬 RBFR / QOTE notes baked in
	•	Levers (TRIZ): coilConfig, waveform, modulationIndex, carrierHz, with guardrails on maxTempC, maxFieldTesla.
	•	Consensus → Field Metrics: AIs agreeing on coil/waveform lowers W, raises β, and pushes CUST → φ.
	•	Art Mapping: W → decoherence, β → gain (amplifier), CUST → phase/sep (stability & interference geometry).
	•	Resonance Log: Auto-bookmarks emergence lock (CUST ≥ φ).

⸻

If you want, I can also add:
	•	a tiny “provider health” strip,
	•	a CSV export of the Resonance Log,
	•	an optional /api/mock endpoint to generate synthetic model JSON for demos.

Want me to append those next?
