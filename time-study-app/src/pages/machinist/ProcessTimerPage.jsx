"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Text,
  Box,
  VStack,
  Spinner,
  Alert,
  Tag,
  useToast,
  AlertIcon,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ProcessTimer } from "../../components/machinist/process-timer";
import { StepTimerList } from "../../components/machinist/step-timer-list";
// import { PageHeader } from "../../components/page-header";
import { Link, useParams, useNavigate } from "react-router-dom";

export default function ProcessTimerPage() {
  const { studyId } = useParams();

  const navigate = useNavigate();
  const toast = useToast();

  const [timeStudy, setTimeStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessRunningState, setIsProcessRunningState] = useState(false); // Overall process state

  // --- Data Fetching ---
  const fetchTimeStudy = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/time_studies/${studyId}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.error || "Failed to load time study"
          }`
        );
      }
      const data = await response.json();
      setTimeStudy(data);
      // Initialize running state based on fetched status
      setIsProcessRunningState(data.status === "in progress");
    } catch (e) {
      console.error("Failed to fetch time study:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    if (studyId) {
      fetchTimeStudy();
    }
  }, [studyId, fetchTimeStudy]);

  // --- API Update Function ---
  const updateStudyOnBackend = async (payload) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/time_studies/${studyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to update study: ${response.status} - ${
            errorData.error || "Update error"
          }`
        );
      }
      const updatedStudyData = await response.json();
      setTimeStudy(updatedStudyData); // Update local state with response from backend
      return updatedStudyData;
    } catch (e) {
      console.error("Error updating time study:", e);
      toast({
        title: "Update Error",
        description: e.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw e; // Re-throw to be caught by calling function if needed
    }
  };

  // --- Event Handlers from ProcessTimer ---
  const handleProcessStart = async () => {
    setIsProcessRunningState(true);
    try {
      await updateStudyOnBackend({
        status: "in progress" /*, started_at: new Date().toISOString() */,
      });
      // ProcessTimer's internal start will be called by its own button
    } catch (e) {
      setIsProcessRunningState(false); // Revert UI state on error
    }
  };

  const handleProcessStop = async (totalTimeInSeconds, notes) => {
    setIsProcessRunningState(false);
    try {
      await updateStudyOnBackend({
        status: "completed",
        actual_total_time: totalTimeInSeconds,
        notes: notes || timeStudy.notes, // Preserve existing notes if new ones aren't provided
        // completed_at: new Date().toISOString()
      });
      toast({
        title: "Time Study Completed",
        description: `Total actual time: ${formatTime(totalTimeInSeconds)}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      // Error already toasted by updateStudyOnBackend
    }
  };

  const handleProcessScrap = async (notes) => {
    setIsProcessRunningState(false);
    try {
      await updateStudyOnBackend({
        status: "scrapped",
        notes: notes, // Scrap reason
        actual_total_time: null, // Or keep current if relevant
      });
      toast({
        title: "Time Study Scrapped",
        description: "The study has been marked as scrapped.",
        status: "error", // Or "warning"
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      // Error already toasted by updateStudyOnBackend
    }
  };

  // Helper to pass to ProcessTimer for formatting time in its toast
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // --- Loading / Error / No Data ---
  if (isLoading)
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  if (error)
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  if (!timeStudy) return <Text>Time study not found.</Text>;

  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="xl">{timeStudy.name}</Heading>
          <Text color="gray.500">
            Admin: {timeStudy.admin?.username || "N/A"} | Status:{" "}
            <Tag
              size="sm"
              colorScheme={
                timeStudy.status === "completed"
                  ? "green"
                  : timeStudy.status === "in progress"
                  ? "blue"
                  : timeStudy.status === "scrapped"
                  ? "red"
                  : "gray"
              }
            >
              {timeStudy.status}
            </Tag>
          </Text>
        </Box>
        <Link to="/machinist">
          {" "}
          {/* Or a more specific back route */}
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Flex>

      <Card>
        <CardHeader>
          <Heading size="md">Overall Process Timer</Heading>
          <Text color="gray.500">Track the total time for this study</Text>
        </CardHeader>
        <CardBody>
          <ProcessTimer
            initialTime={timeStudy.actual_total_time || 0} // Load actual time if study was already in progress/completed
            initialIsRunning={timeStudy.status === "in progress"}
            initialNotes={timeStudy.notes || ""}
            onStart={handleProcessStart} // This will now primarily update backend status
            onStop={handleProcessStop} // This will send final time and notes to backend
            onScrap={handleProcessScrap} // This will send scrap notes to backend
            formatTimeForDisplay={formatTime} // Pass formatter for internal toasts
            studyStatus={timeStudy.status} // Pass current study status
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
            steps={timeStudy.steps || []}
            isProcessRunning={isProcessRunningState} // Use the page-level state
            studyId={timeStudy.id}
            onStepTimeUpdate={fetchTimeStudy} // To refresh data if StepTimerList updates a step
            disabled={
              timeStudy.status === "completed" ||
              timeStudy.status === "scrapped"
            }
          />
        </CardBody>
      </Card>
    </VStack>
  );
}
