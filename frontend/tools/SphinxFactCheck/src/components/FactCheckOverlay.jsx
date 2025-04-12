import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Progress,
  List,
  ListItem,
  Card,
  Heading,
  Icon,
  Avatar
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  QuestionIcon,
  TimeIcon,
  CloseIcon
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { useFactCheck } from '../hooks/useFactCheck';
import { STATEMENT_TYPES, CONFIDENCE_LEVELS } from '../types/scoring';

const MotionBox = motion(Box);

/**
 * Get appropriate color based on credibility score
 */
const getCredibilityColor = (score) => {
  if (score >= 80) return 'green.500';
  if (score >= 60) return 'green.300';
  if (score >= 40) return 'yellow.400';
  if (score >= 20) return 'orange.400';
  return 'red.500';
};

/**
 * Get badge variant based on verification result
 */
const getBadgeForVerification = (result) => {
  if (!result) {
    return {
      colorScheme: 'gray',
      text: 'Unverified',
      icon: QuestionIcon
    };
  }
  
  if (result.isTrue) {
    return {
      colorScheme: 'green',
      text: 'True',
      icon: CheckCircleIcon
    };
  }
  
  if (result.isPartiallyTrue) {
    return {
      colorScheme: 'yellow',
      text: 'Partially True',
      icon: WarningIcon
    };
  }
  
  if (result.isMisleading) {
    return {
      colorScheme: 'orange',
      text: 'Misleading',
      icon: WarningIcon
    };
  }
  
  return {
    colorScheme: 'red',
    text: 'False',
    icon: CloseIcon
  };
};

/**
 * Get confidence level badge
 */
const getConfidenceBadge = (confidenceLevel) => {
  if (!confidenceLevel) return { colorScheme: 'gray', text: 'Unknown' };
  
  switch (confidenceLevel) {
    case CONFIDENCE_LEVELS.VERY_HIGH:
      return { colorScheme: 'green', text: 'Very High Confidence' };
    case CONFIDENCE_LEVELS.HIGH:
      return { colorScheme: 'teal', text: 'High Confidence' };
    case CONFIDENCE_LEVELS.MEDIUM:
      return { colorScheme: 'blue', text: 'Medium Confidence' };
    case CONFIDENCE_LEVELS.LOW:
      return { colorScheme: 'orange', text: 'Low Confidence' };
    case CONFIDENCE_LEVELS.VERY_LOW:
      return { colorScheme: 'red', text: 'Very Low Confidence' };
    default:
      return { colorScheme: 'gray', text: 'Unknown' };
  }
};

/**
 * Get statement type badge
 */
const getStatementTypeBadge = (statementType) => {
  const type = STATEMENT_TYPES[statementType] || STATEMENT_TYPES.GENERAL;
  
  return {
    colorScheme: type.color || 'gray',
    text: type.name || 'General Statement'
  };
};

/**
 * Component for displaying fact check analysis overlay
 */
