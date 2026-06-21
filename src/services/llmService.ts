import type { PatientCase, UserResponse, EvaluationFeedback, StructuredInsightCase, Category, QuizCard, QuizCardType, ExpertAnalysis, CaseComparisonInput } from '../types';
import { buildEvaluationPrompt } from '../utils/prompts';
import { parseEvaluationResponse } from '../utils/scoring';
import { buildInsightStructuringPrompt, buildQuizCardGenerationPrompt, buildExpertAnalysisPrompt, buildComparisonPrompt, buildDictationParsePrompt, VALID_CATEGORIES } from '../utils/insightPrompts';

// Helper to strip markdown code blocks from LLM responses
function stripMarkdownCodeBlocks(text: string): string {
  let result = text.trim();
  if (result.startsWith('```')) {
    result = result.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return result;
}

// Server-side API call helper
async function callServerAPI(prompt: string): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.content?.find((c: { type: string; text: string }) => c.type === 'text');

  if (!textContent?.text) {
    throw new Error('No text content in response');
  }

  return textContent.text;
}

export async function evaluateResponse(
  _apiKey: string, // kept for backwards compatibility, not used
  patient: PatientCase,
  expertAnalysis: string,
  userResponse: UserResponse,
  informationRevealed: string[]
): Promise<EvaluationFeedback> {
  const prompt = buildEvaluationPrompt(patient, expertAnalysis, userResponse, informationRevealed);
  const text = await callServerAPI(prompt);

  const evaluation = parseEvaluationResponse(text);
  if (!evaluation) {
    throw new Error('Failed to parse evaluation response');
  }

  return evaluation;
}

export async function askQuestion(
  _apiKey: string, // kept for backwards compatibility, not used
  question: string,
  context: string
): Promise<string> {
  const prompt = `${context}\n\nQuestion: ${question}`;
  return await callServerAPI(prompt);
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation - should start with 'sk-ant-' and have reasonable length
  return apiKey.startsWith('sk-ant-') && apiKey.length > 40;
}

// ===== INSIGHT FEATURE =====

export interface StructuredInsightResponse {
  structuredCase: StructuredInsightCase;
  lessonLearned: string;
  keyTakeaways: string[];
  clinicalPearls: string[];
  suggestedCategory: Category;
  suggestedTags: string[];
}

export async function structureInsight(
  _apiKey: string, // kept for backwards compatibility, not used
  rawNotes: string
): Promise<StructuredInsightResponse> {
  const prompt = buildInsightStructuringPrompt(rawNotes);
  const text = await callServerAPI(prompt);

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(text));
    // Validate category
    if (!VALID_CATEGORIES.includes(parsed.suggestedCategory)) {
      parsed.suggestedCategory = 'Emergency';
    }
    return parsed as StructuredInsightResponse;
  } catch {
    throw new Error('Failed to parse insight response');
  }
}

// ===== QUIZ CARD GENERATION =====

interface GeneratedCard {
  type: QuizCardType;
  question: string;
  answer: string;
  hints?: string[];
  relatedConcepts?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateQuizCards(
  _apiKey: string, // kept for backwards compatibility, not used
  expertAnalysis: string,
  sourceMrn: string,
  category: Category
): Promise<QuizCard[]> {
  const prompt = buildQuizCardGenerationPrompt(expertAnalysis, category);
  const text = await callServerAPI(prompt);

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(text));
    const cards: QuizCard[] = parsed.cards.map((card: GeneratedCard, index: number) => ({
      id: `${sourceMrn}-${Date.now()}-${index}`,
      type: card.type,
      category,
      sourceMrn,
      question: card.question,
      answer: card.answer,
      hints: card.hints || [],
      relatedConcepts: card.relatedConcepts || [],
      difficulty: card.difficulty || 'medium',
      lastReviewedAt: null,
      nextReviewAt: null,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      correctAttempts: 0,
    }));
    return cards;
  } catch (e) {
    console.error('Quiz parse error. Raw text:', text);
    throw new Error('Failed to parse quiz cards response: ' + (e instanceof Error ? e.message : 'unknown'));
  }
}

// ===== CASE COMPARISON =====

export async function generateExpertAnalysis(
  _apiKey: string, // kept for backwards compatibility, not used
  scenario: string
): Promise<ExpertAnalysis> {
  const prompt = buildExpertAnalysisPrompt(scenario);
  const text = await callServerAPI(prompt);

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(text));
    return parsed as ExpertAnalysis;
  } catch (e) {
    console.error('Parse error. Raw text:', text);
    throw new Error('Failed to parse expert analysis: ' + (e instanceof Error ? e.message : 'unknown'));
  }
}

export interface ComparisonFeedback {
  scores: {
    assessment: number;
    workup: number;
    treatment: number;
    overall: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    missed: string[];
  };
}

export async function compareWithExpert(
  _apiKey: string, // kept for backwards compatibility, not used
  scenario: string,
  userInput: CaseComparisonInput,
  expertAnalysis: ExpertAnalysis
): Promise<ComparisonFeedback> {
  const expertStr = JSON.stringify(expertAnalysis, null, 2);
  const prompt = buildComparisonPrompt(
    scenario,
    userInput.userAssessment,
    userInput.userWorkup,
    userInput.userTreatment,
    expertStr
  );

  const text = await callServerAPI(prompt);

  try {
    return JSON.parse(stripMarkdownCodeBlocks(text)) as ComparisonFeedback;
  } catch {
    throw new Error('Failed to parse comparison feedback');
  }
}

// ===== DICTATION PARSING =====

export interface ParsedDictation {
  scenario: string;
  assessment: string;
  workup: string;
  treatment: string;
}

export async function parseDictation(
  _apiKey: string, // kept for backwards compatibility, not used
  dictatedText: string
): Promise<ParsedDictation> {
  const prompt = buildDictationParsePrompt(dictatedText);
  const text = await callServerAPI(prompt);

  try {
    return JSON.parse(stripMarkdownCodeBlocks(text)) as ParsedDictation;
  } catch {
    throw new Error('Failed to parse dictation');
  }
}
