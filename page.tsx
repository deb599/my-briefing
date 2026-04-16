"use client";

import { useState, useRef, useEffect } from "react";
import { MOCK_AGENT_DATA } from "./mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

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
        background: "rgba(245, 158, 11, 0.1)",
        border: "1px solid rgba(245,158,11,.25)",
        color: "#f59e0b",
        fontFamily: "var(--font-mono)",
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
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem", color: "gray", textTransform: "uppercase", letterSpacing: ".1em", minWidth: 50 }}>
            {label}
          </span>
        )}
        <div style={{ flex: 1, height: 6, background: "#333", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 3,
              background: pct > 70 ? "#ffd60a" : pct > 40 ? "#f59e0b" : "#ef4444",
              transition: "width .8s ease",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".85rem", fontWeight: 700, color: pct > 70 ? "#ffd60a" : pct > 40 ? "#f59e0b" : "#ef4444", whiteSpace: "nowrap" }}>
          {value}/10
        </span>
      </div>
      {note && <p style={{ fontFamily: "var(--font-mono)", fontSize: ".68rem", color: "#f59e0b", marginTop: 4, marginLeft: label ? 62 : 0 }}>note: {note}</p>}
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
      <p style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "gray", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 6 }}>
        {active ? "▶ raw output (streaming...)" : "▶ raw output"}
      </p>
      <div
        ref={ref}
        style={{
          background: "rgba(0,0,0,.4)",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: 14,
          maxHeight: 160,
          overflowY: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: ".72rem",
          color: "gray",
          whiteSpace: "pre-wrap",
          lineHeight: 1.55,
        }}
      >
        {text}
        {active && <span style={{ color: "#ffd60a", animation: "pulse 1s infinite" }}>▌</span>}
      </div>
    </div>
  );
}

/* ───── pipeline node ───── */

function PipelineNode({ agent, status }: { agent: typeof AGENTS[0]; status: AgentStatus }) {
  const isComplete = status === "complete";
  const isRunning = status === "running";
  const dotBorder = isComplete ? "#ffd60a" : isRunning ? "#f59e0b" : "#333";
  const innerColor = isComplete ? "#ffd60a" : isRunning ? "#f59e0b" : "#333";
  const nameColor = isComplete ? "white" : isRunning ? "#f59e0b" : "gray";

  return (
    <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "gray", letterSpacing: ".1em" }}>
        {String(agent.id).padStart(2, "0")}
      </span>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#1c1c1e",
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
          }}
        />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem", color: nameColor, textAlign: "center", maxWidth: 100, lineHeight: 1.35 }}>
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
        background: active ? "#ffd60a" : "#333",
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
  const borderColor = isRunning ? "#f59e0b" : isDone ? "#ffd60a" : "#333";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        background: "#1c1c1e",
        padding: "28px 32px",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: ".7rem",
              background: "rgba(255, 214, 10, 0.1)",
              color: "#ffd60a",
              padding: "3px 9px",
              borderRadius: 3,
            }}
          >
            {String(agentId).padStart(2, "0")}
          </span>
          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "white" }}>
            {AGENTS[agentId - 1].name}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: ".62rem",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 3,
            border: `1px solid ${isRunning ? "#f59e0b" : "#333"}`,
            color: isRunning ? "#f59e0b" : "gray",
          }}
        >
          {isRunning ? "RUNNING" : isDone ? "COMPLETE" : "IDLE"}
        </span>
      </div>

      <StreamingLog text={streamText} active={isRunning} />

      {isDone && data && (
        <div style={{ borderTop: "1px solid #333", paddingTop: 20, marginTop: 16 }}>
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
      <p style={{ color: "white", fontSize: ".88rem", lineHeight: 1.65, borderLeft: "2px solid #333", paddingLeft: 16, margin: "16px 0" }}>
        {String(data.summary || "")}
      </p>
    </div>
  );
}

function renderAgent2(data: Record<string, any>) {
  return (
    <div>
      <ScoreBar value={Number(data.demand_score) || 0} label="demand" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, margin: "20px 0" }}>
        <div>
          <p style={{ fontSize: ".84rem", color: "white" }}>{String(data.top_roles?.[0] || "N/A")}</p>
        </div>
      </div>
    </div>
  );
}

function renderAgent3(data: Record<string, any>) {
  return <p style={{ fontSize: ".88rem", color: "white" }}>{String(data.summary || "Path analysis complete.")}</p>;
}

