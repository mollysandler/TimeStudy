"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import {
  Box,
  Button,
  Card,
  Flex,
  Textarea,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { TimeIcon, CloseIcon, RepeatIcon, CheckIcon } from "@chakra-ui/icons"; // Added CheckIcon

export function ProcessTimer({
  initialTime = 0,
  initialIsRunning = false,
  initialNotes = "",
  onStart, // Parent's handler to update backend status to 'in progress'
  onStop, // Parent's handler to update backend with final time and 'completed' status
  onScrap, // Parent's handler to update backend with 'scrapped' status and notes
  formatTimeForDisplay, // Function to format time (HH:MM:SS)
  studyStatus, // Current status of the whole time study
}) {
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [time, setTime] = useState(initialTime); // Time in seconds
  const [notes, setNotes] = useState(initialNotes);
  const [showScrapNotes, setShowScrapNotes] = useState(false);
  const toast = useToast();
  const intervalRef = useRef(null); // Use ref for interval

  // Synchronize with props
  useEffect(() => {
    setIsRunning(initialIsRunning);
  }, [initialIsRunning]);

  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleActualStart = () => {
    if (studyStatus === "completed" || studyStatus === "scrapped") {
      toast({
        title: "Cannot start a completed or scrapped study.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsRunning(true); // UI update
    if (onStart) onStart(); // Notify parent to update backend status
  };

  const handleActualStop = () => {
    setIsRunning(false); // UI update
    if (onStop) onStop(time, notes); // Notify parent with final time and current notes
    // Parent will show its own "completed" toast after backend update
  };

  const handleActualReset = () => {
    // Resetting a running study might need confirmation or specific backend logic
    // For now, it just resets local UI state. Parent is not notified of a "reset" directly.
    // If a reset should clear backend `actual_total_time`, that's a separate action.
    if (
      window.confirm(
        "Are you sure you want to reset the timer? This will not save the current time."
      )
    ) {
      setTime(0);
      // setNotes(""); // Optionally reset notes too
      setIsRunning(false); // Stop the timer if it was running
      // If onStop was meant to clear backend time on reset, you might call it:
      // if (onStop) onStop(0, notes); // but this would mark it as 'completed' with 0 time
      toast({
        title: "Timer Reset",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleActualScrap = () => {
    if (studyStatus === "completed") {
      toast({
        title: "Cannot scrap a completed study.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (showScrapNotes) {
      // This is the "Confirm Scrap" click
      if (!notes.trim()) {
        toast({
          title: "Please provide a reason for scrapping.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setIsRunning(false); // UI update
      if (onScrap) onScrap(notes); // Notify parent with scrap notes
      // Parent will show its own "scrapped" toast
      // Resetting time here might be redundant if parent re-fetches and updates initialTime
      // setTime(0);
      setShowScrapNotes(false);
    } else {
      setShowScrapNotes(true); // Show the notes input
    }
  };

  const handleCancelScrap = () => {
    setShowScrapNotes(false);
  };

  const isDisabled = studyStatus === "completed" || studyStatus === "scrapped";

  return (
    <VStack spacing={4} align="stretch">
      <Flex
        alignItems="center"
        justifyContent="center"
        p={6}
        border="1px"
        borderColor={isDisabled ? "gray.300" : "gray.200"}
        borderRadius="lg"
        bg={isDisabled ? "gray.100" : "gray.50"}
        opacity={isDisabled ? 0.7 : 1}
      >
        <Text
          fontSize="5xl"
          fontFamily="mono"
          fontWeight="bold"
          color={isDisabled ? "gray.500" : "inherit"}
        >
          {formatTimeForDisplay ? formatTimeForDisplay(time) : `${time}s`}
        </Text>
      </Flex>

      <Flex wrap="wrap" gap={2}>
        {!isRunning ? (
          <Button
            onClick={handleActualStart}
            flex="1"
            leftIcon={<TimeIcon />}
            size="lg"
            colorScheme="blue"
            isDisabled={isDisabled}
          >
            Start Timer
          </Button>
        ) : (
          <Button
            onClick={handleActualStop}
            flex="1"
            leftIcon={<CheckIcon />} // Changed from TimeIcon for "Stop"
            size="lg"
            colorScheme="green" // Or "blue"
            isDisabled={isDisabled}
          >
            Stop & Save
          </Button>
        )}

        <Button
          onClick={handleActualReset}
          variant="outline"
          leftIcon={<RepeatIcon />}
          size="lg"
          isDisabled={isRunning || isDisabled} // Disable reset if running or study completed/scrapped
        >
          Reset Timer
        </Button>

        <Button
          onClick={handleActualScrap}
          colorScheme="red"
          leftIcon={<CloseIcon />}
          size="lg"
          isDisabled={studyStatus === "completed"} // Can scrap if 'in progress' or 'not started'
        >
          {showScrapNotes ? "Confirm Scrap" : "Scrap Study"}
        </Button>
      </Flex>

      {showScrapNotes && (
        <Card p={4} borderColor="red.500" borderWidth="1px">
          <Text fontWeight="medium" mb={2}>
            Please provide a reason for scrapping:
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter reason for scrapping this time study..."
            mb={4}
            isDisabled={isDisabled}
          />
          <Flex gap={2}>
            <Button
              onClick={handleActualScrap} // This is the "Confirm Scrap" button inside the scrap card
              colorScheme="red"
              isDisabled={!notes.trim() || isDisabled}
            >
              Confirm Scrap
            </Button>
            <Button
              onClick={handleCancelScrap}
              variant="outline"
              isDisabled={isDisabled}
            >
              Cancel
            </Button>
          </Flex>
        </Card>
      )}

      {/* General Notes section - always visible if not scrapping */}
      {!showScrapNotes && (
        <Box mt={showScrapNotes ? 0 : 4}>
          {" "}
          {/* Adjust margin if scrap notes were shown */}
          <Text fontWeight="medium" mb={2}>
            Overall Study Notes:
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any general notes about this time study..."
            isDisabled={isDisabled || isRunning} // Disable notes when timer is running or study is done
          />
        </Box>
      )}
    </VStack>
  );
}
