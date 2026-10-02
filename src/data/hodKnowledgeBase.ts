export const HOD_KNOWLEDGE_BASE = {
  version: "2026.10",
  sources: [
    {
      title: "Eagle House School HOD Guide 2026",
      authority: "Eagle House internal policy/guide",
      scope: "HOD leadership, curriculum, teaching and learning, assessment, learner progress, educator development, communication, accountability and department improvement.",
      keyPoints: [
        "The HOD role spans nine interconnected areas: department leadership; curriculum; teaching and learning; assessment; learner progress; educator development; communication; accountability; department improvement.",
        "Weekly HOD review should cover communication, curriculum progress, educator and learner concerns, upcoming assessments, outstanding actions, educator support, escalation and department records.",
        "Assessment quality requires curriculum alignment, appropriate cognitive demand, clear instructions, marking consistency, pre- and post-moderation, feedback, accurate recording, performance review and intervention."
      ]
    },
    {
      title: "Eagle House School Assessment Policy V2 2026",
      authority: "Eagle House internal assessment policy",
      scope: "Grades 8-12 assessment, moderation, academic integrity and AI use.",
      keyPoints: [
        "Grades 8-11 use CAPS as the pedagogical framework with IEB alignment where applicable; Grade 12 follows IEB Subject Assessment Guidelines.",
        "Every formal assessment must be submitted to the HOD/Subject Head at least 5 school days before the scheduled assessment date for pre-assessment moderation.",
        "Post-assessment moderation requires a minimum 10% sample across top, average and weak performance bands.",
        "Internal post-moderation is conducted in purple pen.",
        "Generative AI may be used ethically as a supportive learning aid where permitted, but not to generate final submitted learner work; learners must disclose and cite AI use where the policy requires it."
      ]
    },
    {
      title: "IEB Mathematics Subject Assessment Guidelines 2026 (updated August 2025)",
      authority: "IEB",
      scope: "Grade 12 Mathematics",
      keyPoints: [
        "Paper 1: 3 hours, 150 marks; Paper 2: 3 hours, 150 marks; SBA: 100 marks; total 400.",
        "Mathematics cognitive distribution across Papers 1 and 2: Level 1 Knowledge 20% (±3); Level 2 Routine procedures 30% (±3); Level 3 Complex procedures 35% (±3); Level 4 Problem solving/investigations, reasoning and reflecting 15% (±3).",
        "Paper 1 content includes algebra and equations, patterns and sequences, finance/growth/decay, functions/graphs, differential calculus and probability within the stated mark tolerances.",
        "IEB guidelines should be checked against the specific current subject document before making a compliance claim."
      ]
    },
    {
      title: "IEB Mathematical Literacy Subject Assessment Guidelines 2026 (updated June 2025)",
      authority: "IEB",
      scope: "Grade 12 Mathematical Literacy",
      keyPoints: [
        "Paper 1: 3 hours, 150 marks; Paper 2: 3 hours, 150 marks; SBA: 100 marks; total 400.",
        "Cognitive weighting for both papers: Level 1 Knowing 30% (±5); Level 2 routine procedures in familiar contexts 30% (±5); Level 3 multi-step procedures in varied contexts 20% (±5); Level 4 reasoning and reflecting 20% (±5).",
        "Paper 1 content weighting: Finance 60% (±5), Data Handling 35% (±5), Probability 5%. Paper 2 includes maps/plans/representations of the physical world, measurement and probability according to the published tolerances.",
        "Questions should assess mathematical literacy through relevant real-life contexts."
      ]
    },
    {
      title: "CAPS Mathematics Grades 10-12",
      authority: "South African DBE CAPS",
      scope: "FET Mathematics curriculum and assessment framework",
      keyPoints: [
        "CAPS emphasises mathematical language, quantitative reasoning, problem solving, critical and creative thinking, and understanding when and why procedures are used.",
        "Use the official subject CAPS and applicable annual plan when making pacing or curriculum coverage recommendations; do not substitute generic topic lists for an ATP."
      ]
    },
    {
      title: "CAPS Mathematical Literacy Grades 10-12",
      authority: "South African DBE CAPS",
      scope: "FET Mathematical Literacy curriculum",
      keyPoints: [
        "Use the official CAPS subject framework and applicable annual teaching plan for content sequencing and assessment planning.",
        "Mathematical Literacy assessment should remain contextual, practical and integrated rather than becoming a pure Mathematics paper."
      ]
    }
  ],
  operatingRules: [
    "Prefer the supplied Eagle House policy for internal school procedures, then the named IEB/DBE/Cambridge framework for curriculum requirements.",
    "Never invent a policy clause, weighting, deadline or syllabus requirement. If the supplied sources do not establish it, label it as a recommendation or say verification is required.",
    "Distinguish internal Eagle House requirements from external IEB/DBE/Cambridge requirements.",
    "When a user gives grade, subject and curriculum, tailor the response to that combination.",
    "For assessment moderation, inspect task structure, marks, cognitive demand, content coverage, memo quality, instructions, timing, language, diagrams/data, accessibility and internal policy compliance.",
    "For results analysis, connect evidence to a teaching response, intervention owner, review date and measurable success criterion.",
    "For HOD management questions, provide an immediate action, documentation step, communication step and escalation condition when relevant."
  ]
} as const;


