import React from "react";
import { VStack } from "@chakra-ui/react";
import { AssignmentList } from "../../components/machinist/assignment-list";
import { PageHeader } from "../../components/page-header";

export default function MachinistDashboard() {
  return (
    <VStack spacing={6} align="stretch">
      <PageHeader
        title="Machinist Dashboard"
        description="View your assigned time studies and track process times"
      />
      <AssignmentList />
    </VStack>
  );
}
