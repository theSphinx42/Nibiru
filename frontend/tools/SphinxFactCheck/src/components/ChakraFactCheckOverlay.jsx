import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  STATEMENT_TYPES, 
  CONFIDENCE_LEVELS, 
  calculateImpact, 
  calculateOverallScore,
  SPEAKER_SCORING 
} from '../types/scoring';
import {
  Box,
  Flex,
  Text,
  Badge,
  Progress,
  List,
  ListItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  VStack,
  HStack,
  Link,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Tooltip,
  SimpleGrid,
  useColorModeValue,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Avatar,
  Heading,
  useToast,
  IconButton,
  CloseButton
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  WarningIcon, 
  QuestionIcon, 
  TimeIcon, 
  ExternalLinkIcon,
  InfoIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from "framer-motion";

// Define the MotionBox component for animations
const MotionBox = motion(Box);

// Helper functions
const getCredibilityColor = (score) => {
  if (score >= 80) return "green.500";
  if (score >= 60) return "yellow.500";
  return "red.500";
};

const getCredibilityIcon = (score) => {
  if (score >= 80) return <CheckCircleIcon />;
  if (score >= 60) return <WarningIcon />;
  return <CloseIcon />;
};

const STATEMENT_IMPORTANCE = {
  CRITICAL: { impact: 5, threshold: 0.9 },
  HIGH: { impact: 3, threshold: 0.8 },
  MEDIUM: { impact: 2, threshold: 0.7 },
  LOW: { impact: 1, threshold: 0.6 }
};

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
];

// Get icon for verification result
const getVerificationIconByType = (result) => {
  if (!result.isVerifiable) {
    return { icon: <QuestionIcon />, color: "gray.500", label: "Unverifiable" };
  }
  
  if (result.isTrue === true) {
    return { icon: <CheckCircleIcon />, color: "green.500", label: "True" };
  }
  
  if (result.isPartiallyTrue) {
    return { icon: <WarningIcon />, color: "yellow.500", label: "Partially True" };
  }
  
  if (result.isMisleading) {
    return { icon: <WarningIcon />, color: "orange.500", label: "Misleading" };
  }
  
  return { icon: <CloseIcon />, color: "red.500", label: "False" };
};

