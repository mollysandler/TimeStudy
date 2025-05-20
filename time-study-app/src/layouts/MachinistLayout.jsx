import { Box, Flex } from "@chakra-ui/react";
import { MachinistSidebar } from "../components/machinist/machinist-sidebar";
import { Outlet } from "react-router-dom";

export default function MachinistLayout() {
  return (
    <Flex minH="100vh">
      <MachinistSidebar />
      <Box flex="1" p={6}>
        <Outlet />
        <Box>Machinist Content would appear here</Box>
      </Box>
    </Flex>
  );
}
