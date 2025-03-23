
import React from "react";
import { Flow } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FlowEventTriggers from "@/components/FlowEventTriggers";

interface FlowTriggersTabProps {
  flow: Flow;
  onFlowUpdate: (flow: Flow) => void;
}

export function FlowTriggersTab({ flow, onFlowUpdate }: FlowTriggersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Triggers</CardTitle>
        <CardDescription>
          Configure events that will automatically trigger this flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FlowEventTriggers 
          flow={flow} 
          onFlowUpdate={onFlowUpdate} 
        />
      </CardContent>
    </Card>
  );
}
