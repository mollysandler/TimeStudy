"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ProcessTimer } from "../../components/machinist/process-timer";
import { StepTimerList } from "../../components/machinist/step-timer-list";
import { PageHeader } from "../../components/page-header";
import { Link, useParams } from "react-router-dom";

export default function ProcessTimerPage() {
  const { processId } = useParams();
  const [isProcessRunning, setIsProcessRunning] = useState(false);

  // Mock data - would come from API in real implementation
  const process = {
    id: processId,
    name: "Milling Operation XYZ",
    description: "Complete milling operation for part #12345",
    steps: [
      { id: "1", name: "Setup machine", estimatedTime: 300 },
      { id: "2", name: "Load material", estimatedTime: 120 },
      { id: "3", name: "Run first pass", estimatedTime: 600 },
      { id: "4", name: "Inspect", estimatedTime: 180 },
      { id: "5", name: "Run second pass", estimatedTime: 450 },
      { id: "6", name: "Final inspection", estimatedTime: 240 },
    ],
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <PageHeader title={process.name} description={process.description} />
        <Link to="/machinist">
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Flex>

      <Card>
        <CardHeader>
          <Heading size="md">Process Timer</Heading>
          <Text color="gray.500">Track the total time for this process</Text>
        </CardHeader>
        <CardBody>
          <ProcessTimer
            onStart={() => setIsProcessRunning(true)}
            onStop={() => setIsProcessRunning(false)}
            onScrap={() => setIsProcessRunning(false)}
          />
        </CardBody>
      </Card>

      <Divider my={6} />

      <Card>
        <CardHeader>
          <Heading size="md">Process Steps</Heading>
          <Text color="gray.500">
            Track time for individual steps in the process
          </Text>
        </CardHeader>
        <CardBody>
          <StepTimerList
            steps={process.steps}
            isProcessRunning={isProcessRunning}
          />
        </CardBody>
      </Card>
    </VStack>
  );
}
