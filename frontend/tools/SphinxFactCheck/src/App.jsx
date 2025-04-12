import React, { useState, useCallback, useEffect } from "react"
import FactCheckOverlay from "./components/FactCheckOverlay"
import VideoPlayer from "./components/VideoPlayer"
import { Toaster } from "./components/ui/toaster"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { useToast } from "./components/ui/use-toast"
import { Link2, Youtube, Globe, Shield, Sparkles } from "lucide-react"
import { 
  ChakraProvider, 
  Container, 
  Box, 
  Heading, 
  Text,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useColorModeValue
} from "@chakra-ui/react"
import FactCheckInput from "./components/FactCheckInput"
import FactCheckResults from "./components/FactCheckResults"
import { theme } from "./theme"
import { mockResults } from "./mockData"

// Update the function signature to better document the prop types
function App({ 
  standalone = true, 
  theme = "dark", 
  onSubmit = null // onSubmit: (type: 'url' | 'text') => void
}) {
  const [videoUrl, setVideoUrl] = useState("")
  const [textContent, setTextContent] = useState("")
  const [inputMode, setInputMode] = useState("url") // "url" or "text"
  const [currentVideo, setCurrentVideo] = useState(null)
  const { toast } = useToast()
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTranscriptUpdate = useCallback((statement) => {
    // Pass the statement to FactCheckOverlay
    if (currentVideo) {
      const factCheckEvent = new CustomEvent('factCheck', { 
        detail: {
          ...statement,
          videoId: currentVideo.id
        }
      })
      window.dispatchEvent(factCheckEvent)
    }
  }, [currentVideo])

  const handleVideoSubmit = (e) => {
    e.preventDefault()
    
    // Call the onSubmit callback if provided
    if (onSubmit && typeof onSubmit === 'function') {
      onSubmit('url');
    }
    
    try {
      const url = new URL(videoUrl)
      
      // Handle YouTube URLs (including live streams)
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = ''
        
        if (url.hostname.includes('youtube.com')) {
          // Handle both regular videos and live streams
          videoId = url.searchParams.get('v') || url.pathname.split('/').pop()
        } else {
          videoId = url.pathname.slice(1)
        }
        
        if (videoId) {
          setCurrentVideo({
            type: 'youtube',
            id: videoId,
            url: `https://www.youtube.com/embed/${videoId}?autoplay=1`
          })
          return
        }
      }
      
      // Handle other video URLs
      setCurrentVideo({
        type: 'generic',
        url: videoUrl
      })
      
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL",
        variant: "destructive"
      })
    }
  }
  
  const handleTextSubmit = (e) => {
    e.preventDefault()
    
    if (!textContent.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter some text to fact check",
        variant: "destructive"
      })
      return
    }
    
    // Call the onSubmit callback if provided
    if (onSubmit && typeof onSubmit === 'function') {
      onSubmit('text');
    }
    
    // Process the text content for fact checking
    // For now, just set it as a custom content source
    setCurrentVideo({
      type: 'text',
      id: 'text-' + Date.now(),
      content: textContent
    })
  }

  // Apply theme class to the body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    
    return () => {
      document.body.classList.remove("dark-theme");
    };
  }, [theme]);

  // Function to handle content submission for fact checking
  const handleSubmit = async (content) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, use mock data
      setResults(mockResults);
    } catch (err) {
      setError("Failed to process fact check request. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const bgColor = useColorModeValue("white", "gray.800");

  const AppContent = (
    <ChakraProvider theme={theme}>
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl">Sphinx Fact Check</Heading>
          <Text mt={2} color="gray.600">AI-powered content verification for accurate information</Text>
        </Box>
        
        <Box 
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
        >
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>Check Content</Tab>
              <Tab>Results</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <FactCheckInput onSubmit={handleSubmit} isLoading={isLoading} />
              </TabPanel>
              <TabPanel>
                <FactCheckResults 
                  results={results}
                  isLoading={isLoading}
                  error={error}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </ChakraProvider>
  );

  return AppContent;
}

export default App
