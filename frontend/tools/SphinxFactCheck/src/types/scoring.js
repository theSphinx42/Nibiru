/**
 * Sphinx Fact Check Scoring Schema
 * 
 * This file defines the scoring schema used for the Sphinx Fact Check system,
 * including all parameters for accuracy, trustworthiness, factualness, and
 * confidence levels used in fact-checking operations.
 */

// Constants for statement types and their verification requirements
export const STATEMENT_TYPES = {
  FACTUAL: {
    name: 'Factual',
    requiresVerification: true,
    impactMultiplier: 1.0,
    description: 'Direct factual claims about the world'
  },
  STATISTICAL: {
    name: 'Statistical',
    requiresVerification: true,
    impactMultiplier: 1.2,
    description: 'Claims involving numbers, statistics or data'
  },
  HISTORICAL: {
    name: 'Historical',
    requiresVerification: true,
    impactMultiplier: 0.9,
    description: 'Claims about historical events or timelines'
  },
  CAUSAL: {
    name: 'Causal',
    requiresVerification: true,
    impactMultiplier: 1.1,
    description: 'Claims about cause and effect relationships'
  },
  OPINION: {
    name: 'Opinion',
    requiresVerification: false,
    impactMultiplier: 0.2,
    description: 'Subjective opinions or preferences'
  },
  HYPOTHETICAL: {
    name: 'Hypothetical',
    requiresVerification: false,
    impactMultiplier: 0.3,
    description: 'Conditional or hypothetical statements'
  },
  GENERAL: {
    name: 'General',
    requiresVerification: false,
    impactMultiplier: 0.5,
    description: 'General statements that don\'t fit other categories'
  }
};

// Constants for confidence levels in verification
export const CONFIDENCE_LEVELS = {
  VERY_LOW: 0.2,
  LOW: 0.4,
  MEDIUM: 0.6,
  HIGH: 0.8,
  VERY_HIGH: 0.95
};

// Speaker scoring constants
export const SPEAKER_SCORING = {
  INITIAL_SCORE: 70,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  TRUTH_BONUS: 2.5,
  FALSEHOOD_PENALTY: -5,
  MISLEADING_PENALTY: -3,
  UNVERIFIABLE_NEUTRAL: 0,
  PENALTY_CONSECUTIVE_FALSE: 1.5, // Multiplier for consecutive false statements
  BONUS_CONSECUTIVE_TRUE: 1.2, // Multiplier for consecutive true statements
  DECAY_RATE: 0.95 // How quickly older statements matter less
};

// Impact of verification results on speaker credibility
export const VERIFICATION_IMPACT = {
  TRUTH_CONFIRMED: {
    baseScore: 2.0,     // Base score for confirmed true statements
    confidenceMultiplier: true,  // Whether to multiply by confidence level
    maxImpact: 3.0      // Maximum possible impact
  },
  PARTIAL_TRUTH: {
    baseScore: 0.5,
    confidenceMultiplier: true,
    maxImpact: 1.0
  },
  UNVERIFIABLE: {
    baseScore: 0.0,
    confidenceMultiplier: false,
    maxImpact: 0.0
  },
  MISLEADING: {
    baseScore: -1.5,
    confidenceMultiplier: true,
    maxImpact: -2.0
  },
  FALSE: {
    baseScore: -3.0,
    confidenceMultiplier: true,
    maxImpact: -5.0
  }
};

// Overall content credibility calculation parameters
export const CONTENT_SCORING = {
  SPEAKER_WEIGHT: 0.7,          // Weight given to speaker credibility
  FACT_DENSITY_WEIGHT: 0.15,    // Weight given to density of factual statements
  VERIFICATION_RATIO_WEIGHT: 0.15, // Weight given to ratio of verified statements
  CONFIDENCE_THRESHOLD: 0.6,    // Threshold for including low-confidence calculations
  UPDATE_FREQUENCY: 5000        // Milliseconds between score updates
};

