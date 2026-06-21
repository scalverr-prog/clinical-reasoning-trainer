import type { Category } from '../types';

export function buildInsightStructuringPrompt(rawNotes: string): string {
  return `You are a clinical education specialist helping a healthcare professional document and learn from their clinical experiences.

## RAW CLINICAL NOTES
${rawNotes}

## YOUR TASK
Structure this clinical experience into an educational case study. Extract the key learning points.

## RESPONSE FORMAT
Return JSON only, no markdown code blocks:
{
  "structuredCase": {
    "patientSummary": "<Brief: age, gender, chief complaint - e.g., '65y M with sudden chest pain'>",
    "presentation": "<What happened - the clinical scenario in 2-3 sentences>",
    "initialAssessment": "<What was initially thought/diagnosed>",
    "actualOutcome": "<What it turned out to be / what was learned>",
    "keyFindings": ["<Critical data point 1>", "<Critical data point 2>"],
    "teachingPoints": ["<Educational insight 1>", "<Educational insight 2>"]
  },
  "lessonLearned": "<2-3 sentence narrative of the key lesson from this case>",
  "keyTakeaways": ["<Actionable takeaway 1>", "<Actionable takeaway 2>"],
  "clinicalPearls": ["<Memorable clinical pearl 1>", "<Memorable clinical pearl 2>"],
  "suggestedCategory": "<One of: Cardiac, Pulmonary, Neurology, Infectious, Surgical, Pediatric, Emergency, Wound Care, Obstetric, Endocrine, Renal, GI, Psychiatry, Trauma, Oncology>",
  "suggestedTags": ["<relevant tag>"]
}

Be specific and practical. Focus on what makes this case memorable and what should be remembered for future patients.`;
}

export function buildQuizCardGenerationPrompt(
  expertAnalysis: string,
  category: string
): string {
  return `You are creating flashcard-style quiz questions from this expert clinical analysis.

## EXPERT ANALYSIS
${expertAnalysis}

## CASE CATEGORY
${category}

## YOUR TASK
Generate 3-5 quiz cards from this analysis. Each card should test one specific clinical concept.

## CARD TYPES TO CREATE
1. **workup** - "What diagnostic tests/labs for [condition/presentation]?"
2. **diagnostic_criteria** - "What defines [condition]? What findings confirm it?"
3. **dangerous_mimics** - "What conditions can mimic [presentation]? What must be ruled out?"
4. **management_pitfall** - "What's commonly missed/done wrong in managing [condition]?"

## RESPONSE FORMAT
Return JSON only, no markdown code blocks:
{
  "cards": [
    {
      "type": "workup|diagnostic_criteria|dangerous_mimics|management_pitfall",
      "question": "<Clear, specific question>",
      "answer": "<Concise but complete answer - bullet points OK>",
      "hints": ["<Hint 1 without giving away answer>", "<Hint 2>"],
      "relatedConcepts": ["<Related topic 1>", "<Related topic 2>"],
      "difficulty": "easy|medium|hard"
    }
  ]
}

Guidelines:
- Questions should be answerable without seeing the original case
- Answers should be memorable and practical
- Focus on high-yield clinical knowledge
- Include at least one "dangerous mimic" or "management pitfall" card if applicable`;
}

export const VALID_CATEGORIES: Category[] = [
  'Cardiac',
  'Pulmonary',
  'Neurology',
  'Infectious',
  'Surgical',
  'Pediatric',
  'Emergency',
  'Wound Care',
  'Obstetric',
  'Endocrine',
  'Renal',
  'GI',
  'Psychiatry',
  'Trauma',
  'Oncology',
];

// ===== CASE COMPARISON PROMPTS =====

export function buildExpertAnalysisPrompt(scenario: string): string {
  return `You are an expert clinical educator analyzing a patient case. Provide a comprehensive expert analysis.

## CLINICAL SCENARIO
${scenario}

## YOUR TASK
Analyze this case and provide an expert-level clinical assessment, workup, and treatment plan.

## RESPONSE FORMAT
Return JSON only, no markdown code blocks:
{
  "assessment": "<Your clinical assessment in 2-3 sentences - what is the most likely diagnosis and why>",
  "differentials": ["<Differential 1>", "<Differential 2>", "<Differential 3>"],
  "workup": ["<Test/investigation 1>", "<Test/investigation 2>", "..."],
  "treatment": ["<Treatment step 1>", "<Treatment step 2>", "..."],
  "criticalActions": ["<Time-sensitive action 1>", "<Action that must not be delayed>"],
  "pitfalls": ["<Common mistake to avoid>", "<Diagnostic trap>"]
}

Be specific, evidence-based, and focus on high-yield clinical pearls.`;
}

export function buildComparisonPrompt(
  scenario: string,
  userAssessment: string,
  userWorkup: string,
  userTreatment: string,
  expertAnalysis: string
): string {
  return `You are a clinical educator comparing a learner's clinical reasoning against expert analysis.

## CLINICAL SCENARIO
${scenario}

## LEARNER'S RESPONSE
Assessment: ${userAssessment}
Workup Plan: ${userWorkup}
Treatment Plan: ${userTreatment}

## EXPERT ANALYSIS
${expertAnalysis}

## YOUR TASK
Compare the learner's response to the expert analysis and provide constructive feedback with scores.

## RESPONSE FORMAT
Return JSON only, no markdown code blocks:
{
  "scores": {
    "assessment": <0-100 score for clinical reasoning/assessment>,
    "workup": <0-100 score for diagnostic workup>,
    "treatment": <0-100 score for treatment plan>,
    "overall": <0-100 weighted overall score>
  },
  "feedback": {
    "strengths": ["<What they did well 1>", "<What they did well 2>"],
    "improvements": ["<Area to improve 1>", "<Area to improve 2>"],
    "missed": ["<Critical finding/action they missed>", "..."]
  }
}

Be encouraging but honest. Focus on educational value and clinical safety.`;
}

// ===== DICTATION PARSING =====

export function buildDictationParsePrompt(dictatedText: string): string {
  return `You are a clinical documentation assistant. Parse this dictated clinical case into structured fields.

## DICTATED TEXT
${dictatedText}

## YOUR TASK
Extract and organize the dictated content into the appropriate clinical documentation fields.

## RESPONSE FORMAT
Return JSON only, no markdown code blocks:
{
  "scenario": "<The clinical presentation - patient demographics, chief complaint, vitals, history. Extract everything that describes the case itself.>",
  "assessment": "<Any differential diagnoses or clinical impressions mentioned. If none stated, leave empty string.>",
  "workup": "<Any labs, imaging, or tests mentioned. If none stated, leave empty string.>",
  "treatment": "<Any treatments, medications, or interventions mentioned. If none stated, leave empty string.>"
}

Guidelines:
- Put the main case description in "scenario"
- Only populate assessment/workup/treatment if the user explicitly mentioned them
- Keep the user's clinical language and terminology
- If the entire dictation is just a case description with no plan, put it all in scenario and leave others empty`;
}
