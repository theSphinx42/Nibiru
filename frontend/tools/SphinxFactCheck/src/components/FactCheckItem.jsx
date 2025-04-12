import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Badge,
  Text,
  Box,
  Avatar,
  Icon,
  Tooltip,
  Progress
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  WarningIcon,
  QuestionIcon,
  TimeIcon,
  CloseIcon,
  InfoIcon
} from "@chakra-ui/icons";
import { getCredibilityColor, getCredibilityBgColor, truncateText, formatDate } from "../lib/utils";

function getStatusIcon(status) {
  switch (status.toLowerCase()) {
    case "verified":
      return <CheckCircleIcon color="green.500" />;
    case "misleading":
      return <WarningIcon color="yellow.500" />;
    case "false":
      return <CloseIcon color="red.500" />;
    case "uncertain":
      return <QuestionIcon color="purple.500" />;
    case "checking":
      return <TimeIcon color="blue.500" />;
    default:
      return <InfoIcon color="gray.500" />;
  }
}

const FactCheckItem = ({
  statement,
  analysis,
  status,
  score,
  source,
  timestamp,
  className
}) => {
  return (
    <Card 
      width="full" 
      variant="outline" 
      mb={4} 
      borderRadius="md" 
      overflow="hidden"
      boxShadow="sm"
      className={className}
    >
      <CardHeader pb={2} bg={getCredibilityBgColor(score)}>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Flex alignItems="center" gap={2}>
            <Icon as={() => getStatusIcon(status)} boxSize={5} />
            <Badge colorScheme={
              status.toLowerCase() === "verified" ? "green" :
              status.toLowerCase() === "misleading" ? "yellow" :
              status.toLowerCase() === "false" ? "red" :
              status.toLowerCase() === "uncertain" ? "purple" :
              "blue"
            }>
              {status}
            </Badge>
          </Flex>
          <Tooltip label={`Credibility Score: ${score}/100`}>
            <Box textAlign="right">
              <Text fontWeight="bold" className={getCredibilityColor(score)}>
                {score}/100
              </Text>
              <Progress 
                value={score} 
                max={100} 
                size="xs" 
                width="60px" 
                colorScheme={
                  score >= 80 ? "green" :
                  score >= 60 ? "blue" :
                  score >= 40 ? "yellow" :
                  score >= 20 ? "orange" : "red"
                }
              />
            </Box>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody pt={3}>
        <Text fontWeight="medium" fontSize="md" mb={2}>
          {truncateText(statement, 150)}
        </Text>
        
        <Text fontSize="sm" color="gray.600" mb={3}>
          {analysis}
        </Text>
        
        <Flex justifyContent="space-between" alignItems="center" fontSize="xs" color="gray.500">
          {source && (
            <Flex alignItems="center" gap={1}>
              <Avatar size="xs" name={source} />
              <Text>{source}</Text>
            </Flex>
          )}
          
          {!source && <Box />}
          
          {timestamp && (
            <Text>{formatDate(timestamp)}</Text>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default FactCheckItem; 