"use client";
import React from "react";
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid as ResultsGrid,
  Divider as ResultsDivider,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton, //to avoid naming issues with Button
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  DownloadIcon,
} from "@chakra-ui/icons";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ProcessStepForm } from "../../components/admin/process-step-form";
import { ProcessStepList } from "../../components/admin/process-step-list";
import { exportToCSV, exportToExcel } from "../../utils/exportData";

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

  const formatTime = useCallback((seconds) => {
    // Ensure formatTime is available or define it here
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return "N/A";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  }, []);

  const handleExport = async (format) => {
    // <--- Added async
    if (!timeStudy) {
      console.error("No time study data available to export."); // Add a log
      return;
    }
    // Add a log to confirm the function is called
    console.log(`Exporting time study ID ${timeStudy.id} as ${format}`);

    const filenameBase = `TimeStudy_${timeStudy.id}_${timeStudy.name.replace(
      /\s+/g,
      "_"
    )}`;

    try {
      // Add try-catch around export calls for better error visibility
      if (format === "csv") {
        exportToCSV(timeStudy, `${filenameBase}.csv`);
      } else if (format === "excel") {
        await exportToExcel(timeStudy, `${filenameBase}.xlsx`); // <--- Added await
      }
    } catch (exportError) {
      console.error(`Error during ${format} export:`, exportError);
      // Optionally show a toast to the user
      // toast({ title: "Export Failed", description: "Could not generate the file.", status: "error" });
    }
  };

  if (!timeStudy) {
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
  }

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
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to List
          </Button>
        </Link>
        <Menu>
          <MenuButton
            as={ChakraButton}
            rightIcon={<DownloadIcon />}
            colorScheme="teal"
            variant="solid"
          >
            Export Study
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleExport("csv")}>
              Export as CSV
            </MenuItem>
            <MenuItem onClick={() => handleExport("excel")}>
              Export as Excel
            </MenuItem>
          </MenuList>
        </Menu>
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
                    studyId={timeStudy?.id}
                    onStepDeleted={fetchTimeStudyDetails}
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

                {/* <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  onClick={() => alert("Manage assignments (not implemented)")}
                >
                  Manage Assignments
                </Button> */}
              </CardHeader>
              <CardBody>
                {timeStudy.machinists && timeStudy.machinists.length > 0 ? (
                  timeStudy.machinists.map((machinist) => (
                    <Flex
                      key={machinist.id}
                      justifyContent="space-between"
                      alignItems="center"
                      p={3}
                      mb={2}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Box>
                        <Text fontWeight="medium">
                          {machinist.username} (ID: {machinist.id})
                        </Text>
                      </Box>
                      <Flex gap={2}>
                        {/* <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          variant="outline"
                          aria-label="Edit Machinist"
                          onClick={() =>
                            alert(
                              `Edit machinist ${machinist.id} (not implemented)`
                            )
                          }
                        /> */}
                        {/* <IconButton
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
                        /> */}
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
                <Heading size="md">Time Study Summary & Results</Heading>
                <Text color="gray.500">
                  Detailed information and recorded times for this study.
                </Text>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={4} divider={<ResultsDivider />}>
                  {/* General Study Details Section */}
                  <Box w="full">
                    <Heading
                      size="sm"
                      mb={3}
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      Study Information
                    </Heading>
                    <ResultsGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Stat>
                        <StatLabel>Study ID</StatLabel>
                        <StatNumber>{timeStudy.id}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Study Name</StatLabel>
                        <StatNumber>{timeStudy.name}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Status</StatLabel>
                        <StatNumber>
                          <Tag
                            size="md"
                            colorScheme={
                              timeStudy.status === "completed"
                                ? "green"
                                : timeStudy.status === "in progress"
                                ? "blue"
                                : timeStudy.status === "scrapped"
                                ? "red"
                                : "gray"
                            }
                          >
                            {timeStudy.status}
                          </Tag>
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Admin</StatLabel>
                        <StatNumber>
                          {timeStudy.admin?.username || "N/A"}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Estimated Total Time</StatLabel>
                        <StatNumber>
                          {timeStudy.estimated_total_time || "0"} minutes
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Actual Total Time</StatLabel>
                        <StatNumber
                          color={
                            timeStudy.status === "completed"
                              ? "green.500"
                              : "gray.500"
                          }
                        >
                          {formatTime(timeStudy.actual_total_time)}
                        </StatNumber>
                        {timeStudy.estimated_total_time &&
                          timeStudy.actual_total_time &&
                          timeStudy.status === "completed" && (
                            <StatHelpText>
                              Variance:{" "}
                              {formatTime(
                                Math.abs(
                                  timeStudy.estimated_total_time * 60 -
                                    timeStudy.actual_total_time
                                )
                              )}
                              {timeStudy.estimated_total_time * 60 -
                                timeStudy.actual_total_time >
                              0
                                ? " (Faster)"
                                : " (Slower)"}
                            </StatHelpText>
                          )}
                      </Stat>
                      <Stat>
                        <StatLabel>Number of Steps</StatLabel>
                        <StatNumber>{timeStudy.steps?.length || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Number of Machinists</StatLabel>
                        <StatNumber>
                          {timeStudy.machinists?.length || 0}
                        </StatNumber>
                      </Stat>
                      {timeStudy.notes && (
                        <Stat gridColumn="span 2">
                          {" "}
                          {/* Make notes span full width if 2 columns */}
                          <StatLabel>Overall Study Notes</StatLabel>
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {timeStudy.notes}
                          </Text>
                        </Stat>
                      )}
                    </ResultsGrid>
                  </Box>

                  {/* Results Section - Step Timings */}
                  <Box w="full">
                    <Heading
                      size="sm"
                      mt={6}
                      mb={3}
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      Step Results
                    </Heading>
                    {timeStudy.status === "not started" && (
                      <Text color="gray.500">
                        This time study has not been started yet, so there are
                        no step results.
                      </Text>
                    )}
                    {(timeStudy.status === "in progress" ||
                      timeStudy.status === "completed" ||
                      timeStudy.status === "scrapped") &&
                      (!timeStudy.steps || timeStudy.steps.length === 0) && (
                        <Text color="gray.500">
                          No steps defined for this study.
                        </Text>
                      )}

                    {timeStudy.steps &&
                      timeStudy.steps.length > 0 &&
                      (timeStudy.status === "in progress" ||
                        timeStudy.status === "completed" ||
                        timeStudy.status === "scrapped") && (
                        <VStack spacing={3} align="stretch">
                          {timeStudy.steps
                            .sort((a, b) => a.order - b.order)
                            .map((step) => (
                              <Flex
                                key={step.id}
                                justifyContent="space-between"
                                alignItems="center"
                                p={3}
                                borderWidth="1px"
                                borderColor="gray.200"
                                borderRadius="md"
                              >
                                <Box>
                                  <Text fontWeight="medium">
                                    Step {step.order}: {step.name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    Est:{" "}
                                    {step.estimated_time !== null
                                      ? `${step.estimated_time} min`
                                      : "N/A"}
                                  </Text>
                                </Box>
                                <Text
                                  fontWeight="bold"
                                  color={
                                    step.actual_time !== null
                                      ? "green.600"
                                      : "gray.500"
                                  }
                                >
                                  Actual: {formatTime(step.actual_time)}
                                </Text>
                              </Flex>
                            ))}
                        </VStack>
                      )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
