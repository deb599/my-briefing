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

/* ── Tag Chip ── */
function TagChip({ text, color = "gray" }: { text: string; color?: "yellow" | "green" | "red" | "orange" | "gray" | "blue" }) {
  const colors: Record<string, { bg: string; border: string; fg: string }> = {
    yellow: { bg: "rgba(255,214,10,.08)", border: "rgba(255,214,10,.2)", fg: "#ffd60a" },
    green:  { bg: "rgba(52,211,153,.08)", border: "rgba(52,211,153,.2)", fg: "#34d399" },
    red:    { bg: "rgba(239,68,68,.08)",  border: "rgba(239,68,68,.2)",  fg: "#ef4444" },
    orange: { bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.2)", fg: "#f59e0b" },
    gray:   { bg: "rgba(156,163,175,.06)",border: "rgba(156,163,175,.15)",fg: "#9ca3af" },
    blue:   { bg: "rgba(96,165,250,.08)", border: "rgba(96,165,250,.2)", fg: "#60a5fa" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: ".65rem",
      background: c.bg, border: `1px solid ${c.border}`, color: c.fg,
      padding: "4px 10px", borderRadius: 4, margin: "0 6px 6px 0" }}>
      {text}
    </span>
  );
}

function ChipRow({ items, color = "gray" }: { items: string[]; color?: "yellow" | "green" | "red" | "orange" | "gray" | "blue" }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginTop: 8 }}>
      {items.map((item, i) => <TagChip key={i} text={item} color={color} />)}
    </div>
  );
}

function renderAgent1(data: Record<string, any>) {
  const sentimentColor = (data.score || 0) > 6 ? "green" : (data.score || 0) > 3 ? "orange" : "red";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <Badge text={data.sentiment_label || "Mixed"} color={sentimentColor as any} />
        {data.concern_level && <Badge text={`Risk: ${data.concern_level}`} color={data.concern_level === "high" ? "red" : data.concern_level === "medium" ? "orange" : "gray"} />}
      </div>
      <ScoreBar value={data.score || 0} label="Score" />
      {data.top_themes?.length > 0 && (
        <>
          <SectionLabel text="What people talk about" />
          <ChipRow items={data.top_themes} color="blue" />
        </>
      )}
      {data.key_quote && (
        <p style={{ fontSize: ".78rem", color: "#6b7280", fontStyle: "italic", margin: "10px 0 0", borderLeft: "2px solid #2a2a2c", paddingLeft: 12 }}>
          &ldquo;{data.key_quote}&rdquo;
        </p>
      )}
    </>
  );
}

function renderAgent2(data: Record<string, any>) {
  const salary = data.salary_range || {};
  const salaryText = salary.min && salary.max
    ? `$${Number(salary.min).toLocaleString()} – $${Number(salary.max).toLocaleString()}`
    : null;
  const trendColor = data.hiring_trend === "surging" || data.hiring_trend === "growing" ? "green"
    : data.hiring_trend === "declining" ? "red" : "orange";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <Badge text={data.demand_level || "medium"} color={data.demand_level === "very_high" || data.demand_level === "high" ? "green" : "orange"} />
        <Badge text={data.hiring_trend || "stable"} color={trendColor as any} />
      </div>
      <ScoreBar value={data.demand_score || 0} label="Demand" />
      {salaryText && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 700, color: "#ffd60a" }}>{salaryText}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "#6b7280", textTransform: "uppercase" }}>AUD/yr</span>
        </div>
      )}
      {data.top_roles?.length > 0 && (
        <>
          <SectionLabel text="Roles hiring now" />
          <ChipRow items={data.top_roles} color="yellow" />
        </>
      )}
      {data.top_industries?.length > 0 && (
        <>
          <SectionLabel text="Top industries" />
          <ChipRow items={data.top_industries} color="gray" />
        </>
      )}
    </>
  );
}

