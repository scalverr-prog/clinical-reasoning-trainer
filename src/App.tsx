import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CasePresentation } from './components/CasePresentation';
import { ResponseForm } from './components/ResponseForm';
import { Evaluation } from './components/Evaluation';
import { ExpertComparison } from './components/ExpertComparison';
import { ProgressDashboard } from './components/ProgressDashboard';
import { Settings } from './components/Settings';
import { categorizeCases } from './utils/categoryMatcher';
import { evaluateResponse } from './services/llmService';
import { useProgressStore } from './stores/progressStore';
import { DEMO_PATIENTS } from './data/cases';
import { CACHED_ANALYSES } from './data/analyses';
import type { CaseWithCategory, UserResponse, EvaluationFeedback } from './types';
import { Sparkles, AlertTriangle, Trophy, Zap, X, Brain, ArrowRight } from 'lucide-react';

type View = 'dashboard' | 'case' | 'progress' | 'settings';
type CasePhase = 'review' | 'respond' | 'evaluating' | 'results' | 'expert';

// Format labs content into structured expert analysis
function formatLabsAsAnalysis(caseData: CaseWithCategory): string {
  if (!caseData.labs) return 'No expert analysis available.';

  const labs = caseData.labs;

  // Extract the critical finding (usually after "CRITICAL:")
  const criticalMatch = labs.match(/CRITICAL:\s*(.+)/i);
  const criticalContent = criticalMatch ? criticalMatch[1] : labs;

  // Generate relevant references based on case content
  const references = generateReferences(caseData, labs);

  return `## EXPERT ANALYSIS

**What I noticed:**
- Patient: ${caseData.age}y ${caseData.gender} presenting with ${caseData.chief_complaint}
- Unit: ${caseData.unit}
- Documented diagnosis: ${caseData.diagnosis}
${caseData.pmh.length > 0 ? `- PMH: ${caseData.pmh.join(', ')}` : ''}
- Vitals: BP ${caseData.vitals.bp}, HR ${caseData.vitals.hr}, RR ${caseData.vitals.rr}, Temp ${caseData.vitals.temp}°F, SpO2 ${caseData.vitals.spo2}%

**Critical Finding:**
${criticalContent}

**What's Being Missed:**
The documented assessment of "${caseData.diagnosis}" may be incorrect or incomplete based on the clinical presentation.

**Key Clinical Points:**
${labs}

**What MUST happen:**
Review the critical analysis above and ensure appropriate workup and treatment are initiated immediately.

---

## References

${references}

---
*This case demonstrates a common diagnostic pitfall. The expert analysis identifies findings that should prompt reconsideration of the working diagnosis.*`;
}

