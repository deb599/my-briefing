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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 6px" }}>
      <strong style={{ color: "#9ca3af" }}>{label}:</strong> {value}
    </p>
  );
}

function renderAgent1(data: Record<string, any>) {
  return (
    <>
      <InfoLine label="Sentiment" value={`${data.sentiment_label || "Mixed"} (${data.score || 0}/10)`} />
      <p style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 6px" }}>{data.summary || ""}</p>
      {data.top_themes?.length > 0 && <InfoLine label="Key themes" value={data.top_themes.join(", ")} />}
      {data.key_quote && (
        <p style={{ fontSize: ".8rem", color: "#6b7280", fontStyle: "italic", margin: "8px 0 0" }}>
          &ldquo;{data.key_quote}&rdquo;
        </p>
      )}
    </>
  );
}

function renderAgent2(data: Record<string, any>) {
  const salary = data.salary_range || {};
  const range = salary.min && salary.max
    ? `$${(salary.min).toLocaleString()} – $${(salary.max).toLocaleString()} AUD`
    : "N/A";
  return (
    <>
      <InfoLine label="Demand" value={`${data.demand_level || "medium"} (${data.demand_score || 0}/10)`} />
      <InfoLine label="Top roles" value={(data.top_roles || []).join(", ")} />
      <InfoLine label="Salary range" value={range} />
      <InfoLine label="Hiring trend" value={data.hiring_trend || "stable"} />
      <InfoLine label="Top industries" value={(data.top_industries || []).join(", ")} />
    </>
  );
}

function renderAgent3(data: Record<string, any>) {
  return (
    <>
      {data.recommended_combinations?.length > 0 && (
        <InfoLine label="Recommended combos" value={data.recommended_combinations.join(", ")} />
      )}
      {(data.top_career_paths || []).map((p: any, i: number) => (
        <p key={i} style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 4px" }}>
          <strong style={{ color: "white" }}>{p.title}</strong>
          <span style={{ color: "#6b7280" }}> — {p.years_to_reach}, ~${(p.avg_salary_aud || 0).toLocaleString()} AUD</span>
        </p>
      ))}
      {data.entry_point && <InfoLine label="Entry point" value={data.entry_point} />}
      {data.transferable_skills?.length > 0 && (
        <InfoLine label="Transferable skills" value={data.transferable_skills.join(", ")} />
      )}
    </>
  );
}

function renderAgent4(data: Record<string, any>) {
  return (
    <>
      <InfoLine label="Growth" value={`${data.growth_trajectory || "stable"} (${data.trajectory_score || 0}/10)`} />
      <InfoLine label="AI disruption risk" value={`${data.ai_disruption_risk || "medium"} — ${data.ai_risk_detail || ""}`} />
      <InfoLine label="5-year outlook" value={data.five_year_outlook || "neutral"} />
      {data.safe_bets?.length > 0 && <InfoLine label="Safe bets" value={data.safe_bets.join(", ")} />}
      {data.wildcard_risk && <InfoLine label="Wildcard risk" value={data.wildcard_risk} />}
    </>
  );
}

