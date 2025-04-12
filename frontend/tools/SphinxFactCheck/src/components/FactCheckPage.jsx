import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import FactCheckInput from './FactCheckInput';
import FactCheckResults from './FactCheckResults';

const FactCheckPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    // In a real implementation, you'd call your API here
    try {
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results for demonstration
      const mockResults = {
        accuracy: 76,
        totalClaims: 5,
        statements: [
          {
            text: "The COVID-19 vaccine was developed in record time, proving it was rushed.",
            veracity: "partially_true",
            confidence: 82,
            explanation: "While the COVID-19 vaccines were developed faster than traditional vaccines, this was due to unprecedented global cooperation, funding, and building on existing research. The clinical trials followed standard safety protocols.",
            severity: "medium",
            sources: [
              { url: "https://www.cdc.gov/coronavirus/2019-ncov/vaccines/distributing/steps-ensure-safety.html", title: "CDC - Ensuring COVID-19 Vaccine Safety in the US" },
              { url: "https://www.nature.com/articles/d41586-020-03626-1", title: "Nature - The lightning-fast quest for COVID vaccines" }
            ]
          },
          {
            text: "Global temperatures have not increased in the past decade.",
            veracity: "false",
            confidence: 95,
            explanation: "Global temperature data clearly shows warming trends continuing over the past decade. According to NASA and NOAA, multiple recent years have been among the warmest on record.",
            severity: "high",
            sources: [
              { url: "https://climate.nasa.gov/vital-signs/global-temperature/", title: "NASA - Global Temperature" },
              { url: "https://www.noaa.gov/news/2020-was-earth-s-2nd-hottest-year-just-behind-2016", title: "NOAA - Earth's Temperature Records" }
            ]
          },
          {
            text: "The average American family spends over $5,000 annually on healthcare.",
            veracity: "true",
            confidence: 88,
            explanation: "According to the Bureau of Labor Statistics and various healthcare studies, the average American family spends between $5,000 and $8,000 annually on healthcare including insurance premiums, deductibles, and out-of-pocket costs.",
            severity: "low",
            sources: [
              { url: "https://www.bls.gov/news.release/cesan.nr0.htm", title: "BLS - Consumer Expenditure Survey" },
              { url: "https://www.kff.org/health-costs/report/2020-employer-health-benefits-survey/", title: "KFF - Employer Health Benefits Survey" }
            ]
          },
          {
            text: "Electric vehicles produce more lifetime emissions than gasoline cars.",
            veracity: "false",
            confidence: 90,
            explanation: "Multiple lifecycle analyses show that even when accounting for battery production and electricity generation, electric vehicles produce fewer lifetime emissions than comparable gasoline vehicles in most regions.",
            severity: "high",
            sources: [
              { url: "https://www.epa.gov/greenvehicles/electric-vehicle-myths", title: "EPA - Electric Vehicle Myths" },
              { url: "https://theicct.org/publications/global-LCA-passenger-cars-jul2021", title: "ICCT - Life-cycle Assessment of Vehicle Emissions" }
            ]
          },
          {
            text: "Drinking moderate amounts of red wine can have heart health benefits.",
            veracity: "partially_true",
            confidence: 75,
            explanation: "Some studies suggest moderate red wine consumption may offer heart benefits due to antioxidants, but the relationship is complex. Health organizations caution that any potential benefits must be weighed against risks of alcohol consumption.",
            severity: "low",
            sources: [
              { url: "https://www.heart.org/en/news/2019/05/24/drinking-red-wine-for-heart-health-read-this-before-you-toast", title: "American Heart Association - Red Wine and Heart Health" },
              { url: "https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/red-wine/art-20048281", title: "Mayo Clinic - Red Wine and Heart Health" }
            ]
          }
        ]
      };
      
      setResults(mockResults);
      toast({
        title: 'Analysis complete',
        description: 'Successfully analyzed the provided content',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error during fact checking:', err);
      setError('Failed to analyze the content. Please try again later.');
      toast({
        title: 'Analysis failed',
        description: 'There was an error analyzing your content',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex direction="column" align="center" mb={6}>
            <Image 
              src="/sphinx-logo.png" 
              alt="Sphinx Fact Check" 
              height="80px"
              fallbackSrc="https://via.placeholder.com/150x80?text=Sphinx"
              mb={4}
            />
            <Heading as="h1" size="2xl" textAlign="center" color={textColor}>
              Sphinx Fact Check
            </Heading>
            <Text fontSize="xl" textAlign="center" color={useColorModeValue('gray.600', 'gray.400')} maxW="container.md" mt={2}>
              AI-powered fact checking for documents, articles, and web content
            </Text>
          </Flex>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!results ? (
            <FactCheckInput onSubmit={handleSubmit} isLoading={isLoading} />
          ) : (
            <FactCheckResults 
              results={results} 
              isLoading={isLoading}
              onReset={handleReset}
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default FactCheckPage; 