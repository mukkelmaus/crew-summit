
import React from "react";
import { Flow } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FlowMonitoringTabProps {
  flow: Flow;
}

export function FlowMonitoringTab({ flow }: FlowMonitoringTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flow Monitoring</CardTitle>
        <CardDescription>
          Track the status and performance of your flow in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Flow Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-3 rounded-md">
                <span className="text-sm font-medium">Current Status</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  flow.status === "running" 
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30" 
                    : flow.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30"
                      : flow.status === "error"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30"
                }`}>
                  {flow.status.toUpperCase()}
                </div>
              </div>
              
              <div className="flex items-center justify-between border p-3 rounded-md">
                <span className="text-sm font-medium">Last Run</span>
                <span className="text-sm">
                  {flow.lastRun 
                    ? new Date(flow.lastRun).toLocaleString() 
                    : "Never"}
                </span>
              </div>
              
              <div className="flex items-center justify-between border p-3 rounded-md">
                <span className="text-sm font-medium">Node Count</span>
                <span className="text-sm">{flow.nodes.length} nodes</span>
              </div>
              
              <div className="flex items-center justify-between border p-3 rounded-md">
                <span className="text-sm font-medium">Edge Count</span>
                <span className="text-sm">{flow.edges.length} connections</span>
              </div>
              
              <div className="flex items-center justify-between border p-3 rounded-md">
                <span className="text-sm font-medium">Human Interventions</span>
                <span className="text-sm">
                  {flow.humanInterventionPoints?.length || 0} points
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Active Nodes</h3>
            <div className="space-y-3">
              {flow.nodes.length > 0 ? (
                flow.nodes.map((node) => (
                  <div key={node.id} className="border p-3 rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{node.label}</div>
                      <div className="text-xs text-muted-foreground">{node.type}</div>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${
                      flow.status === "running" 
                        ? "bg-blue-500 animate-pulse" 
                        : flow.status === "completed"
                          ? "bg-green-500"
                          : flow.status === "error"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                    }`} />
                  </div>
                ))
              ) : (
                <div className="border p-3 rounded-md text-center">
                  <p className="text-muted-foreground">No nodes defined</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