// Source reliability ratings
export const SOURCE_RELIABILITY = {
  ACADEMIC: 0.95,               // Academic journals, peer-reviewed research
  GOVERNMENT: 0.90,             // Official government statistics and reports
  MAJOR_NEWS: 0.80,             // Major news organizations with fact-checking
  INDUSTRY: 0.75,               // Industry reports and white papers
  BLOG: 0.50,                   // Blogs and opinion sites
  SOCIAL_MEDIA: 0.30,           // Social media sources
  UNKNOWN: 0.20                 // Unknown or unverified sources
};

/**
 * Calculate impact of a statement on credibility
 * @param {Object} verificationResult The result of fact verification
 * @param {String} statementType The type of statement being verified
 * @returns {Number} The impact on speaker credibility
 */
export function calculateImpact(verificationResult, statementType) {
  // If statement is not verifiable, have minimal impact
  if (!verificationResult.isVerifiable) {
    return SPEAKER_SCORING.UNVERIFIABLE_NEUTRAL;
  }
  
  // Get the multiplier for this statement type
  const typeMultiplier = STATEMENT_TYPES[statementType]?.impactMultiplier || 0.5;
  
  // Apply confidence level as a multiplier
  const confidenceMultiplier = verificationResult.confidence || CONFIDENCE_LEVELS.MEDIUM;
  
  // Calculate base impact
  let impact = 0;
  
  if (verificationResult.isTrue === true) {
    // True statement: positive impact
    impact = SPEAKER_SCORING.TRUTH_BONUS * typeMultiplier * confidenceMultiplier;
  } else if (verificationResult.isPartiallyTrue) {
    // Partially true: slight positive or negative based on details
    impact = (SPEAKER_SCORING.TRUTH_BONUS * 0.3) * typeMultiplier * confidenceMultiplier;
  } else if (verificationResult.isMisleading) {
    // Misleading statement: negative impact
    impact = SPEAKER_SCORING.MISLEADING_PENALTY * typeMultiplier * confidenceMultiplier;
  } else {
    // False statement: strong negative impact
    impact = SPEAKER_SCORING.FALSEHOOD_PENALTY * typeMultiplier * confidenceMultiplier;
  }
  
  return impact;
}

/**
 * Calculate speaker's contribution to overall content credibility
 * @param {Number} speakerScore The speaker's credibility score
 * @param {Number} totalSpeakers Total number of speakers
 * @param {Number} statementCount Number of statements made by this speaker
 * @param {Number} totalStatements Total statements in the content
 * @returns {Number} The speaker's percentage contribution to overall credibility
 */
export function calculateSpeakerContribution(speakerScore, totalSpeakers, statementCount, totalStatements) {
  // Calculate base contribution based on speaker score
  const baseContribution = speakerScore / 100;
  
  // Calculate speaker weight based on their proportion of statements
  const statementProportion = totalStatements > 0 
    ? statementCount / totalStatements 
    : 1 / totalSpeakers;
  
  // Weight by statement proportion (speakers with more statements have more influence)
  return baseContribution * statementProportion * 100;
}

/**
 * Calculate overall credibility score from speakers and statements
 * @param {Object} speakers Object containing all speakers and their data
 * @param {Array} statements Array of all processed statements
 * @returns {Number} The overall content credibility score (0-100)
 */
export function calculateOverallScore(speakers, statements) {
  const speakerScores = Object.values(speakers);
  
  if (speakerScores.length === 0) {
    return SPEAKER_SCORING.INITIAL_SCORE;
  }
  
  // Weight speakers by their number of statements
  const totalStatements = statements.length || 1;
  let overallScore = 0;
  
  speakerScores.forEach(speaker => {
    const speakerWeight = speaker.statements.length / totalStatements;
    overallScore += speaker.credibilityScore * speakerWeight;
  });
  
  return Math.round(overallScore);
} 