function renderAgent4(data: Record<string, any>) {
  return <ScoreBar value={Number(data.trajectory_score) || 0} label="trajectory" />;
}

function renderAgent5(data: Record<string, any>) {
  return <p style={{ fontSize: ".88rem", color: "white" }}>{String(data.bottlenecks?.[0]?.issue || "No significant bottlenecks.")}</p>;
}

function renderAgent6(data: Record<string, any>) {
  return (
    <div style={{ padding: "28px 32px", borderRadius: "8px", background: "#000", borderLeft: `4px solid #ffd60a` }}>
      <p style={{ fontSize: ".95rem", color: "white", lineHeight: 1.7 }}>{String(data.recommendation || "")}</p>
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
      if (next[index]) {
        next[index] = { ...next[index], ...updates };
      }
      return next;
    });
  };

  const runMockPipeline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSeedQuery(query);
    setSubmitted(true);
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    // Simulate streaming UX with realistic delays per agent
    for (let i = 0; i < AGENTS.length; i++) {
      updateAgent(i, { status: "running" });
      const mockData = MOCK_AGENT_DATA[i + 1] || { summary: "No mock data for this agent." };
      const mockStream = JSON.stringify(mockData, null, 2);

      // Simulate token-by-token streaming
      for (let j = 0; j < mockStream.length; j += 12) {
        await new Promise((r) => setTimeout(r, 15));
        setAgentStates((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], streamText: mockStream.slice(0, j + 12) };
          return next;
        });
      }

      await new Promise((r) => setTimeout(r, 200));
      updateAgent(i, { status: "complete", data: mockData, streamText: mockStream });
    }
    setLoading(false);
  };

  const runRealPipeline = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSeedQuery(query);
    setSubmitted(true);
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
        const lines = chunk.split("\n\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const rawJson = line.replace("data: ", "");
            const payload = JSON.parse(rawJson);
            const idx = payload.agentId - 1;

            if (payload.type === "start") {
              updateAgent(idx, { status: "running" });
            } else if (payload.type === "stream") {
              setAgentStates((prev) => {
                const next = [...prev];
                next[idx] = { ...next[idx], streamText: next[idx].streamText + (payload.chunk || "") };
                return next;
              });
            } else if (payload.type === "data") {
              updateAgent(idx, { status: "complete", data: payload.data });
            }
          } catch (e) {
            console.error("Parse error on line:", line);
          }
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
        body: JSON.stringify({
          email: captureEmail,
          query: seedQuery,
          fullAnalysis: fullAnalysis,
        }),
      });

      if (res.ok) setEmailSent(true);
      else setEmailError("Failed to send.");
    } catch (e) {
      setEmailError("Connection error.");
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "60px 20px", background: "#1c1c1e", minHeight: "100vh", color: "white" }}>
      <header style={{ marginBottom: 60, textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#ffd60a", marginBottom: 12 }}>
          Subject Decision Briefing
        </h1>
        <p style={{ color: "gray", fontFamily: "var(--font-mono)", fontSize: ".85rem" }}>
          6 AI agents reasoning sequentially about your query.
        </p>
      </header>

      {!submitted ? (
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Is a Masters in Data Science worth it in 2026?"
            style={{ flex: 1, padding: "16px 20px", background: "#000", border: "1px solid #333", borderRadius: "8px", color: "white" }}
          />
          <button onClick={runPipeline} disabled={loading} style={{ padding: "0 32px", background: "#ffd60a", color: "#1c1c1e", fontWeight: 700, borderRadius: "8px" }}>
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
            <div style={{ marginTop: 80, padding: 40, background: "#000", border: "1px solid #ffd60a", borderRadius: "8px", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 12 }}>Get your Full Executive Briefing (PDF)</h2>
              <div style={{ display: "flex", gap: 12, maxWidth: 500, margin: "24px auto 0" }}>
                <input
                  type="email"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ flex: 1, padding: "12px 18px", background: "#1c1c1e", border: "1px solid #333", color: "white", borderRadius: 4 }}
                />
                <button onClick={sendEmail} style={{ padding: "0 24px", background: "#ffd60a", color: "#1c1c1e", fontWeight: 700, borderRadius: 4 }}>
                  SEND PDF
                </button>
              </div>
              {emailSent && <p style={{ color: "#ffd60a", marginTop: 16 }}>Briefing sent! Check your inbox.</p>}
            </div>
          )}
        </>
      )}
    </main>
  );
}
