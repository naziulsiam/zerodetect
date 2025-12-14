// ===== ZERO DETECT - AI TEXT DETECTION ENGINE =====
// Advanced hybrid detection using multiple linguistic analysis methods
// Created by Ali Siam - https://github.com/naziulsiam

const MIN_TEXT_LENGTH = 50;

// Comprehensive stop words for entropy calculation
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

// Main analysis function
function analyzeText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    const errorDiv = document.getElementById('errorMessage');

    // Clear previous errors
    errorDiv.classList.add('hidden');

    // Validation
    if (!text) {
        showError('Please enter some text to analyze.');
        return;
    }

    if (text.length < MIN_TEXT_LENGTH) {
        showError(`Text must be at least ${MIN_TEXT_LENGTH} characters. Current: ${text.length}`);
        return;
    }

    // Visual feedback
    const btn = document.getElementById('analyzeBtn');
    const btnText = document.getElementById('btnText');
    btn.disabled = true;
    btnText.innerHTML = '<div class="spinner inline-block"></div> Analyzing...';

    // Simulate processing delay for UX
    setTimeout(() => {
        const result = detectAIText(text);
        displayResults(text, result);
        btn.disabled = false;
        btnText.innerHTML = '⚡ Analyze Text';
    }, 500);
}

// Core AI detection engine
function detectAIText(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // METHOD 1: Real Shannon Entropy (45% weight)
    const realEntropy = calculateRealEntropy(text);
    const entropyAIScore = calculateEntropyAIScore(realEntropy) * 0.45;
    
    // METHOD 2: Burstiness Analysis (30% weight)
    const sentencePerplexities = sentences.map(sentence => calculateSentencePerplexity(sentence));
    const burstiness = calculateBurstiness(sentencePerplexities);
    const avgPerplexity = sentencePerplexities.length > 0 
        ? sentencePerplexities.reduce((a, b) => a + b, 0) / sentencePerplexities.length 
        : 0;
    const burstinessAIScore = (1 - Math.min(1, burstiness / 1.5)) * 0.30;
    
    // METHOD 3: N-gram Profiling (15% weight)
    const ngramScore = calculateNgramSignature(text);
    const ngramAIScore = ngramScore * 0.15;
    
    // METHOD 4: Semantic Consistency (10% weight)
    const semanticScore = calculateSemanticConsistency(text);
    const humanAcademicReduction = detectFormalHumanWriting(text);
    const semanticAIScore = Math.max(0, (semanticScore - humanAcademicReduction)) * 0.10;

    // Calculate total AI score
    const totalAIScore = entropyAIScore + burstinessAIScore + ngramAIScore + semanticAIScore;
    const percentage = Math.max(0, Math.min(100, totalAIScore * 100));

    return {
        percentage: Math.round(percentage),
        burstiness: burstiness.toFixed(3),
        perplexity: avgPerplexity.toFixed(3),
        semantic: (semanticScore * 100).toFixed(1),
        ngram: (ngramScore * 100).toFixed(1),
        confidence: calculateHybridConfidence(burstiness, avgPerplexity, ngramScore, semanticScore),
        details: {
            chars: text.length,
            words: text.split(/\s+/).length,
            unique: new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size,
            avgWordLen: (text.replace(/\s/g, '').length / text.split(/\s+/).length).toFixed(2),
            avgSentenceLen: (sentences.length > 0 
                ? (text.split(/\s+/).length / sentences.length).toFixed(2) 
                : '0'),
            punctuation: calculatePunctuationDiversity(text).toFixed(3),
            semantic: (semanticScore * 100).toFixed(2),
            ngram: ngramScore.toFixed(3)
        }
    };
}

// Calculate real Shannon entropy
function calculateRealEntropy(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;

    const freq = {};
    words.forEach(word => {
        freq[word] = (freq[word] || 0) + 1;
    });

    let entropy = 0;
    Object.values(freq).forEach(count => {
        const prob = count / words.length;
        entropy -= prob * Math.log2(prob);
    });

    return entropy;
}

