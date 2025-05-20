"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, AddIcon } from "@chakra-ui/icons";
import { ProcessStepForm } from "../../components/admin/process-step-form";
import { ProcessStepList } from "../../components/admin/process-step-list";
import { PageHeader } from "../../components/page-header";
import { Link, useParams } from "react-router-dom";

export default function TimeStudyDetailPage() {
  const { studyId } = useParams();

  // Mock data - would come from API in real implementation
  const timeStudy = {
    id: studyId,
    name: "Engine Block Machining",
    description: "Complete machining process for engine block model EB-2023",
    steps: [
      { id: "1", name: "Setup CNC machine", estimatedTime: 300 },
      { id: "2", name: "Load material", estimatedTime: 120 },
      { id: "3", name: "Run first operation", estimatedTime: 600 },
      { id: "4", name: "Quality check", estimatedTime: 180 },
    ],
    assignments: [
      {
        id: "1",
        machinistName: "John Doe",
        machinistId: "m1",
        machineId: "cnc1",
        machineName: "CNC Mill #1",
      },
      {
        id: "2",
        machinistName: "Jane Smith",
        machinistId: "m2",
        machineId: "cnc2",
        machineName: "CNC Mill #2",
      },
    ],
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <PageHeader
          title={timeStudy.name}
          description={timeStudy.description}
        />
        <Link to="/admin">
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Process Steps</Tab>
          <Tab>Assignments</Tab>
          <Tab>Results</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Heading size="md">Process Steps</Heading>
                    <Text color="gray.500">
                      Manage the steps for this time study
                    </Text>
                  </Box>
                  <Button leftIcon={<AddIcon />} size="sm">
                    Add Step
                  </Button>
                </CardHeader>
                <CardBody>
                  <ProcessStepList steps={timeStudy.steps} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Add New Process Step</Heading>
                  <Text color="gray.500">
                    Create a new step for this time study
                  </Text>
                </CardHeader>
                <CardBody>
                  <ProcessStepForm studyId={studyId} />
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardHeader
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Heading size="md">Machinist Assignments</Heading>
                  <Text color="gray.500">
                    Manage who is assigned to this time study
                  </Text>
                </Box>
                <Button leftIcon={<AddIcon />} size="sm">
                  Add Assignment
                </Button>
              </CardHeader>
              <CardBody>
                {timeStudy.assignments.map((assignment) => (
                  <Flex
                    key={assignment.id}
                    justifyContent="space-between"
                    alignItems="center"
                    p={4}
                    mb={2}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Box>
                      <Text fontWeight="medium">
                        {assignment.machinistName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {assignment.machineName}
                      </Text>
                    </Box>
                    <Flex gap={2}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button colorScheme="red" size="sm">
                        Remove
                      </Button>
                    </Flex>
                  </Flex>
                ))}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Time Study Results</Heading>
                <Text color="gray.500">
                  View and analyze completed time studies
                </Text>
              </CardHeader>
              <CardBody>
                <Text color="gray.500">No results available yet.</Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
