"use client";

import { useState, useRef, useEffect } from "react";

const AGENTS = [
  { id: 1, name: "Sentiment Listener" },
  { id: 2, name: "Job Market Scanner" },
  { id: 3, name: "Career Path Mapper" },
  { id: 4, name: "Future-Proofing Checker" },
  { id: 5, name: "Decision Brief" },
];

type AgentStatus = "idle" | "running" | "complete" | "error";

interface AgentState {
  status: AgentStatus;
  data: Record<string, unknown> | null;
  streamText: string;
}

function CaveatBadge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-yellow-900/40 border border-yellow-700/50 text-yellow-500 text-xs font-mono px-2 py-0.5 rounded">
      ⚠ {text}
    </span>
  );
}

function UncertainScore({ value, note }: { value: number; note?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs font-mono">score:</span>
        <span className="text-white font-mono font-bold">{value}/10</span>
        <span className="text-gray-600 text-xs">
          [{Array.from({ length: 10 }, (_, i) => (i < value ? "█" : "░")).join("")}]
        </span>
      </div>
      {note && <p className="text-yellow-600 text-xs font-mono">note: {note}</p>}
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
    <div className="mt-3">
      <p className="text-gray-600 text-xs font-mono mb-1 uppercase tracking-widest">
        {active ? "▶ raw output (streaming...)" : "▶ raw output"}
      </p>
      <div
        ref={ref}
        className="bg-black border border-gray-800 rounded p-3 max-h-48 overflow-y-auto text-xs font-mono text-gray-500 whitespace-pre-wrap leading-relaxed"
      >
        {text}
        {active && <span className="text-teal-400 animate-pulse">▌</span>}
      </div>
    </div>
  );
}

