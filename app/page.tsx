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
  data: Record<string, unknown> | null;
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
/* PLACEHOLDER: filled in below */

function AgentCard({ agentId, data, streamText, status }: {
  agentId: number;
  data: Record<string, unknown> | null;
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
      }}
    >
      {/* Header */}
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
            textTransform: "uppercase" as const,
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

      {/* Streaming */}
      <StreamingLog text={streamText} active={isRunning} />

      {/* Parsed results */}
      {isDone && data && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--text-dim)" }}>
              parsed output
            </span>
            <CaveatBadge text="AI-estimated, not live data" />
          </div>

          {/* Agent 1: Sentiment */}
          {agentId === 1 && renderAgent1(data)}

          {/* Agent 2: Job Market */}
          {agentId === 2 && renderAgent2(data)}

          {/* Agent 3: Career Path */}
          {agentId === 3 && renderAgent3(data)}

          {/* Agent 4: Future-Proofing */}
          {agentId === 4 && renderAgent4(data)}

          {/* Agent 5: AI Bottleneck */}
          {agentId === 5 && renderAgent5(data)}

          {/* Agent 6: Final Briefing */}
          {agentId === 6 && renderAgent6(data)}
        </div>
      )}
    </div>
  );
}

/* ───── Agent render functions ───── */

function renderAgent1(data: Record<string, unknown>) {
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
      {data.data_caveat ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em", textTransform: "uppercase" as const }}>CAVEAT: </span>
          {String(data.data_caveat)}
        </div>
      ) : null}
      {data.key_quote ? (
        <p style={{ color: "var(--text-dim)", fontSize: ".86rem", fontStyle: "italic", borderLeft: "2px solid var(--border)", paddingLeft: 16, marginTop: 16 }}>
          &ldquo;{String(data.key_quote)}&rdquo;
        </p>
      ) : null}
    </div>
  );
}

function renderAgent2(data: Record<string, unknown>) {
  const roles = (data.top_roles as string[]) || [];
  const industries = (data.top_industries as string[]) || [];
  const salary = (data as any).salary_range as Record<string, unknown> | undefined;
  const gaps = (data.data_gaps as string[]) || [];
  return (
    <div>
      <ScoreBar value={Number(data.demand_score) || 0} label="demand" note={String(data.demand_score_note || "")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, margin: "20px 0" }}>
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 10 }}>Top Roles</p>
          {roles.map((r, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "4px 0", paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 10, width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
              {r}
            </p>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 10 }}>Industries</p>
          {industries.map((ind, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "4px 0", paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 10, width: 5, height: 5, borderRadius: "50%", background: "var(--warn)" }} />
              {ind}
            </p>
          ))}
        </div>
      </div>
      {salary ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--accent-dim)", borderLeft: "3px solid var(--accent)", fontSize: ".86rem", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 700 }}>
            AU${((salary.min as number) / 1000).toFixed(0)}K–AU${((salary.max as number) / 1000).toFixed(0)}K
          </span>
          <span style={{ color: "var(--text-dim)", fontSize: ".78rem", marginLeft: 10 }}>({String(salary.note || "estimate only")})</span>
        </div>
      ) : null}
      <p style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--text-dim)", marginBottom: 12 }}>
        vol: {String(data.job_volume_estimate || "unknown")} · trend: <span style={{ color: "var(--text)" }}>{String(data.hiring_trend || "unknown")}</span>
      </p>
      {gaps.length > 0 ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em", textTransform: "uppercase" as const, marginBottom: 6 }}>DATA GAPS</p>
          {gaps.map((g, i) => <p key={i} style={{ fontSize: ".82rem", color: "var(--text)", lineHeight: 1.55 }}>— {g}</p>)}
        </div>
      ) : null}
    </div>
  );
}

