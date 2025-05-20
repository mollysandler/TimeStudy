import { Box, Flex } from "@chakra-ui/react";
import { AdminSidebar } from "../components/admin/admin-sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <Flex minH="100vh">
      <AdminSidebar />
      <Box flex="1" p={6}>
        <Outlet />
      </Box>
    </Flex>
  );
}
