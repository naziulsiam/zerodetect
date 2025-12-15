// ===== ZeroDetect - In-browser AI Text Detection Engine =====
// Hybrid ensemble combining entropy, burstiness, n-gram reuse, lexical richness,
// semantic flow, readability, repetition, and stopword balance.
// Built by Ali Siam - https://github.com/naziulsiam

const MIN_TEXT_LENGTH = 50;
const WEIGHTS = {
    entropy: 0.25,
    burstiness: 0.2,
    ngram: 0.15,
    semantic: 0.1,
    lexical: 0.1,
    repetition: 0.1,
    readability: 0.05,
    stopwords: 0.05
};

// Comprehensive stop words for entropy/stopword balance
const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
    'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
    'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'being', 'has',
    'had', 'does', 'did', 'having', 'am', 'such', 'as', 'both', 'each', 'few',
    'more', 'most', 'many', 'much', 'several', 'through', 'during', 'before'
]);

// DOM references (cached for speed)
const ui = {
    textInput: document.getElementById('textInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    btnText: document.getElementById('btnText'),
    errorMessage: document.getElementById('errorMessage'),
    charCount: document.getElementById('charCount'),
    emptyState: document.getElementById('emptyState'),
    resultCard: document.getElementById('resultCard'),
    scorePercentage: document.getElementById('scorePercentage'),
    progressFill: document.getElementById('progressFill'),
    classificationBadge: document.getElementById('classificationBadge'),
    confidenceBox: document.getElementById('confidenceBox'),
    burstinessValue: document.getElementById('burstinessValue'),
    perplexityValue: document.getElementById('perplexityValue'),
    semanticValue: document.getElementById('semanticValue'),
    ngramValue: document.getElementById('ngramValue'),
    lexicalValue: document.getElementById('lexicalValue'),
    repetitionValue: document.getElementById('repetitionValue'),
    detailChars: document.getElementById('detailChars'),
    detailWords: document.getElementById('detailWords'),
    detailUnique: document.getElementById('detailUnique'),
    detailAvgWordLen: document.getElementById('detailAvgWordLen'),
    detailAvgSentenceLen: document.getElementById('detailAvgSentenceLen'),
    detailPunctuation: document.getElementById('detailPunctuation'),
    detailSemantic: document.getElementById('detailSemantic'),
    detailNgram: document.getElementById('detailNgram'),
    detailLexical: document.getElementById('detailLexical'),
    detailRepetition: document.getElementById('detailRepetition'),
    detailReadingEase: document.getElementById('detailReadingEase'),
    detailStopwords: document.getElementById('detailStopwords'),
    signalList: document.getElementById('signalList'),
    detailedAnalysis: document.getElementById('detailedAnalysis')
};

// ===== FIX #1: Initialize on DOM load =====
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    if (ui.analyzeBtn) {
        ui.analyzeBtn.addEventListener('click', analyzeText);
    }
    
    if (ui.textInput) {
        ui.textInput.addEventListener('input', updateCharCount);
    }
    
    // Initialize char count
    updateCharCount();
});

// ===== FIX #2: Add missing UI helper functions =====
function updateCharCount() {
    if (!ui.textInput || !ui.charCount) return;
    const length = ui.textInput.value.length;
    ui.charCount.textContent = `${length} characters`;
}

function showError(message) {
    if (!ui.errorMessage) return;
    ui.errorMessage.textContent = message;
    ui.errorMessage.classList.remove('hidden');
}

function clearError() {
    if (!ui.errorMessage) return;
    ui.errorMessage.classList.add('hidden');
    ui.errorMessage.textContent = '';
}

function lockButton(isLocked) {
    if (!ui.analyzeBtn || !ui.btnText) return;
    if (isLocked) {
        ui.analyzeBtn.disabled = true;
        ui.analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        ui.btnText.textContent = 'Analyzing...';
    } else {
        ui.analyzeBtn.disabled = false;
        ui.analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        ui.btnText.textContent = 'Analyze Text';
    }
}

