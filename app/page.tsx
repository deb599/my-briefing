"use client";

import { useState, useRef, useEffect } from "react";

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

/* ───── tiny components ───── */

function CaveatBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "var(--warn-dim)",
        border: "1px solid rgba(245,158,11,.25)",
        color: "var(--warn)",
        fontFamily: "var(--mono)",
        fontSize: ".68rem",
        padding: "3px 10px",
        borderRadius: "3px",
      }}
    >
      ⚠ {text}
    </span>
  );
}

function ScoreBar({ value, label, note }: { value: number; label?: string; note?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {label && (
          <span style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em", minWidth: 50 }}>
            {label}
          </span>
        )}
        <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 3,
              background: pct > 70 ? "var(--accent)" : pct > 40 ? "var(--warn)" : "var(--decline)",
              transition: "width .8s ease",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".85rem", fontWeight: 700, color: pct > 70 ? "var(--accent)" : pct > 40 ? "var(--warn)" : "var(--decline)", whiteSpace: "nowrap" }}>
          {value}/10
        </span>
      </div>
      {note && <p style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--warn)", marginTop: 4, marginLeft: label ? 62 : 0 }}>note: {note}</p>}
    </div>
  );
}

function StreamingLog({ text, active }: { text: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [text]);
  if (!text && !active) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--text-dim)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 6 }}>
        {active ? "▶ raw output (streaming...)" : "▶ raw output"}
      </p>
      <div
        ref={ref}
        style={{
          background: "rgba(0,0,0,.4)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 14,
          maxHeight: 160,
          overflowY: "auto",
          fontFamily: "var(--mono)",
          fontSize: ".72rem",
          color: "var(--text-dim)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.55,
        }}
      >
        {text}
        {active && <span style={{ color: "var(--accent)", animation: "pulse 1s infinite" }}>▌</span>}
      </div>
    </div>
  );
}

/* ───── pipeline node ───── */

