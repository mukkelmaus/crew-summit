
import React from "react";
import { Flow } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FlowLogger from "@/components/FlowLogger";

interface FlowLogsTabProps {
  flow: Flow;
}

export function FlowLogsTab({ flow }: FlowLogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
        <CardDescription>
          View detailed logs of flow execution and node operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FlowLogger flow={flow} />
      </CardContent>
    </Card>
  );
}
