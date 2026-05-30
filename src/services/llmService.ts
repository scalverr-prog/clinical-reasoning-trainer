import type { PatientCase, UserResponse, EvaluationFeedback } from '../types';
import { buildEvaluationPrompt } from '../utils/prompts';
import { parseEvaluationResponse } from '../utils/scoring';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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
      model: 'claude-sonnet-4-20250514',
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
      model: 'claude-sonnet-4-20250514',
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
