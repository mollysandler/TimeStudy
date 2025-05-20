"use client";

import { useState, useEffect } from "react";
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
import { TimeIcon, CloseIcon, RepeatIcon } from "@chakra-ui/icons";

export function ProcessTimer({ onStart, onStop, onScrap }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [showScrapNotes, setShowScrapNotes] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

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

  const handleStart = () => {
    setIsRunning(true);
    onStart();
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop();
    toast({
      title: "Process timer stopped",
      description: `Total time: ${formatTime(time)}`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setNotes("");
    onStop();
  };

  const handleScrap = () => {
    if (showScrapNotes && notes.trim()) {
      setIsRunning(false);
      onScrap();
      toast({
        title: "Process scrapped",
        description: "The time study has been marked as scrapped.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setTime(0);
      setNotes("");
      setShowScrapNotes(false);
    } else {
      setShowScrapNotes(true);
    }
  };

  const handleCancelScrap = () => {
    setShowScrapNotes(false);
  };

  return (
    <VStack spacing={4} align="stretch">
      <Flex
        alignItems="center"
        justifyContent="center"
        p={6}
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        bg="gray.50"
      >
        <Text fontSize="5xl" fontFamily="mono" fontWeight="bold">
          {formatTime(time)}
        </Text>
      </Flex>

      <Flex wrap="wrap" gap={2}>
        {!isRunning ? (
          <Button
            onClick={handleStart}
            flex="1"
            leftIcon={<TimeIcon />}
            size="lg"
            colorScheme="blue"
          >
            Start Timer
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            flex="1"
            leftIcon={<TimeIcon />}
            size="lg"
            colorScheme="gray"
          >
            Stop Timer
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          leftIcon={<RepeatIcon />}
          size="lg"
        >
          Reset
        </Button>

        <Button
          onClick={handleScrap}
          colorScheme="red"
          leftIcon={<CloseIcon />}
          size="lg"
        >
          Scrap
        </Button>
      </Flex>

      {showScrapNotes && (
        <Card p={4} borderColor="red.500">
          <Text fontWeight="medium" mb={2}>
            Please provide a reason for scrapping:
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter reason for scrapping this time study..."
            mb={4}
          />
          <Flex gap={2}>
            <Button
              onClick={handleScrap}
              colorScheme="red"
              isDisabled={!notes.trim()}
            >
              Confirm Scrap
            </Button>
            <Button onClick={handleCancelScrap} variant="outline">
              Cancel
            </Button>
          </Flex>
        </Card>
      )}

      {!showScrapNotes && (
        <Box>
          <Text fontWeight="medium" mb={2}>
            Notes:
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this process..."
          />
        </Box>
      )}
    </VStack>
  );
}
