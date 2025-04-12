
import { useState, useCallback, useRef } from 'react'

export const useTranscriptProcessor = (onUpdate) => {
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [ccText, setCCText] = useState('')
  const lastProcessedText = useRef('')
  const processingTimeout = useRef(null)

  const STATEMENT_TYPES = {
    FACTUAL: {
      keywords: [
        'percent', '%', 'billion', 'million', 'trillion',
        'increased', 'decreased', 'statistics', 'according to',
        'study shows', 'research indicates', 'data shows',
        'evidence suggests', 'report finds', 'survey indicates'
      ],
      impact: 1
    },
    POLITICAL: {
      keywords: [
        'policy', 'legislation', 'law', 'government',
        'administration', 'congress', 'senate', 'house',
        'democrat', 'republican', 'vote', 'election',
        'passed', 'approved', 'signed', 'vetoed'
      ],
      impact: 1.2
    },
    SCIENTIFIC: {
      keywords: [
        'study', 'research', 'evidence', 'data',
        'scientists', 'experts', 'analysis', 'findings',
        'discovered', 'proven', 'demonstrated', 'confirmed'
      ],
      impact: 1.5
    },
    OPINION: {
      keywords: [
        'think', 'believe', 'feel', 'suggest',
        'might', 'maybe', 'perhaps', 'possibly',
        'in my opinion', 'i think', 'could be'
      ],
      impact: 0
    },
    HYPOTHETICAL: {
      keywords: [
        'if', 'would', 'could', 'might',
        'imagine', 'suppose', 'theoretically', 'potentially'
      ],
      impact: 0
    }
  }

  const processTranscript = useCallback((caption) => {
    setCCText(caption.text)
    compareAndProcess(caption.text, currentTranscript)
  }, [currentTranscript])

  const processSpeech = useCallback((transcript) => {
    setCurrentTranscript(transcript)
    compareAndProcess(ccText, transcript)
  }, [ccText])

  const compareAndProcess = (cc, speech) => {
    clearTimeout(processingTimeout.current)
    
    processingTimeout.current = setTimeout(() => {
      const combinedText = (cc || speech || '').toLowerCase()
      
      // Don't process if it's too similar to last processed text
      if (isTooSimilar(combinedText, lastProcessedText.current)) {
        return
      }

      // Extract statements from the text
      const statements = extractStatements(combinedText)
      
      statements.forEach(statement => {
        const type = determineStatementType(statement)
        const importance = calculateImportance(statement, type)
        
        if (importance > 0) {
          onUpdate({
            text: statement,
            timestamp: new Date().toISOString(),
            type: type,
            importance: importance
          })
        }

        lastProcessedText.current = statement
      })
    }, 500) // Small delay to group nearby statements
  }

  const isTooSimilar = (text1, text2) => {
    if (!text1 || !text2) return false
    const similarity = calculateSimilarity(text1, text2)
    return similarity > 0.8
  }

  const calculateSimilarity = (text1, text2) => {
    const longer = text1.length > text2.length ? text1 : text2
    const shorter = text1.length > text2.length ? text2 : text1
    return (longer.length - levenshteinDistance(longer, shorter)) / longer.length
  }

  const levenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }
    return matrix[str2.length][str1.length]
  }

  const extractStatements = (text) => {
    // Split on common sentence endings and transition words
    return text
      .split(/[.!?;]+|\s+(?:however|moreover|furthermore|therefore|thus|hence|consequently)\s+/i)
      .map(s => s.trim())
      .filter(s => {
        // Filter out non-statements and very short phrases
        const wordCount = s.split(/\s+/).length
        return wordCount >= 3 && wordCount <= 50 && s.length >= 10
      })
  }

  const determineStatementType = (statement) => {
    let maxMatches = 0
    let dominantType = 'NEUTRAL'

    for (const [type, config] of Object.entries(STATEMENT_TYPES)) {
      const matches = config.keywords.filter(keyword => 
        statement.toLowerCase().includes(keyword.toLowerCase())
      ).length

      if (matches > maxMatches) {
        maxMatches = matches
        dominantType = type
      }
    }

    return dominantType
  }

  const calculateImportance = (statement, type) => {
    if (type === 'OPINION' || type === 'HYPOTHETICAL') {
      return 0 // Neutral impact for opinions and hypotheticals
    }

    const config = STATEMENT_TYPES[type]
    if (!config) return 0

    // Count matching keywords for importance
    const keywordMatches = config.keywords.filter(keyword => 
      statement.toLowerCase().includes(keyword.toLowerCase())
    ).length

    // Base importance on keyword matches and type impact
    return keywordMatches * config.impact
  }

  return {
    processTranscript,
    processSpeech
  }
}
