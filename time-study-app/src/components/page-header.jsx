import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeader({ title, description }) {
  return (
    <Box mb={4}>
      <Heading as="h1" size="xl" mb={1}>
        {title}
      </Heading>
      {description && <Text color="gray.500">{description}</Text>}
    </Box>
  );
}
