import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  useColorModeValue,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, LinkIcon, AttachmentIcon } from '@chakra-ui/icons';
import { FaNewspaper } from 'react-icons/fa';

const FactCheckInput = ({ onSubmit, isLoading }) => {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      type: inputType,
      topic
    };
    
    if (inputType === 'text') {
      data.content = content;
    } else if (inputType === 'url') {
      data.url = url;
    } else if (inputType === 'file') {
      data.file = file;
    }
    
    onSubmit(data);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  return (
    <Box 
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
      boxShadow="sm"
    >
      <Heading as="h2" size="lg" mb={4}>Submit Content for Fact-Checking</Heading>

      <FormControl mb={5}>
        <FormLabel fontWeight="medium">Choose Input Type</FormLabel>
        <RadioGroup value={inputType} onChange={setInputType}>
          <HStack spacing={5} wrap="wrap">
            <Radio value="text" colorScheme="brand">
              <Flex align="center">
                <Icon as={FaNewspaper} mr={2} />
                Text
              </Flex>
            </Radio>
            <Radio value="url" colorScheme="brand">
              <Flex align="center">
                <LinkIcon mr={2} />
                URL
              </Flex>
            </Radio>
            <Radio value="file" colorScheme="brand">
              <Flex align="center">
                <AttachmentIcon mr={2} />
                File Upload
              </Flex>
            </Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
      
      <Divider mb={5} />
      
      {inputType === 'text' && (
        <FormControl isRequired mb={5}>
          <FormLabel>Content to Analyze</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the text you want to fact-check here..."
            size="lg"
            minHeight="200px"
            resize="vertical"
          />
          <FormHelperText>
            Enter the full text of the article, statement, or content you want to analyze
          </FormHelperText>
        </FormControl>
      )}
      
      {inputType === 'url' && (
        <FormControl isRequired mb={5}>
          <FormLabel>URL to Analyze</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <LinkIcon color="gray.500" />
            </InputLeftElement>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </InputGroup>
          <FormHelperText>
            Enter the full URL of the webpage or article you want to analyze
          </FormHelperText>
        </FormControl>
      )}
      
      {inputType === 'file' && (
        <FormControl isRequired mb={5}>
          <FormLabel>Upload File</FormLabel>
          <Input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileChange}
            py={1}
          />
          <FormHelperText>
            Upload a document (PDF, Word, or text file) containing the content to analyze
          </FormHelperText>
        </FormControl>
      )}
      
      <FormControl mb={5}>
        <FormLabel>Topic (Optional)</FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Politics, Health, Science"
          />
        </InputGroup>
        <FormHelperText>
          Specifying a topic helps improve accuracy of the fact check
        </FormHelperText>
      </FormControl>
      
      <Flex justify="flex-end">
        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          isLoading={isLoading}
          loadingText="Analyzing"
          isDisabled={
            isLoading || 
            (inputType === 'text' && !content) ||
            (inputType === 'url' && !url) ||
            (inputType === 'file' && !file)
          }
        >
          Start Fact Check
        </Button>
      </Flex>
    </Box>
  );
};

export default FactCheckInput; 