// Simple mood detection service without external dependencies

// Simplified and accurate sentiment analyzer
const simpleSentiment = {
  analyze: (text) => {
    const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'fantastic', 'awesome', 'joy', 'blessed', 'grateful', 'peaceful', 'calm', 'content', 'satisfied', 'proud', 'accomplished', 'successful', 'optimistic', 'cheerful', 'delighted', 'perfect', 'brilliant', 'excellent', 'beautiful', 'lovely', 'nice', 'pleasant', 'enjoyable'];
    const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible', 'angry', 'frustrated', 'depressed', 'upset', 'worried', 'anxious', 'stressed', 'hopeless', 'worthless', 'lonely', 'isolated', 'disappointed', 'cry', 'crying', 'hurt', 'pain', 'miserable', 'devastated', 'heartbroken', 'furious', 'mad', 'irritated', 'annoyed', 'disgusted', 'bitter', 'resentful'];
    
    // Critical phrases that should NEVER be classified as excited
    const criticalPhrases = ['want to die', 'i want to die', 'kill myself', 'hurt myself', 'end it all', 'suicide', 'self harm', 'no point', 'worthless', 'hopeless', 'better off dead'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    // CRITICAL: Check for crisis phrases first
    const lowerText = text.toLowerCase();
    for (const phrase of criticalPhrases) {
      if (lowerText.includes(phrase)) {
        return { 
          score: -10, // Extremely negative
          moodIndicators: { sad: 10, negative: 10 },
          totalWords: words.length,
          crisisDetected: true
        };
      }
    }
    
    // Simple word-based scoring
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        score += 1;
      } else if (negativeWords.includes(word)) {
        score -= 2;
      }
    });
    
    // Normalize score
    const normalizedScore = words.length > 0 ? score / Math.max(words.length, 1) : 0;
    
    return { 
      score: normalizedScore,
      moodIndicators: {
        positive: Math.max(0, score),
        negative: Math.max(0, -score)
      },
      totalWords: words.length
    };
  }
};

// Mood detection patterns and keywords
const moodPatterns = {
  happy: {
    keywords: [
      'happy', 'joy', 'delighted', 'cheerful', 'ecstatic',
      'amazing', 'wonderful', 'fantastic', 'great', 'awesome', 'brilliant',
      'love', 'adore', 'enjoy', 'fun', 'laugh', 'smile', 'celebrate',
      'success', 'achievement', 'accomplish', 'proud', 'grateful', 'blessed'
    ],
    weight: 2.0,
    sentimentThreshold: 1
  },
  sad: {
    keywords: [
      'sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'miserable',
      'cry', 'tears', 'hurt', 'pain', 'loss', 'grief', 'sorrow', 'lonely',
      'disappointed', 'let down', 'heartbroken', 'devastated', 'hopeless',
      'empty', 'numb', 'broken', 'defeated', 'overwhelmed'
    ],
    weight: 1.0,
    sentimentThreshold: -2
  },
  angry: {
    keywords: [
      'angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'frustrated',
      'pissed', 'livid', 'outraged', 'enraged', 'hate', 'disgusted', 'repulsed',
      'fuming', 'seething', 'infuriated', 'aggravated', 'bothered', 'upset',
      'displeased', 'resentful', 'bitter', 'hostile', 'aggressive'
    ],
    weight: 1.0,
    sentimentThreshold: -3
  },
  anxious: {
    keywords: [
      'anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'restless',
      'panic', 'fear', 'scared', 'afraid', 'terrified', 'overwhelmed', 'pressure',
      'deadline', 'exam', 'interview', 'presentation', 'uncertain', 'doubt',
      'apprehensive', 'jittery', 'on edge', 'frazzled', 'burned out'
    ],
    weight: 1.0,
    sentimentThreshold: -1
  },
  excited: {
    keywords: [
      'excited', 'thrilled', 'pumped', 'hyped', 'energized', 'enthusiastic',
      'eager', 'anticipating', 'looking forward', 'can\'t wait', 'stoked',
      'buzzing', 'fired up', 'motivated', 'inspired', 'passionate', 'zealous',
      'vibrant', 'dynamic', 'lively', 'animated', 'spirited'
    ],
    weight: 3.0,
    sentimentThreshold: 2
  },
  calm: {
    keywords: [
      'calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'chill', 'zen',
      'meditation', 'mindful', 'centered', 'balanced', 'grounded', 'stable',
      'content', 'satisfied', 'at ease', 'comfortable', 'cozy', 'warm',
      'gentle', 'soft', 'quiet', 'still', 'harmonious'
    ],
    weight: 1.0,
    sentimentThreshold: 1
  },
  grateful: {
    keywords: [
      'grateful', 'thankful', 'appreciate', 'blessed', 'fortunate', 'lucky',
      'thank you', 'gratitude', 'appreciation', 'acknowledge', 'recognize',
      'value', 'treasure', 'cherish', 'honor', 'respect', 'admire',
      'inspired by', 'moved by', 'touched', 'humbled', 'privileged'
    ],
    weight: 1.0,
    sentimentThreshold: 2
  },
  lonely: {
    keywords: [
      'lonely', 'alone', 'isolated', 'disconnected', 'separated', 'abandoned',
      'left out', 'excluded', 'rejected', 'unwanted', 'unloved', 'ignored',
      'forgotten', 'distant', 'remote', 'solitary', 'single', 'by myself',
      'no one', 'nobody', 'empty', 'void', 'hollow'
    ],
    weight: 1.0,
    sentimentThreshold: -2
  },
  confused: {
    keywords: [
      'confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'bewildered',
      'perplexed', 'disoriented', 'mixed up', 'torn', 'conflicted', 'dilemma',
      'doubt', 'question', 'wonder', 'unsure', 'hesitant', 'indecisive',
      'ambiguous', 'vague', 'unclear', 'muddled', 'chaotic'
    ],
    weight: 1.0,
    sentimentThreshold: -1
  }
};

