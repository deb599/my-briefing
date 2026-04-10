import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple in-memory rate limiter (3 runs per IP per day)
// For production, swap this with Upstash Redis (see README)
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + DAY_MS });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

/* ─── Agent prompts ─── */

function buildPrompt(agentId: number, query: string, previousOutputs: string[]): string {
  const context = previousOutputs.length
    ? `\nPrevious agent outputs for context:\n${previousOutputs.join("\n\n")}\n`
    : "";

  const prompts: Record<number, string> = {
    1: `You are Agent 01 – Sentiment Listener. Analyse the public sentiment and narrative around this career/subject query.
Query: "${query}"
${context}
Respond ONLY with a JSON object (no markdown, no explanation) with these keys:
score (number 0-10), score_confidence (string), summary (string), top_themes (string[]), key_quote (string), data_caveat (string)`,

    2: `You are Agent 02 – Job Market Scanner. Assess the Australian job market for this query.
Query: "${query}"
${context}
Respond ONLY with a JSON object with these keys:
demand_score (number 0-10), demand_score_note (string), top_roles (string[]), top_industries (string[]), salary_range ({min: number, max: number, note: string}), job_volume_estimate (string), hiring_trend (string), data_gaps (string[])`,

    3: `You are Agent 03 – Career Path Mapper. Map realistic career paths for this query in Australia.
Query: "${query}"
${context}
Respond ONLY with a JSON object with these keys:
recommended_combinations (string[]), top_career_paths (Array<{title: string, avg_salary_aud: number, years_to_reach: string, salary_certainty: string}>), transferable_skills (string[]), entry_point (string), path_caveats (string)`,

    4: `You are Agent 04 – Future-Proofing Checker. Assess the long-term viability of this career path against AI and automation.
Query: "${query}"
${context}
Respond ONLY with a JSON object with these keys:
trajectory_score (number 0-10), trajectory_note (string), growth_trajectory (string), ai_disruption_risk (string: "low"|"medium"|"high"), five_year_outlook (string), ai_risk_detail (string), safe_bets (string[]), subjects_to_avoid (string[]), five_year_note (string), wildcard_risk (string)`,

    5: `You are Agent 05 – AI Bottleneck Analyzer. Identify specific AI-driven bottlenecks and friction points in this career field.
Query: "${query}"
${context}
Respond ONLY with a JSON object with these keys:
bottlenecks (Array<{issue: string, severity: string, who_it_hits: string, detail: string}>), pain_points (string[]), ai_noise_factor (string: "low"|"medium"|"high"), ai_noise_detail (string), skill_atrophy_risk (string: "low"|"medium"|"high"), skill_atrophy_detail (string), hiring_impact (string), regulatory_friction (string), silver_lining (string), data_caveat (string)`,

    6: `You are Agent 06 – Final Briefing. Synthesise all previous agent outputs and deliver a final verdict.
Query: "${query}"
${context}
Respond ONLY with a JSON object with these keys:
verdict (string: "go"|"caution"|"avoid"), confidence_score (number 0-10), confidence_note (string), recommendation (string), doors_opened (string[]), doors_closed (string[]), risk_flag (string), one_liner (string), disclaimer (string)`,
  };

  return prompts[agentId] ?? `Analyse: "${query}"`;
}

/* ─── SSE helper ─── */

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/* ─── Route handler ─── */

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Daily limit reached (3 runs/day). Try again tomorrow." },
      { status: 429 }
    );
  }

  const { query } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const previousOutputs: string[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(sseEvent(data)));

      try {
        for (let agentId = 1; agentId <= 6; agentId++) {
          send({ type: "agent_start", agentId });

          const prompt = buildPrompt(agentId, query, previousOutputs);
          let rawText = "";

          const anthropicStream = client.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              rawText += chunk.delta.text;
              send({ type: "agent_text", agentId, chunk: chunk.delta.text });
            }
          }

          // Parse JSON from agent response
          let parsedData: Record<string, unknown> = {};
          try {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
          } catch {
            parsedData = { raw: rawText };
          }

          previousOutputs.push(`Agent ${agentId} output: ${rawText.slice(0, 500)}`);
          send({ type: "agent_complete", agentId, data: parsedData });
        }

        send({ type: "pipeline_complete", executedAt: new Date().toISOString() });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
