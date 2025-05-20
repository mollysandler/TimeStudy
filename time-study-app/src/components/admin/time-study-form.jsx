"use client";

import { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Textarea,
  useToast,
  VStack,
  Flex,
} from "@chakra-ui/react";

export function TimeStudyForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    machine: "",
    department: "",
  });
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Submit form - would send to API in real implementation
    console.log("Form submitted:", formData);

    toast({
      title: "Time Study Created",
      description: "Your new time study has been created successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      machine: "",
      department: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Time Study Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter a descriptive name for this time study"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the purpose and scope of this time study"
            />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel>Machine Type</FormLabel>
              <Input
                name="machine"
                value={formData.machine}
                onChange={handleChange}
                placeholder="e.g., CNC Mill, Lathe, etc."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Department</FormLabel>
              <Input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Machining, Assembly, etc."
              />
            </FormControl>
          </SimpleGrid>
        </VStack>

        <Flex gap={4}>
          <Button type="submit" colorScheme="blue" flex="1">
            Create Time Study
          </Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Flex>
      </VStack>
    </form>
  );
}