export type KnowledgeChunk = {
  id: string;
  sourceTitle: string;
  authority: string;
  scope: string;
  text: string;
  tags: string[];
};

export const HOD_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  ...HOD_KNOWLEDGE_BASE.sources.flatMap((source, sourceIndex) =>
    source.keyPoints.map((point, pointIndex) => ({
      id: `source-${sourceIndex + 1}-point-${pointIndex + 1}`,
      sourceTitle: source.title,
      authority: source.authority,
      scope: source.scope,
      text: point,
      tags: [
        source.title.toLowerCase(),
        source.authority.toLowerCase(),
        source.scope.toLowerCase(),
        ...point.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
      ]
    }))
  )
];

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();
}

function scoreChunk(chunk: KnowledgeChunk, query: string, subject?: string, grade?: string, curriculum?: string): number {
  const q = normalise(`${query} ${subject || ""} ${grade || ""} ${curriculum || ""}`);
  const terms = new Set(q.split(/\s+/).filter((term) => term.length > 2));
  let score = 0;

  for (const term of terms) {
    if (normalise(chunk.text).includes(term)) score += 4;
    if (normalise(chunk.sourceTitle).includes(term)) score += 5;
    if (normalise(chunk.scope).includes(term)) score += 2;
    if (chunk.tags.some((tag) => tag.includes(term))) score += 1;
  }

  if (curriculum && normalise(chunk.authority).includes(normalise(curriculum))) score += 6;
  if (subject && normalise(chunk.sourceTitle).includes(normalise(subject))) score += 6;
  if (grade && chunk.text.toLowerCase().includes(grade.toLowerCase())) score += 3;

  return score;
}

export function retrieveKnowledge(
  query: string,
  subject?: string,
  grade?: string,
  curriculum?: string,
  limit = 8
) {
  const ranked = HOD_KNOWLEDGE_CHUNKS
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, query, subject, grade, curriculum) }))
    .sort((a, b) => b.score - a.score);

  const selected = ranked.filter((item) => item.score > 0).slice(0, limit);
  return selected.length ? selected : ranked.slice(0, Math.min(limit, ranked.length));
}

export function buildCurriculumContext(subject?: string, grade?: string, curriculum?: string) {
  const q = `${subject || ""} ${grade || ""} ${curriculum || ""}`.toLowerCase();
  const relevant = HOD_KNOWLEDGE_BASE.sources.filter((s) => {
    if (q.includes("mathematical literacy") || q.includes("math lit")) return /mathematical literacy|assessment policy|hod guide|caps/i.test(s.title);
    if (q.includes("mathematics") || q.includes("math")) return /mathematics|assessment policy|hod guide|caps/i.test(s.title);
    return /assessment policy|hod guide/i.test(s.title);
  });
  return {
    sourceSummary: relevant.length ? relevant : HOD_KNOWLEDGE_BASE.sources.slice(0, 2),
    operatingRules: HOD_KNOWLEDGE_BASE.operatingRules
  };
}