function PipelineNode({ agent, status }: { agent: typeof AGENTS[0]; status: AgentStatus }) {
  const isComplete = status === "complete";
  const isRunning = status === "running";
  const dotBorder = isComplete ? "var(--accent)" : isRunning ? "var(--warn)" : "var(--border)";
  const innerColor = isComplete ? "var(--accent)" : isRunning ? "var(--warn)" : "var(--border)";
  const nameColor = isComplete ? "var(--text)" : isRunning ? "var(--warn)" : "var(--text-dim)";

  return (
    <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110 }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--text-dim)", letterSpacing: ".1em" }}>
        {String(agent.id).padStart(2, "0")}
      </span>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--surface-raised)",
          border: `2px solid ${dotBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: innerColor,
            boxShadow: isComplete || isRunning ? `0 0 12px ${innerColor}` : "none",
            animation: isRunning ? "pulse 2s infinite" : isComplete ? "none" : "none",
          }}
        />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: nameColor, textAlign: "center", maxWidth: 100, lineHeight: 1.35 }}>
        {agent.name}
      </span>
    </div>
  );
}

function PipelineConnector({ active }: { active: boolean }) {
  return (
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 16,
        height: 2,
        background: active ? "linear-gradient(90deg, var(--accent), var(--border-accent))" : "var(--border)",
        alignSelf: "center",
        marginTop: -14,
        transition: "background .5s ease",
      }}
    />
  );
}

/* ───── agent card renderers ───── */

function AgentCard({ agentId, data, streamText, status }: {
  agentId: number;
  data: Record<string, any> | null;
  streamText: string;
  status: AgentStatus;
}) {
  const isRunning = status === "running";
  const isDone = status === "complete";
  const borderColor = isRunning ? "var(--warn)" : isDone ? "var(--border-accent)" : "var(--border)";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        padding: "28px 32px",
        transition: "border-color .4s ease",
        animation: "fadeUp .5s forwards",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: ".7rem",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              padding: "3px 9px",
              borderRadius: 3,
              letterSpacing: ".05em",
            }}
          >
            {String(agentId).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-bright)" }}>
            {AGENTS[agentId - 1].name}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: ".62rem",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 3,
            border: `1px solid ${isRunning ? "var(--warn)" : isDone ? "var(--border)" : "var(--border)"}`,
            color: isRunning ? "var(--warn)" : isDone ? "var(--text-dim)" : "var(--text-dim)",
            animation: isRunning ? "pulse 1.5s infinite" : "none",
          }}
        >
          {isRunning ? "RUNNING" : isDone ? "COMPLETE" : "IDLE"}
        </span>
      </div>

      <StreamingLog text={streamText} active={isRunning} />

      {isDone && data && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              parsed output
            </span>
            <CaveatBadge text="AI-estimated, not live data" />
          </div>

          {agentId === 1 && renderAgent1(data)}
          {agentId === 2 && renderAgent2(data)}
          {agentId === 3 && renderAgent3(data)}
          {agentId === 4 && renderAgent4(data)}
          {agentId === 5 && renderAgent5(data)}
          {agentId === 6 && renderAgent6(data)}
        </div>
      )}
    </div>
  );
}

/* ───── Agent render functions ───── */

function renderAgent1(data: Record<string, any>) {
  return (
    <div>
      <ScoreBar value={Number(data.score) || 0} label="score" note={String(data.score_confidence || "")} />
      <p style={{ color: "var(--text)", fontSize: ".88rem", lineHeight: 1.65, borderLeft: "2px solid var(--border)", paddingLeft: 16, margin: "16px 0" }}>
        {String(data.summary || "")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {((data.top_themes as string[]) || []).map((t, i) => (
          <span key={i} style={{ fontFamily: "var(--mono)", fontSize: ".7rem", padding: "5px 12px", borderRadius: 20, background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}>
            {t}
          </span>
        ))}
      </div>
      {data.data_caveat && (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em", textTransform: "uppercase" }}>CAVEAT: </span>
          {String(data.data_caveat)}
        </div>
      )}
    </div>
  );
}

function renderAgent2(data: Record<string, any>) {
  const roles = (data.top_roles as string[]) || [];
  const industries = (data.top_industries as string[]) || [];
  const salary = data.salary_range as Record<string, any> | undefined;
  return (
    <div>
      <ScoreBar value={Number(data.demand_score) || 0} label="demand" note={String(data.demand_score_note || "")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, margin: "20px 0" }}>
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 10 }}>Top Roles</p>
          {roles.map((r, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "4px 0", paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 10, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
              {r}
            </p>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 10 }}>Industries</p>
          {industries.map((ind, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "4px 0", paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 10, width: 5, height: 5, borderRadius: "50%", background: "var(--warn)" }} />
              {ind}
            </p>
          ))}
        </div>
      </div>
      {salary && (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--accent-dim)", borderLeft: "3px solid var(--accent)", fontSize: ".86rem", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 700 }}>
            AU${((salary.min as number) / 1000).toFixed(0)}K–AU${((salary.max as number) / 1000).toFixed(0)}K
          </span>
          <span style={{ color: "var(--text-dim)", fontSize: ".78rem", marginLeft: 10 }}>({String(salary.note || "estimate only")})</span>
        </div>
      )}
    </div>
  );
}

function renderAgent3(data: Record<string, any>) {
  const combos = (data.recommended_combinations as string[]) || [];
  const paths = (data.top_career_paths as Array<Record<string, any>>) || [];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {combos.map((c, i) => (
          <span key={i} style={{ fontFamily: "var(--mono)", fontSize: ".72rem", padding: "6px 14px", borderRadius: 20, background: "var(--accent-dim)", border: "1px solid var(--border-accent)", color: "var(--accent)" }}>
            {c}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-bright)", fontSize: ".88rem" }}>{String(p.title)}</span>
            <div style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: ".78rem" }}>
              <span style={{ color: "var(--accent)" }}>AU${(Number(p.avg_salary_aud) / 1000).toFixed(0)}K</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderAgent4(data: Record<string, any>) {
  const safeBets = (data.safe_bets as string[]) || [];
  return (
    <div>
      <ScoreBar value={Number(data.trajectory_score) || 0} label="trajectory" note={String(data.trajectory_note || "")} />
      <div style={{ padding: 20, marginTop: 16, borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderTop: "3px solid var(--grow)" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--grow)", marginBottom: 12 }}>SAFE BETS</p>
        {safeBets.map((s, i) => (
          <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "6px 0", borderBottom: i < safeBets.length - 1 ? "1px solid var(--border)" : "none" }}>✓ {s}</p>
        ))}
      </div>
    </div>
  );
}

function renderAgent5(data: Record<string, any>) {
  const bottlenecks = (data.bottlenecks || []) as Array<Record<string, any>>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {bottlenecks.map((b, i) => (
        <div key={i} style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--surface-raised)", borderLeft: "3px solid var(--danger)" }}>
          <p style={{ fontWeight: 700, fontSize: ".86rem", color: "var(--text-bright)" }}>{String(b.issue)}</p>
          <p style={{ fontSize: ".82rem", color: "var(--text-dim)", marginTop: 4 }}>{String(b.detail)}</p>
        </div>
      ))}
    </div>
  );
}

function renderAgent6(data: Record<string, any>) {
  const verdict = String(data.verdict || "").toLowerCase();
  const verdictColor = verdict === "go" ? "var(--grow)" : "var(--danger)";
  return (
    <div style={{ padding: "28px 32px", borderRadius: "var(--radius)", background: "var(--surface-raised)", borderLeft: `4px solid ${verdictColor}` }}>
      <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: "var(--radius)", border: `1px solid ${verdictColor}`, marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, color: verdictColor }}>{verdict.toUpperCase()}</span>
      </div>
      <p style={{ fontSize: ".95rem", color: "var(--text-bright)", lineHeight: 1.7 }}>{String(data.recommendation || "")}</p>
    </div>
  );
}

/* ───── main page ───── */

export default function Home() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [seedQuery, setSeedQuery] = useState("");
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const updateAgent = (index: number, updates: Partial<AgentState>) => {
    setAgentStates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const runPipeline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSeedQuery(query);
    setSubmitted(true);
    
    // Reset states
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({ query }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const payload = JSON.parse(line);
            const idx = payload.agentId - 1;

            if (payload.type === "start") {
              updateAgent(idx, { status: "running" });
            } else if (payload.type === "stream") {
              setAgentStates(prev => {
                const next = [...prev];
                next[idx].streamText += payload.text;
                return next;
              });
            } else if (payload.type === "data") {
              updateAgent(idx, { status: "complete", data: payload.data });
            }
          } catch (e) {
            console.error("Chunk parse error", e);
          }
        }
      }
    } catch (err) {
      console.error("Pipeline failed", err);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    setEmailError("");
    
    // Construct the full analysis object for the PDF
    const fullAnalysis = agentStates.reduce((acc, agent, idx) => {
      acc[`agent${idx + 1}`] = agent.data;
      return acc;
    }, {} as any);

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: captureEmail,
          query: seedQuery,
          fullAnalysis: fullAnalysis,
        }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        const err = await res.json();
        setEmailError(err.error || "Failed to send.");
      }
    } catch (e) {
      setEmailError("Connection error.");
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
      <header style={{ marginBottom: 60, textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent)", marginBottom: 12 }}>
          Subject Decision Briefing
        </h1>
        <p style={{ color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: ".85rem" }}>
          6 AI agents reasoning sequentially about your career query.
        </p>
      </header>

      {!submitted ? (
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Is a Masters in Data Science worth it in 2026?"
            style={{ flex: 1, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
          />
          <button onClick={runPipeline} disabled={loading} style={{ padding: "0 32px", background: "var(--accent)", color: "var(--bg)", fontWeight: 700, borderRadius: "var(--radius)" }}>
            {loading ? "PROCESSING..." : "RUN PIPELINE"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 60, overflowX: "auto", paddingBottom: 20 }}>
            {AGENTS.map((agent, i) => (
              <div key={agent.id} style={{ display: "flex", alignItems: "center" }}>
                <PipelineNode agent={agent} status={agentStates[i].status} />
                {i < AGENTS.length - 1 && <PipelineConnector active={agentStates[i+1].status !== "idle"} />}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {agentStates
              .map((state, i) => ({ ...state, id: i + 1 }))
              .filter(s => s.status !== "idle")
              .map((s) => (
                <AgentCard key={s.id} agentId={s.id} status={s.status} data={s.data} streamText={s.streamText} />
              ))}
          </div>

          {agentStates[5].status === "complete" && (
            <div style={{ marginTop: 80, padding: 40, background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Get your Full Executive Briefing (PDF)</h2>
              <div style={{ display: "flex", gap: 12, maxWidth: 500, margin: "24px auto 0" }}>
                <input
                  type="email"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, padding: "12px 18px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}
                />
                <button onClick={sendEmail} style={{ padding: "0 24px", background: "var(--accent)", color: "var(--bg)", fontWeight: 700, borderRadius: 4 }}>
                  SEND PDF
                </button>
              </div>
              {emailSent && <p style={{ color: "var(--accent)", marginTop: 16 }}>Briefing sent! Check your inbox.</p>}
              {emailError && <p style={{ color: "var(--danger)", marginTop: 16 }}>{emailError}</p>}
            </div>
          )}
        </>
      )}
    </main>
  );
}
