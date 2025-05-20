import React from "react";
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
} from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export function AssignmentList() {
  // Mock data - would come from API in real implementation
  const assignments = [
    {
      id: "1",
      processName: "Milling Operation XYZ",
      machineName: "CNC Mill #1",
      estimatedTime: "2 hours",
      steps: 6,
      status: "Not Started",
    },
    {
      id: "2",
      processName: "Lathe Operation ABC",
      machineName: "Lathe #3",
      estimatedTime: "1.5 hours",
      steps: 4,
      status: "In Progress",
    },
    {
      id: "3",
      processName: "Drilling Operation DEF",
      machineName: "Drill Press #2",
      estimatedTime: "45 minutes",
      steps: 3,
      status: "Not Started",
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardHeader>
            <Heading size="md">{assignment.processName}</Heading>
            <Text color="gray.500">{assignment.machineName}</Text>
          </CardHeader>
          <CardBody>
            <Box mb={4}>
              <Grid templateColumns="1fr 1fr" gap={2} fontSize="sm">
                <Text color="gray.500">Estimated Time:</Text>
                <Text fontWeight="medium">{assignment.estimatedTime}</Text>
                <Text color="gray.500">Steps:</Text>
                <Text fontWeight="medium">{assignment.steps}</Text>
                <Text color="gray.500">Status:</Text>
                <Text fontWeight="medium">{assignment.status}</Text>
              </Grid>
            </Box>

            <Link to={`/machinist/${assignment.id}`}>
              <Button leftIcon={<TimeIcon />} w="full">
                {assignment.status === "In Progress" ? "Continue" : "Start"}{" "}
                Time Study
              </Button>
            </Link>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
}
