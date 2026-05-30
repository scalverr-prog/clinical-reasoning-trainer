const fs = require('fs');
const path = require('path');

// Read all batch files
const batchFiles = [
  './src/data/new-cases-batch1.ts',
  './src/data/new-cases-batch2.ts',
  './src/data/new-cases-batch3.ts',
  './src/data/new-cases-batch4.ts'
];

let allCases = [];
let allAnalyses = {};

for (const file of batchFiles) {
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, 'utf8');

  // Extract cases array using regex
  const casesMatch = content.match(/export const BATCH\d+_CASES = \[([\s\S]*?)\];/);
  if (casesMatch) {
    // Evaluate the array (simplified - just extract objects)
    const casesStr = casesMatch[1];
    // Count opening braces to find objects
    let cases = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < casesStr.length; i++) {
      if (casesStr[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (casesStr[i] === '}') {
        depth--;
        if (depth === 0 && start >= 0) {
          cases.push(casesStr.substring(start, i + 1));
          start = -1;
        }
      }
    }
    allCases.push(...cases);
  }

  // Extract analyses
  const analysesMatch = content.match(/export const BATCH\d+_ANALYSES: Record<string, string> = \{([\s\S]*?)\};/);
  if (analysesMatch) {
    const analysesStr = analysesMatch[1];
    // Simple extraction of key-value pairs
    const pairs = analysesStr.match(/"MRN-\d+": [`'"][\s\S]*?[`'"]/g);
    if (pairs) {
      for (const pair of pairs) {
        const keyMatch = pair.match(/"(MRN-\d+)":/);
        const valueMatch = pair.match(/: [`'"](.*)['`"]/s);
        if (keyMatch && valueMatch) {
          allAnalyses[keyMatch[1]] = valueMatch[1];
        }
      }
    }
  }
}

console.log(`Found ${allCases.length} new cases`);
console.log(`Found ${Object.keys(allAnalyses).length} new analyses`);

// Append to clinical-reasoning-trainer cases.ts
const trainerCasesPath = './src/data/cases.ts';
let trainerCases = fs.readFileSync(trainerCasesPath, 'utf8');

// Find the closing bracket of the array
const closingBracket = trainerCases.lastIndexOf('];');
if (closingBracket > 0) {
  const newContent = trainerCases.substring(0, closingBracket) +
    ',\n  // === NEW CASES BATCH (Auto-generated) ===\n  ' +
    allCases.join(',\n  ') +
    '\n];';
  fs.writeFileSync(trainerCasesPath, newContent);
  console.log('Updated clinical-reasoning-trainer cases.ts');
}

// Append to clinical-reasoning-trainer analyses.ts
const trainerAnalysesPath = './src/data/analyses.ts';
let trainerAnalyses = fs.readFileSync(trainerAnalysesPath, 'utf8');

// Find the closing brace of the object
const closingBrace = trainerAnalyses.lastIndexOf('};');
if (closingBrace > 0) {
  let analysisEntries = Object.entries(allAnalyses)
    .map(([mrn, analysis]) => `  "${mrn}": \`${analysis.replace(/`/g, "'")}\``)
    .join(',\n');

  const newAnalysesContent = trainerAnalyses.substring(0, closingBrace) +
    ',\n  // === NEW ANALYSES BATCH (Auto-generated) ===\n' +
    analysisEntries +
    '\n};';
  fs.writeFileSync(trainerAnalysesPath, newAnalysesContent);
  console.log('Updated clinical-reasoning-trainer analyses.ts');
}

// Also update clinical-insight if it exists
const insightAppPath = '/Users/scalver/clinical-insight/frontend/src/App.tsx';
const insightPanelPath = '/Users/scalver/clinical-insight/frontend/src/components/ClinicalInsightPanel.tsx';

if (fs.existsSync(insightAppPath)) {
  let insightApp = fs.readFileSync(insightAppPath, 'utf8');
  const insightClosing = insightApp.lastIndexOf('];', insightApp.indexOf('function App'));
  if (insightClosing > 0) {
    const newInsightContent = insightApp.substring(0, insightClosing) +
      ',\n  // === NEW CASES BATCH ===\n  ' +
      allCases.join(',\n  ') +
      '\n' + insightApp.substring(insightClosing);
    fs.writeFileSync(insightAppPath, newInsightContent);
    console.log('Updated clinical-insight App.tsx');
  }
}

if (fs.existsSync(insightPanelPath)) {
  let insightPanel = fs.readFileSync(insightPanelPath, 'utf8');
  const panelClosing = insightPanel.lastIndexOf('};', insightPanel.indexOf('export function'));
  if (panelClosing > 0) {
    let analysisEntries = Object.entries(allAnalyses)
      .map(([mrn, analysis]) => `  "${mrn}": \`${analysis.replace(/`/g, "'")}\``)
      .join(',\n');

    const newPanelContent = insightPanel.substring(0, panelClosing) +
      ',\n  // === NEW ANALYSES BATCH ===\n' +
      analysisEntries +
      '\n' + insightPanel.substring(panelClosing);
    fs.writeFileSync(insightPanelPath, newPanelContent);
    console.log('Updated clinical-insight ClinicalInsightPanel.tsx');
  }
}

console.log('Done!');