// ===== FIX #3: Fixed analyzeText function with proper closing braces =====
function analyzeText() {
    const text = ui.textInput.value.trim();
    clearError();

    // FIXED: Added missing closing brace
    if (!text) {
        return showError('Please enter some text to analyze.');
    }

    // FIXED: Added missing closing brace
    if (text.length < MIN_TEXT_LENGTH) {
        return showError(`Text must be at least ${MIN_TEXT_LENGTH} characters. Current: ${text.length}`);
    }

    lockButton(true);
    // UX-friendly short delay
    setTimeout(() => {
        const result = detectAIText(text);
        displayResults(text, result);
        lockButton(false);
    }, 350);
}

// Run the ensemble detector
function detectAIText(text) {
    const sentences = splitSentences(text);
    const words = tokenize(text);

    const entropy = calculateRealEntropy(words);
    const entropyScore = entropyToAiScore(entropy) * WEIGHTS.entropy;

    const sentencePerplexities = sentences.map(calculateSentencePerplexity);
    const burstiness = calculateBurstiness(sentencePerplexities);
    const avgPerplexity = average(sentencePerplexities);
    const burstinessScore = burstinessToAiScore(burstiness) * WEIGHTS.burstiness;

    const ngram = calculateNgramSignature(words);
    const ngramScore = ngram * WEIGHTS.ngram;

    const semantic = calculateSemanticConsistency(sentences, text);
    const semanticAdjustment = detectFormalHumanWriting(text);
    const semanticScore = Math.max(0, semantic - semanticAdjustment) * WEIGHTS.semantic;

    const lexical = calculateLexicalRichness(words);
    const lexicalScore = lexical * WEIGHTS.lexical;

    const repetition = calculateRepetitionSignature(words);
    const repetitionScore = repetition * WEIGHTS.repetition;

    const readability = calculateReadabilityAI(sentences, words);
    const readabilityScore = readability.aiLikelihood * WEIGHTS.readability;

    const stopwords = calculateStopwordBalance(words);
    const stopwordScore = stopwords * WEIGHTS.stopwords;

    const total = entropyScore + burstinessScore + ngramScore + semanticScore +
                  lexicalScore + repetitionScore + readabilityScore + stopwordScore;
    const percentage = Math.round(Math.max(0, Math.min(1, total)) * 100);

    const signals = [
        {
            name: 'Entropy',
            weight: WEIGHTS.entropy * 100,
            value: entropy.toFixed(2),
            aiScore: (entropyScore / WEIGHTS.entropy).toFixed(2),
            description: 'Predictability of vocabulary distribution'
        },
        {
            name: 'Burstiness',
            weight: WEIGHTS.burstiness * 100,
            value: burstiness.toFixed(2),
            aiScore: (burstinessScore / WEIGHTS.burstiness).toFixed(2),
            description: 'Variance between sentence perplexities'
        },
        {
            name: 'N-gram Signature',
            weight: WEIGHTS.ngram * 100,
            value: (ngram * 100).toFixed(1) + '%',
            aiScore: (ngramScore / WEIGHTS.ngram).toFixed(2),
            description: 'Repetitive bigram/trigram patterns'
        },
        {
            name: 'Semantic Flow',
            weight: WEIGHTS.semantic * 100,
            value: (semantic * 100).toFixed(1) + '%',
            aiScore: (semanticScore / WEIGHTS.semantic).toFixed(2),
            description: 'Transitions and formal phrasing consistency'
        },
        {
            name: 'Lexical Richness',
            weight: WEIGHTS.lexical * 100,
            value: (lexical * 100).toFixed(1) + '%',
            aiScore: (lexicalScore / WEIGHTS.lexical).toFixed(2),
            description: 'Diversity of unique words'
        },
        {
            name: 'Repetition',
            weight: WEIGHTS.repetition * 100,
            value: (repetition * 100).toFixed(1) + '%',
            aiScore: (repetitionScore / WEIGHTS.repetition).toFixed(2),
            description: 'Looping phrases and reused fragments'
        },
        {
            name: 'Readability',
            weight: WEIGHTS.readability * 100,
            value: readability.flesch.toFixed(2),
            aiScore: (readabilityScore / WEIGHTS.readability).toFixed(2),
            description: 'Flesch reading ease and cadence'
        },
        {
            name: 'Stopword Balance',
            weight: WEIGHTS.stopwords * 100,
            value: (stopwords * 100).toFixed(1) + '%',
            aiScore: (stopwordScore / WEIGHTS.stopwords).toFixed(2),
            description: 'Functional word saturation'
        }
    ];

    return {
        percentage,
        burstiness: burstiness.toFixed(3),
        perplexity: avgPerplexity.toFixed(3),
        semantic: (semantic * 100).toFixed(1),
        ngram: (ngram * 100).toFixed(1),
        lexical: (lexical * 100).toFixed(1),
        repetition: (repetition * 100).toFixed(1),
        readability: readability.flesch.toFixed(2),
        stopwords: (stopwords * 100).toFixed(1),
        confidence: calculateHybridConfidence(burstiness, avgPerplexity, ngram, semantic),
        signals,
        details: {
            chars: text.length,
            words: words.length,
            unique: new Set(words).size,
            avgWordLen: averageWordLength(text, words),
            avgSentenceLen: averageSentenceLength(words, sentences),
            punctuation: calculatePunctuationDiversity(text).toFixed(3),
            semantic: (semantic * 100).toFixed(2),
            ngram: ngram.toFixed(3),
            lexical: lexical.toFixed(3),
            repetition: repetition.toFixed(3),
            fleschReadingEase: readability.flesch.toFixed(2),
            stopwordRatio: stopwords.toFixed(3)
        }
    };
}

