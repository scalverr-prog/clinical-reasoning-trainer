import type { PatientCase, UserResponse, EvaluationFeedback, StructuredInsightCase, Category, QuizCard, QuizCardType, ExpertAnalysis, CaseComparisonInput } from '../types';
import { buildEvaluationPrompt } from '../utils/prompts';
import { parseEvaluationResponse } from '../utils/scoring';
import { buildInsightStructuringPrompt, buildQuizCardGenerationPrompt, buildExpertAnalysisPrompt, buildComparisonPrompt, buildDictationParsePrompt, VALID_CATEGORIES } from '../utils/insightPrompts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper to strip markdown code blocks from LLM responses
function stripMarkdownCodeBlocks(text: string): string {
  let result = text.trim();
  if (result.startsWith('```')) {
    result = result.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return result;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  error?: { message: string };
}

export async function evaluateResponse(
  apiKey: string,
  patient: PatientCase,
  expertAnalysis: string,
  userResponse: UserResponse,
  informationRevealed: string[]
): Promise<EvaluationFeedback> {
  const prompt = buildEvaluationPrompt(patient, expertAnalysis, userResponse, informationRevealed);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  const evaluation = parseEvaluationResponse(textContent.text);
  if (!evaluation) {
    throw new Error('Failed to parse evaluation response');
  }

  return evaluation;
}

export async function askQuestion(
  apiKey: string,
  question: string,
  context: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${context}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  return textContent?.text || 'No response received';
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
  apiKey: string,
  rawNotes: string
): Promise<StructuredInsightResponse> {
  const prompt = buildInsightStructuringPrompt(rawNotes);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(textContent.text));
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
  apiKey: string,
  expertAnalysis: string,
  sourceMrn: string,
  category: Category
): Promise<QuizCard[]> {
  const prompt = buildQuizCardGenerationPrompt(expertAnalysis, category);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(textContent.text));
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
    console.error('Quiz parse error. Raw text:', textContent.text);
    throw new Error('Failed to parse quiz cards response: ' + (e instanceof Error ? e.message : 'unknown'));
  }
}

// ===== CASE COMPARISON =====

export async function generateExpertAnalysis(
  apiKey: string,
  scenario: string
): Promise<ExpertAnalysis> {
  const prompt = buildExpertAnalysisPrompt(scenario);
  const modelId = 'claude-sonnet-4-5-20250929';

  console.log('Making API request with model:', modelId);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error Response:', response.status, JSON.stringify(errorData, null, 2));
    const errorMsg = errorData.error?.message || errorData.message || JSON.stringify(errorData);
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  try {
    const parsed = JSON.parse(stripMarkdownCodeBlocks(textContent.text));
    return parsed as ExpertAnalysis;
  } catch (e) {
    console.error('Parse error. Raw text:', textContent.text);
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
  apiKey: string,
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
  const modelId = 'claude-sonnet-4-5-20250929';

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Comparison API Error:', response.status, JSON.stringify(errorData, null, 2));
    const errorMsg = errorData.error?.message || errorData.message || JSON.stringify(errorData);
    throw new Error(`API Error (${response.status}): ${errorMsg}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  try {
    return JSON.parse(stripMarkdownCodeBlocks(textContent.text)) as ComparisonFeedback;
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
  apiKey: string,
  dictatedText: string
): Promise<ParsedDictation> {
  const prompt = buildDictationParsePrompt(dictatedText);
  const modelId = 'claude-sonnet-4-5-20250929';

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const textContent = data.content.find(c => c.type === 'text');
  if (!textContent) {
    throw new Error('No text content in response');
  }

  try {
    return JSON.parse(stripMarkdownCodeBlocks(textContent.text)) as ParsedDictation;
  } catch {
    throw new Error('Failed to parse dictation');
  }
}
