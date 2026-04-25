"use client";

import { useState, useRef, useEffect } from "react";
import { MOCK_AGENT_DATA, MOCK_AGENT_DATA_PERSONALISED, MOCK_DNA_PROFILE } from "./mock-data";

// Default to mock mode — real pipeline only runs when user provides an API key
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

const AGENTS = [
  { id: 1, name: "Sentiment Listener" },
  { id: 2, name: "Job Market Scanner" },
  { id: 3, name: "Career Path Mapper" },
  { id: 4, name: "Future-Proofing Checker" },
  { id: 5, name: "AI Bottleneck Analyzer" },
  { id: 6, name: "Final Briefing" },
];

type AgentStatus = "idle" | "running" | "complete" | "error";
interface AgentState {
  status: AgentStatus;
  data: Record<string, any> | null;
  streamText: string;
}

/* ─────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────── */

function Badge({
  text,
  color = "gray",
}: {
  text: string;
  color?: "yellow" | "green" | "red" | "orange" | "gray" | "blue";
}) {
  const colors: Record<string, { bg: string; border: string; fg: string }> = {
    yellow: { bg: "rgba(255,214,10,.1)", border: "rgba(255,214,10,.3)", fg: "#ffd60a" },
    green:  { bg: "rgba(52,211,153,.1)", border: "rgba(52,211,153,.3)", fg: "#34d399" },
    red:    { bg: "rgba(239,68,68,.1)",  border: "rgba(239,68,68,.3)",  fg: "#ef4444" },
    orange: { bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.3)", fg: "#f59e0b" },
    gray:   { bg: "rgba(156,163,175,.1)",border: "rgba(156,163,175,.3)",fg: "#9ca3af" },
    blue:   { bg: "rgba(96,165,250,.1)", border: "rgba(96,165,250,.3)", fg: "#60a5fa" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-block",
      background: c.bg, border: `1px solid ${c.border}`, color: c.fg,
      fontFamily: "var(--font-mono)", fontSize: ".65rem",
      padding: "3px 10px", borderRadius: "3px",
      textTransform: "uppercase", letterSpacing: ".08em",
    }}>
      {text}
    </span>
  );
}

function ScoreBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  const fg = pct > 70 ? "#34d399" : pct > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      {label && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "#9ca3af",
          textTransform: "uppercase", letterSpacing: ".1em", minWidth: 72 }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 5, background: "#2a2a2c", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: fg,
          borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".8rem",
        fontWeight: 700, color: fg, minWidth: 36, textAlign: "right" }}>
        {value}/10
      </span>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem", color: "#6b7280",
      textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 8, marginTop: 20 }}>
      {text}
    </p>
  );
}

function BulletList({ items, color = "white" }: { items: string[]; color?: string }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10,
          fontSize: ".84rem", color, lineHeight: 1.6, marginBottom: 6 }}>
          <span style={{ color: "#ffd60a", marginTop: 2, flexShrink: 0 }}>›</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #2a2a2c", margin: "18px 0" }} />;
}

/* ─────────────────────────────────────────
   PIPELINE NODES
───────────────────────────────────────── */

function PipelineNode({ agent, status }: { agent: typeof AGENTS[0]; status: AgentStatus }) {
  const done = status === "complete";
  const running = status === "running";
  const border = done ? "#ffd60a" : running ? "#f59e0b" : "#2a2a2c";
  const dot = done ? "#ffd60a" : running ? "#f59e0b" : "#2a2a2c";
  return (
    <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8, minWidth: 100 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".55rem",
        color: "#4b5563", letterSpacing: ".1em" }}>
        {String(agent.id).padStart(2, "0")}
      </span>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111",
        border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: dot,
          boxShadow: (done || running) ? `0 0 10px ${dot}` : "none" }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
        color: done ? "white" : running ? "#f59e0b" : "#4b5563",
        textAlign: "center", maxWidth: 88, lineHeight: 1.35 }}>
        {agent.name}
      </span>
    </div>
  );
}

function PipelineConnector({ active }: { active: boolean }) {
  return (
    <div style={{ flex: "1 1 auto", minWidth: 12, height: 2,
      background: active ? "#ffd60a" : "#2a2a2c",
      alignSelf: "center", marginTop: -16, transition: "background .4s ease" }} />
  );
}

/* ─────────────────────────────────────────
   AGENT CARD RENDERERS (minimal)
───────────────────────────────────────── */

function KeyStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem",
        fontWeight: 700, color: "#ffd60a" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
        color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</span>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "6px 0 0", paddingLeft: 16, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6,
          marginBottom: 4, paddingLeft: 8, position: "relative" }}>
          <span style={{ position: "absolute", left: -8, color: "#4b5563" }}>·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function renderAgent1(data: Record<string, any>) {
  return (
    <>
      <KeyStat value={`${data.score || 0}/10`} label={data.sentiment_label || "Mixed"} />
      <Bullets items={[
        data.summary || "",
        ...(data.top_themes || []),
      ].filter(Boolean)} />
    </>
  );
}

function renderAgent2(data: Record<string, any>) {
  const salary = data.salary_range || {};
  const range = salary.min && salary.max
    ? `$${(salary.min / 1000).toFixed(0)}K–${(salary.max / 1000).toFixed(0)}K AUD`
    : "N/A";
  return (
    <>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
        <KeyStat value={`${data.demand_score || 0}/10`} label="demand" />
        <KeyStat value={range} label="salary range" />
      </div>
      <Bullets items={[
        `Trend: ${data.hiring_trend || "stable"}`,
        `Top roles: ${(data.top_roles || []).join(", ")}`,
        `Industries: ${(data.top_industries || []).join(", ")}`,
      ]} />
    </>
  );
}

function renderAgent3(data: Record<string, any>) {
  return (
    <>
      {data.entry_point && <KeyStat value={data.entry_point} label="best entry point" />}
      <Bullets items={[
        ...(data.top_career_paths || []).map((p: any) =>
          `${p.title} — ~$${(p.avg_salary_aud / 1000).toFixed(0)}K, ${p.years_to_reach}`
        ),
        ...(data.transferable_skills?.length ? [`Key skills: ${data.transferable_skills.join(", ")}`] : []),
      ]} />
    </>
  );
}

function renderAgent4(data: Record<string, any>) {
  return (
    <>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
        <KeyStat value={`${data.trajectory_score || 0}/10`} label="growth" />
        <KeyStat value={data.ai_disruption_risk || "medium"} label="AI risk" />
      </div>
      <Bullets items={[
        data.ai_risk_detail || "",
        ...(data.safe_bets || []).slice(0, 2).map((s: string) => `Safe bet: ${s}`),
      ].filter(Boolean)} />
    </>
  );
}

function renderAgent5(data: Record<string, any>) {
  return (
    <>
      <KeyStat value={data.ai_noise_factor || "medium"} label="AI noise level" />
      <Bullets items={[
        ...(data.bottlenecks || []).slice(0, 3).map((b: any) => `${b.issue} (${b.severity})`),
        ...(data.silver_lining ? [`Silver lining: ${data.silver_lining}`] : []),
      ]} />
    </>
  );
}

function renderAgent6(data: Record<string, any>) {
  const verdictColor: Record<string, string> = {
    go: "#34d399", caution: "#f59e0b", avoid: "#ef4444",
  };
  const color = verdictColor[data.verdict] || "#f59e0b";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem",
          fontWeight: 900, color, textTransform: "uppercase", letterSpacing: ".05em" }}>
          {data.verdict || "N/A"}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".75rem",
          color: "#6b7280" }}>{data.confidence_score || 0}/10 confidence</span>
      </div>
      <p style={{ fontSize: ".95rem", color: "white", lineHeight: 1.7,
        margin: "0 0 10px", fontWeight: 600 }}>
        {data.one_liner || ""}
      </p>
      <Bullets items={[
        data.recommendation || "",
        ...(data.doors_opened || []).slice(0, 2),
        ...(data.risk_flag ? [`Risk: ${data.risk_flag}`] : []),
      ].filter(Boolean)} />
    </>
  );
}

/* ─────────────────────────────────────────
   AGENT CARD SHELL
───────────────────────────────────────── */

