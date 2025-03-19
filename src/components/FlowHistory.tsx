
import { useState } from "react";
import { Flow } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, XCircle, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FlowHistoryProps {
  flows: Flow[];
}

export default function FlowHistory({ flows }: FlowHistoryProps) {
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  
  // Sort flows by lastRun date (most recent first)
  const sortedFlows = [...flows]
    .filter(flow => flow.lastRun)
    .sort((a, b) => {
      const dateA = a.lastRun ? new Date(a.lastRun).getTime() : 0;
      const dateB = b.lastRun ? new Date(b.lastRun).getTime() : 0;
      return dateB - dateA;
    });

  const getStatusIcon = (status: Flow["status"]) => {
    switch (status) {
      case "idle":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Flow["status"]) => {
    switch (status) {
      case "idle":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "";
    }
  };

  // Helper function to create sample execution logs for demonstration
  const generateSampleLogs = (flow: Flow) => {
    const logs = [];
    const startTime = flow.lastRun ? new Date(flow.lastRun) : new Date();
    
    // Starting log
    logs.push({
      timestamp: startTime.toISOString(),
      level: "info",
      message: `Flow "${flow.name}" started execution`
    });
    
    // Node execution logs
    flow.nodes.forEach((node, index) => {
      const nodeTime = new Date(startTime.getTime() + (index + 1) * 1000);
      logs.push({
        timestamp: nodeTime.toISOString(),
        level: "info",
        message: `Executing node "${node.label}" (${node.type})`
      });
      
      // Add random success/error for demonstration
      const outcome = Math.random() > 0.2 ? "success" : "error";
      const outcomeTime = new Date(nodeTime.getTime() + 2000);
      logs.push({
        timestamp: outcomeTime.toISOString(),
        level: outcome,
        message: outcome === "success" 
          ? `Node "${node.label}" executed successfully` 
          : `Error executing node "${node.label}": Sample error message`
      });
    });
    
    // Final log
    const endTime = new Date(startTime.getTime() + (flow.nodes.length + 2) * 3000);
    logs.push({
      timestamp: endTime.toISOString(),
      level: flow.status === "completed" ? "info" : "error",
      message: flow.status === "completed"
        ? `Flow "${flow.name}" completed successfully`
        : `Flow "${flow.name}" failed with errors`
    });
    
    return logs;
  };

  if (sortedFlows.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No execution history</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Run some flows to see their execution history here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flow Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Nodes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFlows.map((flow) => (
              <TableRow key={`${flow.id}-${flow.lastRun}`}>
                <TableCell className="font-medium">{flow.name}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(flow.status)}>
                    {getStatusIcon(flow.status)}
                    <span className="ml-1">{flow.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {flow.lastRun ? format(new Date(flow.lastRun), "MMM d, yyyy HH:mm:ss") : "Never"}
                </TableCell>
                <TableCell>
                  {flow.status !== "running" ? "2m 34s" : "Running..."}
                </TableCell>
                <TableCell>
                  {flow.nodes.length} nodes
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFlow(flow)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedFlow && (
        <Dialog open={!!selectedFlow} onOpenChange={() => setSelectedFlow(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Execution Details: {selectedFlow.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedFlow.status)}>
                    {getStatusIcon(selectedFlow.status)}
                    <span className="ml-1">{selectedFlow.status}</span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Started At</p>
                  <p className="text-sm">
                    {selectedFlow.lastRun 
                      ? format(new Date(selectedFlow.lastRun), "MMM d, yyyy HH:mm:ss") 
                      : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nodes</p>
                  <p className="text-sm">{selectedFlow.nodes.length} nodes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-sm">
                    {selectedFlow.status !== "running" ? "2m 34s" : "Running..."}
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="nodes">
                  <AccordionTrigger>Node Execution</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {selectedFlow.nodes.map((node) => (
                        <div key={node.id} className="border p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{node.type}</Badge>
                              <span className="font-medium">{node.label}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                          {node.data.description && (
                            <p className="text-sm text-muted-foreground mt-2">{node.data.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="logs">
                  <AccordionTrigger>Execution Logs</AccordionTrigger>
                  <AccordionContent>
                    <div className="h-[300px] overflow-y-auto border rounded-md p-2 font-mono text-xs">
                      {generateSampleLogs(selectedFlow).map((log, index) => (
                        <div 
                          key={index}
                          className={`py-1 px-2 border-b ${
                            log.level === "error" 
                              ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300" 
                              : log.level === "success"
                                ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : ""
                          }`}
                        >
                          <span className="text-gray-500 mr-2">
                            [{format(new Date(log.timestamp), "HH:mm:ss.SSS")}]
                          </span>
                          <span className={`${
                            log.level === "error" 
                              ? "text-red-700 dark:text-red-300" 
                              : log.level === "success" || log.level === "info"
                                ? "text-green-700 dark:text-green-300"
                                : ""
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