function renderAgent3(data: Record<string, unknown>) {
  const combos = (data.recommended_combinations as string[]) || [];
  const paths = (data.top_career_paths as Array<Record<string, unknown>>) || [];
  const skills = (data.transferable_skills as string[]) || [];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {combos.map((c, i) => (
          <span key={i} style={{ fontFamily: "var(--mono)", fontSize: ".72rem", padding: "6px 14px", borderRadius: 20, background: "var(--accent-dim)", border: "1px solid var(--border-accent)", color: "var(--accent)" }}>
            {c}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-bright)", fontSize: ".88rem" }}>{String(p.title)}</span>
            <div style={{ textAlign: "right", fontFamily: "var(--mono)", fontSize: ".78rem" }}>
              <span style={{ color: "var(--accent)" }}>AU${(Number(p.avg_salary_aud) / 1000).toFixed(0)}K</span>
              <span style={{ color: "var(--text-dim)", margin: "0 8px" }}>·</span>
              <span style={{ color: "var(--text-dim)" }}>{String(p.years_to_reach)}</span>
              <span style={{ color: "var(--warn)", marginLeft: 8, fontSize: ".68rem" }}>[{String(p.salary_certainty || "?")} certainty]</span>
            </div>
          </div>
        ))}
      </div>
      {skills.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {skills.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--mono)", fontSize: ".7rem", padding: "5px 12px", borderRadius: 20, background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {s}
            </span>
          ))}
        </div>
      ) : null}
      {data.entry_point ? (
        <p style={{ fontSize: ".86rem", color: "var(--text)", borderLeft: "2px solid var(--accent)", paddingLeft: 14 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--text-dim)", letterSpacing: ".1em" }}>ENTRY: </span>
          {String(data.entry_point)}
        </p>
      ) : null}
      {data.path_caveats ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6, marginTop: 16 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em" }}>CAVEAT: </span>
          {String(data.path_caveats)}
        </div>
      ) : null}
    </div>
  );
}

function renderAgent4(data: Record<string, unknown>) {
  const safeBets = (data.safe_bets as string[]) || [];
  const avoids = (data.subjects_to_avoid as string[]) || [];
  return (
    <div>
      <ScoreBar value={Number(data.trajectory_score) || 0} label="trajectory" note={String(data.trajectory_note || "")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "16px 0", fontFamily: "var(--mono)", fontSize: ".78rem" }}>
        <p><span style={{ color: "var(--text-dim)" }}>growth: </span><span style={{ color: "var(--text-bright)" }}>{String(data.growth_trajectory || "")}</span></p>
        <p>
          <span style={{ color: "var(--text-dim)" }}>ai_disruption: </span>
          <span style={{ color: data.ai_disruption_risk === "high" ? "var(--danger)" : data.ai_disruption_risk === "medium" ? "var(--warn)" : "var(--text)" }}>
            {String(data.ai_disruption_risk || "")}
          </span>
        </p>
        <p><span style={{ color: "var(--text-dim)" }}>5yr_outlook: </span><span style={{ color: "var(--text-bright)" }}>{String(data.five_year_outlook || "")}</span></p>
      </div>
      {data.ai_risk_detail ? (
        <p style={{ fontSize: ".86rem", color: "var(--text)", borderLeft: "2px solid var(--border)", paddingLeft: 14, lineHeight: 1.65, margin: "16px 0" }}>
          {String(data.ai_risk_detail)}
        </p>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ padding: 20, borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderTop: "3px solid var(--grow)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--grow)", marginBottom: 12 }}>SAFE BETS</p>
          {safeBets.map((s, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", padding: "6px 0", borderBottom: i < safeBets.length - 1 ? "1px solid var(--border)" : "none" }}>✓ {s}</p>
          ))}
        </div>
        <div style={{ padding: 20, borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)", borderTop: "3px solid var(--decline)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--decline)", marginBottom: 12 }}>AVOID</p>
          {avoids.map((s, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text-dim)", padding: "6px 0", textDecoration: "line-through", borderBottom: i < avoids.length - 1 ? "1px solid var(--border)" : "none" }}>✗ {s}</p>
          ))}
        </div>
      </div>
      {data.five_year_note ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6, marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em" }}>FORECAST CAVEAT: </span>
          {String(data.five_year_note)}
        </div>
      ) : null}
      {data.wildcard_risk ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--danger-dim)", borderLeft: "3px solid var(--danger)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--danger)", letterSpacing: ".1em" }}>WILDCARD: </span>
          {String(data.wildcard_risk)}
        </div>
      ) : null}
    </div>
  );
}

