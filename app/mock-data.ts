/**
 * Mock data for demo mode.
 * Toggle: set NEXT_PUBLIC_USE_MOCK=true in .env.local
 *
 * Two datasets:
 *   MOCK_AGENT_DATA            — generic career query (no student profile)
 *   MOCK_AGENT_DATA_PERSONALISED — tailored to Jamie's Career DNA profile
 *
 * Career DNA profile mock:
 *   MOCK_DNA_PROFILE           — pre-filled student profile for demo
 */

/* ─────────────────────────────────────────
   CAREER DNA PROFILE (demo student: Jamie)
───────────────────────────────────────── */

export const MOCK_DNA_PROFILE = {
  name: "Jamie",
  yearLevel: "Year 11",
  age: "16",
  interests: ["App development", "Video editing", "Strategy games", "3D design"],
  cognitiveStrengths:
    "Spots inefficiencies instantly, breaks complex systems into logical steps, explains things visually — friends always ask Jamie to 'just show me how it works'. Finds pattern-matching and optimisation effortless. Struggles with open-ended tasks that lack clear success criteria.",
  greenLights: [
    "Creates something tangible — can point to it and say 'I made that'",
    "Involves technology in a hands-on way",
    "Room to experiment and iterate without asking permission",
    "Fast feedback loops — knows quickly if something worked",
    "Some autonomy over how the work gets done",
  ],
  hardNos: [
    "Repetitive data entry or admin with no creative input",
    "Managing large teams of people day-to-day",
    "Pure sales or cold outreach roles",
    "Slow-moving bureaucratic environments",
    "Work that's invisible — no output Jamie can see or show",
  ],
  careerArchetypes: ["The Technical Optimizer", "The Entrepreneurial Builder"],
};

/* ─────────────────────────────────────────
   GENERIC MOCK DATA (no student profile)
   Query: "Is a Masters in Data Science worth it in 2026?"
───────────────────────────────────────── */

export const MOCK_AGENT_DATA: Record<number, Record<string, any>> = {
  1: {
    score: 7,
    score_confidence: "medium",
    sentiment_label: "Positive",
    summary:
      "Public sentiment toward data science careers remains broadly positive, driven by sustained employer demand and high-profile AI advances. However, there is growing scepticism about market saturation at the entry level — bootcamp fatigue and junior-role competition are recurring themes.",
    top_themes: ["AI hype vs. reality", "Entry-level saturation", "High senior demand"],
    concern_level: "medium",
    key_quote:
      "The field is great if you can get past the junior bottleneck — senior data scientists are still in massive demand.",
  },
  2: {
    demand_level: "high",
    demand_score: 7,
    top_roles: ["Data Scientist", "ML Engineer", "Data Analyst", "AI/ML Product Manager"],
    salary_range: { min: 85000, max: 145000 },
    top_industries: ["Financial Services", "Healthcare", "Technology"],
    hiring_trend: "growing",
  },
  3: {
    recommended_combinations: [
      "Data Science + Domain Expertise (finance/health)",
      "ML Engineering + Cloud Infrastructure",
      "Analytics + Business Strategy",
    ],
    top_career_paths: [
      { title: "Senior Data Scientist", years_to_reach: "3–5 years", avg_salary_aud: 140000, salary_certainty: "medium" },
      { title: "ML Engineering Lead", years_to_reach: "4–6 years", avg_salary_aud: 165000, salary_certainty: "low" },
      { title: "Head of Data / Analytics Director", years_to_reach: "7–10 years", avg_salary_aud: 200000, salary_certainty: "low" },
    ],
    transferable_skills: ["Statistical modelling", "Python/SQL", "Stakeholder communication"],
    entry_point: "Junior Data Analyst or Associate Data Scientist",
    path_caveats:
      "Timelines assume continuous upskilling and favourable market conditions. AI tooling may compress or eliminate some mid-level roles.",
    summary:
      "Three clear paths emerge: deep technical (ML Engineering), applied business (Analytics Director), or hybrid. The strongest hedge is combining technical skill with a specific industry vertical.",
  },
  4: {
    growth_trajectory: "growing",
    trajectory_score: 7,
    ai_disruption_risk: "medium",
    ai_risk_detail:
      "AI will automate routine analysis and reporting. Problem framing, stakeholder communication, and novel research remain hard to automate. The risk is real but manageable with continuous upskilling.",
    five_year_outlook: "cautious",
    subjects_to_avoid: ["Pure reporting/dashboarding (high automation risk)", "Generic analytics without specialisation"],
    safe_bets: ["ML/AI engineering with deployment skills", "Data science + healthcare domain", "AI safety and evaluation roles"],
    wildcard_risk:
      "A breakthrough in autonomous AI agents could collapse demand for mid-level analysis roles faster than expected.",
  },
  5: {
    bottlenecks: [
      { issue: "Junior role saturation", severity: "high", detail: "AI tools raise the bar for entry-level while bootcamp supply keeps growing.", who_it_hits: "entry-level" },
      { issue: "AI-generated application noise", severity: "high", detail: "Recruiters are flooded with AI-written applications, making genuine candidates harder to spot.", who_it_hits: "everyone" },
      { issue: "Credential devaluation", severity: "medium", detail: "As AI commoditises basic data skills, generic Masters degrees carry less weight.", who_it_hits: "entry-level" },
      { issue: "Tooling churn", severity: "medium", detail: "The AI/ML tooling landscape changes quarterly, creating constant upskilling pressure.", who_it_hits: "mid-career" },
    ],
    pain_points: [
      "Hiring now includes AI-specific screening that didn't exist 2 years ago",
      "Portfolio projects look increasingly similar because candidates use the same AI tools",
      "Remote work competition has gone global, compressing salaries for non-senior roles",
    ],
    ai_noise_factor: "high",
    ai_noise_detail: "AI-generated resumes and portfolio projects are flooding the market, making genuine skill assessment harder.",
    skill_atrophy_risk: "medium",
    skill_atrophy_detail: "Over-reliance on AI code assistants may erode debugging, statistical reasoning, and first-principles thinking.",
    hiring_impact: "Many employers now require live coding or take-home projects specifically designed to test skills AI can't fake.",
    regulatory_friction: "Emerging AI governance requirements are creating new compliance roles but also adding overhead.",
    silver_lining: "Practitioners who combine genuine technical depth with domain expertise are more valuable than ever — AI raises the floor and the ceiling.",
  },
  6: {
    recommendation:
      "A Masters in Data Science is still a viable career investment in 2026, but only if paired with a clear specialisation and practical project experience. A generic degree without differentiation carries meaningful risk of underemployment.",
    confidence_score: 6,
    doors_opened: [
      "Access to senior/specialist roles requiring postgraduate credentials",
      "Visa/immigration pathways requiring a Masters",
      "Research and R&D roles in AI-forward organisations",
    ],
    doors_closed: [
      "2 years of opportunity cost (~$80K–$150K AUD)",
      "Risk of graduating into a reshaped market where the degree carries less value",
    ],
    risk_flag:
      "The biggest risk is graduating without a specialisation that distinguishes you from thousands of other data science graduates.",
    one_liner: "Worth it if you specialise ruthlessly — risky if you treat it as a generic credential.",
    verdict: "caution",
  },
};

