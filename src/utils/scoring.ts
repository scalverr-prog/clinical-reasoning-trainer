import type { EvaluationScore, EvaluationFeedback } from '../types';

export const SCORING_WEIGHTS = {
  clinicalReasoning: 0.25,
  differentialDiagnosis: 0.20,
  informationGathering: 0.20,
  treatmentPlan: 0.20,
  safetyAwareness: 0.15,
};

export function calculateOverallScore(scores: Omit<EvaluationScore, 'overall'>): number {
  return Math.round(
    scores.clinicalReasoning * SCORING_WEIGHTS.clinicalReasoning +
    scores.differentialDiagnosis * SCORING_WEIGHTS.differentialDiagnosis +
    scores.informationGathering * SCORING_WEIGHTS.informationGathering +
    scores.treatmentPlan * SCORING_WEIGHTS.treatmentPlan +
    scores.safetyAwareness * SCORING_WEIGHTS.safetyAwareness
  );
}

export function getScoreGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'Excellent', color: 'text-green-600' };
  if (score >= 80) return { grade: 'Good', color: 'text-blue-600' };
  if (score >= 70) return { grade: 'Satisfactory', color: 'text-yellow-600' };
  if (score >= 60) return { grade: 'Needs Improvement', color: 'text-orange-600' };
  return { grade: 'Review Required', color: 'text-red-600' };
}

export function parseEvaluationResponse(response: string): EvaluationFeedback | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (parsed.scores && typeof parsed.scores.clinicalReasoning === 'number') {
        const scores: EvaluationScore = {
          clinicalReasoning: parsed.scores.clinicalReasoning,
          differentialDiagnosis: parsed.scores.differentialDiagnosis,
          informationGathering: parsed.scores.informationGathering,
          treatmentPlan: parsed.scores.treatmentPlan,
          safetyAwareness: parsed.scores.safetyAwareness,
          overall: 0,
        };
        scores.overall = calculateOverallScore(scores);

        return {
          scores,
          strengths: parsed.strengths || [],
          areasForImprovement: parsed.areasForImprovement || [],
          missedFindings: parsed.missedFindings || [],
          expertComparison: parsed.expertComparison || '',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse evaluation response:', e);
  }
  return null;
}

export function formatScoreForDisplay(score: number): string {
  return `${score}/100`;
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 15;
  if (streak >= 14) return 10;
  if (streak >= 7) return 5;
  if (streak >= 3) return 2;
  return 0;
}
