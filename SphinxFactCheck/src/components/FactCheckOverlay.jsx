
import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Shield, ShieldCheck, ShieldAlert, Info, Clock, ExternalLink, Scale, User, Users } from "lucide-react"

// Helper functions
const getCredibilityColor = (score) => {
  if (score >= 80) return "text-green-500"
  if (score >= 60) return "text-yellow-500"
  return "text-red-500"
}

const getCredibilityIcon = (score) => {
  if (score >= 80) return <ShieldCheck className="w-6 h-6" />
  if (score >= 60) return <Shield className="w-6 h-6" />
  return <ShieldAlert className="w-6 h-6" />
}

const STATEMENT_IMPORTANCE = {
  CRITICAL: { impact: 5, threshold: 0.9 },
  HIGH: { impact: 3, threshold: 0.8 },
  MEDIUM: { impact: 2, threshold: 0.7 },
  LOW: { impact: 1, threshold: 0.6 }
}

// Sample statements for testing (will be replaced with real statements)
const SAMPLE_STATEMENTS = [
  "The unemployment rate has dropped to 3.5%",
  "Global temperatures have risen by 1.1°C since pre-industrial times",
  "The national debt has increased by $3 trillion",
  "Renewable energy now accounts for 20% of electricity generation",
  "Healthcare spending represents 18% of GDP",
  "This is just my opinion on the matter",
  "Hypothetically speaking, if we were to implement this policy",
  "Studies have shown that exercise reduces stress levels by 40%",
  "According to recent data, inflation has risen to 4.2%",
  "I believe we should consider alternative approaches"
]

