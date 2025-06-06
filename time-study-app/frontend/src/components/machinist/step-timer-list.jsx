"use client";
import React from "react";
import {
  VStack,
  Text,
  Box,
  Button,
  HStack,
  useToast,
  IconButton,
  Tag,
} from "@chakra-ui/react";

import { useState, useEffect, useRef } from "react";
import {
  TimeIcon,
  CheckIcon,
  RepeatIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";

// Individual Step Timer Component
function StepTimerItem({
  step,
  // studyId, // Not directly needed here if all API calls use step.id
  isOverallProcessActive, // Is the main timer running?
  onStepTimeUpdate, // Callback to tell parent (ProcessTimerPage) to refetch all data
  isStudyDisabled, // Is the overall study completed/scrapped?
}) {
  // localStepIsRunning: is THIS step's timer UI currently ticking?
  const [localStepIsRunning, setLocalStepIsRunning] = useState(false);
  // stepTime: the accumulated time for THIS step IN THE CURRENT TIMING SESSION
  const [stepTime, setStepTime] = useState(0);
  // Indicates if this step has a saved actual_time from a previous session
  const [isStepCompleted, setIsStepCompleted] = useState(
    !!step.actual_time && step.actual_time > 0
  );

  const toast = useToast();
  const intervalRef = useRef(null);

  // Effect to initialize/reset step time and completion status based on prop from parent
  useEffect(() => {
    setStepTime(step.actual_time || 0); // Display previously saved time if any
    setIsStepCompleted(!!step.actual_time && step.actual_time > 0);
    // If overall process stops or step is already completed, ensure local step timer is stopped
    if ((!isOverallProcessActive && localStepIsRunning) || isStepCompleted) {
      setLocalStepIsRunning(false);
    }
  }, [
    step.actual_time,
    isOverallProcessActive,
    isStepCompleted,
    localStepIsRunning,
  ]); // Added localStepIsRunning

  // Effect for this step's interval timer
  useEffect(() => {
    if (
      localStepIsRunning &&
      isOverallProcessActive &&
      !isStudyDisabled &&
      !isStepCompleted
    ) {
      intervalRef.current = setInterval(() => {
        setStepTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [
    localStepIsRunning,
    isOverallProcessActive,
    isStudyDisabled,
    isStepCompleted,
  ]);

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

  const handleStartThisStep = () => {
    if (isStudyDisabled) {
      toast({
        title: "Study is finished and cannot be timed.",
        status: "info",
      });
      return;
    }
    if (!isOverallProcessActive) {
      toast({
        title: "Overall process is not running.",
        description: "Start the main timer first.",
        status: "warning",
      });
      return;
    }
    if (isStepCompleted) {
      if (
        !window.confirm(
          "This step is already marked as completed with a saved time. Do you want to re-time it? The previous time will be overwritten when you stop this new timing."
        )
      ) {
        return;
      }
      // Resetting for re-timing
      setStepTime(0); // Reset visual timer for this new session
      setIsStepCompleted(false); // Allow timing again
    }
    setLocalStepIsRunning(true);
  };

  const handleStopThisStep = async () => {
    setLocalStepIsRunning(false); // Stop the UI timer for this step
    // Now, save the 'stepTime' (which is the duration of the current timing session for this step)
    try {
      const payload = { actual_time: stepTime };
      // Add step-specific notes to payload if you implement that feature
      // if (stepNotes) payload.notes = stepNotes;

      const response = await fetch(
        `http://localhost:8080/api/steps/${step.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save step time: ${response.status} - ${
            errorData.error || "Server error"
          }`
        );
      }

      toast({
        title: `Step "${step.name}" time saved.`,
        description: `Actual Time: ${formatTime(stepTime)}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsStepCompleted(true); // Mark as completed after successful save
      if (onStepTimeUpdate) {
        onStepTimeUpdate(); // Crucial: Tell parent (ProcessTimerPage) to re-fetch all study data
      }
    } catch (error) {
      toast({
        title: "Error Saving Step Time",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Potentially revert UI state or allow retry if save fails
      // setLocalStepIsRunning(true); // Example: allow user to try stopping again
    }
  };

  // Placeholder for a reset button for an individual step's *current timing session*
  const handleResetThisStepTiming = () => {
    if (localStepIsRunning) {
      toast({
        title: "Please stop the step timer before resetting.",
        status: "warning",
      });
      return;
    }
    if (
      window.confirm(
        "Reset current timing for this step? This will not affect previously saved time unless you start and stop again."
      )
    ) {
      setStepTime(0); // Reset the visual timer for the current session
      setIsStepCompleted(!!step.actual_time && step.actual_time > 0); // Revert to original completed status
    }
  };

  const formattedEstTime =
    step.estimated_time !== null ? `${step.estimated_time} mins` : "N/A";
  // Display the time from the current timing session (stepTime) or the prop if not timing
  const displayTime =
    localStepIsRunning || !isStepCompleted ? stepTime : step.actual_time;

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      shadow="sm"
      bg={isStepCompleted ? "green.50" : "white"}
      opacity={isStudyDisabled ? 0.6 : 1}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <VStack align="start" spacing={0} flex="1">
          <Text fontWeight="medium" isTruncated maxWidth="300px">
            {" "}
            {/* Added text truncation */}
            Step {step.order}: {step.name}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Est: {formattedEstTime}
          </Text>
          <Text
            fontSize="sm"
            color={isStepCompleted ? "green.600" : "blue.600"}
            fontWeight="bold"
          >
            Actual: {formatTime(displayTime)}{" "}
            {isStepCompleted && !localStepIsRunning ? "(Saved)" : ""}
          </Text>
        </VStack>
        <VStack spacing={1}>
          {!localStepIsRunning && !isStepCompleted && (
            <Button
              size="xs"
              leftIcon={<TimeIcon />}
              onClick={handleStartThisStep}
              isDisabled={!isOverallProcessActive || isStudyDisabled}
              width="100px"
            >
              Start
            </Button>
          )}
          {localStepIsRunning && (
            <Button
              size="xs"
              leftIcon={<CheckIcon />}
              colorScheme="green"
              onClick={handleStopThisStep}
              isDisabled={isStudyDisabled}
              width="100px"
            >
              Stop & Save
            </Button>
          )}
          {isStepCompleted &&
            !localStepIsRunning && ( // Show "Re-Time" if completed and not currently running
              <Button
                size="xs"
                leftIcon={<RepeatIcon />}
                onClick={handleStartThisStep} // Re-uses handleStartThisStep which has re-timing logic
                isDisabled={!isOverallProcessActive || isStudyDisabled}
                variant="outline"
                width="100px"
              >
                Re-Time
              </Button>
            )}
          {/* Optional: Reset button for current timing session of a step */}
          {/* <IconButton icon={<RepeatIcon />} size="xs" variant="ghost" onClick={handleResetThisStepTiming} isDisabled={isStudyDisabled || localStepIsRunning || isStepCompleted}/> */}
        </VStack>
      </HStack>
    </Box>
  );
}

// StepTimerList component itself (props changed slightly)
export function StepTimerList({
  steps,
  isOverallProcessActive, // Renamed from isProcessRunning for clarity
  studyId,
  onStepDataChange, // Renamed from onStepTimeUpdate for clarity
  overallStudyStatus, // Pass this down to disable StepTimerItem
}) {
  if (!steps || steps.length === 0) {
    return <Text color="gray.500">No steps defined for this study.</Text>;
  }

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <VStack spacing={3} align="stretch">
      {sortedSteps.map((step) => (
        <StepTimerItem
          key={step.id}
          step={step}
          // studyId={studyId} // Not strictly needed by StepTimerItem if step.id is used for API
          isOverallProcessActive={isOverallProcessActive}
          onStepTimeUpdate={onStepDataChange} // Pass the callback
          isStudyDisabled={
            overallStudyStatus === "completed" ||
            overallStudyStatus === "scrapped"
          }
        />
      ))}
    </VStack>
  );
}
