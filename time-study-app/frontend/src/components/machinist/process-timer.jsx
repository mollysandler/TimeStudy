"use client";
import React from "react";
import { useState, useEffect, useRef } from "react"; // Added useRef
import {
  Box,
  Button,
  Card,
  Flex,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
  const [localIsRunning, setLocalIsRunning] = useState(false); // Timer's own running state
  const [time, setTime] = useState(initialTime); // Time in seconds
  const [notes, setNotes] = useState(initialNotes);
  const [showScrapInput, setShowScrapInput] = useState(false);
  const toast = useToast();
  const intervalRef = useRef(null); // Use ref for interval
  const {
    isOpen: isScrapConfirmOpen,
    onOpen: onScrapConfirmOpen,
    onClose: onScrapConfirmClose,
  } = useDisclosure(); // Modal state

  useEffect(() => {
    setTime(initialTime);
    setNotes(initialNotes || ""); // Ensure notes is not null/undefined
    if (studyStatus === "in progress" && initialIsRunning) {
      setLocalIsRunning(true);
    } else {
      setLocalIsRunning(false);
    }
  }, [initialTime, initialIsRunning, initialNotes, studyStatus]);

  useEffect(() => {
    if (localIsRunning) {
      intervalRef.current = setInterval(
        () => setTime((prev) => prev + 1),
        1000
      );
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [localIsRunning]);

  const handleUIApplicationStart = () => {
    if (studyStatus === "completed" || studyStatus === "scrapped") {
      toast({
        title: "Study is already completed or scrapped.",
        status: "warning",
      });
      return;
    }
    setLocalIsRunning(true);
    if (onStart) onStart();
  };

  const handleUIApplicationStop = () => {
    setLocalIsRunning(false);
    if (onStop) onStop(time, notes);
  };

  const handleUIApplicationReset = () => {
    if (studyStatus === "completed" || studyStatus === "scrapped") {
      toast({
        title: "Cannot reset a completed or scrapped study's timer.",
        status: "warning",
      });
      return;
    }
    if (
      window.confirm(
        "Are you sure you want to reset this timer? The current time will be lost from view and not saved."
      )
    ) {
      setTime(0);
      // Do not change localIsRunning or call onStop from here for reset.
      // Reset is a UI-only action for the timer value itself.
      toast({
        title: "Timer UI Reset",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleInitiateScrap = () => {
    if (studyStatus === "completed" || studyStatus === "scrapped") {
      toast({ title: `Study is already ${studyStatus}.`, status: "info" });
      return;
    }
    setShowScrapInput(true); // Show the notes input
  };

  const handleConfirmScrapWithModal = () => {
    if (!notes.trim()) {
      toast({
        title: "Please provide a reason for scrapping.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onScrapConfirmOpen(); // Open confirmation modal
  };

  const executeScrap = () => {
    setLocalIsRunning(false);
    if (onScrap) onScrap(notes);
    setShowScrapInput(false);
    onScrapConfirmClose(); // Close modal
  };

  const handleCancelScrapInput = () => {
    setShowScrapInput(false);
    // Optionally reset notes to initialNotes if they were being edited for scrap
    // setNotes(initialNotes || "");
  };

  const isStudyEffectivelyDisabled =
    studyStatus === "completed" || studyStatus === "scrapped";

  return (
    <VStack spacing={4} align="stretch">
      <Flex
        alignItems="center"
        justifyContent="center"
        p={6}
        border="1px"
        borderColor={isStudyEffectivelyDisabled ? "gray.300" : "gray.200"}
        borderRadius="lg"
        bg={isStudyEffectivelyDisabled ? "gray.100" : "gray.50"}
        opacity={isStudyEffectivelyDisabled ? 0.7 : 1}
      >
        <Text
          fontSize="5xl"
          fontFamily="mono"
          fontWeight="bold"
          color={isStudyEffectivelyDisabled ? "gray.500" : "inherit"}
        >
          {formatTimeForDisplay ? formatTimeForDisplay(time) : `${time}s`}
        </Text>
      </Flex>
      <Flex wrap="wrap" gap={2}>
        {!localIsRunning ? (
          <Button
            onClick={handleUIApplicationStart}
            flex="1"
            leftIcon={<TimeIcon />}
            size="lg"
            colorScheme="blue"
            isDisabled={isStudyEffectivelyDisabled}
          >
            Start Timer
          </Button>
        ) : (
          <Button
            onClick={handleUIApplicationStop}
            flex="1"
            leftIcon={<CheckIcon />}
            size="lg"
            colorScheme="green"
            isDisabled={isStudyEffectivelyDisabled}
          >
            Stop & Save
          </Button>
        )}

        <Button
          onClick={handleUIApplicationReset}
          variant="outline"
          leftIcon={<RepeatIcon />}
          size="lg"
          isDisabled={localIsRunning || isStudyEffectivelyDisabled}
        >
          Reset Timer
        </Button>

        <Button
          onClick={handleInitiateScrap}
          colorScheme="red"
          leftIcon={<CloseIcon />}
          size="lg"
          isDisabled={isStudyEffectivelyDisabled}
        >
          {showScrapInput ? "Confirm Scrap" : "Scrap Study"}
        </Button>
      </Flex>
      {showScrapInput && (
        <Card p={4} borderColor="red.500" borderWidth="1px" mt={4}>
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
              onClick={handleConfirmScrapWithModal}
              colorScheme="red"
              isDisabled={!notes.trim()}
            >
              Confirm Scrap
            </Button>
            <Button onClick={handleCancelScrapInput} variant="outline">
              Cancel
            </Button>
          </Flex>
        </Card>
      )}
      {/* General Notes section - always visible if not scrapping */}
      {!showScrapInput && (
        <Box mt={4}>
          <Text fontWeight="medium" mb={2}>
            Overall Study Notes:
          </Text>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any general notes about this time study..."
            isDisabled={isStudyEffectivelyDisabled || localIsRunning}
          />
        </Box>
      )}

      {/* Scrap Confirmation Modal */}
      <Modal
        isOpen={isScrapConfirmOpen}
        onClose={onScrapConfirmClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Scrap</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to scrap this time study? This action cannot
            be undone.
            <Text mt={2} fontSize="sm" color="gray.600">
              Reason: {notes}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onScrapConfirmClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={executeScrap}>
              Yes, Scrap Study
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