function renderAgent5(data: Record<string, unknown>) {
  const bottlenecks = (data.bottlenecks || []) as Array<Record<string, unknown>>;
  const painPoints = (data.pain_points || []) as string[];
  const noiseLevel = String(data.ai_noise_factor || "unknown");
  const noiseDetail = data.ai_noise_detail ? String(data.ai_noise_detail) : "";
  const atrophyLevel = String(data.skill_atrophy_risk || "unknown");
  const atrophyDetail = data.skill_atrophy_detail ? String(data.skill_atrophy_detail) : "";
  const hiringImpact = data.hiring_impact ? String(data.hiring_impact) : "";
  const regFriction = data.regulatory_friction ? String(data.regulatory_friction) : "";
  const silverLining = data.silver_lining ? String(data.silver_lining) : "";
  const caveat = data.data_caveat ? String(data.data_caveat) : "";

  const severityColor = (s: unknown) =>
    s === "critical" ? "var(--danger)" : s === "high" ? "var(--orange)" : s === "medium" ? "var(--warn)" : "var(--text-dim)";
  const severityBg = (s: unknown) =>
    s === "critical" ? "var(--danger-dim)" : s === "high" ? "var(--orange-dim)" : s === "medium" ? "var(--warn-dim)" : "rgba(107,112,132,.08)";

  return (
    <div>
      {/* Bottlenecks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--text-dim)" }}>bottlenecks</p>
        {bottlenecks.map((b, i) => (
          <div key={i} style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: severityBg(b.severity), border: `1px solid ${severityColor(b.severity)}33`, borderLeft: `3px solid ${severityColor(b.severity)}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: ".86rem", color: severityColor(b.severity) }}>{String(b.issue)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", padding: "2px 8px", borderRadius: 3, background: `${severityColor(b.severity)}22`, color: severityColor(b.severity), textTransform: "uppercase" as const, letterSpacing: ".08em" }}>
                  {String(b.severity)}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--text-dim)" }}>hits: {String(b.who_it_hits)}</span>
              </div>
            </div>
            <p style={{ fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>{String(b.detail)}</p>
          </div>
        ))}
      </div>

      {/* Pain Points */}
      {painPoints.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 10 }}>pain points</p>
          {painPoints.map((p, i) => (
            <p key={i} style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.6, paddingLeft: 16, position: "relative", marginBottom: 6 }}>
              <span style={{ position: "absolute", left: 0, color: "var(--decline)" }}>▸</span>
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {/* AI Noise & Skill Atrophy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ padding: 20, borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 8 }}>ai noise factor</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, color: noiseLevel === "high" ? "var(--danger)" : noiseLevel === "medium" ? "var(--warn)" : "var(--text)" }}>
            {noiseLevel.toUpperCase()}
          </p>
          {noiseDetail ? <p style={{ fontSize: ".78rem", color: "var(--text-dim)", marginTop: 6, lineHeight: 1.55 }}>{noiseDetail}</p> : null}
        </div>
        <div style={{ padding: 20, borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 8 }}>skill atrophy risk</p>
          <p style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, color: atrophyLevel === "high" ? "var(--danger)" : atrophyLevel === "medium" ? "var(--warn)" : "var(--text)" }}>
            {atrophyLevel.toUpperCase()}
          </p>
          {atrophyDetail ? <p style={{ fontSize: ".78rem", color: "var(--text-dim)", marginTop: 6, lineHeight: 1.55 }}>{atrophyDetail}</p> : null}
        </div>
      </div>

      {/* Hiring & Regulatory */}
      {hiringImpact ? (
        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 4 }}>hiring impact</p>
          <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.6 }}>{hiringImpact}</p>
        </div>
      ) : null}
      {regFriction ? (
        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 4 }}>regulatory friction</p>
          <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.6 }}>{regFriction}</p>
        </div>
      ) : null}

      {/* Silver Lining */}
      {silverLining ? (
        <div style={{ padding: "18px 22px", borderRadius: "var(--radius)", background: "var(--accent-dim)", borderLeft: "3px solid var(--accent)", marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--accent)", letterSpacing: ".15em", textTransform: "uppercase" as const, marginBottom: 6 }}>SILVER LINING</p>
          <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.65 }}>{silverLining}</p>
        </div>
      ) : null}

      {caveat ? (
        <div style={{ padding: "14px 18px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em" }}>CAVEAT: </span>
          {caveat}
        </div>
      ) : null}
    </div>
  );
}