function AgentCard({ agentId, data, streamText, status }: {
  agentId: number;
  data: Record<string, any> | null;
  streamText: string;
  status: AgentStatus;
}) {
  const isRunning = status === "running";
  const isDone = status === "complete";
  const isFinal = agentId === 6;

  return (
    <div style={{
      borderRadius: 10,
      background: "#111113",
      padding: "20px 24px",
      marginBottom: 12,
      borderLeft: `3px solid ${isDone ? (isFinal ? "#ffd60a" : "#2a2a2c") : isRunning ? "#f59e0b" : "#1e1e20"}`,
    }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isDone ? 14 : 6 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "#4b5563" }}>
          {String(agentId).padStart(2, "0")}
        </span>
        <span style={{ fontSize: ".9rem", fontWeight: 600, color: isDone ? "white" : "#6b7280" }}>
          {AGENTS[agentId - 1]?.name}
        </span>
      </div>

      {/* Thinking indicator */}
      {isRunning && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 4, height: 4, borderRadius: "50%", background: "#f59e0b",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "#4b5563" }}>
            analysing...
          </span>
        </div>
      )}

      {/* Parsed output */}
      {isDone && data && (
        <>
          {agentId === 1 && renderAgent1(data)}
          {agentId === 2 && renderAgent2(data)}
          {agentId === 3 && renderAgent3(data)}
          {agentId === 4 && renderAgent4(data)}
          {agentId === 5 && renderAgent5(data)}
          {agentId === 6 && renderAgent6(data)}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */

/* ── Career DNA profile type ── */
interface CareerDNA {
  enabled: boolean;
  name: string;
  yearLevel: string;
  interests: string[];
  cognitiveStrengths: string;
  greenLights: string[];
  hardNos: string[];
  careerArchetypes: string[];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showDNA, setShowDNA] = useState(false);
  const [dnaProfile, setDnaProfile] = useState<CareerDNA>({
    enabled: false,
    name: USE_MOCK ? MOCK_DNA_PROFILE.name : "",
    yearLevel: USE_MOCK ? MOCK_DNA_PROFILE.yearLevel : "",
    interests: USE_MOCK ? [...MOCK_DNA_PROFILE.interests] : [],
    cognitiveStrengths: USE_MOCK ? MOCK_DNA_PROFILE.cognitiveStrengths : "",
    greenLights: USE_MOCK ? [...MOCK_DNA_PROFILE.greenLights] : [],
    hardNos: USE_MOCK ? [...MOCK_DNA_PROFILE.hardNos] : [],
    careerArchetypes: USE_MOCK ? [...MOCK_DNA_PROFILE.careerArchetypes] : [],
  });
  const [interestInput, setInterestInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [seedQuery, setSeedQuery] = useState("");
  const [seedDNA, setSeedDNA] = useState<CareerDNA | null>(null);
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const updateAgent = (index: number, updates: Partial<AgentState>) => {
    setAgentStates(prev => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const updateDNA = (key: keyof CareerDNA, value: any) =>
    setDnaProfile(prev => ({ ...prev, [key]: value }));

  const addInterest = () => {
    const val = interestInput.trim();
    if (val && !dnaProfile.interests.includes(val)) {
      updateDNA("interests", [...dnaProfile.interests, val]);
    }
    setInterestInput("");
  };

  const removeInterest = (tag: string) =>
    updateDNA("interests", dnaProfile.interests.filter(t => t !== tag));

  const EXAMPLES = [
    "Is a Masters in Data Science worth it in 2026?",
    "Will AI replace software engineers in the next 5 years?",
    "Is switching to UX Design a smart career move?",
  ];

  const EXAMPLES_STUDENT = [
    "What should I study after Year 12?",
    "Is Computer Science the right degree for me?",
    "Should I do a gap year or go straight to uni?",
  ];

  /* ── mock pipeline ── */
  const runMockPipeline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSeedQuery(query);
    setSeedDNA(dnaProfile.enabled ? dnaProfile : null);
    setSubmitted(true);
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    const dataset = dnaProfile.enabled ? MOCK_AGENT_DATA_PERSONALISED : MOCK_AGENT_DATA;

    for (let i = 0; i < AGENTS.length; i++) {
      updateAgent(i, { status: "running" });
      const mockData = dataset[i + 1] || { summary: "Analysis complete." };
      const mockStream = JSON.stringify(mockData, null, 2);

      for (let j = 0; j < mockStream.length; j += 14) {
        await new Promise(r => setTimeout(r, 12));
        setAgentStates(prev => {
          const next = [...prev];
          next[i] = { ...next[i], streamText: mockStream.slice(0, j + 14) };
          return next;
        });
      }
      await new Promise(r => setTimeout(r, 180));
      updateAgent(i, { status: "complete", data: mockData, streamText: mockStream });
    }
    setLoading(false);
  };

  /* ── real pipeline ── */
  const runRealPipeline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSeedQuery(query);
    setSeedDNA(dnaProfile.enabled ? dnaProfile : null);
    setSubmitted(true);
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, apiKey, dnaProfile: dnaProfile.enabled ? dnaProfile : null }),
      });
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const payload = JSON.parse(line.replace("data: ", ""));
            const idx = payload.agentId - 1;
            if (payload.type === "start")       updateAgent(idx, { status: "running" });
            else if (payload.type === "stream") {
              setAgentStates(prev => {
                const next = [...prev];
                next[idx] = { ...next[idx], streamText: next[idx].streamText + (payload.chunk || "") };
                return next;
              });
            }
            else if (payload.type === "data")   updateAgent(idx, { status: "complete", data: payload.data });
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      console.error("Pipeline failed", err);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = USE_MOCK ? runMockPipeline : runRealPipeline;

  const sendEmail = async () => {
    setEmailError("");
    const fullAnalysis = agentStates.reduce((acc, agent, idx) => {
      acc[`agent${idx + 1}`] = agent.data;
      return acc;
    }, {} as any);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: captureEmail, query: seedQuery, fullAnalysis }),
      });
      if (res.ok) setEmailSent(true);
      else setEmailError("Failed to send — check Resend config.");
    } catch {
      setEmailError("Connection error.");
    }
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        body { background: #0a0a0b; margin: 0; }
        input::placeholder { color: #374151; }
        input:focus { outline: none; }
      `}</style>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 80px", color: "white" }}>

        {!submitted ? (
          /* ── LANDING ── */
          <>
            {/* Hero pitch */}
            <div style={{ padding: "80px 0 48px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                color: "#ffd60a", letterSpacing: ".2em", textTransform: "uppercase",
                marginBottom: 20 }}>
                My Briefing · Career Intelligence
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 900,
                color: "white", lineHeight: 1.2, margin: "0 0 16px",
                letterSpacing: "-.02em" }}>
                Stop making{" "}
                <span style={{ color: "#ffd60a" }}>$50K decisions</span>
                <br />with a Google search.
              </h1>
              <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto 12px" }}>
                Career advisors charge $300/hour. Job boards show you postings, not truth.
                AI chatbots give confident answers with no depth.
              </p>
              <p style={{ fontSize: "1rem", color: "#9ca3af", lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto" }}>
                My Briefing runs <strong style={{ color: "white" }}>6 specialised AI agents</strong> in
                sequence — each building on the last — to give you the full picture
                in under 2 minutes.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 40,
              marginBottom: 48, flexWrap: "wrap" }}>
              {[
                { stat: "6", label: "specialist agents" },
                { stat: "$300", label: "vs. career advisor/hr" },
                { stat: "<2 min", label: "full briefing" },
              ].map(({ stat, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem",
                    fontWeight: 800, color: "#ffd60a" }}>{stat}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                    color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Query input */}
            <div style={{ background: "#111113", border: "1px solid #2a2a2c",
              borderRadius: 12, padding: "24px 28px" }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                color: "#6b7280", textTransform: "uppercase", letterSpacing: ".12em",
                display: "block", marginBottom: 12 }}>
                Your career question
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runPipeline()}
                  placeholder="e.g. Is a Masters in Data Science worth it in 2026?"
                  style={{ flex: 1, padding: "14px 18px", background: "#0a0a0b",
                    border: "1px solid #2a2a2c", borderRadius: 8, color: "white",
                    fontSize: ".95rem" }}
                />
                <button
                  onClick={runPipeline}
                  disabled={loading || !query.trim()}
                  style={{ padding: "0 28px", background: query.trim() ? "#ffd60a" : "#1e1e20",
                    color: query.trim() ? "#0a0a0b" : "#4b5563",
                    fontWeight: 800, borderRadius: 8, border: "none",
                    cursor: query.trim() ? "pointer" : "default",
                    fontSize: ".88rem", letterSpacing: ".04em",
                    transition: "all .2s ease", whiteSpace: "nowrap" }}>
                  {loading ? "RUNNING…" : "RUN BRIEFING →"}
                </button>
              </div>

              {/* Example queries */}
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(dnaProfile.enabled ? EXAMPLES_STUDENT : EXAMPLES).map(ex => (
                  <button key={ex} onClick={() => setQuery(ex)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                      color: "#6b7280", background: "none",
                      border: "1px solid #2a2a2c", borderRadius: 4,
                      padding: "5px 12px", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                    {ex}
                  </button>
                ))}
              </div>

              {/* ── Career DNA panel ── */}
              <div style={{ marginTop: 20, borderTop: "1px solid #1e1e20", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button onClick={() => setShowDNA(d => !d)}
                    style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                      color: dnaProfile.enabled ? "#ffd60a" : "#4b5563",
                      background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {showDNA ? "▼" : "▶"}{" "}
                    🧬 Personalise for a student{" "}
                    <span style={{ color: "#374151" }}>(optional — uses Career DNA profile)</span>
                  </button>
                  {dnaProfile.enabled && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                      color: "#ffd60a", background: "rgba(255,214,10,.08)",
                      border: "1px solid rgba(255,214,10,.2)", padding: "2px 10px", borderRadius: 3 }}>
                      ✓ Profile active: {dnaProfile.name || "Student"}
                    </span>
                  )}
                </div>

                {showDNA && (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Enable toggle */}
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <div onClick={() => updateDNA("enabled", !dnaProfile.enabled)}
                        style={{ width: 36, height: 20, borderRadius: 10,
                          background: dnaProfile.enabled ? "#ffd60a" : "#2a2a2c",
                          position: "relative", transition: "background .2s", cursor: "pointer" }}>
                        <div style={{ position: "absolute", top: 3,
                          left: dnaProfile.enabled ? 18 : 3, width: 14, height: 14,
                          borderRadius: "50%", background: dnaProfile.enabled ? "#0a0a0b" : "#6b7280",
                          transition: "left .2s" }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                        color: dnaProfile.enabled ? "white" : "#6b7280" }}>
                        {dnaProfile.enabled ? "Personalisation ON — agents will tailor output to this student" : "Personalisation OFF"}
                      </span>
                    </label>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Name */}
                      <div>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                          color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                          display: "block", marginBottom: 6 }}>Student Name</label>
                        <input value={dnaProfile.name}
                          onChange={e => updateDNA("name", e.target.value)}
                          placeholder="e.g. Jamie"
                          style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                            border: "1px solid #2a2a2c", borderRadius: 6,
                            color: "white", fontSize: ".85rem" }} />
                      </div>
                      {/* Year level */}
                      <div>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                          color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                          display: "block", marginBottom: 6 }}>Year Level</label>
                        <input value={dnaProfile.yearLevel}
                          onChange={e => updateDNA("yearLevel", e.target.value)}
                          placeholder="e.g. Year 11, Age 16"
                          style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                            border: "1px solid #2a2a2c", borderRadius: 6,
                            color: "white", fontSize: ".85rem" }} />
                      </div>
                    </div>

                    {/* Interests / flow activities */}
                    <div>
                      <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                        color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                        display: "block", marginBottom: 6 }}>
                        Interests & Flow Activities
                        <span style={{ color: "#374151", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                          — what makes them lose track of time?
                        </span>
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {dnaProfile.interests.map(tag => (
                          <span key={tag} style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                            background: "rgba(255,214,10,.08)", border: "1px solid rgba(255,214,10,.2)",
                            color: "#ffd60a", padding: "3px 10px", borderRadius: 3,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                            onClick={() => removeInterest(tag)}>
                            {tag} ×
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input value={interestInput}
                          onChange={e => setInterestInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addInterest()}
                          placeholder="Type an interest and press Enter..."
                          style={{ flex: 1, padding: "8px 12px", background: "#0a0a0b",
                            border: "1px solid #2a2a2c", borderRadius: 6,
                            color: "white", fontSize: ".82rem" }} />
                        <button onClick={addInterest}
                          style={{ padding: "0 16px", background: "#2a2a2c",
                            border: "none", borderRadius: 6, color: "#9ca3af",
                            cursor: "pointer", fontSize: ".8rem" }}>Add</button>
                      </div>
                    </div>

                    {/* Cognitive strengths */}
                    <div>
                      <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                        color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                        display: "block", marginBottom: 6 }}>
                        Cognitive Strengths
                        <span style={{ color: "#374151", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                          — what feels effortlessly easy?
                        </span>
                      </label>
                      <textarea value={dnaProfile.cognitiveStrengths}
                        onChange={e => updateDNA("cognitiveStrengths", e.target.value)}
                        placeholder="e.g. Spots patterns instantly, breaks complex problems into steps, explains things visually..."
                        rows={2}
                        style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                          border: "1px solid #2a2a2c", borderRadius: 6, color: "white",
                          fontSize: ".82rem", resize: "vertical", lineHeight: 1.6,
                          fontFamily: "inherit" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Green Lights */}
                      <div>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                          color: "#34d399", textTransform: "uppercase", letterSpacing: ".1em",
                          display: "block", marginBottom: 6 }}>
                          ✦ Green Lights — must-haves
                        </label>
                        <textarea value={dnaProfile.greenLights.join("\n")}
                          onChange={e => updateDNA("greenLights", e.target.value.split("\n").filter(Boolean))}
                          placeholder={"Creates tangible output\nInvolves technology\nRoom to experiment"}
                          rows={4}
                          style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                            border: "1px solid rgba(52,211,153,.2)", borderRadius: 6,
                            color: "#e5e7eb", fontSize: ".82rem", resize: "vertical",
                            lineHeight: 1.7, fontFamily: "inherit" }} />
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: ".56rem",
                          color: "#374151", marginTop: 4 }}>One per line</p>
                      </div>
                      {/* Hard Nos */}
                      <div>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                          color: "#ef4444", textTransform: "uppercase", letterSpacing: ".1em",
                          display: "block", marginBottom: 6 }}>
                          ✗ Hard Nos — deal-breakers
                        </label>
                        <textarea value={dnaProfile.hardNos.join("\n")}
                          onChange={e => updateDNA("hardNos", e.target.value.split("\n").filter(Boolean))}
                          placeholder={"Repetitive admin work\nPure sales roles\nNo creative input"}
                          rows={4}
                          style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                            border: "1px solid rgba(239,68,68,.2)", borderRadius: 6,
                            color: "#e5e7eb", fontSize: ".82rem", resize: "vertical",
                            lineHeight: 1.7, fontFamily: "inherit" }} />
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: ".56rem",
                          color: "#374151", marginTop: 4 }}>One per line</p>
                      </div>
                    </div>

                    {/* Career archetype */}
                    <div>
                      <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                        color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                        display: "block", marginBottom: 6 }}>
                        Career Archetype
                        <span style={{ color: "#374151", marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                          — from Career DNA Interviewer (optional)
                        </span>
                      </label>
                      <input value={dnaProfile.careerArchetypes.join(", ")}
                        onChange={e => updateDNA("careerArchetypes",
                          e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. The Technical Optimizer, The Entrepreneurial Builder"
                        style={{ width: "100%", padding: "9px 12px", background: "#0a0a0b",
                          border: "1px solid #2a2a2c", borderRadius: 6,
                          color: "white", fontSize: ".82rem" }} />
                    </div>

                    {USE_MOCK && (
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                        color: "#374151", borderLeft: "2px solid #1e1e20", paddingLeft: 10 }}>
                        Demo mode: pre-filled with Jamie's profile. Toggle personalisation ON to see tailored agent output.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* BYOK section */}
              <div style={{ marginTop: 16, borderTop: "1px solid #1e1e20", paddingTop: 16 }}>
                <button onClick={() => setShowKeyInput(k => !k)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                    color: "#4b5563", background: "none", border: "none",
                    cursor: "pointer", padding: 0 }}>
                  {showKeyInput ? "▼" : "▶"} Use your own Anthropic API key (live mode)
                </button>
                {showKeyInput && (
                  <div style={{ marginTop: 12 }}>
                    <input type="password" value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      style={{ width: "100%", padding: "10px 14px", background: "#0a0a0b",
                        border: "1px solid #2a2a2c", borderRadius: 6, color: "white",
                        fontFamily: "var(--font-mono)", fontSize: ".8rem" }} />
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                      color: "#374151", marginTop: 8 }}>
                      Your key is never stored. Used only for this session's pipeline call.
                      {USE_MOCK && " (mock mode active — key not used)"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div style={{ marginTop: 48 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                color: "#4b5563", textTransform: "uppercase",
                letterSpacing: ".15em", textAlign: "center", marginBottom: 24 }}>
                How it works
              </p>
              <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
                {AGENTS.map((agent, i) => (
                  <div key={agent.id} style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}>
                    <div style={{ textAlign: "center", minWidth: 100 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: ".55rem",
                        color: "#374151", marginBottom: 6 }}>
                        {String(agent.id).padStart(2, "0")}
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: "50%",
                        border: "1px solid #2a2a2c", margin: "0 auto 8px",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%",
                          background: "#2a2a2c" }} />
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                        color: "#4b5563", lineHeight: 1.4 }}>
                        {agent.name}
                      </div>
                    </div>
                    {i < AGENTS.length - 1 && (
                      <div style={{ width: 24, height: 1,
                        background: "#1e1e20", flexShrink: 0, marginTop: -16 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* ── RESULTS ── */
          <>
            <div style={{ padding: "40px 0 32px",
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                {seedDNA?.enabled && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                      color: "#ffd60a", background: "rgba(255,214,10,.08)",
                      border: "1px solid rgba(255,214,10,.2)",
                      padding: "3px 10px", borderRadius: 3 }}>
                      🧬 Tailored to {seedDNA.name || "Student"}'s Career DNA
                    </span>
                    {seedDNA.careerArchetypes?.length > 0 && seedDNA.careerArchetypes.map((a, i) => (
                      <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                        color: "#9ca3af", background: "#1e1e20",
                        padding: "3px 10px", borderRadius: 3 }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                  color: "#6b7280", textTransform: "uppercase",
                  letterSpacing: ".12em", marginBottom: 6 }}>
                  Query
                </div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600,
                  color: "white", margin: 0, maxWidth: 600 }}>
                  {seedQuery}
                </h2>
              </div>
              <button onClick={() => { setSubmitted(false); setQuery(""); setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))); }}
                style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                  color: "#6b7280", background: "none",
                  border: "1px solid #2a2a2c", borderRadius: 6,
                  padding: "8px 16px", cursor: "pointer" }}>
                ← New query
              </button>
            </div>

            {/* Pipeline progress */}
            <div style={{ display: "flex", justifyContent: "center", gap: 0,
              marginBottom: 40, overflowX: "auto", paddingBottom: 12 }}>
              {AGENTS.map((agent, i) => (
                <div key={agent.id} style={{ display: "flex", alignItems: "center" }}>
                  <PipelineNode agent={agent} status={agentStates[i].status} />
                  {i < AGENTS.length - 1 && (
                    <PipelineConnector active={agentStates[i + 1]?.status !== "idle"} />
                  )}
                </div>
              ))}
            </div>

            {/* Agent cards */}
            {agentStates
              .map((state, i) => ({ ...state, id: i + 1 }))
              .filter(s => s.status !== "idle")
              .map(s => (
                <AgentCard key={s.id} agentId={s.id}
                  status={s.status} data={s.data} streamText={s.streamText} />
              ))}

            {/* Email capture */}
            {agentStates[5]?.status === "complete" && (
              <div style={{ marginTop: 48, padding: "36px 40px",
                background: "#111113", border: "1px solid #ffd60a33",
                borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                  color: "#ffd60a", textTransform: "uppercase",
                  letterSpacing: ".15em", marginBottom: 12 }}>
                  Your briefing is ready
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700,
                  color: "white", margin: "0 0 8px" }}>
                  Get the full report emailed to you
                </h3>
                <p style={{ fontSize: ".88rem", color: "#6b7280",
                  margin: "0 0 24px" }}>
                  A clean summary of all 6 agents sent to your inbox.
                </p>
                <div style={{ display: "flex", gap: 10,
                  maxWidth: 480, margin: "0 auto" }}>
                  <input
                    type="email"
                    value={captureEmail}
                    onChange={e => setCaptureEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ flex: 1, padding: "12px 16px",
                      background: "#0a0a0b", border: "1px solid #2a2a2c",
                      color: "white", borderRadius: 6, fontSize: ".9rem" }}
                  />
                  <button onClick={sendEmail}
                    style={{ padding: "0 24px", background: "#ffd60a",
                      color: "#0a0a0b", fontWeight: 800, borderRadius: 6,
                      border: "none", cursor: "pointer", fontSize: ".85rem" }}>
                    SEND →
                  </button>
                </div>
                {emailSent && (
                  <p style={{ color: "#34d399", fontFamily: "var(--font-mono)",
                    fontSize: ".75rem", marginTop: 16 }}>
                    ✓ Briefing sent — check your inbox.
                  </p>
                )}
                {emailError && (
                  <p style={{ color: "#ef4444", fontFamily: "var(--font-mono)",
                    fontSize: ".75rem", marginTop: 16 }}>
                    {emailError}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
