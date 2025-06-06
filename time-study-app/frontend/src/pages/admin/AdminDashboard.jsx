import React from "react";
import { VStack } from "@chakra-ui/react";
import { TimeStudyList } from "../../components/admin/time-study-list";
import { PageHeader } from "../../components/page-header";

export default function AdminDashboard() {
  return (
    <VStack spacing={6} align="stretch">
      <PageHeader
        title="Admin Dashboard"
        description="Manage time studies, processes, and assignments"
      />
      <TimeStudyList />
    </VStack>
  );
}
