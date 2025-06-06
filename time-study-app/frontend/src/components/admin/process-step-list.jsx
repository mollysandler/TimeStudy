import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export function ProcessStepList({ steps, studyId, onStepDeleted }) {
  const toast = useToast();

  // For delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [stepToDelete, setStepToDelete] = useState(null);
  const cancelRef = useRef();

  const handleDeleteClick = (step) => {
    setStepToDelete(step);
    onOpen();
  };

  const confirmDeleteStep = async () => {
    if (!stepToDelete) return;

    try {
      // Using the /api/steps/:step_id endpoint

      const response = await fetch(`/api/steps/${stepToDelete.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.error || `Failed to delete step: ${response.status}`
        );
      }

      toast({
        title: "Step Deleted",
        description: `Step "${stepToDelete.name}" was successfully deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Notify the parent component (TimeStudyDetailPage) to refresh its data
      if (onStepDeleted) {
        onStepDeleted();
      }
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setStepToDelete(null);
    }
  };

  const sortedSteps = steps ? [...steps].sort((a, b) => a.order - b.order) : [];

  return (
    <>
      <VStack spacing={2} align="stretch">
        {sortedSteps.map((step) => (
          <Flex // Outer Flex for each step item
            key={step.id}
            alignItems="center"
            justifyContent="space-between"
            p={4}
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
          >
            {/* Flex container for step number, name, and estimated time */}
            <Flex alignItems="center" gap={4}>
              <Flex // For the step number circle
                alignItems="center"
                justifyContent="center"
                w={8}
                h={8}
                fontSize="sm"
                fontWeight="medium"
                borderRadius="full"
                bg="blue.50"
              >
                {step.order}
              </Flex>
              <Box>
                {" "}
                <Text fontWeight="medium">{step.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Estimated time:{" "}
                  {typeof step.estimated_time === "number" &&
                  !isNaN(step.estimated_time)
                    ? `${step.estimated_time} ${
                        step.estimated_time === 1 ? "minute" : "minutes"
                      }`
                    : "N/A"}
                </Text>
              </Box>
            </Flex>{" "}
            <Flex gap={1}>
              <IconButton
                variant="ghost"
                aria-label="Delete step"
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                onClick={() => handleDeleteClick(step)}
              />
            </Flex>{" "}
          </Flex>
        ))}

        {sortedSteps.length === 0 && (
          <Text p={4} textAlign="center" color="gray.500">
            No steps added yet. Use the form below to add steps to this process.
          </Text>
        )}
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Process Step
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the step "
              <strong>{stepToDelete?.name}</strong>"? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteStep} ml={3}>
                Delete Step
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
