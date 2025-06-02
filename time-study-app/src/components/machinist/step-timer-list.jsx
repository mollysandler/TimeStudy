// frontend/src/components/machinist/step-timer-list.js (Conceptual)
"use client";
import { VStack, Text, Box, Button, HStack, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { TimeIcon, CheckIcon } from "@chakra-ui/icons"; // For individual step timers

// Individual Step Timer Component (could be a sub-component)
function StepTimerItem({
  step,
  studyId,
  isOverallProcessRunning,
  onStepTimeUpdate,
  disabled,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(step.actual_time || 0); // Load existing actual time
  const toast = useToast();

  useEffect(() => {
    setTime(step.actual_time || 0); // Sync with prop changes
  }, [step.actual_time]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    /* ... same formatTime function ... */
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const handleStartStep = () => {
    if (!isOverallProcessRunning) {
      toast({
        title: "Overall process timer is not running.",
        description: "Please start the main process timer first.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setIsRunning(true);
  };

  const handleStopStep = async () => {
    setIsRunning(false);
    // API call to save this step's time
    try {
      const response = await fetch(
        `http://localhost:8080/api/steps/${step.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actual_time: time /*, notes: stepNotes (if you add them) */,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to save step time.");
      toast({
        title: `Step "${step.name}" time saved.`,
        description: `Time: ${formatTime(time)}`,
        status: "success",
        duration: 3000,
      });
      if (onStepTimeUpdate) onStepTimeUpdate(); // Notify parent to refetch all study data
    } catch (error) {
      toast({
        title: "Error saving step time",
        description: error.message,
        status: "error",
        duration: 4000,
      });
    }
  };

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      shadow="sm"
      opacity={disabled ? 0.6 : 1}
    >
      <HStack justifyContent="space-between">
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium">
            Step {step.order}: {step.name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Est: {step.estimated_time || "N/A"} mins | Actual:{" "}
            {formatTime(time)}
          </Text>
        </VStack>
        <HStack>
          {!isRunning ? (
            <Button
              size="sm"
              leftIcon={<TimeIcon />}
              onClick={handleStartStep}
              isDisabled={
                !isOverallProcessRunning ||
                disabled ||
                step.actual_time > 0 /* Prevent re-timing if already timed */
              }
            >
              Start Step
            </Button>
          ) : (
            <Button
              size="sm"
              leftIcon={<CheckIcon />}
              colorScheme="green"
              onClick={handleStopStep}
              isDisabled={disabled}
            >
              Stop Step
            </Button>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}

export function StepTimerList({
  steps,
  isProcessRunning,
  studyId,
  onStepTimeUpdate,
  disabled,
}) {
  if (!steps || steps.length === 0) {
    return <Text color="gray.500">No steps defined for this study.</Text>;
  }

  // Sort steps by order if not already sorted by backend
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <VStack spacing={3} align="stretch">
      {sortedSteps.map((step) => (
        <StepTimerItem
          key={step.id}
          step={step}
          studyId={studyId}
          isOverallProcessRunning={isProcessRunning}
          onStepTimeUpdate={onStepTimeUpdate}
          disabled={disabled}
        />
      ))}
    </VStack>
  );
}