function renderAgent3(data: Record<string, any>) {
  return (
    <>
      {(data.top_career_paths || []).map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "#0a0a0b", borderRadius: 6, marginBottom: 6,
          border: "1px solid #1e1e20" }}>
          <div>
            <span style={{ fontSize: ".88rem", fontWeight: 600, color: "white" }}>{p.title}</span>
            <span style={{ fontSize: ".72rem", color: "#6b7280", marginLeft: 10 }}>{p.years_to_reach}</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".85rem", fontWeight: 700, color: "#ffd60a" }}>
            ${Number(p.avg_salary_aud || 0).toLocaleString()}
          </span>
        </div>
      ))}
      {data.entry_point && (
        <div style={{ marginTop: 8 }}>
          <Badge text={`Start: ${data.entry_point}`} color="yellow" />
        </div>
      )}
      {data.transferable_skills?.length > 0 && (
        <>
          <SectionLabel text="Skills you'd gain that transfer anywhere" />
          <ChipRow items={data.transferable_skills} color="blue" />
        </>
      )}
    </>
  );
}

function renderAgent4(data: Record<string, any>) {
  const riskColor = data.ai_disruption_risk === "high" ? "red" : data.ai_disruption_risk === "medium" ? "orange" : "green";
  const outlookColor = data.five_year_outlook === "optimistic" ? "green" : data.five_year_outlook === "cautious" ? "orange" : "gray";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <Badge text={data.growth_trajectory || "stable"} color="blue" />
        <Badge text={`AI risk: ${data.ai_disruption_risk || "medium"}`} color={riskColor as any} />
        <Badge text={`5yr: ${data.five_year_outlook || "neutral"}`} color={outlookColor as any} />
      </div>
      <ScoreBar value={data.trajectory_score || 0} label="Growth" />
      {data.safe_bets?.length > 0 && (
        <>
          <SectionLabel text="Safe bets within this field" />
          <ChipRow items={data.safe_bets} color="green" />
        </>
      )}
      {data.wildcard_risk && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(239,68,68,.06)",
          border: "1px solid rgba(239,68,68,.15)", borderRadius: 6 }}>
          <span style={{ fontSize: ".72rem", color: "#ef4444", fontFamily: "var(--font-mono)",
            textTransform: "uppercase", letterSpacing: ".08em" }}>Wildcard </span>
          <span style={{ fontSize: ".8rem", color: "#d1d5db" }}>{data.wildcard_risk}</span>
        </div>
      )}
    </>
  );
}

function renderAgent5(data: Record<string, any>) {
  const severityColor = (s: string) => s === "critical" ? "red" : s === "high" ? "orange" : s === "medium" ? "yellow" : "gray";
  return (
    <>
      {(data.bottlenecks || []).slice(0, 4).map((b: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10,
          padding: "8px 12px", background: "#0a0a0b", borderRadius: 6, marginBottom: 6,
          border: "1px solid #1e1e20" }}>
          <Badge text={b.severity || "medium"} color={severityColor(b.severity) as any} />
          <div>
            <span style={{ fontSize: ".84rem", fontWeight: 600, color: "white" }}>{b.issue}</span>
            {b.who_it_hits && (
              <span style={{ fontSize: ".68rem", color: "#6b7280", marginLeft: 8 }}>Hits: {b.who_it_hits}</span>
            )}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        {data.ai_noise_factor && <Badge text={`AI hype confusion: ${data.ai_noise_factor}`} color={data.ai_noise_factor === "high" ? "red" : "orange"} />}
        {data.skill_atrophy_risk && <Badge text={`Skills becoming obsolete: ${data.skill_atrophy_risk}`} color={data.skill_atrophy_risk === "high" ? "red" : "orange"} />}
      </div>
      {data.silver_lining && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(52,211,153,.06)",
          border: "1px solid rgba(52,211,153,.15)", borderRadius: 6 }}>
          <span style={{ fontSize: ".72rem", color: "#34d399", fontFamily: "var(--font-mono)",
            textTransform: "uppercase", letterSpacing: ".08em" }}>Upside </span>
          <span style={{ fontSize: ".8rem", color: "#d1d5db" }}>{data.silver_lining}</span>
        </div>
      )}
    </>
  );
}

