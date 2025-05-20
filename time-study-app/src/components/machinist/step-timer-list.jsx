import { VStack } from "@chakra-ui/react";
import { StepTimer } from "./step-timer";

export function StepTimerList({ steps, isProcessRunning }) {
  return (
    <VStack spacing={4} align="stretch">
      {steps.map((step) => (
        <StepTimer
          key={step.id}
          step={step}
          isProcessRunning={isProcessRunning}
        />
      ))}
    </VStack>
  );
}
