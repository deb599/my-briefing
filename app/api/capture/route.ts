import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const AGENT_LABELS: Record<string, string> = {
  agent1: "Sentiment Analysis",
  agent2: "Job Market",
  agent3: "Career Paths",
  agent4: "Future-Proofing",
  agent5: "AI Bottlenecks",
  agent6: "Final Briefing",
};

function formatList(items: string[]): string {
  return items.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join("");
}

function formatAgentHtml(agentKey: string, data: any): string {
  if (!data) return "<p>No data available.</p>";

  // Agent 1: Sentiment
  if (data.sentiment_label) {
    return `
      <p><strong>Sentiment:</strong> ${data.sentiment_label} (${data.score}/10)</p>
      <p>${data.summary}</p>
      <p><strong>Key themes:</strong> ${(data.top_themes || []).join(", ")}</p>
      ${data.key_quote ? `<p style="font-style: italic; color: #666;">"${data.key_quote}"</p>` : ""}
    `;
  }

  // Agent 2: Job Market
  if (data.demand_level) {
    const salary = data.salary_range || {};
    return `
      <p><strong>Demand:</strong> ${data.demand_level} (${data.demand_score}/10)</p>
      <p><strong>Top roles:</strong> ${(data.top_roles || []).join(", ")}</p>
      <p><strong>Salary range:</strong> $${(salary.min || 0).toLocaleString()} – $${(salary.max || 0).toLocaleString()} AUD</p>
      <p><strong>Hiring trend:</strong> ${data.hiring_trend}</p>
      <p><strong>Top industries:</strong> ${(data.top_industries || []).join(", ")}</p>
    `;
  }

  // Agent 3: Career Paths
  if (data.top_career_paths) {
    const paths = (data.top_career_paths || [])
      .map((p: any) => `<li style="margin-bottom: 6px;"><strong>${p.title}</strong> — ${p.years_to_reach}, ~$${(p.avg_salary_aud || 0).toLocaleString()} AUD</li>`)
      .join("");
    return `
      <p><strong>Recommended combos:</strong> ${(data.recommended_combinations || []).join(", ")}</p>
      <ul style="padding-left: 20px;">${paths}</ul>
      <p><strong>Entry point:</strong> ${data.entry_point || "N/A"}</p>
      <p><strong>Transferable skills:</strong> ${(data.transferable_skills || []).join(", ")}</p>
    `;
  }

  // Agent 4: Future-Proofing
  if (data.growth_trajectory) {
    return `
      <p><strong>Growth:</strong> ${data.growth_trajectory} (${data.trajectory_score}/10)</p>
      <p><strong>AI disruption risk:</strong> ${data.ai_disruption_risk} — ${data.ai_risk_detail || ""}</p>
      <p><strong>5-year outlook:</strong> ${data.five_year_outlook}</p>
      <p><strong>Safe bets:</strong> ${(data.safe_bets || []).join(", ")}</p>
      <p><strong>Wildcard risk:</strong> ${data.wildcard_risk || "N/A"}</p>
    `;
  }

  // Agent 5: AI Bottlenecks
  if (data.bottlenecks) {
    const bottlenecks = (data.bottlenecks || [])
      .map((b: any) => `<li style="margin-bottom: 6px;"><strong>${b.issue}</strong> (${b.severity}) — ${b.detail}</li>`)
      .join("");
    return `
      <ul style="padding-left: 20px;">${bottlenecks}</ul>
      <p><strong>AI noise:</strong> ${data.ai_noise_factor} — ${data.ai_noise_detail || ""}</p>
      <p><strong>Skill atrophy risk:</strong> ${data.skill_atrophy_risk} — ${data.skill_atrophy_detail || ""}</p>
      <p><strong>Silver lining:</strong> ${data.silver_lining || "N/A"}</p>
    `;
  }

  // Agent 6: Final Briefing
  if (data.recommendation) {
    return `
      <p style="font-size: 16px; font-weight: bold; color: #1C1C1E;">${data.one_liner || ""}</p>
      <p>${data.recommendation}</p>
      <p><strong>Confidence:</strong> ${data.confidence_score}/10 — ${data.confidence_note || ""}</p>
      <p><strong>Verdict:</strong> <span style="text-transform: uppercase; font-weight: bold;">${data.verdict || "N/A"}</span></p>
      <p><strong>Opportunities:</strong> ${(data.doors_opened || []).join(", ")}</p>
      <p><strong>Limitations:</strong> ${(data.doors_closed || []).join(", ")}</p>
      <p><strong>Key risk:</strong> ${data.risk_flag || "N/A"}</p>
      <p style="font-size: 11px; color: #999; margin-top: 12px;">${data.disclaimer || ""}</p>
    `;
  }

  // Fallback: extract any summary-like field, or show a cleaned-up version
  return `<p>${data.summary || data.recommendation || data.one_liner || JSON.stringify(data, null, 2).replace(/[{}"]/g, "").slice(0, 500)}</p>`;
}

