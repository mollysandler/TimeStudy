"use client";
import React from "react";
import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  useToast,
  VStack,
  Heading,
} from "@chakra-ui/react";

export function ProcessStepForm({ studyId, onStepAdded }) {
  const [name, setName] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(""); // Store as string for NumberInput
  const [order, setOrder] = useState(""); // You'll need to determine how to set this
  // const [notes, setNotes] = useState(""); // If you keep notes for UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic Validation
    if (!name.trim() || !studyId || !order.trim()) {
      // Added order validation
      toast({
        title: "Validation Error",
        description: "Step Name, Study ID, and Order are required.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Validate that estimated time is a number (if provided)
    if (
      estimatedTime &&
      (isNaN(Number(estimatedTime)) || Number(estimatedTime) < 0)
    ) {
      toast({
        title: "Validation Error",
        description: "Estimated time must be a non-negative number.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }
    // Validate order
    if (isNaN(Number(order)) || Number(order) <= 0) {
      toast({
        title: "Validation Error",
        description: "Order must be a positive number.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    const stepData = {
      name: name.trim(),
      estimated_time: estimatedTime ? parseInt(estimatedTime, 10) : null,
      order: parseInt(order, 10),
      // notes: notes, // Only include if your backend Step model has a 'notes' field
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/time_studies/${studyId}/steps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stepData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "An unknown error occurred while adding the step.",
        }));
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      // const newStep = await response.json(); // Optional: use the returned step data

      toast({
        title: "Step Added",
        description: "The new process step has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form fields
      setName("");
      setEstimatedTime("");
      setOrder("");
      // setNotes("");

      // Call the callback prop to notify the parent component (TimeStudyDetailPage)
      if (onStepAdded) {
        onStepAdded();
      }
    } catch (error) {
      console.error("Failed to add step:", error);
      toast({
        title: "Failed to Add Step",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl
          isRequired
          isInvalid={
            !name.trim() && isSubmitting /* A bit more precise error display */
          }
        >
          <FormLabel>Step Name</FormLabel>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a descriptive name for this step"
          />
          {!name.trim() && isSubmitting && (
            <FormErrorMessage>Step name is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isRequired isInvalid={!order.trim() && isSubmitting}>
          <FormLabel>Order</FormLabel>
          <NumberInput
            min={1}
            value={order}
            onChange={(valueString) => setOrder(valueString)}
            precision={0} // Ensure whole numbers
          >
            <NumberInputField placeholder="e.g., 1, 2, 3" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          {!order.trim() && isSubmitting && (
            <FormErrorMessage>
              Order is required and must be a positive number.
            </FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Estimated Time (minutes)</FormLabel>
          <NumberInput
            min={0} // Allow 0 if a step can have no estimated time
            value={estimatedTime}
            onChange={(valueString) => setEstimatedTime(valueString)} // Keep as string for NumberInput
          >
            <NumberInputField placeholder="Enter estimated time in minutes" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/*
        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional instructions or notes for this step"
          />
        </FormControl>
        */}

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Adding..."
        >
          Add Step
        </Button>
      </VStack>
    </form>
  );
}
