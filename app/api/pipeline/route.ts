import Anthropic from "@anthropic-ai/sdk";

interface AgentResult {
  agentId: number;
  agentName: string;
  data: Record<string, unknown>;
}

const UNCERTAINTY_DISCLAIMER = `
CONTEXT: You are an AI analyst with training data up to early 2025. You do not have live data.
RULES — follow these strictly:
1. ALWAYS provide a full answer. Never say "insufficient data" or refuse to extrapolate.
2. If the query is about a future date (2027, 2028, etc), reason forward from known trends — treat it as forecasting, not a knowledge gap.
3. If data is thin, extrapolate from adjacent fields, historical patterns, or first principles. State you are doing so.
4. Use ranges not single numbers where uncertain (e.g. salary: 80K-110K, not 95K).
5. Flag the single biggest uncertainty in one short sentence — do not list everything you don't know.
6. Never hang, never refuse, never say "I cannot determine this." Always give your best reasoned estimate.
`;

function buildPrompt(agentId: number, query: string, context: string): string {
  const prompts: Record<number, string> = {
    1: `${UNCERTAINTY_DISCLAIMER}

You are Agent 1: Sentiment Analysis (AI-estimated, not real-time).
Analyze likely public sentiment around: "${query}"
Note: You cannot access Reddit, forums, or current social media. Base this on patterns in your training data.

Return ONLY valid JSON with uncertainty flags:
{
  "score": <number 0-10>,
  "score_confidence": "<low|medium — note this is AI-estimated>",
  "sentiment_label": "<Very Negative|Negative|Mixed|Positive|Very Positive>",
  "summary": "<2-3 sentence summary — explicitly note this is based on historical patterns, not live data>",
  "top_themes": ["<theme1>", "<theme2>", "<theme3>"],
  "concern_level": "<low|medium|high>",
  "data_caveat": "<one honest sentence about what you cannot know here>",
  "key_quote": "<a representative opinion someone might say>"
}`,

    2: `${UNCERTAINTY_DISCLAIMER}

You are Agent 2: Job Market Analysis (AI-estimated, not live data).
Based on query "${query}" and prior agent data:
${context}

You have no access to live job boards (Seek, LinkedIn, Indeed). All figures are estimates.
Salary data may be 1-2 years out of date. Regional variation not fully captured.

Return ONLY valid JSON:
{
  "demand_level": "<low|medium|high|very_high>",
  "demand_score": <number 0-10>,
  "demand_score_note": "<acknowledge this is AI estimate, not live board data>",
  "top_roles": ["<role1>", "<role2>", "<role3>", "<role4>"],
  "salary_range": { "min": <number AUD>, "max": <number AUD>, "note": "estimate only, may be outdated" },
  "top_industries": ["<industry1>", "<industry2>", "<industry3>"],
  "job_volume_estimate": "<rough estimate with uncertainty, e.g. 'estimated 8,000-15,000 nationally, unverified'>",
  "hiring_trend": "<declining|stable|growing|surging>",
  "data_gaps": ["<gap1 — what you couldn't verify>", "<gap2>"]
}`,

    3: `${UNCERTAINTY_DISCLAIMER}

You are Agent 3: Career Path Analysis (AI-modelled, not verified outcomes).
Map career paths for: "${query}"
Prior context:
${context}

Salary figures are rough estimates. Timeline varies heavily by individual.
Flag where paths depend on factors you cannot predict (economy, AI disruption, individual skill).

Return ONLY valid JSON:
{
  "recommended_combinations": ["<combo1>", "<combo2>", "<combo3>"],
  "top_career_paths": [
    { "title": "<role>", "years_to_reach": "<timeframe>", "avg_salary_aud": <number>, "salary_certainty": "<low|medium>" },
    { "title": "<role>", "years_to_reach": "<timeframe>", "avg_salary_aud": <number>, "salary_certainty": "<low|medium>" },
    { "title": "<role>", "years_to_reach": "<timeframe>", "avg_salary_aud": <number>, "salary_certainty": "<low|medium>" }
  ],
  "transferable_skills": ["<skill1>", "<skill2>", "<skill3>"],
  "entry_point": "<best starting role for someone new>",
  "path_caveats": "<honest note about what makes these paths uncertain>"
}`,

    4: `${UNCERTAINTY_DISCLAIMER}

You are Agent 4: Future-Proofing Assessment (speculative, treat as rough signal only).
Evaluate future viability of: "${query}"
Prior context:
${context}

AI disruption forecasts are highly uncertain. Treat all predictions as directional only.
Be honest about what you cannot predict — regulation, new tech, economic shifts.

Return ONLY valid JSON:
{
  "growth_trajectory": "<declining|stable|growing|rapidly_growing>",
  "trajectory_score": <number 0-10>,
  "trajectory_note": "<acknowledge speculative nature>",
  "ai_disruption_risk": "<low|medium|high>",
  "ai_risk_detail": "<1-2 sentences — what AI will and won't replace, and why this is uncertain>",
  "five_year_outlook": "<optimistic|neutral|cautious>",
  "five_year_note": "<honest caveat about forecast reliability>",
  "subjects_to_avoid": ["<avoid1>", "<avoid2>"],
  "safe_bets": ["<safe1>", "<safe2>", "<safe3>"],
  "wildcard_risk": "<one unexpected risk factor that could invalidate this whole analysis>"
}`,

    5: `${UNCERTAINTY_DISCLAIMER}

You are Agent 5: Decision Summary (synthesised AI opinion, not professional advice).
Compile findings for: "${query}"
All prior agent outputs:
${context}

This is not financial or career advice. Confidence scores reflect AI consistency, not real-world certainty.
Be direct about what the data supports and what it doesn't.

Return ONLY valid JSON:
{
  "recommendation": "<clear 2-sentence recommendation — include key caveat>",
  "confidence_score": <number 0-10>,
  "confidence_note": "<why this score is limited — what the AI couldn't verify>",
  "doors_opened": ["<opportunity1>", "<opportunity2>", "<opportunity3>"],
  "doors_closed": ["<limitation1>", "<limitation2>"],
  "risk_flag": "<the single most important risk — be blunt>",
  "one_liner": "<one direct sentence summing up the verdict, no sugarcoating>",
  "verdict": "<go|caution|avoid>",
  "disclaimer": "AI-generated analysis only. Verify with current sources before making decisions."
}`,

    6: `${UNCERTAINTY_DISCLAIMER}

You are Agent 6: AI Bottleneck Analyzer (speculative, based on training data patterns).
Identify the specific bottlenecks, pain points, and friction that AI is creating in the field related to: "${query}"
Prior context:
${context}

Think about: job displacement pressure, skill obsolescence, tooling churn, trust gaps, regulatory uncertainty,
over-reliance on AI leading to skill atrophy, AI-generated noise flooding the field, hiring filter changes,
credential devaluation, and any emerging friction between human practitioners and AI systems.

Return ONLY valid JSON:
{
  "bottlenecks": [
    { "issue": "<short title>", "severity": "<critical|high|medium|low>", "detail": "<1-2 sentence explanation>", "who_it_hits": "<entry-level|mid-career|senior|everyone>" },
    { "issue": "<short title>", "severity": "<critical|high|medium|low>", "detail": "<1-2 sentence explanation>", "who_it_hits": "<entry-level|mid-career|senior|everyone>" },
    { "issue": "<short title>", "severity": "<critical|high|medium|low>", "detail": "<1-2 sentence explanation>", "who_it_hits": "<entry-level|mid-career|senior|everyone>" },
    { "issue": "<short title>", "severity": "<critical|high|medium|low>", "detail": "<1-2 sentence explanation>", "who_it_hits": "<entry-level|mid-career|senior|everyone>" },
    { "issue": "<short title>", "severity": "<critical|high|medium|low>", "detail": "<1-2 sentence explanation>", "who_it_hits": "<entry-level|mid-career|senior|everyone>" }
  ],
  "pain_points": [
    "<specific pain point practitioners are experiencing because of AI — be concrete, not vague>",
    "<specific pain point>",
    "<specific pain point>"
  ],
  "ai_noise_factor": "<low|medium|high — how much AI-generated noise is flooding this field (e.g. AI-written applications, AI-generated content, AI slop)>",
  "ai_noise_detail": "<1-2 sentences on how AI noise specifically affects this field>",
  "skill_atrophy_risk": "<low|medium|high — risk that reliance on AI tools causes practitioners to lose core skills>",
  "skill_atrophy_detail": "<1-2 sentences explaining which skills are at risk of atrophy>",
  "hiring_impact": "<how AI is changing hiring filters, interview processes, or credential requirements in this field>",
  "regulatory_friction": "<any regulatory uncertainty or compliance bottlenecks AI is creating>",
  "silver_lining": "<one genuine opportunity that these AI bottlenecks create for savvy practitioners>",
  "data_caveat": "<honest note about speculation level>"
}`,

    7: `${UNCERTAINTY_DISCLAIMER}

You are Agent 7: Final Briefing (synthesised AI opinion, not professional advice). (synthesised AI opinion, not professional advice).
Compile findings for: "${query}"
All prior agent outputs:
${context}

This is not financial or career advice. Confidence scores reflect AI consistency, not real-world certainty.
Be direct about what the data supports and what it doesn't.
Pay special attention to the AI bottleneck analysis — factor those pain points into your recommendation.

Return ONLY valid JSON:
{
  "recommendation": "<clear 2-sentence recommendation — include key caveat>",
  "confidence_score": <number 0-10>,
  "confidence_note": "<why this score is limited — what the AI couldn't verify>",
  "doors_opened": ["<opportunity1>", "<opportunity2>", "<opportunity3>"],
  "doors_closed": ["<limitation1>", "<limitation2>"],
  "risk_flag": "<the single most important risk — be blunt>",
  "one_liner": "<one direct sentence summing up the verdict, no sugarcoating>",
  "verdict": "<go|caution|avoid>",
  "disclaimer": "AI-generated analysis only. Verify with current sources before making decisions."
}`,
  };
  return prompts[agentId];
}