// Convert entropy to AI score
function calculateEntropyAIScore(entropy) {
    if (entropy < 3.5) return 1.0;      // Definitely AI
    if (entropy < 3.8) return 0.85;
    if (entropy < 4.2) return 0.60;
    if (entropy < 4.5) return 0.30;
    if (entropy < 5.5) return 0.10;
    return 0.02;                        // Definitely human
}

// Calculate sentence perplexity
function calculateSentencePerplexity(sentence) {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;

    const commonWords = {
        'the': 0.2, 'a': 0.15, 'and': 0.15, 'to': 0.12, 'of': 0.12,
        'in': 0.12, 'is': 0.10, 'that': 0.10, 'for': 0.10, 'it': 0.10,
        'with': 0.09, 'as': 0.08, 'on': 0.08, 'be': 0.08, 'have': 0.08
    };

    let predictabilityScore = 0;
    words.forEach(word => {
        predictabilityScore += commonWords[word] || 0.02;
    });
    predictabilityScore = predictabilityScore / words.length;

    const hasCommonPatterns = /^(this|the|in|our|by|as|for|through)\s/.test(sentence.trim());
    const structureBonus = hasCommonPatterns ? 0.05 : 0;

    return 2.0 + (1.0 - (predictabilityScore + structureBonus)) * 4.0;
}

// Calculate burstiness
function calculateBurstiness(perplexities) {
    if (perplexities.length < 2) return 0;
    
    const mean = perplexities.reduce((a, b) => a + b, 0) / perplexities.length;
    const variance = perplexities.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / perplexities.length;
    
    return Math.sqrt(variance);
}

// Calculate n-gram signature
function calculateNgramSignature(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length < 3) return 0.5;

    // Bigram analysis
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(words[i] + ' ' + words[i + 1]);
    }

    const bigramFreq = {};
    bigrams.forEach(bg => {
        bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
    });

    let entropy = 0;
    const totalBigrams = bigrams.length;
    Object.values(bigramFreq).forEach(count => {
        const prob = count / totalBigrams;
        entropy -= prob * Math.log2(prob || 1);
    });

    const ngramAIIndicator = entropy < 8.2 ? 1 : 0;

    // Trigram analysis
    const trigrams = [];
    for (let i = 0; i < words.length - 2; i++) {
        trigrams.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }

    const trigramFreq = {};
    trigrams.forEach(tg => {
        trigramFreq[tg] = (trigramFreq[tg] || 0) + 1;
    });

    const repeatedTrigrams = Object.values(trigramFreq).filter(count => count > 1).length;
    const trigramRepetitionRatio = repeatedTrigrams / Object.keys(trigramFreq).length;
    const trigramAIIndicator = trigramRepetitionRatio > 0.08 ? 0.8 : 0.2;

    return (ngramAIIndicator * 0.6 + trigramAIIndicator * 0.4);
}

// Calculate semantic consistency
function calculateSemanticConsistency(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 0.5;

    const keywordPatterns = {
        transitions: ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently', 'thus', 'hence'],
        qualifiers: ['significant', 'important', 'notable', 'remarkable', 'evident', 'clear', 'obvious', 'essential'],
        passive_constructions: ['is', 'are', 'was', 'were', 'be', 'been', 'being'],
        formal_patterns: ['provides', 'demonstrates', 'indicates', 'suggests', 'shows', 'reveals', 'presents']
    };

    let consistentPatterns = 0;
    let totalPatterns = 0;

    sentences.forEach((sentence) => {
        const lower = sentence.toLowerCase();
        const hasTransition = keywordPatterns.transitions.some(t => lower.includes(t));
        const hasPassive = keywordPatterns.passive_constructions.some(p => lower.includes(p)) && lower.length > 20;
        const hasFormal = keywordPatterns.formal_patterns.some(f => lower.includes(f));

        if (hasTransition || hasPassive || hasFormal) {
            consistentPatterns++;
        }
        totalPatterns++;
    });

    const consistencyRatio = consistentPatterns / totalPatterns;
    return consistencyRatio > 0.60 ? Math.min(1, consistencyRatio) : consistencyRatio * 0.3;
}

