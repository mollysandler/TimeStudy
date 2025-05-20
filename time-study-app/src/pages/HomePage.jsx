import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { TimeIcon, SettingsIcon, AtSignIcon } from "@chakra-ui/icons";

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Container maxW="container.xl" centerContent py={12}>
      <Heading as="h1" size="2xl" textAlign="center" mb={8}>
        Time Study Application
      </Heading>

      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={6}
        w="full"
        maxW="4xl"
      >
        <Card
          variant="outline"
          transition="all 0.2s"
          _hover={{ boxShadow: "md" }}
        >
          <CardHeader textAlign="center">
            <Flex
              w="14"
              h="14"
              rounded="full"
              bg={useColorModeValue("blue.50", "blue.900")}
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <AtSignIcon
                boxSize={8}
                color={useColorModeValue("blue.500", "blue.200")}
              />
            </Flex>
            <Heading size="lg">Machinist Portal</Heading>
            <Text color="gray.500" mt={2}>
              Track process times and manage your assignments
            </Text>
          </CardHeader>
          <CardBody display="flex" justifyContent="center">
            <Link to="/machinist">
              <Button size="lg" leftIcon={<TimeIcon />}>
                Enter as Machinist
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card
          variant="outline"
          transition="all 0.2s"
          _hover={{ boxShadow: "md" }}
        >
          <CardHeader textAlign="center">
            <Flex
              w="14"
              h="14"
              rounded="full"
              bg={useColorModeValue("blue.50", "blue.900")}
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <SettingsIcon
                boxSize={8}
                color={useColorModeValue("blue.500", "blue.200")}
              />
            </Flex>
            <Heading size="lg">Admin Portal</Heading>
            <Text color="gray.500" mt={2}>
              Manage time studies, processes, and assignments
            </Text>
          </CardHeader>
          <CardBody display="flex" justifyContent="center">
            <Link to="/admin">
              <Button size="lg" variant="outline" leftIcon={<SettingsIcon />}>
                Enter as Admin
              </Button>
            </Link>
          </CardBody>
        </Card>
      </Grid>
    </Container>
  );
}
