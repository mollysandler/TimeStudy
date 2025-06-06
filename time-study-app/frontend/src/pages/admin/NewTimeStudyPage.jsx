import React from "react";
import { Button, Card, CardBody, Flex, VStack } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { TimeStudyForm } from "../../components/admin/time-study-form";
import { PageHeader } from "../../components/page-header";
import { Link } from "react-router-dom";

export default function NewTimeStudyPage() {
  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <PageHeader
          title="Create New Time Study"
          description="Set up a new process for time study"
        />
        <Link to="/admin">
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Flex>

      <Card>
        <CardBody pt={6}>
          <TimeStudyForm />
        </CardBody>
      </Card>
    </VStack>
  );
}