// Self-harm detection patterns - CRITICAL for user safety
const selfHarmPatterns = [
  'hurt myself', 'kill myself', 'end it all', 'not worth living',
  'want to die', 'i want to die', 'suicide', 'self harm', 'cut myself', 'harm myself',
  'end my life', 'take my life', 'give up', 'no point', 'hopeless',
  'worthless', 'better off dead', 'burden', 'everyone would be better',
  'no one cares', 'no one would miss me', 'disappear', 'fade away',
  'should die', 'wish i was dead', 'rather be dead', 'life is meaningless',
  'cant go on', 'can\'t go on', 'nothing matters', 'pointless', 'useless',
  'hate myself', 'hate my life', 'tired of living', 'done with life'
];

// Helpline information
const helplineInfo = {
  US: {
    number: '988',
    text: 'Text HOME to 741741',
    website: 'https://suicidepreventionlifeline.org',
    name: 'National Suicide Prevention Lifeline'
  },
  UK: {
    number: '116 123',
    text: 'Text SHOUT to 85258',
    website: 'https://www.samaritans.org',
    name: 'Samaritans'
  },
  CA: {
    number: '1-833-456-4566',
    text: 'Text 45645',
    website: 'https://suicideprevention.ca',
    name: 'Crisis Services Canada'
  },
  AU: {
    number: '13 11 14',
    text: 'Text 0477 13 11 14',
    website: 'https://www.lifeline.org.au',
    name: 'Lifeline Australia'
  },
  IN: {
    number: '91-22-27546669',
    text: 'Text 9152987821',
    website: 'https://www.aasra.info',
    name: 'AASRA'
  }
};

class MoodDetectionService {
  constructor() {
    // Simple tokenizer and stemmer replacements
    this.tokenizer = {
      tokenize: (text) => text.split(/\s+/).filter(token => token.length > 0)
    };
    this.stemmer = {
      stem: (word) => word.toLowerCase().replace(/ing$|ed$|s$/, '')
    };
  }