function renderAgent6(data: Record<string, unknown>) {
  const verdict = String(data.verdict || "").toLowerCase();
  const verdictColor = verdict === "go" ? "var(--grow)" : verdict === "avoid" ? "var(--danger)" : "var(--warn)";
  const verdictBg = verdict === "go" ? "rgba(34,197,94,.1)" : verdict === "avoid" ? "var(--danger-dim)" : "var(--warn-dim)";
  const doors = (data.doors_opened as string[]) || [];
  const closed = (data.doors_closed as string[]) || [];

  return (
    <div style={{ padding: "28px 32px", borderRadius: "var(--radius)", background: "var(--surface-raised)", borderLeft: `4px solid ${verdictColor}`, position: "relative", overflow: "hidden" }}>
      <div style={{ content: "''", position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${verdictColor}, transparent)` }} />

      {/* Verdict */}
      <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: "var(--radius)", background: verdictBg, border: `1px solid ${verdictColor}`, marginBottom: 20 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: verdictColor, letterSpacing: ".1em" }}>VERDICT: </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "1rem", fontWeight: 700, color: verdictColor }}>{verdict.toUpperCase()}</span>
      </div>

      <ScoreBar value={Number(data.confidence_score) || 0} label="confidence" note={String(data.confidence_note || "")} />

      <p style={{ fontSize: ".9rem", color: "var(--text)", lineHeight: 1.7, borderLeft: "2px solid var(--border)", paddingLeft: 16, margin: "20px 0" }}>
        {String(data.recommendation || "")}
      </p>

      {/* Doors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ padding: 18, borderRadius: "var(--radius)", background: "var(--surface)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--grow)", marginBottom: 10 }}>DOORS OPENED</p>
          {doors.map((d, i) => <p key={i} style={{ fontSize: ".82rem", color: "var(--text)", lineHeight: 1.6 }}>→ {d}</p>)}
        </div>
        <div style={{ padding: 18, borderRadius: "var(--radius)", background: "var(--surface)" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 10 }}>DOORS CLOSED</p>
          {closed.map((d, i) => <p key={i} style={{ fontSize: ".82rem", color: "var(--text-dim)", lineHeight: 1.6, textDecoration: "line-through" }}>✗ {d}</p>)}
        </div>
      </div>

      {data.risk_flag ? (
        <div style={{ padding: "16px 20px", borderRadius: "var(--radius)", background: "var(--danger-dim)", borderLeft: "3px solid var(--danger)", marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--danger)", letterSpacing: ".15em", textTransform: "uppercase" as const, marginBottom: 6 }}>RISK FLAG</p>
          <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.65 }}>{String(data.risk_flag)}</p>
        </div>
      ) : null}

      {data.one_liner ? (
        <p style={{ fontSize: ".92rem", color: "var(--text-bright)", fontStyle: "italic", borderLeft: `2px solid ${verdictColor}`, paddingLeft: 16, marginBottom: 16 }}>
          {String(data.one_liner)}
        </p>
      ) : null}

      <p style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--text-dim)", marginTop: 12 }}>
        {String(data.disclaimer || "AI-generated analysis only. Verify with current sources before making decisions.")}
      </p>
    </div>
  );
}

/* ───── main page ───── */

export default function Home() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [seedQuery, setSeedQuery] = useState("");
  const [executedAt, setExecutedAt] = useState("");
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const runPipeline = async () => {
    if (!query.trim()) return;
    setRateLimitError("");
    setLoading(true);
    setSeedQuery(query);
    setSubmitted(true);
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (res.status === 429) {
      setRateLimitError("Daily limit reached (3 runs/day). Try again tomorrow.");
      setLoading(false);
      setSubmitted(false);
      return;
    }

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6));

          if (event.type === "agent_start") {
            setAgentStates((prev) => {
              const next = [...prev];
              next[event.agentId - 1] = { status: "running", data: null, streamText: "" };
              return next;
            });
          }

          if (event.type === "agent_text") {
            setAgentStates((prev) => {
              const next = [...prev];
              const current = next[event.agentId - 1];
              next[event.agentId - 1] = { ...current, streamText: current.streamText + event.chunk };
              return next;
            });
          }

          if (event.type === "agent_complete") {
            setAgentStates((prev) => {
              const next = [...prev];
              next[event.agentId - 1] = { ...next[event.agentId - 1], status: "complete", data: event.data };
              return next;
            });
          }

          if (event.type === "pipeline_complete") {
            setExecutedAt(new Date(event.executedAt).toLocaleDateString("en-AU", {
              year: "numeric", month: "long", day: "numeric",
            }));
            setLoading(false);
          }
        } catch { /* skip malformed events */ }
      }
    }
  };

  const handleEmailSubmit = async () => {
    if (!captureEmail.trim() || !captureEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");

    // Collect completed agent outputs to include in the email
    const briefingText = agentStates
      .map((s, i) => {
        if (s.status !== "complete") return null;
        const name = AGENTS[i]?.name ?? `Agent ${i + 1}`;
        const text = s.streamText?.trim();
        return text ? `=== ${name} ===\n${text}` : null;
      })
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: captureEmail, query: seedQuery, optIn, briefingText }),
      });
      if (res.ok) {
        setEmailSent(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setEmailError(body.error === "Email service not configured"
          ? "Email service not configured. Please contact the site owner."
          : "Something went wrong. Please try again.");
      }
    } catch {
      setEmailError("Network error. Please try again.");
    }
  };

  const pipelineDone = !loading && agentStates.some((s) => s.status === "complete");

  const runningAgentIdx = agentStates.findIndex((s) => s.status === "running");

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px" }}>

        {/* ─── Header ─── */}
        <header style={{ padding: "64px 0 40px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", letterSpacing: ".18em", textTransform: "uppercase" as const, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, animation: "fadeUp .6s .2s both" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)", animation: "pulse 2s infinite", display: "inline-block" }} />
            7-Agent Pipeline Output
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, color: "var(--text-bright)", letterSpacing: "-.02em", lineHeight: 1.15, marginBottom: 12, animation: "fadeUp .6s .35s both" }}>
            Subject Decision Briefing
          </h1>
          <div style={{ padding: "16px 20px", borderRadius: "var(--radius)", background: "var(--warn-dim)", borderLeft: "3px solid var(--warn)", fontSize: ".82rem", color: "var(--text)", lineHeight: 1.65, animation: "fadeUp .6s .5s both" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--warn)", letterSpacing: ".1em", textTransform: "uppercase" as const, marginBottom: 6, fontWeight: 700 }}>⚠ What this tool actually is</p>
            <p>Seven Claude AI agents reasoning sequentially about your query. No live data. No real job boards. No verified statistics. Training data cutoff early 2025. Treat this as a rough signal, not a source of truth.</p>
          </div>
        </header>

        {/* ─── Input ─── */}
        {!submitted && (
          <div style={{ padding: "40px 0", animation: "fadeUp .5s .6s both" }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontFamily: "var(--mono)", fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase" as const, color: "var(--text-dim)", marginBottom: 8 }}>
                Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                placeholder="e.g. Is data science worth it in 2028"
                style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 18px", color: "var(--text-bright)", fontFamily: "var(--sans)", fontSize: ".9rem", outline: "none" }}
              />
            </div>
            {rateLimitError && <p style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--danger)", marginBottom: 12 }}>{rateLimitError}</p>}

            <button
              onClick={runPipeline}
              disabled={!query.trim()}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: "var(--radius)",
                border: "1px solid var(--accent)",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                fontFamily: "var(--mono)",
                fontSize: ".82rem",
                letterSpacing: ".12em",
                cursor: query.trim() ? "pointer" : "not-allowed",
                opacity: query.trim() ? 1 : 0.3,
                transition: "all .3s ease",
              }}
            >
              RUN PIPELINE →
            </button>
          </div>
        )}

        {/* ─── Pipeline Running ─── */}
        {submitted && (
          <>
            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--text-dim)" }}>
              <span>
                query: <span style={{ color: "var(--text)" }}>&apos;{seedQuery}&apos;</span>
              </span>
              <span>
                {loading ? (
                  <span style={{ color: "var(--warn)" }}>running agent {runningAgentIdx + 1}/{AGENTS.length}...</span>
                ) : executedAt ? (
                  <span>completed {executedAt}</span>
                ) : null}
              </span>
            </div>

            {/* Pipeline visualization */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 0 32px", overflowX: "auto", borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
              {AGENTS.map((agent, i) => (
                <div key={agent.id} style={{ display: "contents" }}>
                  <PipelineNode agent={agent} status={agentStates[i].status} />
                  {i < AGENTS.length - 1 && (
                    <PipelineConnector active={agentStates[i].status === "complete"} />
                  )}
                </div>
              ))}
            </div>

            {/* Agent cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
              {AGENTS.map((agent) => {
                const state = agentStates[agent.id - 1];
                if (state.status === "idle") return null;
                return (
                  <AgentCard
                    key={agent.id}
                    agentId={agent.id}
                    data={state.data}
                    streamText={state.streamText}
                    status={state.status}
                  />
                );
              })}
            </div>

            {/* Reset */}
            {!loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, paddingTop: 8 }}>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setQuery("");
                    setShowEmailForm(false);
                    setEmailSent(false);
                    setCaptureEmail("");
                    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--mono)",
                    fontSize: ".72rem",
                    color: "var(--text-dim)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase" as const,
                    cursor: "pointer",
                    padding: "12px 0",
                  }}
                >
                  ← new query
                </button>
              </div>
            )}

            {/* Download CTA */}
            {pipelineDone && submitted && !showEmailForm && !emailSent && (
              <div style={{
                padding: "32px 36px",
                borderRadius: "var(--radius)",
                background: "var(--surface-raised)",
                border: "1px solid var(--border-accent)",
                borderLeft: "4px solid var(--accent)",
                marginBottom: 32,
                animation: "fadeUp .5s both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: "1.2rem" }}>📩</span>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-bright)", margin: 0 }}>
                    Get this briefing as a PDF
                  </h3>
                </div>
                <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.6, marginBottom: 20 }}>
                  We&apos;ll send you a clean PDF of this career briefing — so you can reference it offline when making your decision.
                </p>
                <button
                  onClick={() => setShowEmailForm(true)}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--accent)",
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    fontFamily: "var(--mono)",
                    fontSize: ".8rem",
                    letterSpacing: ".08em",
                    cursor: "pointer",
                    transition: "all .3s ease",
                  }}
                >
                  SEND ME THE PDF →
                </button>
              </div>
            )}

            {/* Email Form */}
            {showEmailForm && !emailSent && (
              <div style={{
                padding: "32px 36px",
                borderRadius: "var(--radius)",
                background: "var(--surface-raised)",
                border: "1px solid var(--border-accent)",
                borderLeft: "4px solid var(--accent)",
                marginBottom: 32,
                animation: "fadeUp .4s both",
              }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: 20 }}>
                  Where should we send the PDF?
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <input
                    type="email"
                    value={captureEmail}
                    onChange={(e) => setCaptureEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                    placeholder="you@email.com"
                    style={{
                      width: "100%",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "14px 18px",
                      color: "var(--text-bright)",
                      fontFamily: "var(--sans)",
                      fontSize: ".9rem",
                      outline: "none",
                    }}
                  />
                  {emailError && (
                    <p style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--danger)", marginTop: 6 }}>{emailError}</p>
                  )}
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => setOptIn(e.target.checked)}
                    style={{ marginTop: 3, accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: ".78rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                    Also subscribe me to the <strong style={{ color: "var(--text)" }}>AI Watcher</strong> newsletter — weekly signals on how AI is reshaping careers, industries, and hiring. Delivered on LinkedIn. Unsubscribe anytime.
                  </span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={handleEmailSubmit}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "var(--radius)",
                      border: "none",
                      background: "var(--accent)",
                      color: "var(--bg)",
                      fontFamily: "var(--mono)",
                      fontSize: ".8rem",
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      cursor: "pointer",
                    }}
                  >
                    SEND PDF
                  </button>
                  <button
                    onClick={() => setShowEmailForm(false)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      background: "none",
                      color: "var(--text-dim)",
                      fontFamily: "var(--mono)",
                      fontSize: ".72rem",
                      cursor: "pointer",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Email Success */}
            {emailSent && (
              <div style={{
                padding: "28px 32px",
                borderRadius: "var(--radius)",
                background: "rgba(34,197,94,.08)",
                border: "1px solid rgba(34,197,94,.25)",
                borderLeft: "4px solid var(--grow)",
                marginBottom: 32,
                animation: "fadeUp .4s both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: "1.1rem" }}>✓</span>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--grow)", margin: 0 }}>
                    PDF on its way
                  </h3>
                </div>
                <p style={{ fontSize: ".84rem", color: "var(--text)", lineHeight: 1.6 }}>
                  Check your inbox at <span style={{ fontFamily: "var(--mono)", color: "var(--text-bright)" }}>{captureEmail}</span>.
                  {optIn && (
                    <span> To complete your AI Watcher subscription, <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7384456045533888512" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>follow the newsletter on LinkedIn</a>.</span>
                  )}
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer style={{ padding: "36px 0 48px", fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--text-dim)", textAlign: "center", lineHeight: 1.7, letterSpacing: ".02em", borderTop: "1px solid var(--border)" }}>
          Pipeline executed in 6 stages. This briefing is AI-estimated — verify with current sources before making decisions.
        </footer>
      </div>
    </main>
  );
}