function renderAgent5(data: Record<string, any>) {
  return (
    <>
      {(data.bottlenecks || []).slice(0, 4).map((b: any, i: number) => (
        <p key={i} style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 4px" }}>
          <strong style={{ color: "white" }}>{b.issue}</strong>
          <span style={{ color: "#6b7280" }}> ({b.severity}) — {b.detail}</span>
        </p>
      ))}
      {data.ai_noise_factor && <InfoLine label="AI noise" value={`${data.ai_noise_factor} — ${data.ai_noise_detail || ""}`} />}
      {data.skill_atrophy_risk && <InfoLine label="Skill atrophy risk" value={`${data.skill_atrophy_risk} — ${data.skill_atrophy_detail || ""}`} />}
      {data.silver_lining && <InfoLine label="Silver lining" value={data.silver_lining} />}
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
      <p style={{ fontSize: "1rem", color: "white", lineHeight: 1.7,
        margin: "0 0 10px", fontWeight: 600 }}>
        {data.one_liner || ""}
      </p>
      <p style={{ fontSize: ".84rem", color: "#d1d5db", lineHeight: 1.6, margin: "0 0 8px" }}>
        {data.recommendation || ""}
      </p>
      <InfoLine label="Confidence" value={`${data.confidence_score || 0}/10`} />
      <p style={{ fontSize: ".84rem", margin: "0 0 6px" }}>
        <strong style={{ color: "#9ca3af" }}>Verdict:</strong>{" "}
        <span style={{ color, fontWeight: 700, textTransform: "uppercase" }}>{data.verdict || "N/A"}</span>
      </p>
      {data.doors_opened?.length > 0 && <InfoLine label="Opportunities" value={data.doors_opened.join(", ")} />}
      {data.doors_closed?.length > 0 && <InfoLine label="Limitations" value={data.doors_closed.join(", ")} />}
      {data.risk_flag && <InfoLine label="Key risk" value={data.risk_flag} />}
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
  const [query, setQuery] = useState("Should I do a Bachelor of Computer Science?");
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
  const [briefingCount, setBriefingCount] = useState(0);

  // Fetch briefing count on load
  useEffect(() => {
    fetch("/api/counter").then(r => r.json()).then(d => setBriefingCount(d.count || 0)).catch(() => {});
  }, []);

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
    "Should I do a Bachelor of Computer Science?",
    "Is a nursing degree a good choice right now?",
    "Should I study business or engineering?",
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
    fetch("/api/counter", { method: "POST" }).then(r => r.json()).then(d => setBriefingCount(d.count || 0)).catch(() => {});
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
      fetch("/api/counter", { method: "POST" }).then(r => r.json()).then(d => setBriefingCount(d.count || 0)).catch(() => {});
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
                <span style={{ color: "#ffd60a" }}>6 AI agents.</span>
                <br />One honest answer about what to study.
              </h1>
              <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto 12px" }}>
                Career advisors charge $300/hour. Job boards show you listings, not truth.
                AI chatbots give confident answers with zero depth.
              </p>
              <p style={{ fontSize: "1rem", color: "#9ca3af", lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto" }}>
                My Briefing runs <strong style={{ color: "white" }}>6 specialised AI agents</strong> in
                sequence — each building on the last — to give you the full picture
                in under 2 minutes.
              </p>
            </div>

            {/* Value props */}
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

            {/* Social proof */}
            {briefingCount > 0 && (
              <div style={{ textAlign: "center", marginBottom: 32, marginTop: -24 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                  color: "#4b5563" }}>
                  {briefingCount.toLocaleString()} briefings generated so far
                </span>
              </div>
            )}

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
                  placeholder="Type your career question..."
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

              {/* BYOK section — always visible */}
              <div style={{ marginTop: 16, borderTop: "1px solid #1e1e20", paddingTop: 16 }}>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem",
                  color: "#6b7280", textTransform: "uppercase", letterSpacing: ".1em",
                  display: "block", marginBottom: 8 }}>
                  API Key <span style={{ color: "#374151", textTransform: "none", letterSpacing: 0 }}>(Anthropic)</span>
                </label>
                <input type="password" value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  style={{ width: "100%", padding: "10px 14px", background: "#0a0a0b",
                    border: "1px solid #2a2a2c", borderRadius: 6, color: "white",
                    fontFamily: "var(--font-mono)", fontSize: ".8rem" }} />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                  color: "#374151", marginTop: 8, lineHeight: 1.6 }}>
                  Your key is never stored — used only for this session.
                  {USE_MOCK && (
                    <span style={{ display: "block", marginTop: 4, color: "#ffd60a", opacity: 0.7 }}>
                      ✦ Demo mode active — no key needed. Hit "Run Briefing" to see a sample analysis.
                    </span>
                  )}
                </p>
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
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => {
                    const url = "https://my-briefing-hazel.vercel.app";
                    const text = `Hey, found this cool tool — it runs 6 AI agents to help you figure out what to study after finishing high school: ${url}`;
                    navigator.clipboard.writeText(text);
                    const btn = document.getElementById("share-top-btn");
                    if (btn) {
                      btn.innerHTML = "✓ Copied!";
                      setTimeout(() => { btn.innerHTML = "📤 Tell a friend"; }, 2000);
                    }
                  }}
                  id="share-top-btn"
                  style={{ fontFamily: "var(--font-mono)", fontSize: ".7rem",
                    color: "#0a0a0b", background: "#ffd60a",
                    border: "none", borderRadius: 6,
                    padding: "9px 18px", cursor: "pointer", fontWeight: 700,
                    letterSpacing: ".04em", transition: "all .2s ease",
                    whiteSpace: "nowrap" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ffe44d"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#ffd60a"; }}>
                  📤 Tell a friend
                </button>
                <button onClick={() => { setSubmitted(false); setQuery(""); setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))); }}
                  style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                    color: "#6b7280", background: "none",
                    border: "1px solid #2a2a2c", borderRadius: 6,
                    padding: "8px 16px", cursor: "pointer" }}>
                  ← New query
                </button>
              </div>
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
                  margin: "0 0 8px" }}>
                  A clean summary of all 6 agents sent to your inbox.
                </p>
                <p style={{ fontSize: ".72rem", color: "#4b5563",
                  margin: "0 0 20px", lineHeight: 1.5 }}>
                  Tip: Check your spam folder and mark as "not spam" if it lands there.
                  Adding <span style={{ color: "#9ca3af" }}>info@ba-co-pilot.com</span> to your contacts helps too.
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

                {/* Career DNA giveaway + feedback */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e1e20",
                  background: "#0f0f11", borderRadius: 8, padding: 20, textAlign: "center" as const }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: ".75rem",
                    color: "#ffd60a", fontWeight: 700, margin: "0 0 6px" }}>
                    Free: The Career DNA Interviewer
                  </p>
                  <p style={{ fontSize: ".78rem", color: "#6b7280", margin: "0 0 16px", lineHeight: 1.6 }}>
                    An AI prompt that asks 50 deep questions to uncover what career actually fits you — not just the "safe" answers. Hit the button and we'll send it over.
                  </p>
                  <a href="mailto:info@ba-co-pilot.com?subject=Send%20me%20the%20Career%20DNA%20Interviewer&body=Hey%2C%20just%20ran%20a%20briefing%20on%20My%20Briefing%20—%20send%20me%20the%20Career%20DNA%20prompt!%0A%0AQuick%20feedback%20on%20the%20tool%3A%20"
                    style={{ display: "inline-block", padding: "10px 24px", background: "#ffd60a",
                      color: "#0a0a0b", fontWeight: 800, fontSize: ".78rem", textDecoration: "none",
                      borderRadius: 6, fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>
                    GET THE FREE PROMPT →
                  </a>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                    color: "#4b5563", marginTop: 12, lineHeight: 1.5 }}>
                    We're building this in public — tell us what worked, what didn't, and what you'd want next.
                  </p>
                </div>

                {/* Share button */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #1e1e20" }}>
                  <button
                    onClick={() => {
                      const url = "https://my-briefing-hazel.vercel.app";
                      const text = `Hey, found this cool tool — it runs 6 AI agents to help you figure out what to study after finishing high school: ${url}`;
                      navigator.clipboard.writeText(text);
                      const btn = document.getElementById("share-btn");
                      if (btn) { btn.textContent = "COPIED!"; setTimeout(() => btn.textContent = "TELL A FRIEND", 2000); }
                    }}
                    id="share-btn"
                    style={{ padding: "10px 28px", background: "none",
                      color: "#ffd60a", fontWeight: 700, borderRadius: 6,
                      border: "1px solid #ffd60a33", cursor: "pointer",
                      fontSize: ".8rem", letterSpacing: ".06em",
                      transition: "all .2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,214,10,.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                    TELL A FRIEND
                  </button>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                    color: "#4b5563", marginTop: 8 }}>
                    Copies a link so they can try it too
                  </p>
                </div>
              </div>
            )}

            {/* Locked sections — coming soon teasers */}
            {agentStates[5]?.status === "complete" && (
              <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Locked: Career DNA */}
                <div style={{ padding: "24px 28px", background: "#111113",
                  border: "1px dashed #2a2a2c", borderRadius: 10, opacity: 0.6 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: ".95rem", fontWeight: 700, color: "white" }}>
                      Career DNA Personalisation
                    </span>
                  </div>
                  <p style={{ fontSize: ".82rem", color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>
                    Get briefings tailored to your interests, strengths, and goals — not generic advice.
                  </p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                    color: "#ffd60a", background: "rgba(255,214,10,.08)",
                    border: "1px solid rgba(255,214,10,.2)",
                    padding: "4px 12px", borderRadius: 4 }}>
                    COMING SOON
                  </span>
                </div>

                {/* Locked: Compare Career Paths */}
                <div style={{ padding: "24px 28px", background: "#111113",
                  border: "1px dashed #2a2a2c", borderRadius: 10, opacity: 0.6 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: ".95rem", fontWeight: 700, color: "white" }}>
                      Compare Career Paths
                    </span>
                  </div>
                  <p style={{ fontSize: ".82rem", color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>
                    Run briefings on multiple options side by side — Computer Science vs Engineering vs Business — and see which one fits best.
                  </p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem",
                    color: "#ffd60a", background: "rgba(255,214,10,.08)",
                    border: "1px solid rgba(255,214,10,.2)",
                    padding: "4px 12px", borderRadius: 4 }}>
                    COMING SOON
                  </span>
                </div>

              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
