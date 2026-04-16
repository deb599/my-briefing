/**
 * Realistic mock data matching the actual agent JSON schemas from pipeline-route.ts.
 * Used for testing email/PDF/UI without burning AI tokens.
 *
 * Toggle: set NEXT_PUBLIC_USE_MOCK=true in .env.local
 */

export const MOCK_AGENT_DATA: Record<number, Record<string, any>> = {
  1: {
    score: 7,
    score_confidence: "medium — AI-estimated from training data patterns",
    sentiment_label: "Positive",
    summary:
      "Public sentiment toward data science careers remains broadly positive, driven by sustained employer demand and high-profile AI advances. However, there is growing scepticism about market saturation at the entry level — bootcamp fatigue and junior-role competition are recurring themes. This assessment is based on historical patterns, not live data.",
    top_themes: [
      "AI hype vs. reality",
      "Entry-level saturation concerns",
      "High senior-level demand",
    ],
    concern_level: "medium",
    data_caveat:
      "Cannot access current Reddit, LinkedIn, or forum sentiment — patterns may have shifted since training cutoff.",
    key_quote:
      "The field is great if you can get past the junior bottleneck — senior data scientists are still in massive demand.",
  },

  2: {
    demand_level: "high",
    demand_score: 7,
    demand_score_note:
      "AI estimate based on training data trends, not live job board scraping.",
    top_roles: [
      "Data Scientist",
      "ML Engineer",
      "Data Analyst",
      "AI/ML Product Manager",
    ],
    salary_range: {
      min: 85000,
      max: 145000,
      note: "AUD estimate only, may be 1-2 years outdated",
    },
    top_industries: ["Financial Services", "Healthcare", "Technology"],
    job_volume_estimate:
      "Estimated 10,000–18,000 open roles nationally (unverified)",
    hiring_trend: "growing",
    data_gaps: [
      "Cannot verify current job board volumes",
      "Regional salary variation not captured",
    ],
  },

  3: {
    recommended_combinations: [
      "Data Science + Domain Expertise (finance/health)",
      "ML Engineering + Cloud Infrastructure",
      "Analytics + Business Strategy",
    ],
    top_career_paths: [
      {
        title: "Senior Data Scientist",
        years_to_reach: "3-5 years",
        avg_salary_aud: 140000,
        salary_certainty: "medium",
      },
      {
        title: "ML Engineering Lead",
        years_to_reach: "4-6 years",
        avg_salary_aud: 165000,
        salary_certainty: "low",
      },
      {
        title: "Head of Data / Analytics Director",
        years_to_reach: "7-10 years",
        avg_salary_aud: 200000,
        salary_certainty: "low",
      },
    ],
    transferable_skills: [
      "Statistical modelling",
      "Python/SQL",
      "Stakeholder communication",
    ],
    entry_point: "Junior Data Analyst or Associate Data Scientist",
    path_caveats:
      "Timelines assume continuous upskilling and favourable market conditions. AI tooling may compress or eliminate some mid-level roles.",
    summary:
      "Three clear paths emerge: deep technical (ML Engineering), applied business (Analytics Director), or hybrid (Data Science + domain). The strongest hedge is combining technical skill with a specific industry vertical.",
  },

  4: {
    growth_trajectory: "growing",
    trajectory_score: 7,
    trajectory_note:
      "Directional estimate only — AI disruption pace is inherently unpredictable.",
    ai_disruption_risk: "medium",
    ai_risk_detail:
      "AI will automate routine analysis and reporting. However, problem framing, stakeholder communication, and novel research remain hard to automate. The risk is real but manageable with continuous upskilling.",
    five_year_outlook: "cautious",
    five_year_note:
      "Positive overall trajectory, but the nature of 'data science' roles will shift significantly. Roles that survive will look different from today's job descriptions.",
    subjects_to_avoid: [
      "Pure reporting/dashboarding (high automation risk)",
      "Generic data analytics without specialisation",
    ],
    safe_bets: [
      "ML/AI engineering with deployment skills",
      "Data science + healthcare/biotech domain",
      "AI safety and evaluation roles",
    ],
    wildcard_risk:
      "A breakthrough in autonomous AI agents could collapse demand for mid-level analysis roles faster than expected.",
  },

  5: {
    bottlenecks: [
      {
        issue: "Junior role saturation",
        severity: "high",
        detail:
          "AI-assisted coding and analysis tools are raising the bar for entry-level roles while simultaneously increasing the supply of bootcamp graduates.",
        who_it_hits: "entry-level",
      },
      {
        issue: "AI-generated application noise",
        severity: "high",
        detail:
          "Recruiters are flooded with AI-written applications, making it harder for genuine candidates to stand out.",
        who_it_hits: "everyone",
      },
      {
        issue: "Credential devaluation",
        severity: "medium",
        detail:
          "As AI tools commoditise basic data skills, traditional credentials (bootcamps, generic Masters) carry less weight.",
        who_it_hits: "entry-level",
      },
      {
        issue: "Tooling churn",
        severity: "medium",
        detail:
          "The AI/ML tooling landscape changes quarterly, creating constant upskilling pressure.",
        who_it_hits: "mid-career",
      },
      {
        issue: "Trust gaps in AI outputs",
        severity: "medium",
        detail:
          "Stakeholders increasingly question AI-generated analyses, requiring data scientists to spend more time on validation and explainability.",
        who_it_hits: "senior",
      },
    ],
    pain_points: [
      "Hiring processes now include AI-specific screening that didn't exist 2 years ago",
      "Portfolio projects look increasingly similar because candidates use the same AI tools",
      "Remote work competition has gone global, compressing salaries for non-senior roles",
    ],
    ai_noise_factor: "high",
    ai_noise_detail:
      "AI-generated resumes, cover letters, and even portfolio projects are flooding the market, making genuine skill assessment harder for both candidates and employers.",
    skill_atrophy_risk: "medium",
    skill_atrophy_detail:
      "Over-reliance on AI code assistants may erode debugging, statistical reasoning, and first-principles thinking skills.",
    hiring_impact:
      "Many employers now require live coding or take-home projects specifically designed to test skills AI tools can't easily fake.",
    regulatory_friction:
      "Emerging AI governance requirements are creating new compliance roles but also adding overhead to AI-heavy projects.",
    silver_lining:
      "Practitioners who combine genuine technical depth with domain expertise and communication skills are more valuable than ever — AI raises the floor but also raises the ceiling.",
    data_caveat:
      "These bottleneck assessments are based on patterns in training data and may not reflect the most recent market shifts.",
  },

  6: {
    recommendation:
      "A Masters in Data Science is still a viable career investment in 2026, but only if paired with a clear specialisation (ML engineering, healthcare AI, or AI safety) and practical project experience. A generic data science degree without differentiation carries meaningful risk of underemployment.",
    confidence_score: 6,
    confidence_note:
      "Score limited by inability to verify current job market data, salary figures, and the pace of AI disruption. Treat as directional guidance, not a definitive answer.",
    doors_opened: [
      "Access to senior/specialist roles requiring postgraduate credentials",
      "Visa/immigration pathways that require a Masters degree",
      "Research and R&D roles in AI-forward organisations",
    ],
    doors_closed: [
      "2 years of opportunity cost and lost income (~$80K-$150K AUD)",
      "Risk of graduating into a reshaped market where the degree has less value",
    ],
    risk_flag:
      "The biggest risk is not the degree itself — it's graduating without a specialisation or portfolio that distinguishes you from the thousands of other new data science graduates.",
    one_liner:
      "Worth it if you specialise ruthlessly; risky if you treat it as a generic credential.",
    verdict: "caution",
    disclaimer:
      "AI-generated analysis only. Verify with current sources before making decisions.",
  },
};
