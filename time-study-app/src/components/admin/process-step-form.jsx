"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";

export function ProcessStepForm({ studyId }) {
  const [formData, setFormData] = useState({
    name: "",
    estimatedMinutes: "",
    notes: "",
  });
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.estimatedMinutes) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate that estimated time is a number
    if (
      isNaN(Number(formData.estimatedMinutes)) ||
      Number(formData.estimatedMinutes) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Estimated time must be a positive number.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Submit form - would send to API in real implementation
    console.log("Step added:", {
      ...formData,
      studyId,
      estimatedSeconds: Number(formData.estimatedMinutes) * 60,
    });

    toast({
      title: "Step Added",
      description: "The process step has been added successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      name: "",
      estimatedMinutes: "",
      notes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Step Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter a descriptive name for this step"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Estimated Time (minutes)</FormLabel>
          <Input
            name="estimatedMinutes"
            type="number"
            value={formData.estimatedMinutes}
            onChange={handleChange}
            placeholder="Enter estimated time in minutes"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional instructions or notes for this step"
          />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Add Step
        </Button>
      </VStack>
    </form>
  );
}
