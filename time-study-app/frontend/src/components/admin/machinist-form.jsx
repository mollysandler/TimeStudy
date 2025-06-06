"use client";
import React from "react";
import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select, // For selecting the role
  useToast,
  VStack,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Optional: for redirecting

export function MachinistForm() {
  // State for individual fields, easier for validation and API payload
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("machinist"); // Default role to machinist
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate(); // Optional

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!username.trim()) {
      toast({
        title: "Validation Error",
        description: "Machinist Name (Username) is required.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    const userData = {
      username: username.trim(),
      role: role, // Send the selected role
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json(); // Try to parse JSON regardless of status for error messages

      if (!response.ok) {
        // Use error message from backend if available, otherwise a generic one
        const errorMessage =
          responseData.error || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      toast({
        title: "User Created",
        description: `${
          role.charAt(0).toUpperCase() + role.slice(1)
        } "${username}" has been added successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setUsername("");
      setRole("machinist"); // Reset to default role

      // Optional: Navigate to a user list page or back
      // navigate("/admin/users");
    } catch (error) {
      console.error("Failed to add user:", error);
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

  return (
    <form onSubmit={handleSubmit}>
      <VStack
        spacing={6}
        align="stretch"
        p={5}
        borderWidth="1px"
        borderRadius="lg"
      >
        <Heading size="md" mb={2}>
          Add New User
        </Heading>
        <FormControl
          isRequired
          isInvalid={
            !username.trim() &&
            isSubmitting /* Show error if submitting and empty */
          }
        >
          <FormLabel>Name (Username)</FormLabel>
          <Input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter user's name (will be username)"
          />
          {!username.trim() && isSubmitting && (
            <FormErrorMessage>Name is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Role</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="machinist">Machinist</option>
            <option value="admin">Admin</option>
            {/* Add other roles if needed */}
          </Select>
        </FormControl>

        {/*
          The "Time Study" and "Department" fields have been removed as they
          don't directly map to our current simple User model.
          Assigning users to studies is done when creating/editing a TimeStudy.
          Department could be a future enhancement to the User model.
        */}

        <Flex gap={4} mt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            flex="1"
            isLoading={isSubmitting}
            loadingText="Adding..."
          >
            Add User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUsername("");
              setRole("machinist");
              // navigate(-1); // Or navigate to a specific path
            }}
            isDisabled={isSubmitting}
          >
            Cancel / Reset
          </Button>
        </Flex>
      </VStack>
    </form>
  );
}