// Detect formal human writing
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

    const hasEducationalContext = educationalCount >= 2;
    const hasAcademicStructure = academicCount >= 2;

    if (hasEducationalContext) return 0.35;
    if (hasAcademicStructure) return 0.20;
    return 0;
}

// Calculate punctuation diversity
function calculatePunctuationDiversity(text) {
    const punctuation = text.match(/[!?.;:,\-—–]/g) || [];
    if (punctuation.length === 0) return 0;

    const uniquePunct = new Set(punctuation).size;
    return uniquePunct / punctuation.length;
}

// Calculate confidence level
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

// Display results in UI
function displayResults(text, result) {
    const resultCard = document.getElementById('resultCard');
    const emptyState = document.getElementById('emptyState');

    // Update score
    document.getElementById('scorePercentage').textContent = result.percentage + '%';
    document.getElementById('progressFill').style.width = result.percentage + '%';

    // Color the progress bar
    const progressBar = document.getElementById('progressFill');
    if (result.percentage < 30) {
        progressBar.className = 'h-full progress-bar-fill bg-gradient-to-r from-green-500 to-green-600';
    } else if (result.percentage < 70) {
        progressBar.className = 'h-full progress-bar-fill bg-gradient-to-r from-yellow-500 to-orange-500';
    } else {
        progressBar.className = 'h-full progress-bar-fill bg-gradient-to-r from-red-500 to-red-600';
    }

    // Classification badge
    const aiPercentage = result.percentage;
    let classification = '';
    let badgeClass = '';
    
    if (aiPercentage < 20) {
        classification = '✅ Definitely Human';
        badgeClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
    } else if (aiPercentage < 40) {
        classification = '👤 Likely Human';
        badgeClass = 'bg-green-500/10 text-green-300 border border-green-500/20';
    } else if (aiPercentage < 60) {
        classification = '❓ Mixed/Uncertain';
        badgeClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    } else if (aiPercentage < 80) {
        classification = '🤖 Likely AI';
        badgeClass = 'bg-red-500/10 text-red-300 border border-red-500/20';
    } else {
        classification = '⚠️ Definitely AI';
        badgeClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    }

    const badge = document.getElementById('classificationBadge');
    badge.textContent = classification;
    badge.className = `inline-block px-4 py-2 rounded-lg text-sm font-bold ${badgeClass}`;

    // Confidence box
    document.getElementById('confidenceBox').innerHTML = 
        `<strong class="text-cyan-300">Confidence: ${result.confidence}</strong><br>` +
        `<span class="text-gray-400">${aiPercentage}% AI-generated • ${100 - aiPercentage}% Human-written</span>`;

    // Update metrics
    document.getElementById('burstinessValue').textContent = result.burstiness;
    document.getElementById('perplexityValue').textContent = result.perplexity;
    document.getElementById('semanticValue').textContent = result.semantic + '%';
    document.getElementById('ngramValue').textContent = result.ngram + '%';

    // Update details
    document.getElementById('detailChars').textContent = result.details.chars.toLocaleString();
    document.getElementById('detailWords').textContent = result.details.words.toLocaleString();
    document.getElementById('detailUnique').textContent = result.details.unique.toLocaleString();
    document.getElementById('detailAvgWordLen').textContent = result.details.avgWordLen;
    document.getElementById('detailAvgSentenceLen').textContent = result.details.avgSentenceLen;
    document.getElementById('detailPunctuation').textContent = result.details.punctuation;
    document.getElementById('detailSemantic').textContent = result.details.semantic;
    document.getElementById('detailNgram').textContent = result.details.ngram;

    // Show results
    emptyState.classList.add('hidden');
    resultCard.classList.remove('hidden');
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Clear text and results
function clearText() {
    document.getElementById('textInput').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('resultCard').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

// Real-time character count
document.getElementById('textInput').addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length;
});

// Keyboard shortcut: Ctrl/Cmd + Enter to analyze
document.getElementById('textInput').addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        analyzeText();
    }
});