// --- Metric helpers ---
function splitSentences(text) {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(Boolean);
}

function tokenize(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
}

function average(values) {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function averageWordLength(text, words) {
    if (!words.length) return '0.00';
    const letters = text.replace(/\s/g, '').length;
    return (letters / words.length).toFixed(2);
}

function averageSentenceLength(words, sentences) {
    if (!sentences.length) return '0.00';
    return (words.length / sentences.length).toFixed(2);
}

function calculateRealEntropy(words) {
    if (!words.length) return 0;
    const freq = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});
    return Object.values(freq).reduce((entropy, count) => {
        const prob = count / words.length;
        return entropy - prob * Math.log2(prob);
    }, 0);
}

function entropyToAiScore(entropy) {
    if (entropy < 3.5) return 1.0;
    if (entropy < 3.8) return 0.85;
    if (entropy < 4.2) return 0.6;
    if (entropy < 4.5) return 0.3;
    if (entropy < 5.5) return 0.1;
    return 0.02;
}

function calculateSentencePerplexity(sentence) {
    const words = tokenize(sentence);
    if (!words.length) return 0;
    const commonWords = {
        the: 0.2, a: 0.15, and: 0.15, to: 0.12, of: 0.12,
        in: 0.12, is: 0.10, that: 0.10, for: 0.10, it: 0.10,
        with: 0.09, as: 0.08, on: 0.08, be: 0.08, have: 0.08
    };
    const predictability = words.reduce((score, word) => score + (commonWords[word] || 0.02), 0) / words.length;
    const structureBonus = /^(this|the|in|our|by|as|for|through)\s/.test(sentence.trim()) ? 0.05 : 0;
    return 2.0 + (1.0 - (predictability + structureBonus)) * 4.0;
}

function calculateBurstiness(perplexities) {
    if (perplexities.length < 2) return 0;
    const mean = average(perplexities);
    const variance = perplexities.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / perplexities.length;
    return Math.sqrt(variance);
}

function burstinessToAiScore(burstiness) {
    if (burstiness < 0.35) return 0.95;
    if (burstiness < 0.6) return 0.75;
    if (burstiness < 0.9) return 0.55;
    if (burstiness < 1.2) return 0.35;
    return 0.15;
}

