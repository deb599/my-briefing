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
   Query: "Should I do a Bachelor of Computer Science?"
───────────────────────────────────────── */

export const MOCK_AGENT_DATA: Record<number, Record<string, any>> = {
  1: {
    score: 8,
    score_confidence: "medium",
    sentiment_label: "Positive",
    summary:
      "Computer Science remains one of the most in-demand bachelor degrees. Students and graduates are generally positive about career prospects, though there's growing awareness that the degree alone isn't enough — projects, internships, and specialisation matter more than ever.",
    top_themes: ["Strong graduate demand", "Portfolio matters more than GPA", "AI changing the skillset"],
    concern_level: "low",
    key_quote:
      "A CS degree opens doors, but what you build outside class is what gets you hired.",
  },
  2: {
    demand_level: "very_high",
    demand_score: 9,
    top_roles: ["Software Engineer", "Full-Stack Developer", "Data Analyst", "Cloud Engineer"],
    salary_range: { min: 65000, max: 110000 },
    top_industries: ["Technology", "Financial Services", "Healthcare", "Government"],
    hiring_trend: "growing",
  },
  3: {
    recommended_combinations: [
      "Computer Science + minor in Business or Design",
      "Software Engineering + internship-heavy pathway",
      "IT + specialisation in cybersecurity or cloud",
    ],
    top_career_paths: [
      { title: "Junior Software Engineer", years_to_reach: "0–1 year", avg_salary_aud: 72000, salary_certainty: "medium" },
      { title: "Mid-Level Developer", years_to_reach: "2–4 years", avg_salary_aud: 105000, salary_certainty: "medium" },
      { title: "Senior Engineer / Tech Lead", years_to_reach: "5–8 years", avg_salary_aud: 150000, salary_certainty: "medium" },
    ],
    transferable_skills: ["Problem solving", "Programming (Python, JS, SQL)", "Systems thinking"],
    entry_point: "Junior Developer or Graduate Software Engineer",
    summary:
      "A CS degree leads naturally into software engineering, but also opens paths in data, cybersecurity, product management, and tech consulting. The key is picking a direction by third year.",
  },
  4: {
    growth_trajectory: "growing",
    trajectory_score: 8,
    ai_disruption_risk: "low",
    ai_risk_detail:
      "AI tools are changing how developers work but increasing demand for people who can build with them. CS graduates who learn to work alongside AI will be more productive, not replaced.",
    five_year_outlook: "optimistic",
    subjects_to_avoid: ["Pure IT support roles (limited growth)", "Generic diplomas without a programming foundation"],
    safe_bets: ["Software engineering with AI tool fluency", "Cybersecurity", "Cloud infrastructure and DevOps"],
    wildcard_risk:
      "If AI coding tools advance rapidly, the bar for entry-level roles may rise — making internships and side projects even more critical.",
  },
  5: {
    bottlenecks: [
      { issue: "Graduate competition", severity: "high", detail: "CS is one of the most popular degrees — standing out requires projects, not just grades.", who_it_hits: "entry-level" },
      { issue: "AI-assisted homework problem", severity: "medium", detail: "Students relying on AI to complete assignments may graduate without core skills employers test for.", who_it_hits: "entry-level" },
      { issue: "Internship bottleneck", severity: "high", detail: "Top companies fill graduate roles from their intern pipeline — students without internships face a harder job search.", who_it_hits: "entry-level" },
    ],
    pain_points: [
      "University curriculum can lag behind industry tools and frameworks",
      "Group projects rarely reflect real-world engineering team dynamics",
      "Many students don't start building a portfolio until final year — too late",
    ],
    ai_noise_factor: "medium",
    ai_noise_detail: "AI-generated assignments and projects make it harder for employers to assess genuine ability. Live coding interviews are becoming standard.",
    skill_atrophy_risk: "medium",
    skill_atrophy_detail: "Students who lean too heavily on AI assistants during study may struggle with debugging, logic, and first-principles problem solving.",
    silver_lining: "Students who build real projects and learn to use AI tools effectively have a massive advantage over those who don't.",
  },
  6: {
    recommendation:
      "A Bachelor of Computer Science is a strong choice with excellent career prospects. The degree itself opens doors, but what separates successful graduates is building real projects, securing internships, and picking a specialisation by third year.",
    confidence_score: 8,
    doors_opened: [
      "Software engineering roles across almost every industry",
      "Pathway to high-paying senior and leadership positions",
      "Foundation for specialising in AI, cybersecurity, or product",
    ],
    doors_closed: [
      "3–4 years of study before full-time earning",
      "Degree alone won't guarantee a role without practical experience",
    ],
    risk_flag:
      "The biggest risk is coasting through the degree without building anything — graduates with no portfolio or internships face a tough market.",
    one_liner: "Strong choice — but only if you build things along the way, not just study theory.",
    verdict: "go",
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
