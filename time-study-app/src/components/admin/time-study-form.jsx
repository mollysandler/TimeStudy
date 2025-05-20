"use client";

import { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage, // For displaying errors
  Input,
  NumberInput, // For numeric inputs
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select, // For status and selecting users
  Textarea,
  useToast,
  VStack,
  Flex,
  Heading,
  IconButton,
  HStack,
  Box,
  Spinner, // For loading users
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"; // To redirect after successful creation

export function TimeStudyForm() {
  const [name, setName] = useState("");
  const [estimatedTotalTime, setEstimatedTotalTime] = useState("");
  const [adminId, setAdminId] = useState("");
  const [machinistIdsInput, setMachinistIdsInput] = useState(""); // Comma-separated string
  const [status, setStatus] = useState("not started"); // Default status

  const [steps, setSteps] = useState([
    { name: "", estimated_time: "", order: 1 },
  ]);

  const [users, setUsers] = useState([]); // To store fetched users for Admin/Machinist selection
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate(); // For redirecting

  // Fetch users for Admin selection
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await fetch("http://localhost:8080/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        if (data.length > 0) {
          // setAdminId(data[0].id.toString()); // Pre-select the first user as admin, or leave empty
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // --- Step Management ---
  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    // Automatically set order if not manually managed elsewhere
    if (field !== "order") {
      newSteps[index]["order"] = index + 1;
    }
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([
      ...steps,
      { name: "", estimated_time: "", order: steps.length + 1 },
    ]);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-order remaining steps
    setSteps(newSteps.map((step, i) => ({ ...step, order: i + 1 })));
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!name.trim() || !adminId) {
      toast({
        title: "Validation Error",
        description: "Time Study Name and Admin are required.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Validate steps
    for (const step of steps) {
      if (!step.name.trim()) {
        toast({
          title: "Validation Error",
          description: "All steps must have a name.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare Machinist IDs: convert comma-separated string to array of numbers
    const machinist_ids = machinistIdsInput
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0); // Filter out invalid entries

    const timeStudyData = {
      name,
      estimated_total_time: estimatedTotalTime
        ? parseInt(estimatedTotalTime, 10)
        : null,
      admin_id: parseInt(adminId, 10),
      status,
      steps: steps.map((step) => ({
        ...step,
        estimated_time: step.estimated_time
          ? parseInt(step.estimated_time, 10)
          : null,
      })),
      machinist_ids, // Already an array of numbers
    };

    try {
      const response = await fetch("http://localhost:8080/api/time_studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timeStudyData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.error || response.statusText
          }`
        );
      }

      // const createdStudy = await response.json(); // Optional: use the created study data

      toast({
        title: "Time Study Created",
        description: "Your new time study has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form or navigate away
      setName("");
      setEstimatedTotalTime("");
      setAdminId(users.length > 0 ? users[0].id.toString() : "");
      setMachinistIdsInput("");
      setStatus("not started");
      setSteps([{ name: "", estimated_time: "", order: 1 }]);
      navigate("/admin/time-studies"); // Navigate back to the list view
    } catch (error) {
      console.error("Failed to create time study:", error);
      toast({
        title: "Creation Failed",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUsers) {
    return <Spinner />;
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={5}
      borderWidth="1px"
      borderRadius="lg"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" mb={4}>
          Create New Time Study
        </Heading>

        <FormControl isRequired isInvalid={!name.trim() && isSubmitting}>
          <FormLabel>Time Study Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a descriptive name"
          />
          {!name.trim() && isSubmitting && (
            <FormErrorMessage>Name is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Estimated Total Time (minutes)</FormLabel>
          <NumberInput
            min={0}
            value={estimatedTotalTime}
            onChange={(valueString) => setEstimatedTotalTime(valueString)}
          >
            <NumberInputField placeholder="e.g., 120" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired isInvalid={!adminId && isSubmitting}>
          <FormLabel>Admin in Charge</FormLabel>
          <Select
            placeholder="Select an Admin"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} (ID: {user.id})
              </option>
            ))}
          </Select>
          {!adminId && isSubmitting && (
            <FormErrorMessage>Admin is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Machinist IDs (comma-separated)</FormLabel>
          <Input
            value={machinistIdsInput}
            onChange={(e) => setMachinistIdsInput(e.target.value)}
            placeholder="e.g., 2, 3, 5"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="not started">Not Started</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </FormControl>

        {/* Steps Section */}
        <VStack
          spacing={4}
          align="stretch"
          borderWidth="1px"
          p={4}
          borderRadius="md"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md">Steps</Heading>
            <Button leftIcon={<AddIcon />} size="sm" onClick={addStep}>
              Add Step
            </Button>
          </Flex>
          {steps.map((step, index) => (
            <HStack key={index} spacing={3} align="flex-end">
              <FormControl
                isRequired
                isInvalid={
                  !step.name.trim() && isSubmitting && steps.length > 0
                }
              >
                <FormLabel fontSize="sm">Step {index + 1} Name</FormLabel>
                <Input
                  size="sm"
                  value={step.name}
                  onChange={(e) =>
                    handleStepChange(index, "name", e.target.value)
                  }
                  placeholder="Step Name"
                />
                {!step.name.trim() && isSubmitting && steps.length > 0 && (
                  <FormErrorMessage>Step name is required.</FormErrorMessage>
                )}
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Est. Time (mins)</FormLabel>
                <NumberInput
                  size="sm"
                  min={0}
                  value={step.estimated_time}
                  onChange={(valueString) =>
                    handleStepChange(index, "estimated_time", valueString)
                  }
                >
                  <NumberInputField placeholder="e.g., 30" />
                </NumberInput>
              </FormControl>
              <IconButton
                aria-label="Remove step"
                icon={<DeleteIcon />}
                colorScheme="red"
                variant="ghost"
                size="sm"
                onClick={() => removeStep(index)}
                isDisabled={steps.length === 1 && index === 0} // Don't allow removing the very last step if it's the only one
              />
            </HStack>
          ))}
        </VStack>

        <Flex gap={4} mt={6}>
          <Button
            type="submit"
            colorScheme="blue"
            flex="1"
            isLoading={isSubmitting}
            loadingText="Creating..."
          >
            Create Time Study
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin")}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
