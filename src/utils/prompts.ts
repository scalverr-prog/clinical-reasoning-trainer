import type { PatientCase, UserResponse } from '../types';

export function buildEvaluationPrompt(
  patient: PatientCase,
  expertAnalysis: string,
  userResponse: UserResponse,
  _informationRevealed: string[]
): string {
  return `You are evaluating a medical learner's ability to identify clinical errors and missed findings.

## THE CASE
**Patient:** ${patient.age}y ${patient.gender} | ${patient.unit}
**Chief Complaint:** ${patient.chief_complaint}
**Clinical Notes:** ${patient.recent_notes}
**Documented Diagnosis:** ${patient.diagnosis}
**Current Medications/Orders:** ${patient.medications.join(', ') || 'None'}

## EXPERT ANALYSIS (What should have been caught)
${expertAnalysis}

## LEARNER'S RESPONSE
**What concerns them:** ${userResponse.safetyConsiderations || 'Not provided'}

**What they think is being missed:** ${userResponse.differentialDiagnosis || 'Not provided'}

**What they would do differently:** ${userResponse.workupPlan || 'Not provided'}

## EVALUATION INSTRUCTIONS
Compare the learner's response to the expert analysis. Score based on:

1. **Red Flag Recognition (30%)**: Did they identify the concerning findings/symptoms?
2. **Diagnostic Accuracy (30%)**: Did they recognize what's actually wrong or being missed?
3. **Action Plan (25%)**: Would their proposed actions address the real problem?
4. **Clinical Safety (15%)**: Did they prioritize patient safety appropriately?

Be encouraging but honest. Award partial credit for reasonable thinking even if they didn't catch everything.

## RESPONSE FORMAT
Return JSON only:
{
  "scores": {
    "clinicalReasoning": <0-100>,
    "differentialDiagnosis": <0-100>,
    "informationGathering": <0-100>,
    "treatmentPlan": <0-100>,
    "safetyAwareness": <0-100>
  },
  "strengths": ["<what they got right>", ...],
  "areasForImprovement": ["<what to work on>", ...],
  "missedFindings": ["<critical things they didn't catch>", ...],
  "expertComparison": "<2-3 sentence summary comparing their response to expert analysis>"
}`;
}

export function buildChatPrompt(
  patient: PatientCase,
  question: string,
  context: string
): string {
  return `You are a clinical educator helping a medical learner.

## CASE CONTEXT
${patient.chief_complaint} - ${patient.diagnosis}

## CONTEXT
${context}

## LEARNER'S QUESTION
${question}

Respond helpfully but don't give away answers directly. Encourage critical thinking.`;
}