export default function ChakraFactCheckOverlay({ videoUrl, statements }) {
  const toast = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [credibilityScore, setCredibilityScore] = useState(SPEAKER_SCORING.INITIAL_SCORE);
  const [showRecentClaims, setShowRecentClaims] = useState(false);
  const [recentClaims, setRecentClaims] = useState([]);
  const [speakers, setSpeakers] = useState({});
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [allStatements, setAllStatements] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [statementCount, setStatementCount] = useState(0);
  const statementInterval = useRef(null);
  
  // Background colors based on color mode
  const bgColor = useColorModeValue("white", "gray.800");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  // Reset everything when video changes
  useEffect(() => {
    if (videoUrl) {
      setCredibilityScore(SPEAKER_SCORING.INITIAL_SCORE);
      setRecentClaims([]);
      setSpeakers({});
      setActiveSpeaker(null);
      // Add initial speakers for testing
      addSpeaker('speaker1', 'John D.');
      addSpeaker('speaker2', 'Sarah M.');
    }
  }, [videoUrl]);

  const addSpeaker = useCallback((speakerId, name = `Speaker ${Object.keys(speakers).length + 1}`) => {
    setSpeakers(prev => ({
      ...prev,
      [speakerId]: {
        name,
        credibilityScore: SPEAKER_SCORING.INITIAL_SCORE,
        statements: [],
        consecutiveFalse: 0
      }
    }));
  }, [speakers]);

  const processStatement = useCallback((statement) => {
    // Skip if no statement
    if (!statement || !statement.text) return;
    
    // Determine statement type
    const type = determineStatementType(statement.text);
    
    // Verify the statement
    const verificationResult = verifyStatement(statement.text, type);
    
    // Create new statement object with verification result
    const newStatement = {
      id: Date.now(),
      text: statement.text,
      speaker: statement.speaker || 'Unknown Speaker',
      timestamp: statement.timestamp || new Date().toISOString(),
      type,
      verificationResult
    };
    
    // Update all statements
    setAllStatements(prev => [...prev, newStatement]);
    
    // Update recent claims (keep most recent 5)
    setRecentClaims(prev => {
      const updated = [newStatement, ...prev];
      return updated.slice(0, 5);
    });
    
    // Update speaker data
    setSpeakers(prev => {
      const speaker = prev[newStatement.speaker] || {
        name: newStatement.speaker,
        statements: [],
        credibilityScore: SPEAKER_SCORING.INITIAL_SCORE,
        consecutiveFalse: 0
      };
      
      // Calculate impact on speaker credibility
      const impact = calculateImpact(verificationResult, type);
      
      // Apply penalty for consecutive false statements
      let consecutiveFalse = speaker.consecutiveFalse;
      let impactMultiplier = 1;
      
      if (verificationResult.isTrue === false) {
        consecutiveFalse++;
        if (consecutiveFalse > 1) {
          impactMultiplier = Math.pow(SPEAKER_SCORING.PENALTY_CONSECUTIVE_FALSE, consecutiveFalse - 1);
        }
      } else {
        consecutiveFalse = 0;
      }
      
      // Calculate new score with penalties
      const newScore = Math.max(
        SPEAKER_SCORING.MIN_SCORE,
        Math.min(
          SPEAKER_SCORING.MAX_SCORE,
          speaker.credibilityScore + (impact * impactMultiplier)
        )
      );
      
      // Update speaker data
      const updatedSpeaker = {
        ...speaker,
        statements: [...speaker.statements, newStatement],
        credibilityScore: newScore,
        consecutiveFalse
      };
      
      return {
        ...prev,
        [newStatement.speaker]: updatedSpeaker
      };
    });
    
    // Increment statement count
    setStatementCount(prev => prev + 1);

    // Show notification for significant claims
    if (Math.abs(impact) >= 3) {
      toast({
        title: impact > 0 ? "Verified True" : "Verified False",
        description: `${newStatement.speaker}: ${newStatement.text.slice(0, 100)}${newStatement.text.length > 100 ? '...' : ''}`,
        status: impact > 0 ? "success" : "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [activeSpeaker, speakers, toast]);

  const updateOverallScore = useCallback(() => {
    const speakerScores = Object.values(speakers);
    if (speakerScores.length === 0) return;

    const totalScore = speakerScores.reduce((sum, speaker) => 
      sum + (speaker.credibilityScore * (1 / speakerScores.length)), 0
    );
    
    setCredibilityScore(Math.round(totalScore));
  }, [speakers]);

  // Simulate real-time processing (will be replaced with actual speech recognition)
  useEffect(() => {
    if (videoUrl) {
      const interval = setInterval(() => {
        const speakerIds = Object.keys(speakers);
        if (speakerIds.length > 0) {
          const randomSpeaker = speakerIds[Math.floor(Math.random() * speakerIds.length)];
          const randomStatement = SAMPLE_STATEMENTS[Math.floor(Math.random() * SAMPLE_STATEMENTS.length)];
          processStatement({ text: randomStatement, speaker: randomSpeaker });
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [videoUrl, speakers, processStatement]);

  const determineStatementType = (text) => {
    // Check for statistical patterns (numbers, percentages, etc.)
    if (/\d+%|\d+\s*percent|\d+\.\d+|statistics show/i.test(text)) {
      return 'STATISTICAL';
    }
    
    // Check for historical references
    if (/in \d{4}|historically|in the past|years ago|century|decade/i.test(text)) {
      return 'HISTORICAL';
    }
    
    // Check for causal claims
    if (/because|therefore|causes|leads to|results in|due to/i.test(text)) {
      return 'CAUSAL';
    }
    
    // Check for opinions
    if (/I think|I believe|in my opinion|I feel|should be|ought to|might be/i.test(text)) {
      return 'OPINION';
    }
    
    // Check for hypotheticals
    if (/if|would|could|may|might|hypothetically|imagine if/i.test(text)) {
      return 'HYPOTHETICAL';
    }
    
    // Default to factual for anything that appears to be a direct claim
    if (/is|are|was|were|will be|has been|have been/i.test(text)) {
      return 'FACTUAL';
    }
    
    // Fall back to general for anything else
    return 'GENERAL';
  };
  
  const verifyStatement = (text, type) => {
    // If statement type doesn't require verification
    if (!STATEMENT_TYPES[type]?.requiresVerification) {
      return {
        isVerifiable: false,
        confidence: CONFIDENCE_LEVELS.MEDIUM,
        sources: []
      };
    }
    
    // Simulate a verification process (this would be replaced with actual API call)
    // For demo purposes, we'll randomly determine verification results
    const randomFactor = Math.random();
    let isTrue, isPartiallyTrue, isMisleading, confidence, sources;
    
    // Simulate verification sources based on statement type
    const simulateSources = () => {
      const sourceCount = Math.floor(Math.random() * 3) + 1;
      const possibleSources = [
        { name: 'Academic Paper', type: 'ACADEMIC', url: '#' },
        { name: 'Government Report', type: 'GOVERNMENT', url: '#' },
        { name: 'News Article', type: 'MAJOR_NEWS', url: '#' },
        { name: 'Industry Publication', type: 'INDUSTRY', url: '#' },
        { name: 'Blog Post', type: 'BLOG', url: '#' },
        { name: 'Social Media', type: 'SOCIAL_MEDIA', url: '#' }
      ];
      
      return Array.from({ length: sourceCount }, () => {
        const source = possibleSources[Math.floor(Math.random() * possibleSources.length)];
        return {
          ...source,
          relevance: Math.random().toFixed(2)
        };
      });
    };
    
    if (randomFactor > 0.7) {
      // True statement
      isTrue = true;
      isPartiallyTrue = false;
      isMisleading = false;
      confidence = CONFIDENCE_LEVELS.HIGH + (Math.random() * (CONFIDENCE_LEVELS.VERY_HIGH - CONFIDENCE_LEVELS.HIGH));
      sources = simulateSources();
    } else if (randomFactor > 0.5) {
      // Partially true
      isTrue = null;
      isPartiallyTrue = true;
      isMisleading = false;
      confidence = CONFIDENCE_LEVELS.MEDIUM + (Math.random() * (CONFIDENCE_LEVELS.HIGH - CONFIDENCE_LEVELS.MEDIUM));
      sources = simulateSources();
    } else if (randomFactor > 0.3) {
      // Misleading
      isTrue = false;
      isPartiallyTrue = false;
      isMisleading = true;
      confidence = CONFIDENCE_LEVELS.MEDIUM + (Math.random() * (CONFIDENCE_LEVELS.HIGH - CONFIDENCE_LEVELS.MEDIUM));
      sources = simulateSources();
    } else {
      // False
      isTrue = false;
      isPartiallyTrue = false;
      isMisleading = false;
      confidence = CONFIDENCE_LEVELS.MEDIUM + (Math.random() * (CONFIDENCE_LEVELS.VERY_HIGH - CONFIDENCE_LEVELS.MEDIUM));
      sources = simulateSources();
    }
    
    return {
      isVerifiable: true,
      isTrue,
      isPartiallyTrue,
      isMisleading,
      confidence,
      sources
    };
  };

  // Update the overall credibility score
  useEffect(() => {
    // Only update if we have statements
    if (allStatements.length > 0) {
      const newScore = calculateOverallScore(speakers, allStatements);
      setCredibilityScore(newScore);
    }
  }, [speakers, allStatements]);
  
  // For demo, simulate a stream of statements
  useEffect(() => {
    if (!isActive) return;
    
    const sampleStatements = [
      { text: "The unemployment rate has dropped by 5% in the last quarter.", speaker: "Analyst Smith" },
      { text: "Our product increased customer satisfaction by 87%.", speaker: "CEO Jones" },
      { text: "Studies show that 9 out of 10 doctors recommend our approach.", speaker: "Dr. Williams" },
      { text: "I believe this is the best course of action for our company.", speaker: "Board Member Davis" },
      { text: "If we implement this strategy, we could see a 30% growth.", speaker: "CFO Wilson" },
      { text: "The competitor's solution has failed in 60% of cases.", speaker: "Analyst Smith" },
      { text: "We were founded in 1985 and have been industry leaders since 1990.", speaker: "CEO Jones" },
      { text: "Because of market conditions, this trend will continue through 2023.", speaker: "Analyst Smith" },
      { text: "In my opinion, we should reconsider our approach to this problem.", speaker: "Dr. Williams" },
      { text: "Global temperatures have risen 1.1 degrees Celsius since pre-industrial times.", speaker: "Dr. Williams" }
    ];
    
    // Process initial statements
    processStatement(sampleStatements[statementCount % sampleStatements.length]);
    
    // Set up interval to process statements
    statementInterval.current = setInterval(() => {
      processStatement(sampleStatements[statementCount % sampleStatements.length]);
    }, 8000);
    
    return () => {
      if (statementInterval.current) {
        clearInterval(statementInterval.current);
      }
    };
  }, [isActive, processStatement, statementCount]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main credibility indicator */}
          <MotionBox
            position="fixed"
            bottom="4"
            right="4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            bg={glassBg}
            p={4}
            borderRadius="lg"
            boxShadow="lg"
            backdropFilter="blur(10px)"
            borderWidth="1px"
            borderColor={borderColor}
            zIndex={1000}
          >
            <Flex alignItems="center" justifyContent="space-between">
              <HStack spacing={4}>
                <Box>
                  <Icon 
                    as={getCredibilityIcon(credibilityScore)} 
                    color={getCredibilityColor(credibilityScore)} 
                    w={6} 
                    h={6} 
                  />
                </Box>
                
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>
                    Video Credibility
                  </Text>
                  <Flex alignItems="center">
                    <Slider 
                      value={credibilityScore} 
                      max={100} 
                      min={0}
                      isReadOnly
                      width="150px"
                      mr={2}
                    >
                      <SliderTrack>
                        <SliderFilledTrack bg={getCredibilityColor(credibilityScore)} />
                      </SliderTrack>
                      <SliderThumb boxSize={3} />
                    </Slider>
                    <Badge colorScheme={credibilityScore >= 80 ? "green" : credibilityScore >= 60 ? "yellow" : "red"}>
                      {Math.round(credibilityScore)}%
                    </Badge>
                  </Flex>
                  
                  {/* Speaker contributions */}
                  <VStack align="flex-start" mt={2} spacing={1}>
                    {Object.entries(speakers).map(([id, speaker]) => (
                      <HStack key={id} spacing={2} fontSize="xs">
                        <Avatar size="2xs" name={speaker.name} />
                        <Text color="gray.400">{speaker.name}:</Text>
                        <Badge 
                          colorScheme={
                            speaker.credibilityScore >= 80 ? "green" : 
                            speaker.credibilityScore >= 60 ? "yellow" : "red"
                          }
                          variant="subtle"
                        >
                          {Math.round(speaker.credibilityScore)}%
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </HStack>
              
              <IconButton
                aria-label="View recent claims"
                icon={showRecentClaims ? <ChevronDownIcon /> : <ChevronUpIcon />}
                size="sm"
                variant="ghost"
                onClick={() => setShowRecentClaims(!showRecentClaims)}
              />
            </Flex>
          </MotionBox>

          {/* Recent claims panel */}
          <AnimatePresence>
            {showRecentClaims && (
              <MotionBox
                position="fixed"
                bottom="32"
                right="4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                bg={glassBg}
                borderRadius="lg"
                boxShadow="lg"
                backdropFilter="blur(10px)"
                borderWidth="1px"
                borderColor={borderColor}
                p={4}
                maxW="md"
                zIndex={1000}
              >
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                  <Heading size="sm">Recent Claims</Heading>
                  <CloseButton onClick={() => setShowRecentClaims(false)} />
                </Flex>
                
                <VStack align="stretch" maxH="300px" overflowY="auto" spacing={2}>
                  {recentClaims.length > 0 ? (
                    recentClaims.map((claim) => {
                      const verification = getVerificationIconByType(claim.verificationResult);
                      return (
                        <Card 
                          key={claim.id} 
                          size="sm" 
                          variant="outline" 
                          bg={useColorModeValue("white", "gray.700")}
                        >
                          <CardBody p={3}>
                            <HStack spacing={2} mb={1}>
                              <Avatar size="xs" name={claim.speaker} />
                              <Text fontWeight="medium" fontSize="sm">{claim.speaker}</Text>
                              <Badge colorScheme={verification.color.split('.')[0]} ml="auto">
                                {verification.label}
                              </Badge>
                            </HStack>
                            
                            <Text fontSize="sm" mb={2}>{claim.text}</Text>
                            
                            {claim.verificationResult.isVerifiable && claim.verificationResult.sources && (
                              <HStack mt={2} flexWrap="wrap">
                                {claim.verificationResult.sources.slice(0, 2).map((source, idx) => (
                                  <Link 
                                    key={idx} 
                                    href={source.url} 
                                    isExternal 
                                    fontSize="xs" 
                                    color="blue.500"
                                  >
                                    {source.name} <ExternalLinkIcon mx="1px" />
                                  </Link>
                                ))}
                              </HStack>
                            )}
                          </CardBody>
                        </Card>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color="gray.500">No claims analyzed yet</Text>
                  )}
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
} 