/* ─────────────────────────────────────────
   PERSONALISED MOCK DATA (Career DNA: Jamie)
   Query: "What should I study after Year 12?"
   Profile: Technical Optimizer + Entrepreneurial Builder
───────────────────────────────────────── */

export const MOCK_AGENT_DATA_PERSONALISED: Record<number, Record<string, any>> = {
  1: {
    score: 8,
    score_confidence: "medium",
    sentiment_label: "Very Positive",
    summary:
      "Sentiment around tech-creative career paths — software engineering, product design, game development, and indie tech — is strongly positive among students with Jamie's profile. The combination of 'Technical Optimizer' and 'Entrepreneurial Builder' archetypes is one of the most sought-after in the 2026 market. Crucially, Jamie's identified Green Lights (tangible output, autonomy, fast feedback) map directly to environments where this archetype thrives: product companies, startups, and applied engineering roles.",
    top_themes: [
      "High demand for builder-type engineers",
      "Autonomy increasingly rewarded in tech",
      "Creative-technical crossover roles surging",
    ],
    concern_level: "low",
    key_quote:
      "The students who build things while studying — apps, games, tools — consistently outperform those who only study the theory.",
  },
  2: {
    demand_level: "very_high",
    demand_score: 9,
    top_roles: [
      "Software / Full-Stack Engineer",
      "Product Designer (UX/UI)",
      "Game Developer / Technical Artist",
      "Indie Founder / Technical Co-founder",
    ],
    salary_range: { min: 90000, max: 160000 },
    top_industries: ["Technology / SaaS", "Games & Interactive Media", "Creative Tech / Agencies"],
    hiring_trend: "surging",
  },
  3: {
    recommended_combinations: [
      "Computer Science + minor in Interaction Design",
      "Software Engineering + self-built app portfolio",
      "Game Design / Digital Media + strong programming foundation",
    ],
    top_career_paths: [
      { title: "Product Engineer / Full-Stack Dev", years_to_reach: "2–3 years", avg_salary_aud: 105000, salary_certainty: "medium" },
      { title: "Senior Software Engineer", years_to_reach: "4–6 years", avg_salary_aud: 145000, salary_certainty: "medium" },
      { title: "Technical Co-founder / Indie Developer", years_to_reach: "3–8 years", avg_salary_aud: 120000, salary_certainty: "low" },
    ],
    transferable_skills: [
      "Systems thinking (already strong per profile)",
      "Visual communication / 3D design cross-over",
      "Strategic problem decomposition",
    ],
    entry_point: "Junior Developer or Associate Product Designer — ideally with 1–2 personal projects to show",
    path_caveats:
      "Jamie's 'Hard No' of invisible output rules out backend-only roles. Front-end, full-stack, or product-facing engineering would sustain motivation. Avoid pure infrastructure/DevOps paths early on.",
    summary:
      "Jamie's profile is unusually strong for a technical path with creative expression. The rare combination of systems-thinking ease and visual/creative interest opens doors in product engineering, UX engineering, and game development that pure coders or pure designers rarely access.",
  },
  4: {
    growth_trajectory: "rapidly_growing",
    trajectory_score: 9,
    ai_disruption_risk: "low",
    ai_risk_detail:
      "Jamie's Green Lights align with the roles AI is augmenting, not replacing. Builders who use AI as a tool — rather than compete with it — are seeing output multiply 3–5x. The 'Entrepreneurial Builder' archetype specifically benefits from AI reducing the cost of building solo projects.",
    five_year_outlook: "optimistic",
    subjects_to_avoid: [
      "Generic IT support / help desk roles (no creative output, Jamie's Hard No)",
      "Enterprise systems administration (bureaucratic, slow feedback)",
    ],
    safe_bets: [
      "AI-native product development (building with AI, not replaced by it)",
      "UX Engineering — rare skill combining design sense and build ability",
      "Indie app / game development as a parallel track to employment",
    ],
    wildcard_risk:
      "If Jamie pursues the Entrepreneurial Builder path, the risk isn't AI — it's isolation and lack of feedback structure. Needs a peer group or co-founder early.",
  },
  5: {
    bottlenecks: [
      {
        issue: "Portfolio differentiation pressure",
        severity: "high",
        detail: "Every CS graduate now has a GitHub. Jamie needs projects with a story — 'I built this because I was annoyed by X' beats 'here is a CRUD app'.",
        who_it_hits: "entry-level",
      },
      {
        issue: "Creative-technical identity confusion",
        severity: "medium",
        detail: "Students like Jamie who sit between 'pure engineer' and 'pure designer' often struggle to position themselves. Both paths will try to claim them — pick one as primary and the other as a superpower.",
        who_it_hits: "entry-level",
      },
      {
        issue: "Parental pressure toward 'safe' paths",
        severity: "medium",
        detail: "The Technical Optimizer archetype can be steered toward accounting, IT support, or law by well-meaning parents. These paths directly conflict with Jamie's Hard Nos and will lead to burnout.",
        who_it_hits: "entry-level",
      },
      {
        issue: "Degree vs. portfolio debate",
        severity: "medium",
        detail: "For Jamie's archetype, a strong portfolio often outperforms a weak degree at top tech companies. The risk is choosing a safe degree and building nothing vs. choosing a creative degree and building everything.",
        who_it_hits: "entry-level",
      },
    ],
    pain_points: [
      "High school doesn't teach the skills Jamie already has — risk of disengagement in Year 12",
      "Strategy gaming experience is an underrated signal for systems thinking that most career advisors ignore",
      "3D design and video editing are professional-grade skills being treated as hobbies",
    ],
    ai_noise_factor: "medium",
    ai_noise_detail:
      "In game dev and creative tech, AI-generated assets are flooding the market. Jamie's differentiation must be design taste and systems thinking, not raw production speed.",
    skill_atrophy_risk: "low",
    skill_atrophy_detail:
      "Jamie's profile is naturally curious and builder-oriented — atrophy is less likely than over-reliance on AI code completion before foundations are solid.",
    hiring_impact:
      "Top tech companies are now asking for live coding with AI tools allowed — testing judgment and architecture, not memorisation. This favours Jamie's archetype.",
    regulatory_friction: "Minimal for software/product roles at this stage.",
    silver_lining:
      "Jamie's combination of 3D design, video editing, and systems thinking is exactly the profile emerging 'spatial computing' and XR roles are starving for. This is a niche with almost no competition from peers.",
  },
  6: {
    recommendation:
      "Jamie should pursue a Computer Science or Software Engineering degree with a deliberate creative specialisation — and start building a public portfolio of personally meaningful projects now, before university. The Technical Optimizer + Entrepreneurial Builder combination is rare and highly valued; the risk is letting formal education crowd out the self-directed building that makes this archetype exceptional.",
    confidence_score: 8,
    doors_opened: [
      "Product Engineering at high-growth tech companies",
      "UX Engineering — the rare bridge between design and code",
      "Indie / solo founder path enabled by AI tools lowering build costs",
      "Spatial computing / XR development — emerging, low-competition niche",
    ],
    doors_closed: [
      "Enterprise IT, admin-heavy roles (direct Hard No conflict)",
      "Pure management tracks without technical output",
      "Any path chosen primarily for parental approval — high burnout risk per profile",
    ],
    risk_flag:
      "Jamie's biggest enemy is not the market — it's choosing a 'safe' path under social pressure that violates every Green Light. A misaligned degree will extinguish the builder instinct that makes this profile valuable.",
    one_liner:
      "Build in public, study CS with a creative lens, and trust that the market is starving for exactly what Jamie already is.",
    verdict: "go",
  },
};
