import { Button, Flex, Text, VStack } from "@chakra-ui/react";
import { TimeIcon, InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";

export function MachinistSidebar() {
  const location = useLocation();

  return (
    <Flex
      direction="column"
      w="64"
      p={4}
      borderRight="1px"
      borderColor="gray.200"
      h="100vh"
    >
      <Flex alignItems="center" gap={2} py={4}>
        <TimeIcon boxSize={6} color="blue.500" />
        <Text fontSize="xl" fontWeight="bold">
          Time Study App
        </Text>
      </Flex>

      <VStack spacing={1} align="stretch" flex="1" py={8}>
        <Link to="/machinist">
          <Button
            variant={location === "/machinist" ? "solid" : "ghost"}
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
          fontWeight="medium"
          color="gray.500"
        >
          ASSIGNED MACHINES
        </Text>

        {/* Mock data - would come from API in real implementation */}
        {["CNC Mill #1", "Lathe #3", "Drill Press #2"].map((machine, index) => (
          <Link key={index} to={`/machinist/${index + 1}`}>
            <Button
              key={index}
              variant={
                location === `/machinist/${index + 1}` ? "solid" : "ghost"
              }
              justifyContent="flex-start"
              leftIcon={<TimeIcon />}
              w="full"
            >
              {machine}
            </Button>
          </Link>
        ))}
      </VStack>

      <Link to="/">
        <Button variant="outline" leftIcon={<ExternalLinkIcon />} w="full">
          Sign Out
        </Button>
      </Link>
    </Flex>
  );
}
