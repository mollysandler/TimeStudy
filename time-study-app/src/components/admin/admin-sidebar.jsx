import { Button, Flex, Text, VStack } from "@chakra-ui/react";
import {
  SettingsIcon,
  TimeIcon,
  AddIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";

export function AdminSidebar() {
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
        <SettingsIcon boxSize={6} color="blue.500" />
        <Text fontSize="xl" fontWeight="bold">
          Admin Panel
        </Text>
      </Flex>
      <VStack spacing={1} align="stretch" flex="1" py={8}>
        <Link to="/admin">
          <Button
            variant={location === "/admin" ? "solid" : "ghost"}
            justifyContent="flex-start"
            leftIcon={<SettingsIcon />}
            w="full"
          >
            Dashboard
          </Button>
        </Link>

        <Link to="/admin/time-studies/new">
          <Button
            variant={location === "/admin/time-studies/new" ? "solid" : "ghost"}
            justifyContent="flex-start"
            leftIcon={<AddIcon />}
            w="full"
          >
            New Time Study
          </Button>
        </Link>
        <Link to="/admin/machinist/new">
          <Button
            variant={location === "/admin/machinist/new" ? "solid" : "ghost"}
            justifyContent="flex-start"
            leftIcon={<AddIcon />}
            w="full"
          >
            New Empoyee
          </Button>
        </Link>

        {/* <Text
          px={4}
          pt={6}
          pb={2}
          fontSize="xs"
          fontWeight="medium"
          color="gray.500"
        >
          MANAGEMENT
        </Text> */}

        {/* <Button
          variant="ghost"
          justifyContent="flex-start"
          leftIcon={<SettingsIcon />}
          w="full"
        >
          Machinists
        </Button> */}

        {/* <Button
          variant="ghost"
          justifyContent="flex-start"
          leftIcon={<TimeIcon />}
          w="full"
        >
          Time Studies
        </Button> */}

        {/* <Button
          variant="ghost"
          justifyContent="flex-start"
          leftIcon={<SettingsIcon />}
          w="full"
        >
          Settings
        </Button> */}
      </VStack>

      <Link to="/">
        <Button variant="outline" leftIcon={<ExternalLinkIcon />} w="full">
          Sign Out
        </Button>
      </Link>
    </Flex>
  );
}