function AgentCard({ agentId, data, streamText, status }: {
  agentId: number;
  data: Record<string, unknown> | null;
  streamText: string;
  status: AgentStatus;
}) {
  const isRunning = status === "running";
  const isDone = status === "complete";

  const borderColor = isRunning
    ? "border-yellow-700"
    : isDone
    ? "border-gray-700"
    : "border-gray-800";

  return (
    <div className={`border ${borderColor} rounded bg-[#0d0d0d] p-5 space-y-4 transition-colors`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-mono text-xs">AGENT_{String(agentId).padStart(2, "0")}</span>
          <span className="text-white font-mono text-sm font-bold">{AGENTS[agentId - 1].name}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 border rounded ${
          isRunning
            ? "border-yellow-700 text-yellow-600 animate-pulse"
            : isDone
            ? "border-gray-700 text-gray-500"
            : "border-gray-800 text-gray-700"
        }`}>
          {isRunning ? "RUNNING" : isDone ? "DONE" : "IDLE"}
        </span>
      </div>

      {/* Streaming raw output */}
      <StreamingLog text={streamText} active={isRunning} />

      {/* Parsed results */}
      {isDone && data && (
        <div className="space-y-4 border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs font-mono uppercase tracking-widest">parsed output</span>
            <CaveatBadge text="AI-estimated, not live data" />
          </div>

          {agentId === 1 && (
            <div className="space-y-3">
              <UncertainScore
                value={Number(data.score) || 0}
                note={String(data.score_confidence || "")}
              />
              <p className="text-gray-400 text-sm leading-relaxed border-l border-gray-700 pl-3">
                {String(data.summary || "")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(data.top_themes as string[] || []).map((t, i) => (
                  <span key={i} className="text-xs font-mono text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
              {data.data_caveat ? (
                <p className="text-yellow-700 text-xs font-mono border border-yellow-900/50 rounded p-2 bg-yellow-900/10">
                  CAVEAT: {String(data.data_caveat)}
                </p>
              ) : null}
              {data.key_quote ? (
                <p className="text-gray-600 text-sm italic border-l border-gray-700 pl-3">
                  &ldquo;{String(data.key_quote)}&rdquo;
                </p>
              ) : null}
            </div>
          )}

          {agentId === 2 && (
            <div className="space-y-3">
              <UncertainScore
                value={Number(data.demand_score) || 0}
                note={String(data.demand_score_note || "")}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-mono text-xs mb-2 uppercase">Top Roles</p>
                  <ul className="space-y-1">
                    {(data.top_roles as string[] || []).map((r, i) => (
                      <li key={i} className="text-gray-400 text-xs font-mono">
                        <span className="text-gray-600">→ </span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-600 font-mono text-xs mb-2 uppercase">Industries</p>
                  <ul className="space-y-1">
                    {(data.top_industries as string[] || []).map((ind, i) => (
                      <li key={i} className="text-gray-400 text-xs font-mono">
                        <span className="text-gray-600">→ </span>{ind}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {data.salary_range ? (
                <div className="border border-gray-800 rounded p-2 text-xs font-mono">
                  <span className="text-gray-600">salary est: </span>
                  <span className="text-white">
                    AU${((data.salary_range as Record<string, number>).min / 1000).toFixed(0)}K–
                    AU${((data.salary_range as Record<string, number>).max / 1000).toFixed(0)}K
                  </span>
                  <span className="text-yellow-700 ml-2">
                    ({(data.salary_range as Record<string, unknown>).note as string || "estimate only"})
                  </span>
                </div>
              ) : null}
              <p className="text-gray-500 text-xs font-mono">
                vol: {String(data.job_volume_estimate || "unknown")} · trend: {String(data.hiring_trend || "unknown")}
              </p>
              {(data.data_gaps as string[] || []).length > 0 && (
                <div className="border border-yellow-900/40 rounded p-2 bg-yellow-900/5">
                  <p className="text-yellow-700 text-xs font-mono mb-1">DATA GAPS:</p>
                  {(data.data_gaps as string[]).map((g, i) => (
                    <p key={i} className="text-yellow-800 text-xs font-mono">— {g}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {agentId === 3 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(data.recommended_combinations as string[] || []).map((c, i) => (
                  <span key={i} className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-0.5 rounded">
                    {c}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {(data.top_career_paths as Array<Record<string, unknown>> || []).map((p, i) => (
                  <div key={i} className="border border-gray-800 rounded px-3 py-2 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{String(p.title)}</span>
                      <div className="text-right">
                        <span className="text-gray-400">
                          AU${(Number(p.avg_salary_aud) / 1000).toFixed(0)}K · {String(p.years_to_reach)}
                        </span>
                        <span className="text-yellow-800 ml-2">
                          [{String(p.salary_certainty || "?")} certainty]
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {data.entry_point ? (
                <p className="text-gray-400 text-xs font-mono border-l border-gray-700 pl-2">
                  entry: {String(data.entry_point)}
                </p>
              ) : null}
              {data.path_caveats ? (
                <p className="text-yellow-700 text-xs font-mono border border-yellow-900/50 rounded p-2 bg-yellow-900/10">
                  CAVEAT: {String(data.path_caveats)}
                </p>
              ) : null}
            </div>
          )}

          {agentId === 4 && (
            <div className="space-y-3">
              <UncertainScore
                value={Number(data.trajectory_score) || 0}
                note={String(data.trajectory_note || "")}
              />
              <div className="text-xs font-mono space-y-1">
                <p>
                  <span className="text-gray-600">trajectory: </span>
                  <span className="text-gray-300">{String(data.growth_trajectory || "")}</span>
                </p>
                <p>
                  <span className="text-gray-600">ai_disruption: </span>
                  <span className={
                    data.ai_disruption_risk === "high" ? "text-red-500" :
                    data.ai_disruption_risk === "medium" ? "text-yellow-500" :
                    "text-gray-300"
                  }>{String(data.ai_disruption_risk || "")}</span>
                </p>
                <p>
                  <span className="text-gray-600">5yr_outlook: </span>
                  <span className="text-gray-300">{String(data.five_year_outlook || "")}</span>
                </p>
              </div>
              {data.ai_risk_detail ? (
                <p className="text-gray-500 text-xs border-l border-gray-700 pl-2 leading-relaxed">
                  {String(data.ai_risk_detail)}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-xs font-mono mb-1">SAFE BETS</p>
                  {(data.safe_bets as string[] || []).map((s, i) => (
                    <p key={i} className="text-gray-400 text-xs font-mono">✓ {s}</p>
                  ))}
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-mono mb-1">AVOID</p>
                  {(data.subjects_to_avoid as string[] || []).map((s, i) => (
                    <p key={i} className="text-gray-500 text-xs font-mono line-through">✗ {s}</p>
                  ))}
                </div>
              </div>
              {data.five_year_note ? (
                <p className="text-yellow-700 text-xs font-mono border border-yellow-900/50 rounded p-2 bg-yellow-900/10">
                  FORECAST CAVEAT: {String(data.five_year_note)}
                </p>
              ) : null}
              {data.wildcard_risk ? (
                <p className="text-red-800 text-xs font-mono border border-red-900/30 rounded p-2 bg-red-900/5">
                  WILDCARD: {String(data.wildcard_risk)}
                </p>
              ) : null}
            </div>
          )}

          {agentId === 5 && (
            <div className="space-y-4">
              <div className={`border rounded p-3 text-sm ${
                data.verdict === "go"
                  ? "border-green-900 bg-green-900/10 text-green-400"
                  : data.verdict === "avoid"
                  ? "border-red-900 bg-red-900/10 text-red-400"
                  : "border-yellow-900 bg-yellow-900/10 text-yellow-400"
              }`}>
                <span className="font-mono text-xs uppercase">verdict: </span>
                <span className="font-bold font-mono">{String(data.verdict || "").toUpperCase()}</span>
              </div>
              <UncertainScore
                value={Number(data.confidence_score) || 0}
                note={String(data.confidence_note || "")}
              />
              <p className="text-gray-400 text-sm leading-relaxed border-l border-gray-700 pl-3">
                {String(data.recommendation || "")}
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="text-gray-600 mb-1 uppercase">Opens</p>
                  {(data.doors_opened as string[] || []).map((d, i) => (
                    <p key={i} className="text-gray-400">→ {d}</p>
                  ))}
                </div>
                <div>
                  <p className="text-gray-600 mb-1 uppercase">Closes</p>
                  {(data.doors_closed as string[] || []).map((d, i) => (
                    <p key={i} className="text-gray-500 line-through">✗ {d}</p>
                  ))}
                </div>
              </div>
              {data.risk_flag ? (
                <p className="text-red-600 text-xs font-mono border border-red-900/30 rounded p-2 bg-red-900/5">
                  RISK: {String(data.risk_flag)}
                </p>
              ) : null}
              {data.one_liner ? (
                <p className="text-gray-300 text-sm font-mono border-l-2 border-gray-600 pl-3 italic">
                  {String(data.one_liner)}
                </p>
              ) : null}
              <p className="text-gray-700 text-xs font-mono">
                {String(data.disclaimer || "AI-generated analysis only. Verify with current sources before making decisions.")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [seedQuery, setSeedQuery] = useState("");
  const [executedAt, setExecutedAt] = useState("");
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(() => ({ status: "idle", data: null, streamText: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const runPipeline = async () => {
    if (!query.trim() || !apiKey.trim()) return;
    setAuthError("");
    setLoading(true);
    setSeedQuery(query);
    setSubmitted(true);
    setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, apiKey }),
    });

    if (res.status === 401) {
      setAuthError("Invalid API key. Get yours at console.anthropic.com");
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
              next[event.agentId - 1] = {
                ...current,
                streamText: current.streamText + event.chunk,
              };
              return next;
            });
          }

          if (event.type === "agent_complete") {
            setAgentStates((prev) => {
              const next = [...prev];
              next[event.agentId - 1] = {
                ...next[event.agentId - 1],
                status: "complete",
                data: event.data,
              };
              return next;
            });
          }

          if (event.type === "pipeline_complete") {
            setExecutedAt(new Date(event.executedAt).toLocaleDateString("en-AU", {
              year: "numeric", month: "long", day: "numeric",
            }));
            setLoading(false);
          }
        } catch {}
      }
    }
  };

  const runningAgentIdx = agentStates.findIndex((s) => s.status === "running");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <p className="text-gray-600 text-xs tracking-[0.2em] uppercase mb-2">
            5-agent research pipeline · AI-estimated output
          </p>
          <h1 className="text-2xl font-bold text-white mb-3">Subject Decision Briefing</h1>
          <div className="text-xs text-yellow-700 border border-yellow-900/50 rounded p-3 bg-yellow-900/10 space-y-1">
            <p className="font-bold">⚠ What this tool actually is:</p>
            <p>Five Claude AI agents reasoning sequentially about your query. No live data. No real job boards. No verified statistics. Training data cutoff early 2025.</p>
            <p>Treat this as a rough signal, not a source of truth.</p>
          </div>
        </div>

        {/* Input */}
        {!submitted && (
          <div className="mb-8 space-y-4">
            <div className="space-y-2">
              <label className="text-gray-600 text-xs uppercase tracking-widest block">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-700 font-mono text-sm focus:outline-none focus:border-gray-500 transition-colors"
              />
              <p className="text-gray-700 text-xs font-mono">
                Your key is used directly and never stored.{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 underline hover:text-gray-300"
                >
                  Get a key →
                </a>
              </p>
              {authError && (
                <p className="text-red-500 text-xs font-mono">{authError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-gray-600 text-xs uppercase tracking-widest block">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                placeholder="e.g. Is data science worth it in 2028"
                className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-700 font-mono text-sm focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            <button
              onClick={runPipeline}
              disabled={!query.trim() || !apiKey.trim()}
              className="w-full border border-gray-700 text-gray-300 font-mono py-3 rounded text-sm tracking-widest hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              RUN PIPELINE →
            </button>
          </div>
        )}

        {submitted && (
          <>
            {/* Status bar */}
            <div className="flex justify-between items-center mb-6 text-xs font-mono text-gray-600">
              <span>
                query: <span className="text-gray-400">&apos;{seedQuery}&apos;</span>
              </span>
              <span>
                {loading ? (
                  <span className="text-yellow-600">
                    running agent {runningAgentIdx + 1}/{AGENTS.length}...
                  </span>
                ) : executedAt ? (
                  <span className="text-gray-600">completed {executedAt}</span>
                ) : null}
              </span>
            </div>

            {/* Pipeline status row */}
            <div className="flex items-center gap-2 mb-8 text-xs font-mono overflow-x-auto pb-2">
              {AGENTS.map((agent, i) => {
                const s = agentStates[i].status;
                return (
                  <div key={agent.id} className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        s === "complete" ? "bg-gray-500" :
                        s === "running" ? "bg-yellow-500 animate-pulse" :
                        "bg-gray-800"
                      }`} />
                      <span className={
                        s === "complete" ? "text-gray-500" :
                        s === "running" ? "text-yellow-600" :
                        "text-gray-700"
                      }>
                        {String(agent.id).padStart(2, "0")}_{agent.name.replace(" ", "_")}
                      </span>
                    </div>
                    {i < AGENTS.length - 1 && (
                      <span className="text-gray-800">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agent cards — show all, including idle ones so user sees the full pipeline */}
            <div className="space-y-4">
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
              <button
                onClick={() => {
                  setSubmitted(false);
                  setQuery("");
                  setAgentStates(AGENTS.map(() => ({ status: "idle", data: null, streamText: "" })));
                }}
                className="mt-8 text-gray-700 text-xs font-mono hover:text-gray-400 transition-colors tracking-widest uppercase"
              >
                ← new query
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