// Generate clinical references based on case content
function generateReferences(caseData: CaseWithCategory, labs: string): string {
  const refs: string[] = [];
  const content = (labs + ' ' + caseData.chief_complaint + ' ' + caseData.diagnosis + ' ' + caseData.pmh.join(' ')).toLowerCase();

  // Cardiac references
  if (/chest pain|mi|myocardial|stemi|nstemi|acs|troponin|angina/.test(content)) {
    refs.push('1. Amsterdam EA, et al. 2014 AHA/ACC Guideline for the Management of Patients With Non-ST-Elevation Acute Coronary Syndromes. *Circulation*. 2014;130:e344-e426.');
    refs.push('2. Thygesen K, et al. Fourth Universal Definition of Myocardial Infarction (2018). *Circulation*. 2018;138:e618-e651.');
  }

  // PE/DVT references
  if (/pulmonary embolism|pe |dvt|d-dimer|wells|thrombosis/.test(content)) {
    refs.push('1. Konstantinides SV, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. *Eur Heart J*. 2020;41:543-603.');
    refs.push('2. Kearon C, et al. Antithrombotic Therapy for VTE Disease: CHEST Guideline. *Chest*. 2016;149:315-352.');
  }

  // Stroke references
  if (/stroke|tia|aphasia|hemiparesis|thrombolytic|tpa/.test(content)) {
    refs.push('1. Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. *Stroke*. 2019;50:e344-e418.');
    refs.push('2. Kleindorfer DO, et al. 2021 Guideline for the Prevention of Stroke in Patients With Stroke and TIA. *Stroke*. 2021;52:e364-e467.');
  }

  // Sepsis references
  if (/sepsis|septic|lactate|qsofa|infection.*fever|bacteremia/.test(content)) {
    refs.push('1. Evans L, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. *Crit Care Med*. 2021;49:e1063-e1143.');
    refs.push('2. Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). *JAMA*. 2016;315:801-810.');
  }

  // DKA/HHS references
  if (/dka|diabetic ketoacidosis|hhs|hyperglycemic|glucose.*high/.test(content)) {
    refs.push('1. Kitabchi AE, et al. Hyperglycemic Crises in Adult Patients With Diabetes. *Diabetes Care*. 2009;32:1335-1343.');
    refs.push('2. American Diabetes Association. Standards of Medical Care in Diabetes—2023. *Diabetes Care*. 2023;46(Suppl 1):S1-S291.');
  }

  // Meningitis references
  if (/meningitis|lumbar puncture|lp |csf|neck stiffness|photophobia/.test(content)) {
    refs.push('1. van de Beek D, et al. Clinical Practice Guideline for Bacterial Meningitis. *Clin Infect Dis*. 2016;63:e355-e388.');
    refs.push('2. Tunkel AR, et al. Practice Guidelines for Bacterial Meningitis. *Clin Infect Dis*. 2004;39:1267-1284.');
  }

  // Appendicitis references
  if (/appendicitis|appendix|rlq|mcburney/.test(content)) {
    refs.push('1. Di Saverio S, et al. WSES Jerusalem guidelines for diagnosis and treatment of acute appendicitis. *World J Emerg Surg*. 2016;11:34.');
    refs.push('2. Bhangu A, et al. Acute appendicitis: modern understanding of pathogenesis, diagnosis, and management. *Lancet*. 2015;386:1278-1287.');
  }

  // Aortic dissection/AAA references
  if (/aortic|dissection|aaa|aneurysm|tearing.*pain/.test(content)) {
    refs.push('1. Hiratzka LF, et al. 2010 ACCF/AHA/AATS/ACR/ASA/SCA/SCAI/SIR/STS/SVM Guidelines for the Diagnosis and Management of Patients With Thoracic Aortic Disease. *Circulation*. 2010;121:e266-e369.');
    refs.push('2. Chaikof EL, et al. The Society for Vascular Surgery practice guidelines on the care of patients with an abdominal aortic aneurysm. *J Vasc Surg*. 2018;67:2-77.');
  }

  // Ectopic pregnancy references
  if (/ectopic|pregnancy.*pain|hcg|tubal/.test(content)) {
    refs.push('1. ACOG Practice Bulletin No. 193: Tubal Ectopic Pregnancy. *Obstet Gynecol*. 2018;131:e91-e103.');
    refs.push('2. Barnhart KT. Ectopic Pregnancy. *N Engl J Med*. 2009;361:379-387.');
  }

  // Pediatric references
  if (caseData.age < 18 || /pediatric|child|infant|neonatal/.test(content)) {
    refs.push('1. American Academy of Pediatrics. Red Book: 2021–2024 Report of the Committee on Infectious Diseases. 32nd ed. Itasca, IL: AAP; 2021.');
    refs.push('2. Kliegman RM, et al. Nelson Textbook of Pediatrics. 21st ed. Philadelphia: Elsevier; 2020.');
  }

  // Drug toxicity references
  if (/toxicity|overdose|poison|drug level|digoxin|lithium|salicylate/.test(content)) {
    refs.push('1. Nelson LS, et al. Goldfrank\'s Toxicologic Emergencies. 11th ed. New York: McGraw-Hill; 2019.');
    refs.push('2. Hendrickson RG, et al. Clinical Toxicology. In: Tintinalli JE, et al. *Emergency Medicine*. 9th ed. McGraw-Hill; 2020.');
  }

  // Compartment syndrome references
  if (/compartment syndrome|compartment pressure|fasciotomy/.test(content)) {
    refs.push('1. Schmidt AH. Acute Compartment Syndrome. *Orthop Clin North Am*. 2016;47:517-525.');
    refs.push('2. Via AG, et al. Acute compartment syndrome. *Muscles Ligaments Tendons J*. 2015;5:18-22.');
  }

  // Necrotizing fasciitis references
  if (/necrotizing|fournier|fasciitis|gas gangrene/.test(content)) {
    refs.push('1. Stevens DL, et al. Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections: 2014 Update by IDSA. *Clin Infect Dis*. 2014;59:e10-e52.');
    refs.push('2. Hakkarainen TW, et al. Necrotizing soft tissue infections: review and current concepts in treatment, systems of care, and outcomes. *Curr Probl Surg*. 2014;51:344-362.');
  }

  // General emergency medicine reference if no specific matches
  if (refs.length === 0) {
    refs.push('1. Tintinalli JE, et al. Tintinalli\'s Emergency Medicine: A Comprehensive Study Guide. 9th ed. New York: McGraw-Hill; 2020.');
    refs.push('2. Marx JA, et al. Rosen\'s Emergency Medicine: Concepts and Clinical Practice. 9th ed. Philadelphia: Elsevier; 2018.');
    refs.push('3. UpToDate. Wolters Kluwer. Available at: https://www.uptodate.com');
  }

  return refs.join('\n\n');
}

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentCase, setCurrentCase] = useState<CaseWithCategory | null>(null);
  const [casePhase, setCasePhase] = useState<CasePhase>('review');
  const [_userResponse, setUserResponse] = useState<UserResponse | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(0);

  const { apiKey, recordCompletedCase, updateStreak, achievements } = useProgressStore();

  const cases = useMemo(() => categorizeCases(DEMO_PATIENTS), []);

  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => setShowAchievement(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement]);

  const handleStartCase = (caseData: CaseWithCategory) => {
    setCurrentCase(caseData);
    setCasePhase('review');
    setUserResponse(null);
    setEvaluation(null);
    setError(null);
    setCurrentView('case');
  };

  const handleSubmitResponse = async (response: UserResponse) => {
    if (!currentCase) return;

    if (!apiKey) {
      setError('Please add your Anthropic API key in Settings to enable evaluation.');
      return;
    }

    setUserResponse(response);
    setIsEvaluating(true);
    setError(null);
    setCasePhase('evaluating');

    try {
      const expertAnalysis = CACHED_ANALYSES[currentCase.mrn] || 'No expert analysis available for this case.';
      const feedback = await evaluateResponse(
        apiKey,
        currentCase,
        expertAnalysis,
        response,
        []
      );
      setEvaluation(feedback);
      setCasePhase('results');

      if (feedback.scores.overall >= 80) {
        setComboCount(c => c + 1);
      } else {
        setComboCount(0);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
      setCasePhase('respond');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCompleteCase = () => {
    if (!currentCase || !evaluation) return;

    const prevAchievements = [...achievements];

    recordCompletedCase(
      {
        mrn: currentCase.mrn,
        score: evaluation.scores.overall,
        date: new Date().toISOString(),
        category: currentCase.categories[0] || 'General',
      },
      currentCase.categories[0] || 'General',
      cases.filter(c => c.categories.includes(currentCase.categories[0])).length
    );
    updateStreak();

    const store = useProgressStore.getState();
    const newAchievement = store.achievements.find(a => !prevAchievements.includes(a));
    if (newAchievement) {
      setShowAchievement(newAchievement);
    }

    setCurrentCase(null);
    setCasePhase('review');
    setCurrentView('dashboard');
  };

  const handleCloseCase = () => {
    setCurrentCase(null);
    setCasePhase('review');
    setCurrentView('dashboard');
  };

  const expertAnalysis = currentCase
    ? (CACHED_ANALYSES[currentCase.mrn] || formatLabsAsAnalysis(currentCase))
    : '';

  const renderCaseContent = () => {
    if (!currentCase) return null;

    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCloseCase}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Combo Indicator */}
        {comboCount > 1 && casePhase === 'results' && (
          <div className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <Zap className="w-6 h-6" />
            <span className="font-bold">{comboCount}x COMBO!</span>
            <span className="text-orange-100">You're on fire!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Phase: Review Case */}
        {casePhase === 'review' && (
          <div className="space-y-6">
            <CasePresentation caseData={currentCase} />

            <button
              onClick={() => setCasePhase('respond')}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-lg"
            >
              <Brain className="w-6 h-6" />
              I've Reviewed the Case
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Phase: Respond */}
        {casePhase === 'respond' && (
          <div className="space-y-6">
            {/* Collapsed case summary */}
            <div className="bg-slate-800 text-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{currentCase.age}y {currentCase.gender}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-300">{currentCase.unit}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-blue-400">{currentCase.chief_complaint}</span>
                </div>
                <button
                  onClick={() => setCasePhase('review')}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  Review case
                </button>
              </div>
              <div className="mt-2 text-amber-400 text-sm">
                Documented Dx: {currentCase.diagnosis}
              </div>
            </div>

            <ResponseForm
              onSubmit={handleSubmitResponse}
              isSubmitting={isEvaluating}
            />
          </div>
        )}

        {/* Phase: Evaluating */}
        {casePhase === 'evaluating' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
              <Sparkles className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-xl font-medium text-gray-700">Analyzing your response...</p>
            <p className="text-gray-500 mt-2">Comparing with expert clinical reasoning</p>
          </div>
        )}

        {/* Phase: Results */}
        {casePhase === 'results' && evaluation && (
          <Evaluation
            feedback={evaluation}
            caseData={currentCase}
            onViewExpert={() => setCasePhase('expert')}
            onComplete={handleCompleteCase}
          />
        )}

        {/* Phase: Expert Comparison */}
        {casePhase === 'expert' && evaluation && (
          <ExpertComparison
            expertAnalysis={expertAnalysis}
            caseData={currentCase}
            onBack={() => setCasePhase('results')}
            onComplete={handleCompleteCase}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {/* Achievement Toast */}
      {showAchievement && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">Achievement Unlocked!</p>
              <p className="text-yellow-100">{showAchievement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20">
        {currentView === 'dashboard' && (
          <Dashboard cases={cases} onStartCase={handleStartCase} />
        )}
        {currentView === 'case' && renderCaseContent()}
        {currentView === 'progress' && <ProgressDashboard />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