function renderAgent6(data: Record<string, any>) {
  const verdictColor: Record<string, string> = { go: "#34d399", caution: "#f59e0b", avoid: "#ef4444" };
  const verdictBg: Record<string, string> = { go: "rgba(52,211,153,.1)", caution: "rgba(245,158,11,.1)", avoid: "rgba(239,68,68,.1)" };
  const color = verdictColor[data.verdict] || "#f59e0b";
  const bg = verdictBg[data.verdict] || "rgba(245,158,11,.1)";
  const fitScore = data.fit_score || 0;
  const fitColor = fitScore >= 8 ? "#34d399" : fitScore >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <>
      {/* Fit Score — big and prominent */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          padding: "12px 20px", background: "#0a0a0b", borderRadius: 10,
          border: `2px solid ${fitColor}`, minWidth: 80 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 900, color: fitColor }}>
            {fitScore}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: ".55rem", color: "#6b7280",
            textTransform: "uppercase", letterSpacing: ".1em" }}>
            out of 10
          </span>
        </div>
        <div>
          <Badge text={data.fit_label || "N/A"} color={fitScore >= 8 ? "green" : fitScore >= 5 ? "orange" : "red"} />
          <p style={{ fontSize: ".9rem", color: "#d1d5db", fontWeight: 500, margin: "6px 0 0", lineHeight: 1.5 }}>
            {data.one_liner || ""}
          </p>
        </div>
      </div>

      {/* Verdict banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px",
        background: bg, borderRadius: 6, marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 800,
          color, textTransform: "uppercase", letterSpacing: ".08em" }}>
          {data.verdict || "N/A"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
        {data.doors_opened?.length > 0 && (
          <div style={{ flex: 1 }}>
            <SectionLabel text="Opens doors to" />
            <ChipRow items={data.doors_opened} color="green" />
          </div>
        )}
        {data.doors_closed?.length > 0 && (
          <div style={{ flex: 1 }}>
            <SectionLabel text="Limits" />
            <ChipRow items={data.doors_closed} color="red" />
          </div>
        )}
      </div>
      {data.risk_flag && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(239,68,68,.06)",
          border: "1px solid rgba(239,68,68,.15)", borderRadius: 6 }}>
          <span style={{ fontSize: ".72rem", color: "#ef4444", fontFamily: "var(--font-mono)",
            textTransform: "uppercase", letterSpacing: ".08em" }}>Key risk </span>
          <span style={{ fontSize: ".8rem", color: "#d1d5db" }}>{data.risk_flag}</span>
        </div>
      )}
      {/* Confidence — subtle, at the bottom */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".58rem", color: "#4b5563",
          textTransform: "uppercase", letterSpacing: ".08em" }}>
          Analysis confidence: {data.confidence_score || 0}/10
        </span>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   AGENT DESCRIPTIONS & DETAIL HELPERS
───────────────────────────────────────── */

const AGENT_DESCRIPTIONS: Record<number, string> = {
  1: "What people actually think about this field",
  2: "Demand, salaries & who's hiring",
  3: "Where this path leads and how long it takes",
  4: "Will this field still matter in 5 years?",
  5: "Where AI creates problems for this career",
  6: "The bottom line — should you do it?",
};

