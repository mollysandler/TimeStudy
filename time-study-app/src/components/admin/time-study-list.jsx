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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export function TimeStudyList() {
  // Mock data - would come from API in real implementation
  const timeStudies = [
    {
      id: "1",
      name: "Engine Block Machining",
      description: "Complete machining process for engine block model EB-2023",
      steps: 4,
      assignments: 2,
      createdAt: "2023-10-15",
    },
    {
      id: "2",
      name: "Transmission Assembly",
      description: "Assembly process for automatic transmission model AT-X",
      steps: 6,
      assignments: 3,
      createdAt: "2023-11-02",
    },
    {
      id: "3",
      name: "Cylinder Head Milling",
      description: "Precision milling for cylinder head components",
      steps: 5,
      assignments: 1,
      createdAt: "2023-12-10",
    },
  ];

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
              <Heading size="md">{study.name}</Heading>
              <Text color="gray.500">{study.description}</Text>
            </CardHeader>
            <CardBody>
              <Box mb={4}>
                <Grid templateColumns="1fr 1fr" gap={2} fontSize="sm">
                  <Text color="gray.500">Steps:</Text>
                  <Text fontWeight="medium">{study.steps}</Text>
                  <Text color="gray.500">Assignments:</Text>
                  <Text fontWeight="medium">{study.assignments}</Text>
                  <Text color="gray.500">Created:</Text>
                  <Text fontWeight="medium">{study.createdAt}</Text>
                </Grid>
              </Box>

              <Flex gap={2}>
                <Link
                  to={`/admin/time-studies/${study.id}`}
                  style={{ flex: 1 }}
                >
                  <Button variant="outline" leftIcon={<EditIcon />} flex="1">
                    Edit
                  </Button>
                </Link>
                <Button colorScheme="red" p={0} minW={10} h={10}>
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