export function FactCheckOverlay({ platform = 'web', userTier = 'free', videoId = null, channelId = null }) {
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(true)
  const [credibilityScore, setCredibilityScore] = useState(80)
  const [showRecentClaims, setShowRecentClaims] = useState(false)
  const [recentClaims, setRecentClaims] = useState([])
  const [speakers, setSpeakers] = useState({})
  const [activeSpeaker, setActiveSpeaker] = useState(null)

  // Reset everything when video changes
  useEffect(() => {
    if (videoId) {
      setCredibilityScore(80)
      setRecentClaims([])
      setSpeakers({})
      setActiveSpeaker(null)
      // Add initial speakers for testing
      addSpeaker('speaker1', 'John D.')
      addSpeaker('speaker2', 'Sarah M.')
    }
  }, [videoId])

  const addSpeaker = useCallback((speakerId, name = `Speaker ${Object.keys(speakers).length + 1}`) => {
    setSpeakers(prev => ({
      ...prev,
      [speakerId]: {
        name,
        credibilityScore: 80,
        statements: [],
        contribution: 0
      }
    }))
  }, [speakers])

  const processStatement = useCallback((statement, speakerId = activeSpeaker) => {
    const type = determineStatementType(statement)
    const verificationResult = verifyStatement(statement)
    
    // Create new claim
    const newClaim = {
      timestamp: new Date().toLocaleTimeString(),
      speaker: speakers[speakerId]?.name || "Unknown Speaker",
      speakerId,
      claim: statement,
      type,
      verificationResult,
      impact: calculateImpact(verificationResult, type)
    }

    // Update recent claims
    setRecentClaims(prev => [newClaim, ...prev].slice(0, 50))

    // Update speaker's credibility if statement is verifiable
    if (speakerId && verificationResult.isVerifiable) {
      setSpeakers(prev => {
        const speaker = prev[speakerId]
        const newScore = Math.max(0, Math.min(100, 
          speaker.credibilityScore + newClaim.impact
        ))
        
        return {
          ...prev,
          [speakerId]: {
            ...speaker,
            credibilityScore: newScore,
            statements: [...speaker.statements, newClaim],
            contribution: calculateContribution(newScore, Object.keys(prev).length)
          }
        }
      })

      // Update overall video credibility score
      updateOverallScore()
    }

    // Show notification for significant claims
    if (Math.abs(newClaim.impact) >= 3) {
      toast({
        title: newClaim.impact > 0 ? "Verified True" : "Verified False",
        description: `${newClaim.speaker}: ${newClaim.claim.slice(0, 100)}${newClaim.claim.length > 100 ? '...' : ''}`,
        variant: newClaim.impact > 0 ? "default" : "destructive"
      })
    }
  }, [activeSpeaker, speakers, toast])

  const updateOverallScore = useCallback(() => {
    const speakerScores = Object.values(speakers)
    if (speakerScores.length === 0) return

    const totalScore = speakerScores.reduce((sum, speaker) => 
      sum + (speaker.credibilityScore * (1 / speakerScores.length)), 0
    )
    
    setCredibilityScore(Math.round(totalScore))
  }, [speakers])

  // Simulate real-time processing (will be replaced with actual speech recognition)
  useEffect(() => {
    if (videoId) {
      const interval = setInterval(() => {
        const speakerIds = Object.keys(speakers)
        if (speakerIds.length > 0) {
          const randomSpeaker = speakerIds[Math.floor(Math.random() * speakerIds.length)]
          const randomStatement = SAMPLE_STATEMENTS[Math.floor(Math.random() * SAMPLE_STATEMENTS.length)]
          processStatement(randomStatement, randomSpeaker)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [videoId, speakers, processStatement])

  const determineStatementType = (statement) => {
    // Check for factual indicators
    if (statement.match(/\d+%|\d+ percent|statistics show|according to|research indicates|studies show/i)) {
      return "FACTUAL"
    }
    // Check for opinions
    if (statement.match(/I think|I believe|in my opinion|might|maybe|perhaps/i)) {
      return "OPINION"
    }
    // Check for hypotheticals
    if (statement.match(/if|would|could|hypothetically|imagine|suppose/i)) {
      return "HYPOTHETICAL"
    }
    return "GENERAL"
  }

  const verifyStatement = (statement) => {
    // Simulate verification process
    const isFactual = statement.match(/\d+%|\d+ percent|statistics|data|research/i)
    const confidence = Math.random()
    
    return {
      isVerifiable: isFactual ? true : false,
      isTrue: isFactual ? confidence > 0.3 : null,
      confidence: confidence,
      sources: isFactual ? [
        { name: "Official Statistics", url: "#" },
        { name: "Research Database", url: "#" }
      ] : []
    }
  }

  const calculateImpact = (verificationResult, type) => {
    if (!verificationResult.isVerifiable) return 0
    
    const baseImpact = verificationResult.isTrue ? 2 : -3
    const confidenceMultiplier = verificationResult.confidence
    
    return baseImpact * confidenceMultiplier
  }

  const calculateContribution = (speakerScore, totalSpeakers) => {
    return (speakerScore / 100) * (1 / totalSpeakers) * 100
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 credibility-indicator rounded-lg p-4 text-white shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center ${getCredibilityColor(credibilityScore)}`}
              >
                {getCredibilityIcon(credibilityScore)}
              </motion.div>
              
              <div className="flex flex-col">
                <div className="text-sm font-semibold gold-text">
                  Video Credibility
                </div>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[credibilityScore]}
                    max={100}
                    step={1}
                    className="w-32"
                    disabled
                  />
                  <span className="text-sm gold-text">
                    {Math.round(credibilityScore)}%
                  </span>
                </div>
                
                {/* Speaker contributions */}
                <div className="mt-2 flex flex-col gap-1">
                  {Object.entries(speakers).map(([id, speaker]) => (
                    <div key={id} className="flex items-center gap-2 text-xs">
                      <User className="w-3 h-3 text-primary" />
                      <span className="text-gray-300">{speaker.name}:</span>
                      <span className={getCredibilityColor(speaker.credibilityScore)}>
                        {Math.round(speaker.credibilityScore)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecentClaims(!showRecentClaims)}
                  className={`hover:bg-primary/10 transition-colors ${showRecentClaims ? 'bg-primary/10' : ''}`}
                  title="View recent claims"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showRecentClaims && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed bottom-36 right-4 dark-glass rounded-lg p-4 shadow-lg max-w-md"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold gold-text">Recent Claims</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecentClaims(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {recentClaims.map((claim, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-lg p-3 transition-colors ${
                        claim.verificationResult.isVerifiable 
                          ? 'bg-black/20 hover:bg-black/30' 
                          : 'bg-black/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-primary">{claim.speaker}</span>
                              <span className="text-xs text-gray-400">{claim.timestamp}</span>
                            </div>
                            <div className={`text-sm mt-1 ${
                              claim.verificationResult.isVerifiable 
                                ? 'text-white' 
                                : 'text-gray-400'
                            }`}>
                              {claim.claim}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {claim.verificationResult.isVerifiable && claim.verificationResult.sources && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {claim.verificationResult.sources.map((source, sourceIndex) => (
                            <Button
                              key={sourceIndex}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                              onClick={() => window.open(source.url, '_blank')}
                            >
                              {source.name}
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

export default FactCheckOverlay
