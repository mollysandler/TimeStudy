import React, { useState, useEffect } from "react"; // Import hooks
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  Box,
  Spinner, // For loading state
  Alert, // For error messages
  AlertIcon,
  Flex, // For centering loading/error messages
  Tag, // For status
} from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export function AssignmentList() {
  const [timeStudies, setTimeStudies] = useState([]); // State for storing studies
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages

  useEffect(() => {
    const fetchTimeStudies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all time studies (same endpoint as admin list for now)
        const response = await fetch("http://localhost:8080/api/time_studies");

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        setTimeStudies(data);
      } catch (e) {
        console.error("Failed to fetch time studies for machinist:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeStudies();
  }, []); // Empty dependency array: runs once on mount

  // --- Conditional Rendering ---
  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading assigned studies...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        There was an error loading studies: {error}
      </Alert>
    );
  }

  if (timeStudies.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" mb={2}>
          No Time Studies Assigned
        </Heading>
        <Text color="gray.500">
          There are currently no time studies available or assigned to you.
        </Text>
      </Box>
    );
  }

  // --- Main Content ---
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {/*
        The 'study' object here will have the structure from your Flask `TimeStudy.to_dict()`:
        {
          id, name, estimated_total_time, number_of_steps, status, admin, steps, machinists
        }
        We need to map these to the card display.
        The original mock 'assignment' had 'processName', 'machineName', 'estimatedTime'.
        We'll use 'study.name', 'study.estimated_total_time', 'study.number_of_steps', 'study.status'.
        'machineName' isn't directly part of our TimeStudy model.
      */}
      {timeStudies.map((study) => (
        <Card key={study.id}>
          <CardHeader>
            <Heading size="md">{study.name}</Heading>
            {/* 'machineName' is not in our model.
                Could display Admin or a generic placeholder.
                Or, if a study is tied to a specific machine, add that to backend.
            */}
            <Text color="gray.500" fontSize="sm">
              Admin: {study.admin ? study.admin.username : "N/A"}
            </Text>
          </CardHeader>
          <CardBody>
            <Box mb={4}>
              <Grid templateColumns="1fr 1fr" gap={2} fontSize="sm">
                <Text color="gray.500">Est. Total Time:</Text>
                <Text fontWeight="medium">
                  {study.estimated_total_time || "N/A"} mins
                </Text>
                <Text color="gray.500">Steps:</Text>
                <Text fontWeight="medium">{study.number_of_steps}</Text>{" "}
                {/* This is len(study.steps) */}
                <Text color="gray.500">Status:</Text>
                <Text fontWeight="medium">
                  <Tag
                    size="sm"
                    colorScheme={
                      study.status === "completed"
                        ? "green"
                        : study.status === "in progress"
                        ? "blue"
                        : "gray"
                    }
                  >
                    {study.status}
                  </Tag>
                </Text>
              </Grid>
            </Box>

            {/*
              The link should go to a page where the machinist can interact with this specific study.
              The path `/machinist/${study.id}` seems appropriate.
            */}
            <Link to={`/machinist/study/${study.id}`}>
              {" "}
              {/* Updated link for clarity */}
              <Button leftIcon={<TimeIcon />} w="full" colorScheme="blue">
                {study.status === "in progress"
                  ? "Continue Study"
                  : study.status === "completed"
                  ? "View Results" // Or "View Details"
                  : "Start Study"}
              </Button>
            </Link>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}
