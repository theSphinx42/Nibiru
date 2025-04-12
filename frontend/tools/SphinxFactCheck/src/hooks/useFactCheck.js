import { useState, useEffect, useCallback } from 'react';
import { 
  calculateImpact, 
  calculateOverallScore, 
  SPEAKER_SCORING, 
  STATEMENT_TYPES, 
  CONFIDENCE_LEVELS
} from '../types/scoring';

/**
 * Hook for managing fact checking state and logic
 */
export function useFactCheck() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [speakers, setSpeakers] = useState({});
  const [statements, setStatements] = useState([]);
  const [overallScore, setOverallScore] = useState(SPEAKER_SCORING.INITIAL_SCORE);
  
  // Reset all state
  const resetFactCheck = useCallback(() => {
    setSpeakers({});
    setStatements([]);
    setOverallScore(SPEAKER_SCORING.INITIAL_SCORE);
    setError(null);
    setIsAnalyzing(false);
  }, []);
  
  // Process a new statement from a speaker
  const processStatement = useCallback(async (speakerId, speakerName, statement, statementType = 'GENERAL') => {
    try {
      setIsAnalyzing(true);
      
      // Create statement object with proper type validation
      const validType = Object.keys(STATEMENT_TYPES).includes(statementType) ? 
        statementType : 'GENERAL';
      
      const newStatement = {
        id: `stmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        speakerId,
        speakerName,
        content: statement,
        type: validType,
        timestamp: new Date().toISOString(),
        processed: false
      };
      
      // Add to statements collection
      setStatements(prev => [...prev, newStatement]);
      
      // Determine if statement requires verification based on its type
      const requiresVerification = STATEMENT_TYPES[validType]?.requiresVerification || false;
      
      // If statement requires verification, verify it
      let verificationResult = null;
      if (requiresVerification) {
        verificationResult = await verifyStatement(statement, validType);
        
        // Update statement with verification result
        setStatements(prev => prev.map(s => 
          s.id === newStatement.id 
            ? { ...s, verificationResult, processed: true } 
            : s
        ));
      } else {
        // Mark as processed even if not verified
        setStatements(prev => prev.map(s => 
          s.id === newStatement.id 
            ? { ...s, processed: true } 
            : s
        ));
      }
      
      // Update speaker credibility
      setSpeakers(prev => {
        const existingSpeaker = prev[speakerId] || {
          id: speakerId,
          name: speakerName,
          credibilityScore: SPEAKER_SCORING.INITIAL_SCORE,
          statements: [],
          consecutiveFalse: 0,
          consecutiveTrue: 0
        };
        
        let newScore = existingSpeaker.credibilityScore;
        let consecutiveFalse = existingSpeaker.consecutiveFalse;
        let consecutiveTrue = existingSpeaker.consecutiveTrue;
        
        // Calculate impact on score if we have verification results
        if (verificationResult) {
          let impact = calculateImpact(verificationResult, validType);
          
          // Apply consecutive statement multipliers if applicable
          if (verificationResult.isTrue) {
            consecutiveFalse = 0;
            consecutiveTrue += 1;
            if (consecutiveTrue > 1) {
              impact *= SPEAKER_SCORING.BONUS_CONSECUTIVE_TRUE;
            }
          } else if (verificationResult.isTrue === false) {
            consecutiveTrue = 0;
            consecutiveFalse += 1;
            if (consecutiveFalse > 1) {
              impact *= SPEAKER_SCORING.PENALTY_CONSECUTIVE_FALSE;
            }
          }
          
          // Apply decay to existing score before adding impact
          newScore = (newScore * SPEAKER_SCORING.DECAY_RATE) + impact;
          
          // Ensure score stays within bounds
          newScore = Math.max(
            SPEAKER_SCORING.MIN_SCORE, 
            Math.min(SPEAKER_SCORING.MAX_SCORE, newScore)
          );
        }
        
        // Add statement to speaker's history
        const updatedSpeaker = {
          ...existingSpeaker,
          credibilityScore: newScore,
          consecutiveFalse,
          consecutiveTrue,
          statements: [
            ...existingSpeaker.statements,
            {
              id: newStatement.id,
              content: statement,
              type: validType,
              timestamp: newStatement.timestamp,
              verificationResult
            }
          ]
        };
        
        return {
          ...prev,
          [speakerId]: updatedSpeaker
        };
      });
      
      setIsAnalyzing(false);
      return newStatement.id;
    } catch (err) {
      setError(err.message || 'Error processing statement');
      setIsAnalyzing(false);
      return null;
    }
  }, []);
  
  // Verify a statement using AI or other verification methods
  const verifyStatement = async (statement, statementType) => {
    // In a real application, this would call an API
    // For now, we'll simulate verification with random results but using our scoring schema
    
    // Add a slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Get the statement type definition
    const typeDefinition = STATEMENT_TYPES[statementType] || STATEMENT_TYPES.GENERAL;
    
    // Adjust verification probability based on statement type
    const baseVerificationProbability = 0.5; // 50% baseline
    const adjustedProbability = baseVerificationProbability * typeDefinition.impactMultiplier;
    
    // Generate random value for verification
    const randomValue = Math.random();
    
    // Determine verification result
    let isTrue = null;
    let isPartiallyTrue = false;
    let isMisleading = false;
    
    // Use statement type impact multiplier to influence verification outcome
    const truthThreshold = adjustedProbability;
    const partialTruthThreshold = truthThreshold + 0.15;
    const misleadingThreshold = partialTruthThreshold + 0.15;
    
    if (randomValue < truthThreshold) {
      isTrue = true;
    } else if (randomValue < partialTruthThreshold) {
      isPartiallyTrue = true;
    } else if (randomValue < misleadingThreshold) {
      isMisleading = true;
    } else {
      isTrue = false;
    }
    
    // Determine confidence level
    let confidenceLevel;
    const confidenceRand = Math.random();
    
    if (confidenceRand > 0.8) {
      confidenceLevel = CONFIDENCE_LEVELS.VERY_HIGH;
    } else if (confidenceRand > 0.6) {
      confidenceLevel = CONFIDENCE_LEVELS.HIGH;
    } else if (confidenceRand > 0.4) {
      confidenceLevel = CONFIDENCE_LEVELS.MEDIUM;
    } else if (confidenceRand > 0.2) {
      confidenceLevel = CONFIDENCE_LEVELS.LOW;
    } else {
      confidenceLevel = CONFIDENCE_LEVELS.VERY_LOW;
    }
    
    return {
      isVerifiable: true,
      isTrue,
      isPartiallyTrue,
      isMisleading,
      confidence: confidenceLevel,
      sources: [], // Would contain sources in a real system
      explanation: `Verification result for "${statement.substring(0, 30)}..." (${typeDefinition.name} statement)`
    };
  };
  
  // Recalculate overall score whenever speakers or statements change
  useEffect(() => {
    const newOverallScore = calculateOverallScore(speakers, statements);
    setOverallScore(newOverallScore);
  }, [speakers, statements]);
  
  return {
    isAnalyzing,
    error,
    speakers,
    statements,
    overallScore,
    processStatement,
    resetFactCheck
  };
} 