function getDetailText(agentId: number, data: Record<string, any>): string | null {
  if (!data) return null;
  switch (agentId) {
    case 1: return data.summary || data.data_caveat || null;
    case 2: return data.demand_score_note || (data.data_gaps?.length ? `Data gaps: ${data.data_gaps.join(", ")}` : null);
    case 3: return data.path_caveats || null;
    case 4: return data.ai_risk_detail || data.trajectory_note || null;
    case 5: return data.ai_noise_detail || data.skill_atrophy_detail || data.data_caveat || null;
    case 6: return data.recommendation || data.confidence_note || null;
    default: return null;
  }
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
  const [expanded, setExpanded] = useState(false);
  const isRunning = status === "running";
  const isDone = status === "complete";
  const isFinal = agentId === 6;
  const detailText = isDone && data ? getDetailText(agentId, data) : null;

  return (
    <div style={{
      borderRadius: 10,
      background: "#111113",
      padding: "20px 24px",
      marginBottom: 12,
      borderLeft: `3px solid ${isDone ? (isFinal ? "#ffd60a" : "#2a2a2c") : isRunning ? "#f59e0b" : "#1e1e20"}`,
    }}>
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "#4b5563" }}>
          {String(agentId).padStart(2, "0")}
        </span>
        <span style={{ fontSize: ".9rem", fontWeight: 600, color: isDone ? "white" : "#6b7280" }}>
          {AGENTS[agentId - 1]?.name}
        </span>
      </div>
      {/* One-line description */}
      <p style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem", color: "#4b5563",
        margin: "0 0 12px", paddingLeft: 28 }}>
        {AGENT_DESCRIPTIONS[agentId]}
      </p>

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

          {/* Expandable detail */}
          {detailText && (
            <div style={{ marginTop: 12, borderTop: "1px solid #1e1e20", paddingTop: 10 }}>
              <button onClick={() => setExpanded(e => !e)}
                style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem",
                  color: "#4b5563", background: "none", border: "none",
                  cursor: "pointer", padding: 0, letterSpacing: ".06em" }}>
                {expanded ? "▼ Hide detail" : "▶ What does this mean?"}
              </button>
              {expanded && (
                <p style={{ fontSize: ".8rem", color: "#9ca3af", lineHeight: 1.7,
                  margin: "8px 0 0", paddingLeft: 2 }}>
                  {detailText}
                </p>
              )}
            </div>
          )}
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
                The wrong degree costs{" "}
                <span style={{ color: "#ffd60a" }}>4 years you can't get back.</span>
                <br />This takes 2 minutes.
              </h1>
              <p style={{ fontSize: "1rem", color: "#9ca3af", lineHeight: 1.7,
                maxWidth: 540, margin: "0 auto" }}>
                Choosing a degree shouldn't feel like guessing.
                My Briefing runs <strong style={{ color: "white" }}>6 AI agents</strong> across
                any uni pathway so high school students know what they're getting into before they commit.
              </p>
            </div>

            {/* Value props */}
            <div style={{ display: "flex", justifyContent: "center", gap: 40,
              marginBottom: 48, flexWrap: "wrap" }}>
              {[
                { stat: "6", label: "specialist agents" },
                { stat: "1", label: "honest briefing" },
                { stat: "<2 min", label: "full analysis" },
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

            {/* Main input card */}
            <div style={{ background: "#111113", border: "1px solid #2a2a2c",
              borderRadius: 12, padding: "24px 28px" }}>

              {/* BYOK section — at the top */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #1e1e20" }}>
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

              {/* Query input */}
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

            </div>

            {/* Coming Soon — feature teasers */}
            <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 280px", padding: "28px 28px", background: "#111113",
                border: "1px solid rgba(255,214,10,.15)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>🧬</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>
                    Career DNA Personalisation
                  </span>
                </div>
                <p style={{ fontSize: ".85rem", color: "#9ca3af", margin: "0 0 14px", lineHeight: 1.6 }}>
                  Get briefings tailored to your interests, strengths, and deal-breakers — not generic advice.
                </p>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                  color: "#ffd60a", background: "rgba(255,214,10,.1)",
                  border: "1px solid rgba(255,214,10,.25)",
                  padding: "5px 14px", borderRadius: 4, fontWeight: 700 }}>
                  COMING SOON
                </span>
              </div>

              <div style={{ flex: "1 1 280px", padding: "28px 28px", background: "#111113",
                border: "1px solid rgba(255,214,10,.15)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.2rem" }}>⚖️</span>
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>
                    Compare Career Paths
                  </span>
                </div>
                <p style={{ fontSize: ".85rem", color: "#9ca3af", margin: "0 0 14px", lineHeight: 1.6 }}>
                  Run briefings on multiple options side by side — CS vs Engineering vs Business — and see which fits best.
                </p>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: ".65rem",
                  color: "#ffd60a", background: "rgba(255,214,10,.1)",
                  border: "1px solid rgba(255,214,10,.25)",
                  padding: "5px 14px", borderRadius: 4, fontWeight: 700 }}>
                  COMING SOON
                </span>
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

                {/* Feedback CTA */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e1e20",
                  background: "#0f0f11", borderRadius: 8, padding: 20, textAlign: "center" as const }}>
                  <p style={{ fontSize: ".82rem", color: "#9ca3af", margin: "0 0 14px", lineHeight: 1.6 }}>
                    Early demo — send feedback to <a href="mailto:info@ba-co-pilot.com?subject=My%20Briefing%20Feedback%20%2B%20Send%20Career%20DNA%20Prompt&body=What%20worked%3A%20%0AWhat%20didn't%3A%20%0AWhat%20I'd%20want%20next%3A%20" style={{ color: "#ffd60a", textDecoration: "underline" }}>info@ba-co-pilot.com</a> and get <strong style={{ color: "#d1d5db" }}>The Career DNA Interviewer</strong> free — an AI prompt that asks 50 deep questions to uncover what career actually fits you.
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
