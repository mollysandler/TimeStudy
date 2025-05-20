import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

export function ProcessStepList({ steps }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <VStack spacing={2} align="stretch">
      {steps.map((step, index) => (
        <Flex
          key={step.id}
          alignItems="center"
          justifyContent="space-between"
          p={4}
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Flex alignItems="center" gap={4}>
            <Flex
              alignItems="center"
              justifyContent="center"
              w={8}
              h={8}
              fontSize="sm"
              fontWeight="medium"
              borderRadius="full"
              bg="blue.50"
            >
              {index + 1}
            </Flex>
            <Box>
              <Text fontWeight="medium">{step.name}</Text>
              <Text fontSize="sm" color="gray.500">
                Estimated time: {formatTime(step.estimatedTime)}
              </Text>
            </Box>
          </Flex>

          <Flex gap={2}>
            <Button variant="ghost" p={0} minW={8} h={8}>
              <EditIcon />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" p={0} minW={8} h={8}>
              <DeleteIcon />
              <span className="sr-only">Delete</span>
            </Button>
          </Flex>
        </Flex>
      ))}

      {steps.length === 0 && (
        <Text p={4} textAlign="center" color="gray.500">
          No steps added yet. Use the form below to add steps to this process.
        </Text>
      )}
    </VStack>
  );
}
