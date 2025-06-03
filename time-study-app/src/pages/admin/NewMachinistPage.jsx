import { Button, Card, CardBody, Flex, VStack } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { MachinistForm } from "../../components/admin/machinist-form";
import { PageHeader } from "../../components/page-header";
import { Link } from "react-router-dom";

export default function NewMachinistPage() {
  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <PageHeader title="Add New Employee" description="Add new employees" />
        <Link to="/admin">
          <Button leftIcon={<ArrowBackIcon />} variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </Flex>

      <Card>
        <CardBody pt={6}>
          <MachinistForm />
        </CardBody>
      </Card>
    </VStack>
  );
}
