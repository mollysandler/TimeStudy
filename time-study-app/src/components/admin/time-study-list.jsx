import {
  Box,
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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function TimeStudyList() {
  const [timeStudies, setTimeStudies] = useState([]); //state for storing studies
  const [isLoading, setIsLoading] = useState(true); //state for loading status
  const [error, setError] = useState(null); //state for any errors

  useEffect(() => {
    // Define the async function to fetch data
    const fetchTimeStudies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Your Flask backend API endpoint for getting all time studies
        const response = await fetch("http://localhost:8080/api/time_studies");

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
        {/*
          Now we map over the 'timeStudies' state which comes from the API.
          The structure of 'study' will be based on your `to_dict()` method in Flask:
          {
            "id": 1,
            "name": "CNC Part Alpha Study",
            "estimated_total_time": 120,
            "number_of_steps": 4, // This is `len(self.steps)` from your backend
            "status": "not started",
            "admin": { "id": 1, "username": "admin_user" },
            "admin_id": 1,
            "steps": [
              { "id": 1, "name": "Setup Machine", "estimated_time": 30, "order": 1, "time_study_id": 1 },
              ...
            ],
            "machinists": [
              { "id": 2, "username": "machinist_alice" },
              { "id": 3, "username": "machinist_bob" }
            ]
          }
          We need to adjust what we display on the card to match this.
        */}
        {timeStudies.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <Heading size="md">{study.name}</Heading>
              {/* 'description' is not directly in our backend model for TimeStudy.
                  You might want to add it to the backend model, or use another field,
                  or perhaps display some of the step names or admin name here.
                  For now, I'll comment it out or you can adapt.
              */}
              {/* <Text color="gray.500">{study.description}</Text> */}
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

                  {/* 'createdAt' is not in our backend model yet.
                      You could add a `created_at = db.Column(db.DateTime, default=datetime.utcnow)`
                      to your TimeStudy model in Flask if you need this.
                      For now, I'll comment it out.
                  */}
                  {/* <Text color="gray.500">Created:</Text>
                  <Text fontWeight="medium">{study.createdAt}</Text> */}
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
                  onClick={() =>
                    alert(`Delete study ID: ${study.id} (not implemented yet)`)
                  }
                >
                  <DeleteIcon />
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