  /**
   * Detect mood from journal entry text
   * @param {string} text - The journal entry text
   * @param {string} manualMood - Manually selected mood (optional)
   * @returns {Object} - Mood detection result
   */
  detectMood(text, manualMood = null) {
    if (!text || typeof text !== 'string') {
      return {
        detected: 'neutral',
        confidence: 0,
        manual: manualMood,
        selfHarmDetected: false,
        analysis: {
          sentiment: 0,
          keywords: [],
          reasoning: 'No text provided'
        }
      };
    }

    // Clean and prepare text
    const cleanText = this.cleanText(text);
    const tokens = this.tokenizer.tokenize(cleanText.toLowerCase());

    // CRITICAL: Check for self-harm indicators FIRST
    const selfHarmDetected = this.detectSelfHarm(cleanText);
    
    // Get sentiment analysis
    const sentimentResult = simpleSentiment.analyze(cleanText);
    const sentimentScore = sentimentResult.score;
    
    // If self-harm is detected OR sentiment analysis detects crisis, override mood detection
    if (selfHarmDetected || sentimentResult.crisisDetected) {
      return {
        detected: 'sad', // Classify as sad for crisis situations
        confidence: 0.95,
        manual: manualMood,
        selfHarmDetected: true,
        analysis: {
          sentiment: -10, // Extremely negative sentiment
          keywords: this.getSelfHarmKeywords(cleanText),
          reasoning: 'Crisis content detected - self-harm indicators found',
          moodScores: { sad: 15 }, // Very high sad score for crisis
          crisisDetected: true
        }
      };
    }

    // Calculate mood scores using the original text, not tokens
    const moodScores = this.calculateMoodScores(cleanText, sentimentScore);
    
    // Get the mood with highest score
    const detectedMoodResult = this.getHighestScoringMood(moodScores);
    
    return {
      detected: detectedMoodResult.mood,
      confidence: detectedMoodResult.confidence,
      manual: manualMood,
      selfHarmDetected: false,
      analysis: {
        sentiment: sentimentScore,
        keywords: this.getDetectedKeywords(tokens),
        reasoning: this.generateReasoning(detectedMoodResult.mood, moodScores, sentimentScore),
        moodScores: moodScores
      }
    };
  }

  /**
   * Clean text for analysis
   */
  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate mood scores based on keywords and sentiment - SIMPLIFIED AND ACCURATE
   */
  calculateMoodScores(text, sentimentScore) {
    const scores = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      grateful: 0,
      lonely: 0,
      confused: 0,
      neutral: 0
    };
    
    const originalText = typeof text === 'string' ? text : text.join(' ');
    const lowerText = originalText.toLowerCase();
    
    // STEP 1: Direct keyword detection with high precision
    // Excited - very specific indicators only
    if (lowerText.includes('excited') || lowerText.includes('thrilled') || lowerText.includes('pumped') || 
        lowerText.includes('can\'t wait') || lowerText.includes('hyped') || lowerText.includes('stoked')) {
      scores['excited'] = 10;
      return scores; // Return immediately to prevent confusion with happy
    }
    
    // Sad - clear sadness indicators
    if (lowerText.includes('sad') || lowerText.includes('crying') || lowerText.includes('cry') || 
        lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('blue') || 
        lowerText.includes('heartbroken') || lowerText.includes('devastated') || lowerText.includes('miserable') ||
        lowerText.includes('feel terrible') || lowerText.includes('feel awful') || lowerText.includes('hopeless')) {
      scores['sad'] = 10;
      return scores;
    }
    
