import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import FactCheckInput from './FactCheckInput';
import FactCheckResults from './FactCheckResults';

// Mock function - replace with actual API call
const mockFactCheck = (payload) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve({
        accuracy: 0.78,
        totalClaims: 5,
        statements: [
          {
            id: 1,
            claim: "The Great Wall of China is visible from space with the naked eye.",
            veracity: "false",
            explanation: "Contrary to popular belief, the Great Wall of China cannot be seen from space with the naked eye. This has been confirmed by multiple astronauts.",
            confidence: 0.95,
            severity: "high",
            sources: [
              { title: "NASA", url: "https://www.nasa.gov/vision/space/workinginspace/great_wall.html" },
              { title: "Scientific American", url: "https://www.scientificamerican.com/article/is-chinas-great-wall-visible-from-space/" }
            ]
          },
          {
            id: 2,
            claim: "Mount Everest is the tallest mountain in the world.",
            veracity: "partially true",
            explanation: "Mount Everest is the tallest mountain above sea level (29,032 feet), but Mauna Kea in Hawaii is technically taller from base to peak at over 33,000 feet, with much of it underwater.",
            confidence: 0.88,
            severity: "low",
            sources: [
              { title: "National Geographic", url: "https://www.nationalgeographic.com/science/article/the-tallest-mountain-in-the-world" }
            ]
          },
          {
            id: 3, 
            claim: "Albert Einstein failed math as a student.",
            veracity: "false",
            explanation: "Einstein excelled in mathematics from a young age. This is a common myth that has been debunked by historians and biographers.",
            confidence: 0.92,
            severity: "medium",
            sources: [
              { title: "Einstein Archives", url: "https://alberteinstein.info/biography" }
            ]
          },
          {
            id: 4,
            claim: "The Earth is approximately 4.5 billion years old.",
            veracity: "true",
            explanation: "Scientific consensus based on radiometric dating of meteorites and oldest Earth rocks places Earth's age at approximately 4.54 billion years.",
            confidence: 0.97,
            severity: "none",
            sources: [
              { title: "USGS", url: "https://www.usgs.gov/faqs/how-old-earth" }
            ]
          },
          {
            id: 5,
            claim: "Thomas Edison invented the light bulb.",
            veracity: "partially true",
            explanation: "Edison developed the first commercially practical incandescent light bulb, but he wasn't the first to invent the concept. Earlier inventors like Joseph Swan had created versions of incandescent lamps before Edison.",
            confidence: 0.85,
            severity: "medium",
            sources: [
              { title: "Smithsonian Magazine", url: "https://www.smithsonianmag.com/innovation/thomas-edison-light-bulb-history-180978149/" }
            ]
          }
        ]
      });
    }, 2000);
  });
};

const FactCheckToolApp = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('brand.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleSubmit = async (payload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call
      const data = await mockFactCheck(payload);
      setResults(data);
    } catch (err) {
      setError('An error occurred while analyzing the content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setResults(null);
    setError(null);
  };
  
  return (
    <Container maxW="container.lg" py={8}>
      <Box
        mb={6}
        p={5}
        bg={headerBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading as="h1" size="xl" mb={2}>Sphinx Fact Checker</Heading>
        <Text fontSize="lg">
          Analyze content for factual accuracy and get detailed explanations
        </Text>
      </Box>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setError(null)}
          />
        </Alert>
      )}
      
      <VStack spacing={8} align="stretch">
        <FactCheckInput 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
        />
        
        {results && (
          <>
            <Divider />
            <FactCheckResults 
              results={results} 
              isLoading={isLoading} 
              onReset={handleReset}
            />
          </>
        )}
      </VStack>
    </Container>
  );
};

export default FactCheckToolApp; 