export async function POST(req: Request) {
  const { query, apiKey } = await req.json();

  if (!query || typeof query !== "string") {
    return new Response("Missing query", { status: 400 });
  }

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-ant-")) {
    return new Response("Invalid or missing Anthropic API key", { status: 401 });
  }

  const client = new Anthropic({ apiKey });

  const agents = [
    { id: 1, name: "Sentiment Listener" },
    { id: 2, name: "Job Market Scanner" },
    { id: 3, name: "Career Path Mapper" },
    { id: 4, name: "Future-Proofing Checker" },
    { id: 5, name: "Decision Brief" },
    { id: 6, name: "AI Bottleneck Analyzer" },
    { id: 7, name: "Final Briefing" },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const previousOutputs: AgentResult[] = [];

      for (const agent of agents) {
        send({ type: "agent_start", agentId: agent.id, agentName: agent.name });

        try {
          const context = previousOutputs
            .map((o) => `${o.agentName}: ${JSON.stringify(o.data)}`)
            .join("\n");

          const prompt = buildPrompt(agent.id, query, context);
          let fullText = "";

          // Stream Claude's response token by token, with 45s per-agent timeout
          const claudeStream = client.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          });

          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Agent timeout after 45s")), 45000)
          );

          await Promise.race([
            (async () => {
              for await (const event of claudeStream) {
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  const chunk = event.delta.text;
                  fullText += chunk;
                  send({ type: "agent_text", agentId: agent.id, chunk });
                }
              }
            })(),
            timeout,
          ]);

          // Parse JSON from the completed response
          let data: Record<string, unknown> = {};
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            data = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: fullText };
          } catch {
            data = { raw: fullText };
          }

          previousOutputs.push({ agentId: agent.id, agentName: agent.name, data });
          send({ type: "agent_complete", agentId: agent.id, agentName: agent.name, data });
        } catch (err) {
          send({ type: "agent_error", agentId: agent.id, error: String(err) });
        }
      }

      send({ type: "pipeline_complete", executedAt: new Date().toISOString() });
      controller.close();
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