    // Angry - clear anger indicators
    if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious') || 
        lowerText.includes('frustrated') || lowerText.includes('pissed') || lowerText.includes('hate') ||
        lowerText.includes('irritated') || lowerText.includes('annoyed') || lowerText.includes('rage') ||
        lowerText.includes('livid') || lowerText.includes('outraged')) {
      scores['angry'] = 10;
      return scores;
    }
    
    // Anxious - clear anxiety indicators
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous') || 
        lowerText.includes('stressed') || lowerText.includes('panic') || lowerText.includes('overwhelmed') ||
        lowerText.includes('fear') || lowerText.includes('scared') || lowerText.includes('afraid') ||
        lowerText.includes('terrified') || lowerText.includes('uneasy')) {
      scores['anxious'] = 10;
      return scores;
    }
    
    // Confused - clear confusion indicators
    if (lowerText.includes('confused') || lowerText.includes('don\'t know') || lowerText.includes('unsure') || 
        lowerText.includes('unclear') || lowerText.includes('lost') || lowerText.includes('puzzled') ||
        lowerText.includes('mixed up') || lowerText.includes('uncertain') || lowerText.includes('bewildered')) {
      scores['confused'] = 10;
      return scores;
    }
    
    // Lonely - clear loneliness indicators
    if (lowerText.includes('lonely') || lowerText.includes('alone') || lowerText.includes('isolated') || 
        lowerText.includes('no one cares') || lowerText.includes('by myself') || lowerText.includes('abandoned') ||
        lowerText.includes('left out') || lowerText.includes('disconnected')) {
      scores['lonely'] = 10;
      return scores;
    }
    
    // Happy - clear happiness indicators (but not excited)
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('cheerful') || 
        lowerText.includes('delighted') || lowerText.includes('good day') || lowerText.includes('feel good') || 
        lowerText.includes('wonderful day') || lowerText.includes('great day') || lowerText.includes('amazing') ||
        lowerText.includes('fantastic') || lowerText.includes('awesome') || lowerText.includes('brilliant')) {
      scores['happy'] = 10;
      return scores;
    }
    
    // Grateful - clear gratitude indicators
    if (lowerText.includes('grateful') || lowerText.includes('thankful') || lowerText.includes('blessed') || 
        lowerText.includes('appreciate') || lowerText.includes('thank you') || lowerText.includes('gratitude')) {
      scores['grateful'] = 10;
      return scores;
    }
    
    // Calm - clear calmness indicators
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('relaxed') || 
        lowerText.includes('serene') || lowerText.includes('tranquil') || lowerText.includes('zen') ||
        lowerText.includes('meditation') || lowerText.includes('mindful')) {
      scores['calm'] = 10;
      return scores;
    }
    
    // STEP 2: Fallback to sentiment analysis for general positive/negative
    // Note: sentimentScore is normalized by word count, so use small thresholds
    if (sentimentScore > 0.15) {
      scores['happy'] = 5; // Moderate confidence for general positive sentiment
    } else if (sentimentScore < -0.15) {
      scores['sad'] = 5; // Moderate confidence for general negative sentiment
    } else {
      scores['neutral'] = 5; // Default to neutral for unclear cases
    }
    
    return scores;
  }

  /**
   * Get the mood with the highest score - IMPROVED LOGIC
   */
  getHighestScoringMood(moodScores) {
    let maxScore = 0;
    let detectedMood = 'neutral';
    
    // Find the highest scoring mood
    Object.entries(moodScores).forEach(([mood, score]) => {
      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood;
      }
    });
    
    // Higher threshold for mood detection to prevent false positives
    if (maxScore < 3) {
      detectedMood = 'neutral';
      maxScore = 1;
    }
    
    // Calculate confidence based on score strength
    let confidence = 0;
    if (maxScore >= 8) {
      confidence = 0.9; // Very confident
    } else if (maxScore >= 5) {
      confidence = 0.7; // Confident
    } else if (maxScore >= 3) {
      confidence = 0.5; // Somewhat confident
    } else {
      confidence = 0.3; // Low confidence
    }
    
    return { mood: detectedMood, confidence: confidence };
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(moodScores, sentimentScore) {
    const maxScore = Math.max(...Object.values(moodScores));
    const totalScore = Object.values(moodScores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) return 0;
    
    const confidence = Math.min(maxScore / totalScore, 1);
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Detect self-harm indicators
   */
  detectSelfHarm(text) {
    const lowerText = text.toLowerCase();
    return selfHarmPatterns.some(pattern => lowerText.includes(pattern));
  }

  /**
   * Get detected keywords
   */
  getDetectedKeywords(tokens) {
    const detectedKeywords = [];
    
    Object.keys(moodPatterns).forEach(mood => {
      moodPatterns[mood].keywords.forEach(keyword => {
        const stemmedKeyword = this.stemmer.stem(keyword);
        if (tokens.some(token => 
          token.includes(stemmedKeyword) || stemmedKeyword.includes(token)
        )) {
          detectedKeywords.push(keyword);
        }
      });
    });
    
    return [...new Set(detectedKeywords)]; // Remove duplicates
  }

  /**
   * Get self-harm keywords found in text
   */
  getSelfHarmKeywords(text) {
    const lowerText = text.toLowerCase();
    const foundKeywords = [];
    
    selfHarmPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        foundKeywords.push(pattern);
      }
    });
    
    return foundKeywords;
  }

  /**
   * Generate reasoning for mood detection
   */
  generateReasoning(detectedMood, moodScores, sentimentScore) {
    const reasons = [];
    
    if (sentimentScore > 0.15) {
      reasons.push('Positive sentiment detected');
    } else if (sentimentScore < -0.15) {
      reasons.push('Negative sentiment detected');
    }
    
    if (moodScores[detectedMood] > 0) {
      reasons.push(`Keywords related to ${detectedMood} mood found`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Neutral sentiment and no specific mood indicators');
    }
    
    return reasons.join(', ');
  }

  /**
   * Get helpline information
   */
  getHelplineInfo(country = 'US') {
    return helplineInfo[country] || helplineInfo.US;
  }

  /**
   * Analyze mood trends over time
   */
  analyzeMoodTrends(entries) {
    if (!entries || entries.length === 0) {
      return {
        trend: 'stable',
        dominantMood: 'neutral',
        moodDistribution: {},
        insights: ['No entries available for analysis']
      };
    }

    const moodCounts = {};
    const moodScores = [];
    
    entries.forEach(entry => {
      const mood = entry.mood?.detected || entry.mood?.manual || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      moodScores.push({
        date: entry.createdAt,
        mood: mood,
        confidence: entry.mood?.confidence || 0
      });
    });

    // Calculate dominant mood
    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    // Calculate trend
    const recentEntries = entries.slice(-7); // Last 7 entries
    const recentMoods = recentEntries.map(entry => 
      entry.mood?.detected || entry.mood?.manual || 'neutral'
    );
    
    const positiveMoods = ['happy', 'excited', 'grateful', 'calm'];
    const negativeMoods = ['sad', 'angry', 'anxious', 'lonely'];
    
    const recentPositive = recentMoods.filter(mood => positiveMoods.includes(mood)).length;
    const recentNegative = recentMoods.filter(mood => negativeMoods.includes(mood)).length;
    
    let trend = 'stable';
    if (recentPositive > recentNegative + 1) {
      trend = 'improving';
    } else if (recentNegative > recentPositive + 1) {
      trend = 'declining';
    }

    // Generate insights
    const insights = this.generateMoodInsights(moodCounts, trend, dominantMood);

    return {
      trend: trend,
      dominantMood: dominantMood,
      moodDistribution: moodCounts,
      moodScores: moodScores,
      insights: insights
    };
  }

  /**
   * Generate mood insights
   */
  generateMoodInsights(moodCounts, trend, dominantMood) {
    const insights = [];
    const totalEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    if (trend === 'improving') {
      insights.push('Your mood has been improving recently. Keep up the positive momentum!');
    } else if (trend === 'declining') {
      insights.push('Your mood has been declining recently. Consider reaching out for support.');
    }
    
    const dominantPercentage = Math.round((moodCounts[dominantMood] / totalEntries) * 100);
    insights.push(`Your most common mood is ${dominantMood} (${dominantPercentage}% of entries)`);
    
    if (moodCounts['grateful'] > 0) {
      insights.push('You frequently express gratitude, which is great for mental well-being!');
    }
    
    if (moodCounts['anxious'] > totalEntries * 0.3) {
      insights.push('You experience anxiety frequently. Consider stress management techniques.');
    }
    
    return insights;
  }
}

module.exports = new MoodDetectionService();