function calculateLexicalRichness(words) {
    if (!words.length) return 0.5;
    const ratio = new Set(words).size / words.length;
    if (ratio < 0.40) return 0.95;
    if (ratio < 0.48) return 0.75;
    if (ratio < 0.56) return 0.55;
    if (ratio < 0.65) return 0.35;
    return 0.15;
}

function calculateRepetitionSignature(words) {
    if (words.length < 6) return 0.35;
    const bigramCounts = {};
    const trigramCounts = {};

    for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }

    for (let i = 0; i < words.length - 2; i++) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        trigramCounts[trigram] = (trigramCounts[trigram] || 0) + 1;
    }

    const repeatedBigrams = Object.values(bigramCounts).filter(c => c > 1).length;
    const repeatedTrigrams = Object.values(trigramCounts).filter(c => c > 1).length;
    const denominator = Math.max(1, Object.keys(bigramCounts).length + Object.keys(trigramCounts).length);
    const repetitionRatio = (repeatedBigrams * 0.6 + repeatedTrigrams * 0.4) / denominator;

    if (repetitionRatio > 0.10) return 0.95;
    if (repetitionRatio > 0.06) return 0.75;
    if (repetitionRatio > 0.03) return 0.50;
    return 0.25;
}

function calculateReadabilityAI(sentences, words) {
    if (!words.length || !sentences.length) {
        return { aiLikelihood: 0.5, flesch: 0 };
    }
    const syllableCount = words.reduce((total, word) => total + estimateSyllables(word), 0);
    const wordsPerSentence = words.length / sentences.length;
    const syllablesPerWord = syllableCount / words.length;
    const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

    let aiLikelihood = 0.2;
    if (fleschReadingEase < 40) aiLikelihood = 0.80;
    else if (fleschReadingEase < 55) aiLikelihood = 0.60;
    else if (fleschReadingEase < 70) aiLikelihood = 0.45;
    else if (fleschReadingEase < 85) aiLikelihood = 0.35;

    return { aiLikelihood, flesch: fleschReadingEase };
}

function estimateSyllables(word) {
    const cleaned = word.toLowerCase().replace(/e$/i, '');
    const matches = cleaned.match(/[aeiouy]+/g);
    return Math.max(1, (matches || []).length);
}

function calculateStopwordBalance(words) {
    if (!words.length) return 0.5;
    const stopwordCount = words.filter(w => STOP_WORDS.has(w)).length;
    const ratio = stopwordCount / words.length;

    if (ratio < 0.35) return 0.80;
    if (ratio < 0.45) return 0.60;
    if (ratio < 0.55) return 0.40;
    if (ratio < 0.65) return 0.50;
    return 0.70;
}

