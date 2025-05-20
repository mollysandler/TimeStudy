"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Textarea,
  Text,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, TimeIcon } from "@chakra-ui/icons";

export function StepTimer({ step, isProcessRunning }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let interval = null;

    if (isRunning && isProcessRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isProcessRunning]);

  // If the main process stops, pause all step timers
  useEffect(() => {
    if (!isProcessRunning && isRunning) {
      setIsRunning(false);
    }
  }, [isProcessRunning, isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatEstimatedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleStart = () => {
    if (!isProcessRunning) {
      toast({
        title: "Main process not running",
        description: "Please start the main process timer first.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    toast({
      title: "Step completed",
      description: `${step.name} completed in ${formatTime(time)}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleScrap = () => {
    setShowNotes(true);
  };

  const handleScrapConfirm = () => {
    if (notes.trim()) {
      setIsRunning(false);
      setTime(0);
      setNotes("");
      setShowNotes(false);
      toast({
        title: "Step scrapped",
        description: "This step has been reset.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelScrap = () => {
    setShowNotes(false);
  };

  return (
    <Card mb={4} borderColor={isCompleted ? "green.500" : "gray.200"}>
      <CardBody p={4}>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          alignItems={{ md: "center" }}
          justifyContent={{ md: "space-between" }}
        >
          <Box>
            <Text fontWeight="medium">{step.name}</Text>
            <Text fontSize="sm" color="gray.500">
              Estimated: {formatEstimatedTime(step.estimatedTime)}
            </Text>
          </Box>

          <Flex alignItems="center" gap={4}>
            <Text fontSize="xl" fontFamily="mono" fontWeight="semibold">
              {formatTime(time)}
            </Text>

            <Flex gap={2}>
              {!isCompleted && !isRunning && (
                <Button
                  onClick={handleStart}
                  size="sm"
                  variant="outline"
                  leftIcon={<TimeIcon />}
                  isDisabled={!isProcessRunning}
                >
                  Start
                </Button>
              )}

              {!isCompleted && isRunning && (
                <Button
                  onClick={handleStop}
                  size="sm"
                  variant="outline"
                  leftIcon={<TimeIcon />}
                >
                  Pause
                </Button>
              )}

              {!isCompleted && (
                <Button
                  onClick={handleComplete}
                  size="sm"
                  variant="outline"
                  leftIcon={<CheckIcon />}
                  isDisabled={time === 0}
                >
                  Complete
                </Button>
              )}

              {!isCompleted && (
                <Button
                  onClick={handleScrap}
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<CloseIcon />}
                  isDisabled={time === 0}
                >
                  Scrap
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>

        {showNotes && (
          <Box mt={4}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter reason for scrapping this step..."
              mb={2}
            />
            <Flex gap={2}>
              <Button
                onClick={handleScrapConfirm}
                colorScheme="red"
                size="sm"
                isDisabled={!notes.trim()}
              >
                Confirm Scrap
              </Button>
              <Button onClick={handleCancelScrap} variant="outline" size="sm">
                Cancel
              </Button>
            </Flex>
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
