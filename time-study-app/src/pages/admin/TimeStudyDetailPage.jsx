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
  IconButton,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Tag,
  Step,
} from "@chakra-ui/react";
import { ArrowBackIcon, AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ProcessStepForm } from "../../components/admin/process-step-form";
import { ProcessStepList } from "../../components/admin/process-step-list";

export default function TimeStudyDetailPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [timeStudy, setTimeStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Callback function to refetch data, useful after adding a step
  const fetchTimeStudyDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8080/api/time_studies/${studyId}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error message from backend
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorData.error ||
            response.statusText ||
            "Failed to fetch time study details"
          }`
        );
      }
      const data = await response.json();
      setTimeStudy(data);
    } catch (e) {
      console.error("Failed to fetch time study details:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studyId) {
      fetchTimeStudyDetails();
    }
  }, [studyId]);

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" />
        <Text ml={4}>Loading time study details...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="flex-end" alignItems="center" mb={4} mt={4}>
          <Button
            onClick={() => navigate("/admin")}
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            size="sm"
          >
            Back to List
          </Button>
        </Flex>
        <Alert status="error">
          <AlertIcon />
          Error fetching time study: {error}
        </Alert>
      </VStack>
    );
  }

  if (!timeStudy) {
    // Should ideally be caught by error state if fetch failed, but as a fallback
    return <Text>Time study not found.</Text>;
  }

  // --- Main Content ---
  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="xl">{timeStudy.name}</Heading>
          <Text color="gray.500" mt={1}>
            Admin: {timeStudy.admin ? timeStudy.admin.username : "N/A"} |
            Status:{" "}
            <Tag
              size="sm"
              colorScheme={
                timeStudy.status === "completed"
                  ? "green"
                  : timeStudy.status === "in progress"
                  ? "blue"
                  : "gray"
              }
            >
              {timeStudy.status}
            </Tag>
          </Text>
          <Text color="gray.500">
            Est. Total Time: {timeStudy.estimated_total_time || "N/A"} mins
          </Text>
        </Box>
        <Link to="/admin">
          {" "}
          {/* Updated link to go back to the list */}
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to List
          </Button>
        </Link>
      </Flex>

      <Tabs isLazy>
        {" "}
        <TabList>
          <Tab>
            Process Steps ({timeStudy.steps ? timeStudy.steps.length : 0})
          </Tab>
          <Tab>
            Machinists ({timeStudy.machinists ? timeStudy.machinists.length : 0}
            )
          </Tab>
          <Tab>Details & Results</Tab>
        </TabList>
        <TabPanels>
          {/* --- Process Steps Tab --- */}
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
                </CardHeader>
                <CardBody>
                  <ProcessStepList
                    steps={timeStudy?.steps || []}
                    studyId={timeStudy?.id} // Pass studyId if needed for other actions (like edit)
                    onStepDeleted={fetchTimeStudyDetails} // <<< PASS THE CALLBACK HERE
                  />
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
                  <ProcessStepForm
                    studyId={timeStudy.id}
                    onStepAdded={fetchTimeStudyDetails}
                  />
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* --- Machinists (Assignments) Tab --- */}
          <TabPanel>
            <Card>
              <CardHeader
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Heading size="md">Assigned Machinists</Heading>
                  <Text color="gray.500">
                    View machinists assigned to this time study
                  </Text>
                </Box>
                {/* Button to manage assignments - could open a modal */}
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  onClick={() => alert("Manage assignments (not implemented)")}
                >
                  Manage Assignments
                </Button>
              </CardHeader>
              <CardBody>
                {timeStudy.machinists && timeStudy.machinists.length > 0 ? (
                  timeStudy.machinists.map((machinist) => (
                    <Flex
                      key={machinist.id} // Use machinist.id as key
                      justifyContent="space-between"
                      alignItems="center"
                      p={3} // Reduced padding
                      mb={2}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Box>
                        <Text fontWeight="medium">
                          {machinist.username} (ID: {machinist.id})
                        </Text>
                        {/* If you add more details to machinist user, display here */}
                      </Box>
                      <Flex gap={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          variant="outline"
                          aria-label="Edit Machinist"
                          onClick={() =>
                            alert(
                              `Edit machinist ${machinist.id} (not implemented)`
                            )
                          }
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          aria-label="Remove Machinist"
                          onClick={() =>
                            alert(
                              `Remove machinist ${machinist.id} (not implemented)`
                            )
                          }
                        />
                      </Flex>
                    </Flex>
                  ))
                ) : (
                  <Text color="gray.500">
                    No machinists assigned to this study yet.
                  </Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* --- Results/Details Tab --- */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Time Study Details & Results</Heading>
                <Text color="gray.500">
                  View details and analyze completed time studies
                </Text>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text>
                    <strong>ID:</strong> {timeStudy.id}
                  </Text>
                  <Text>
                    <strong>Name:</strong> {timeStudy.name}
                  </Text>
                  <Text>
                    <strong>Status:</strong>{" "}
                    <Tag
                      size="md"
                      colorScheme={
                        timeStudy.status === "completed"
                          ? "green"
                          : timeStudy.status === "in progress"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {timeStudy.status}
                    </Tag>
                  </Text>
                  <Text>
                    <strong>Admin:</strong>{" "}
                    {timeStudy.admin ? timeStudy.admin.username : "N/A"}
                  </Text>
                  <Text>
                    <strong>Estimated Total Time:</strong>{" "}
                    {timeStudy.estimated_total_time || "N/A"} minutes
                  </Text>
                  <Text>
                    <strong>Number of Steps:</strong>{" "}
                    {timeStudy.steps ? timeStudy.steps.length : 0}
                  </Text>
                  <Text>
                    <strong>Number of Machinists:</strong>{" "}
                    {timeStudy.machinists ? timeStudy.machinists.length : 0}
                  </Text>
                  {/* If you add created_at to backend:
                    <Text><strong>Created At:</strong> {timeStudy.created_at ? new Date(timeStudy.created_at).toLocaleString() : 'N/A'}</Text>
                    */}
                </VStack>
                <Heading size="sm" mt={6} mb={3}>
                  Results
                </Heading>
                <Text color="gray.500">
                  No results available yet. (This section can be built out
                  later)
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