function calculateNgramSignature(words) {
    if (words.length < 3) return 0.5;
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]} ${words[i + 1]}`);
    }

    const bigramFreq = bigrams.reduce((acc, bg) => {
        acc[bg] = (acc[bg] || 0) + 1;
        return acc;
    }, {});

    const bigramEntropy = Object.values(bigramFreq).reduce((entropy, count) => {
        const prob = count / bigrams.length;
        return entropy - prob * Math.log2(prob || 1);
    }, 0);

    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
        trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    const trigramFreq = trigrams.reduce((acc, tg) => {
        acc[tg] = (acc[tg] || 0) + 1;
        return acc;
    }, {});

    const repeatedTrigrams = Object.values(trigramFreq).filter(count => count > 1).length;
    const trigramRepetitionRatio = trigrams.length ? repeatedTrigrams / Object.keys(trigramFreq).length : 0;
    const ngramAIIndicator = bigramEntropy < 8.2 ? 1 : 0;
    const trigramAIIndicator = trigramRepetitionRatio > 0.08 ? 0.8 : 0.2;

    return ngramAIIndicator * 0.6 + trigramAIIndicator * 0.4;
}

function calculateSemanticConsistency(sentences, rawText) {
    if (sentences.length < 2) return 0.5;
    const keywordPatterns = {
        transitions: ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently', 'thus', 'hence'],
        qualifiers: ['significant', 'important', 'notable', 'remarkable', 'evident', 'clear', 'obvious', 'essential'],
        passive: ['is', 'are', 'was', 'were', 'be', 'been', 'being'],
        formal: ['provides', 'demonstrates', 'indicates', 'suggests', 'shows', 'reveals', 'presents']
    };

    let consistentPatterns = 0;
    sentences.forEach((sentence) => {
        const lower = sentence.toLowerCase();
        const hasTransition = keywordPatterns.transitions.some(t => lower.includes(t));
        const hasPassive = keywordPatterns.passive.some(p => lower.includes(p)) && lower.length > 20;
        const hasFormal = keywordPatterns.formal.some(f => lower.includes(f));
        const hasQualifier = keywordPatterns.qualifiers.some(q => lower.includes(q));

        if (hasTransition || hasPassive || hasFormal || hasQualifier) {
            consistentPatterns++;
        }
    });

    const ratio = consistentPatterns / sentences.length;
    return ratio > 0.60 ? Math.min(1, ratio) : ratio * 0.3;
}

function detectFormalHumanWriting(text) {
    const lower = text.toLowerCase();
    const educationalMarkers = [
        'explain', 'example', 'demonstrate', 'show', 'evidence',
        'support', 'claim', 'topic', 'sentence', 'paragraph',
        'continue', 'pattern', 'relationship', 'instruction',
        'write', 'essay', 'learn', 'teaching', 'student'
    ];
    const academicMarkers = [
        'moreover', 'furthermore', 'however', 'thus', 'therefore',
        'significant', 'important', 'relevant', 'appropriate'
    ];

    const educationalCount = educationalMarkers.filter(m => lower.includes(m)).length;
    const academicCount = academicMarkers.filter(m => lower.includes(m)).length;

    if (educationalCount >= 2) return 0.35;
    if (academicCount >= 2) return 0.20;
    return 0;
}

function calculatePunctuationDiversity(text) {
    const punctuation = text.match(/[!?.;:\-—–]/g) || [];
    if (!punctuation.length) return 0;
    return new Set(punctuation).size / punctuation.length;
}

function calculateHybridConfidence(burstiness, perplexity, ngramScore, semanticScore) {
    const burstinessIndicator = burstiness < 0.7 ? 1 : (burstiness < 1.0 ? 0.5 : 0);
    const perplexityIndicator = perplexity < 3.5 ? 1 : (perplexity < 4.0 ? 0.5 : 0);
    const ngramIndicator = ngramScore > 0.65 ? 1 : (ngramScore > 0.50 ? 0.5 : 0);
    const semanticIndicator = semanticScore > 0.55 ? 1 : (semanticScore > 0.40 ? 0.5 : 0);

    const agreement = (
        burstinessIndicator * 0.30 +
        ngramIndicator * 0.15 +
        semanticIndicator * 0.10 +
        perplexityIndicator * 0.45
    );

    if (agreement >= 0.85) return 'Very High';
    if (agreement >= 0.70) return 'High';
    if (agreement >= 0.50) return 'Medium';
    if (agreement >= 0.30) return 'Low';
    return 'Very Low';
}

// --- UI helpers ---
function displayResults(text, result) {
    ui.scorePercentage.textContent = `${result.percentage}%`;
    ui.progressFill.style.width = `${result.percentage}%`;

    if (result.percentage < 30) {
        ui.progressFill.className = 'h-full progress-bar-fill bg-gradient-to-r from-emerald-400 via-cyan-500 to-cyan-600 shadow-lg shadow-emerald-500/30';
    } else if (result.percentage < 70) {
        ui.progressFill.className = 'h-full progress-bar-fill bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 shadow-lg shadow-amber-500/30';
    } else {
        ui.progressFill.className = 'h-full progress-bar-fill bg-gradient-to-r from-rose-500 via-red-500 to-red-700 shadow-lg shadow-rose-500/30';
    }

    const badgeState = classifyPercentage(result.percentage);
    ui.classificationBadge.textContent = badgeState.label;
    ui.classificationBadge.className = `inline-block px-4 py-2 rounded-lg text-sm font-bold ${badgeState.classes}`;

    ui.confidenceBox.innerHTML = `
        <p class="text-lg font-semibold text-white">Confidence: ${result.confidence}</p>
        <p class="text-sm text-slate-400">${result.percentage}% AI-generated • ${100 - result.percentage}% Human-written</p>
    `;

    ui.burstinessValue.textContent = result.burstiness;
    ui.perplexityValue.textContent = result.perplexity;
    ui.semanticValue.textContent = `${result.semantic}%`;
    ui.ngramValue.textContent = `${result.ngram}%`;
    ui.lexicalValue.textContent = `${result.lexical}%`;
    ui.repetitionValue.textContent = `${result.repetition}%`;

    ui.detailChars.textContent = result.details.chars.toLocaleString();
    ui.detailWords.textContent = result.details.words.toLocaleString();
    ui.detailUnique.textContent = result.details.unique.toLocaleString();
    ui.detailAvgWordLen.textContent = result.details.avgWordLen;
    ui.detailAvgSentenceLen.textContent = result.details.avgSentenceLen;
    ui.detailPunctuation.textContent = result.details.punctuation;
    ui.detailSemantic.textContent = result.details.semantic;
    ui.detailNgram.textContent = result.details.ngram;
    ui.detailLexical.textContent = result.details.lexical;
    ui.detailRepetition.textContent = result.details.repetition;
    ui.detailReadingEase.textContent = result.details.fleschReadingEase;
    ui.detailStopwords.textContent = result.details.stopwordRatio;

    renderSignals(result.signals);

    ui.emptyState.classList.add('hidden');
    ui.resultCard.classList.remove('hidden');
    
    if (ui.detailedAnalysis) {
        ui.detailedAnalysis.classList.remove('hidden');
    }
}

function classifyPercentage(percentage) {
    if (percentage < 20) {
        return { label: '✅ Definitely Human', classes: 'bg-green-500/20 text-green-400 border border-green-500/30' };
    }
    if (percentage < 40) {
        return { label: '👤 Likely Human', classes: 'bg-green-500/10 text-green-300 border border-green-500/20' };
    }
    if (percentage < 60) {
        return { label: '❓ Mixed/Uncertain', classes: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' };
    }
    if (percentage < 80) {
        return { label: '🤖 Likely AI', classes: 'bg-red-500/10 text-red-300 border border-red-500/20' };
    }
    return { label: '⚠️ Definitely AI', classes: 'bg-red-500/20 text-red-400 border border-red-500/30' };
}

function renderSignals(signals) {
    ui.signalList.innerHTML = '';
    signals.forEach(signal => {
        const wrapper = document.createElement('div');
        wrapper.className = 'p-4 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:border-cyan-500/30 transition-all duration-200';

        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-2';
        header.innerHTML = `
            <span class="text-sm font-semibold text-white">${signal.name}</span>
            <span class="text-xs text-slate-400">${signal.weight}% weight</span>
        `;

        const value = document.createElement('div');
        value.className = 'text-cyan-400 font-mono text-lg mb-1';
        value.textContent = signal.value;

        const desc = document.createElement('div');
        desc.className = 'text-xs text-slate-500';
        desc.textContent = signal.description;

        const score = document.createElement('div');
        score.className = 'text-xs text-slate-400 mt-1';
        score.textContent = `AI Score: ${signal.aiScore}`;

        wrapper.appendChild(header);
        wrapper.appendChild(value);
        wrapper.appendChild(desc);
        wrapper.appendChild(score);
        ui.signalList.appendChild(wrapper);
    });
}