export function FactCheckOverlay({ 
  transcriptData, 
  visible = true, 
  position = 'right',
  width = '30%',
  onClose = () => {}
}) {
  const { 
    isAnalyzing, 
    error, 
    speakers, 
    statements, 
    overallScore, 
    processStatement, 
    resetFactCheck 
  } = useFactCheck();
  
  const [recentStatements, setRecentStatements] = useState([]);
  
  // Process transcript data
  useEffect(() => {
    if (!transcriptData) return;
    
    const { speakerId, speakerName, statement, statementType } = transcriptData;
    if (!statement || !speakerId) return;
    
    processStatement(speakerId, speakerName, statement, statementType);
  }, [transcriptData, processStatement]);
  
  // Keep track of recent verified statements
  useEffect(() => {
    if (!statements.length) return;
    
    // Get all processed statements
    const processedStatements = statements
      .filter(s => s.processed)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    
    setRecentStatements(processedStatements);
  }, [statements]);
  
  // Reset when closed
  useEffect(() => {
    if (!visible) {
      resetFactCheck();
    }
  }, [visible, resetFactCheck]);
  
  if (!visible) return null;
  
  return (
    <MotionBox
      position="fixed"
      top="0"
      right={position === 'right' ? '0' : 'auto'}
      left={position === 'left' ? '0' : 'auto'}
      height="100vh"
      width={width}
      bg="blackAlpha.900"
      zIndex="overlay"
      color="white"
      p={4}
      overflowY="auto"
      initial={{ x: position === 'right' ? '100%' : '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: position === 'right' ? '100%' : '-100%' }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Sphinx Fact Check</Heading>
        <Icon 
          as={CloseIcon} 
          cursor="pointer" 
          onClick={onClose}
          _hover={{ color: 'red.400' }}
        />
      </Flex>
      
      {error && (
        <Card bg="red.700" p={3} my={3}>
          <Text>Error: {error}</Text>
        </Card>
      )}
      
      {isAnalyzing && (
        <Flex alignItems="center" mb={4}>
          <Icon as={TimeIcon} mr={2} />
          <Text>Analyzing statement...</Text>
        </Flex>
      )}
      
      {/* Overall Score */}
      <Card bg="whiteAlpha.200" p={4} mb={4}>
        <Heading size="sm" mb={2}>Overall Credibility Score</Heading>
        <Text fontSize="2xl" fontWeight="bold" color={getCredibilityColor(overallScore)}>
          {Math.round(overallScore)}%
        </Text>
        <Progress 
          value={overallScore} 
          colorScheme={overallScore >= 60 ? 'green' : overallScore >= 40 ? 'yellow' : 'red'}
          size="sm"
          borderRadius="full"
          mt={2}
        />
      </Card>
      
      {/* Speakers */}
      {Object.keys(speakers).length > 0 && (
        <Box mb={4}>
          <Heading size="sm" mb={2}>Speakers</Heading>
          <List spacing={2}>
            {Object.values(speakers).map(speaker => (
              <ListItem key={speaker.id}>
                <Card bg="whiteAlpha.100" p={3}>
                  <Flex alignItems="center">
                    <Avatar size="sm" name={speaker.name} mr={3} />
                    <Box flex="1">
                      <Text fontWeight="bold">{speaker.name}</Text>
                      <Flex alignItems="center">
                        <Text fontSize="sm" mr={2}>Credibility:</Text>
                        <Text 
                          fontWeight="bold" 
                          color={getCredibilityColor(speaker.credibilityScore)}
                        >
                          {Math.round(speaker.credibilityScore)}%
                        </Text>
                      </Flex>
                    </Box>
                    <Progress 
                      value={speaker.credibilityScore}
                      colorScheme={
                        speaker.credibilityScore >= 60 ? 'green' : 
                        speaker.credibilityScore >= 40 ? 'yellow' : 'red'
                      }
                      size="xs"
                      width="60px"
                      borderRadius="full"
                    />
                  </Flex>
                </Card>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Recent Claims */}
      {recentStatements.length > 0 && (
        <Box>
          <Heading size="sm" mb={2}>Recent Claims</Heading>
          <List spacing={3}>
            {recentStatements.map(statement => {
              const verificationBadge = getBadgeForVerification(statement.verificationResult);
              const typeBadge = getStatementTypeBadge(statement.type);
              const confidenceBadge = statement.verificationResult ? 
                getConfidenceBadge(statement.verificationResult.confidence) : null;
                
              return (
                <ListItem key={statement.id}>
                  <Card bg="whiteAlpha.100" p={3}>
                    <Flex mb={2}>
                      <Badge colorScheme={typeBadge.colorScheme} mr={1}>
                        {typeBadge.text}
                      </Badge>
                      <Text fontSize="xs" color="gray.400" ml="auto">
                        {new Date(statement.timestamp).toLocaleTimeString()}
                      </Text>
                    </Flex>
                    
                    <Text mb={2} fontSize="sm">"{statement.content}"</Text>
                    
                    <Text fontSize="xs" color="gray.400" mb={1}>
                      - {statement.speakerName}
                    </Text>
                    
                    <Flex wrap="wrap" gap={2} mt={2}>
                      <Badge colorScheme={verificationBadge.colorScheme}>
                        <Flex alignItems="center">
                          <Icon as={verificationBadge.icon} mr={1} />
                          {verificationBadge.text}
                        </Flex>
                      </Badge>
                      
                      {confidenceBadge && (
                        <Badge colorScheme={confidenceBadge.colorScheme} variant="outline">
                          {confidenceBadge.text}
                        </Badge>
                      )}
                    </Flex>
                    
                    {statement.verificationResult?.explanation && (
                      <Text fontSize="xs" mt={2} color="gray.300">
                        {statement.verificationResult.explanation}
                      </Text>
                    )}
                  </Card>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </MotionBox>
  );
}