export async function POST(req: Request) {
  try {
    const { email, query, fullAnalysis } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    const userQuery = String(query || "Strategic Briefing");

    // Format the analysis into clean HTML sections
    const analysisHtml = Object.entries(fullAnalysis || {})
      .map(([agentKey, data]: [string, any]) => {
        const label = AGENT_LABELS[agentKey] || agentKey.replace("agent", "Phase ");
        return `
          <div style="margin-bottom: 30px; padding: 20px; background: #F9F9F9; border-left: 4px solid #FFD60A;">
            <h3 style="margin-top: 0; color: #1C1C1E; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
              ${label}
            </h3>
            <div style="color: #444; line-height: 1.6;">
              ${formatAgentHtml(agentKey, data)}
            </div>
          </div>
        `;
      }).join('');

    const { data, error } = await resend.emails.send({
      from: "My Briefing <info@ba-co-pilot.com>",
      to: [userEmail],
      subject: `My Briefing: ${userQuery}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1C1C1E;">
          <header style="background: #1C1C1E; padding: 30px; text-align: center; border-bottom: 5px solid #FFD60A;">
            <h1 style="color: #FFD60A; margin: 0; font-size: 24px;">Executive Briefing</h1>
            <p style="color: #F9F9F9; font-size: 14px; margin-top: 10px; opacity: 0.8;">${userQuery}</p>
          </header>
          
          <div style="padding: 40px 0;">
            ${analysisHtml}
          </div>

          <div style="text-align: center; padding: 24px 0 20px;">
            <a href="https://my-briefing-hazel.vercel.app" style="display: inline-block; padding: 14px 32px; background: #FFD60A; color: #1C1C1E; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 6px; letter-spacing: 0.5px;">TELL A FRIEND →</a>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">Know someone figuring out what to study? Share the link.</p>
          </div>

          <div style="text-align: center; padding: 28px 24px; margin: 0 0 20px; background: #1C1C1E; border-radius: 8px;">
            <p style="font-size: 13px; color: #F9F9F9; margin: 0 0 6px; font-weight: 700;">Send feedback, get a free prompt</p>
            <p style="font-size: 12px; color: #999; margin: 0 0 18px; line-height: 1.5;">This is an early demo — your feedback shapes what we build next. Tell us what worked and what didn't, and we'll send you <strong style="color: #ccc;">The Career DNA Interviewer</strong> — an AI prompt that asks 50 deep questions to uncover what career actually fits you.</p>
            <a href="mailto:info@ba-co-pilot.com?subject=My%20Briefing%20Feedback%20%2B%20Send%20Career%20DNA%20Prompt&body=Hey%2C%20just%20tried%20the%20My%20Briefing%20demo.%0A%0AWhat%20worked%3A%20%0A%0AWhat%20didn't%3A%20%0A%0AWhat%20I'd%20want%20next%3A%20%0A%0APlease%20send%20me%20the%20Career%20DNA%20Interviewer%20prompt!" style="display: inline-block; padding: 12px 28px; background: #FFD60A; color: #1C1C1E; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 6px;">SEND FEEDBACK →</a>
            <p style="font-size: 11px; color: #666; margin: 14px 0 0; line-height: 1.5;">Want to know when the full version launches? <a href="mailto:info@ba-co-pilot.com?subject=Sign%20me%20up%20for%20My%20Briefing%20launch&body=Hey%2C%20add%20me%20to%20the%20launch%20list!" style="color: #FFD60A; text-decoration: underline;">Sign up for launch updates</a></p>
          </div>

          <footer style="padding: 20px; text-align: center; border-top: 1px solid #EEE; font-size: 12px; color: #999;">
            <p>Generated by My Briefing — AI Career Intelligence · info@ba-co-pilot.com</p>
          </footer>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: "Email failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });

  } catch (err: any) {
    console.error("Global Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
