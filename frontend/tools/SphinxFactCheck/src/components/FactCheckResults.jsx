import React from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
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
  useColorModeValue
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  WarningIcon, 
  QuestionIcon, 
  TimeIcon, 
  ExternalLinkIcon,
  InfoIcon,
  CloseIcon 
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const VeracityBadge = ({ veracity }) => {
  const getBadgeProps = () => {
    switch (veracity) {
      case 'true':
        return { 
          colorScheme: 'green', 
          icon: <CheckCircleIcon mr={1} />,
          text: 'True'
        };
      case 'partially_true':
        return { 
          colorScheme: 'yellow', 
          icon: <WarningIcon mr={1} />,
          text: 'Partially True'
        };
      case 'false':
        return { 
          colorScheme: 'red', 
          icon: <CloseIcon mr={1} />,
          text: 'False'
        };
      case 'unverifiable':
        return { 
          colorScheme: 'gray', 
          icon: <QuestionIcon mr={1} />,
          text: 'Unverifiable'
        };
      default:
        return { 
          colorScheme: 'purple', 
          icon: <InfoIcon mr={1} />,
          text: 'Unknown'
        };
    }
  };

  const { colorScheme, icon, text } = getBadgeProps();

  return (
    <Badge 
      colorScheme={colorScheme} 
      fontSize="sm" 
      p={1} 
      borderRadius="full" 
      display="flex" 
      alignItems="center"
    >
      {icon} {text}
    </Badge>
  );
};

const SeverityIndicator = ({ severity }) => {
  const getSeverityProps = () => {
    switch (severity) {
      case 'low':
        return { 
          colorScheme: 'blue', 
          text: 'Low Severity'
        };
      case 'medium':
        return { 
          colorScheme: 'orange', 
          text: 'Medium Severity'
        };
      case 'high':
        return { 
          colorScheme: 'red', 
          text: 'High Severity'
        };
      default:
        return { 
          colorScheme: 'gray', 
          text: 'Unknown Severity'
        };
    }
  };

  const { colorScheme, text } = getSeverityProps();

  return (
    <Badge 
      colorScheme={colorScheme} 
      fontSize="xs" 
      p={1} 
      borderRadius="md"
    >
      {text}
    </Badge>
  );
};

const FactCheckResults = ({ results, isLoading, onReset }) => {
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (isLoading) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md" mb={4}>Analyzing content...</Heading>
        <Progress size="sm" isIndeterminate colorScheme="teal" />
      </Box>
    );
  }

  if (!results) {
    return null;
  }

  const getAccuracyColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const statements = results.statements || [];

  return (
    <VStack spacing={6} align="stretch">
      <Box 
        bg={cardBgColor} 
        p={6} 
        borderRadius="lg" 
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">Fact Check Results</Heading>
          <Button 
            onClick={onReset} 
            size="sm" 
            leftIcon={<TimeIcon />}
            variant="outline"
          >
            New Check
          </Button>
        </Flex>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <Stat>
            <StatLabel>Overall Accuracy</StatLabel>
            <StatNumber>{results.accuracy}%</StatNumber>
            <StatHelpText>
              <Progress 
                value={results.accuracy} 
                colorScheme={getAccuracyColor(results.accuracy)} 
                size="sm" 
                borderRadius="full" 
                mt={1}
              />
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Claims Analyzed</StatLabel>
            <StatNumber>{results.totalClaims}</StatNumber>
            <StatHelpText>
              <HStack mt={1}>
                <Badge colorScheme="green">
                  {statements.filter(s => s.veracity === 'true').length} True
                </Badge>
                <Badge colorScheme="yellow">
                  {statements.filter(s => s.veracity === 'partially_true').length} Partial
                </Badge>
                <Badge colorScheme="red">
                  {statements.filter(s => s.veracity === 'false').length} False
                </Badge>
              </HStack>
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Critical Issues</StatLabel>
            <StatNumber>
              {statements.filter(s => s.severity === 'high' && s.veracity !== 'true').length}
            </StatNumber>
            <StatHelpText>
              High severity claims requiring attention
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      <Heading size="md" mb={2}>Analyzed Statements</Heading>
      
      <VStack spacing={4} align="stretch">
        {statements.map((statement, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              borderWidth="1px" 
              borderColor={borderColor}
              boxShadow="sm"
              bg={cardBgColor}
              overflow="hidden"
            >
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <VeracityBadge veracity={statement.veracity} />
                    <SeverityIndicator severity={statement.severity} />
                  </HStack>
                  <Tooltip label={`${statement.confidence}% confidence in this assessment`}>
                    <Badge colorScheme="purple" variant="outline">
                      {statement.confidence}% confidence
                    </Badge>
                  </Tooltip>
                </Flex>
              </CardHeader>
              
              <CardBody py={3}>
                <Text fontWeight="medium" mb={3}>
                  "{statement.text}"
                </Text>
                <Text fontSize="sm">
                  {statement.explanation}
                </Text>
              </CardBody>
              
              {statement.sources && statement.sources.length > 0 && (
                <CardFooter 
                  pt={0} 
                  borderTop="1px" 
                  borderColor={borderColor}
                  bg={useColorModeValue('gray.50', 'gray.900')}
                >
                  <VStack align="stretch" width="100%" spacing={1}>
                    <Text fontSize="xs" fontWeight="medium" mb={1}>
                      Sources:
                    </Text>
                    <List spacing={1}>
                      {statement.sources.map((source, idx) => (
                        <ListItem key={idx} fontSize="xs">
                          <Link 
                            href={source.url} 
                            isExternal 
                            color="teal.500"
                            display="inline-flex"
                            alignItems="center"
                          >
                            {source.title} <ExternalLinkIcon mx="2px" />
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                </CardFooter>
              )}
            </Card>
          </MotionBox>
        ))}
      </VStack>

      <Flex justify="center" mt={6}>
        <Button 
          onClick={onReset} 
          colorScheme="teal" 
          leftIcon={<TimeIcon />}
          size="lg"
        >
          Run Another Fact Check
        </Button>
      </Flex>
    </VStack>
  );
};

export default FactCheckResults; 