import React from "react";
import {
  Button,
  Flex,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { TimeIcon, InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function MachinistSidebar() {
  const location = useLocation();
  const [timeStudies, setTimeStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedStudies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: When auth is implemented, fetch studies for the specific logged-in machinist.
        // For now, fetching all studies.
        const response = await fetch("/api/time_studies");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setTimeStudies(data);
      } catch (e) {
        console.error("Failed to fetch studies for sidebar:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedStudies();
  }, []); // Empty dependency array means run once on mount

  const isActive = (path) => location.pathname === path;
  // For dynamic paths like the timer page, we need a more flexible check
  const isTimerPageActive = (studyId) =>
    location.pathname === `/machinist/timer/${studyId}`;

  return (
    <Flex
      direction="column"
      w="64" // Standard sidebar width
      minW="64" // Ensure it doesn't shrink too much
      p={4}
      borderRight="1px"
      borderColor="gray.200"
      h="100vh" // Full viewport height
      bg="gray.50" // Slight background color
    >
      <Flex
        alignItems="center"
        gap={2}
        py={4}
        mb={4}
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <TimeIcon boxSize={6} color="blue.500" />
        <Text fontSize="xl" fontWeight="bold">
          Time Study App
        </Text>
      </Flex>

      <VStack spacing={1} align="stretch" flex="1" overflowY="auto">
        {" "}
        {/* Added overflowY for long lists */}
        <Link to="/machinist">
          <Button
            variant={isActive("/machinist") ? "solid" : "ghost"}
            colorScheme={isActive("/machinist") ? "blue" : "gray"}
            justifyContent="flex-start"
            leftIcon={<InfoIcon />}
            w="full"
          >
            Dashboard
          </Button>
        </Link>
        <Text
          px={4}
          pt={6}
          pb={2}
          fontSize="xs"
          fontWeight="semibold" // Changed to semibold
          color="gray.600" // Slightly darker
          textTransform="uppercase" // Uppercase for section titles
        >
          Active Time Studies {/* Changed from "Assigned Machines" */}
        </Text>
        {isLoading && (
          <Flex justifyContent="center" py={4}>
            <Spinner />
          </Flex>
        )}
        {error && (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={2}
          >
            <AlertIcon boxSize="20px" />
            <Text fontSize="xs" mt={1}>
              Error loading studies.
            </Text>
          </Alert>
        )}
        {!isLoading && !error && timeStudies.length === 0 && (
          <Text px={4} py={2} fontSize="sm" color="gray.500">
            No active studies.
          </Text>
        )}
        {!isLoading &&
          !error &&
          timeStudies
            .filter(
              (study) =>
                study.status === "in progress" || study.status === "not started"
            ) // Optional: Filter for active ones
            .map((study) => (
              <Link key={study.id} to={`/machinist/${study.id}`}>
                {" "}
                <Button
                  variant={isTimerPageActive(study.id) ? "solid" : "ghost"}
                  colorScheme={isTimerPageActive(study.id) ? "blue" : "gray"}
                  justifyContent="flex-start"
                  leftIcon={<TimeIcon />}
                  w="full"
                  textAlign="left"
                  title={study.name}
                  isTruncated
                >
                  {study.name}
                </Button>
              </Link>
            ))}
      </VStack>

      <Link to="/">
        {" "}
        <Button
          variant="outline"
          leftIcon={<ExternalLinkIcon />}
          w="full"
          mt={8}
        >
          Sign Out
        </Button>
      </Link>
    </Flex>
  );
}
