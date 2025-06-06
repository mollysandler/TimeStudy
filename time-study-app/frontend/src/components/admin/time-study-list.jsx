import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { exportToCSV, exportToExcel } from "../../utils/exportData";

export function TimeStudyList() {
  const [timeStudies, setTimeStudies] = useState([]); //state for storing studies
  const [isLoading, setIsLoading] = useState(true); //state for loading status
  const [error, setError] = useState(null); //state for any errors

  // For delete confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studyToDelete, setStudyToDelete] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    // Define the async function to fetch data
    const fetchTimeStudies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Your Flask backend API endpoint for getting all time studies
        const response = await fetch("/api/time_studies");

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        setTimeStudies(data);
      } catch (e) {
        console.error("Failed to fetch time studies:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeStudies();
  }, []); //run when we refresh

  const handleDeleteClick = (study) => {
    setStudyToDelete(study);
    onOpen(); // Open confirmation dialog
  };

  const confirmDeleteStudy = async () => {
    if (!studyToDelete) return;
    try {
      const response = await fetch(`/api/time_studies/${studyToDelete.id}`, {
        method: "DELETE",
      });
      const responseData = await response.json().catch(() => null); // Try to get JSON, but allow for 204 no content

      if (!response.ok) {
        throw new Error(
          responseData?.error || `Failed to delete study: ${response.status}`
        );
      }

      toast({
        title: "Time Study Deleted",
        description: `"${studyToDelete.name}" was successfully deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh the list: either filter locally or re-fetch
      setTimeStudies((prevStudies) =>
        prevStudies.filter((s) => s.id !== studyToDelete.id)
      );
      // Or: await fetchTimeStudies();
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setStudyToDelete(null);
    }
  };

  const handleExport = (study, format) => {
    const filenameBase = `TimeStudy_${study.id}_${study.name.replace(
      /\s+/g,
      "_"
    )}`;
    if (format === "csv") {
      exportToCSV(study, `${filenameBase}.csv`);
    } else if (format === "excel") {
      exportToExcel(study, `${filenameBase}.xlsx`);
    }
  };

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="200px">
        <Spinner size="xl" />
        <Text ml={4}>Loading time studies...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        There was an error processing your request: {error}
      </Alert>
    );
  }

  if (timeStudies.length === 0 && !isLoading && !error) {
    return (
      <Box>
        <Flex justifyContent="space-between" mb={4}>
          <Heading size="lg">Time Studies</Heading>
          <Link to="/admin/time-studies/new">
            <Button leftIcon={<AddIcon />}>Create New</Button>
          </Link>
        </Flex>
        <Text>No time studies found. Start by creating a new one!</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent="space-between" mb={4}>
        <Heading size="lg">Time Studies</Heading>
        <Link to="/admin/time-studies/new">
          <Button leftIcon={<AddIcon />}>Create New</Button>
        </Link>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {timeStudies.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md" isTruncated>
                  {study.name}
                </Heading>
                {/* Export Menu Button */}
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Export options"
                    icon={<DownloadIcon />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem onClick={() => handleExport(study, "csv")}>
                      Export as CSV
                    </MenuItem>
                    <MenuItem onClick={() => handleExport(study, "excel")}>
                      Export as Excel
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text color="gray.500" fontSize="sm">
                Admin: {study.admin ? study.admin.username : "N/A"}
              </Text>
              <Text color="gray.500" fontSize="sm">
                Status: {study.status}
              </Text>
            </CardHeader>
            <CardBody>
              <Box mb={4}>
                <Grid templateColumns="1fr 1fr" gap={2} fontSize="sm">
                  <Text color="gray.500">Steps:</Text>
                  <Text fontWeight="medium">{study.number_of_steps}</Text>

                  <Text color="gray.500">Machinists:</Text>
                  <Text fontWeight="medium">{study.machinists.length}</Text>

                  <Text color="gray.500">Est. Total Time:</Text>
                  <Text fontWeight="medium">
                    {study.estimated_total_time || "N/A"} mins
                  </Text>
                </Grid>
              </Box>

              <Flex gap={2}>
                <Link
                  to={`/admin/time-studies/${study.id}`} // Use the study.id from the API
                  style={{ flex: 1 }}
                >
                  <Button variant="outline" leftIcon={<EditIcon />} flex="1">
                    View/Edit
                  </Button>
                </Link>
                <Button
                  colorScheme="red"
                  p={0}
                  minW={10}
                  h={10}
                  onClick={() => handleDeleteClick(study)}
                >
                  <DeleteIcon />
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Time Study
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the time study "
              <strong>{studyToDelete?.name}</strong>"? This action cannot be
              undone and will delete all associated steps.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteStudy} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
