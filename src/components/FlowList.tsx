
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
import { Play, CheckCircle, XCircle, Clock, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FlowEditor from "./FlowEditor";

interface FlowListProps {
  flows: Flow[];
  crewId: string;
  onRunFlow?: (flow: Flow) => void;
}

export default function FlowList({ flows, crewId, onRunFlow }: FlowListProps) {
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [editMode, setEditMode] = useState(false);

  if (!flows.length) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12 opacity-20" />}
        title="No flows yet"
        description="Create your first workflow to automate task execution in this crew."
        action={
          <Button size="sm" variant="outline">
            Create Flow
          </Button>
        }
      />
    );
  }

  const getStatusIcon = (status: Flow["status"]) => {
    switch (status) {
      case "idle":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
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

  const handleRunFlow = (flow: Flow) => {
    if (onRunFlow) {
      onRunFlow(flow);
    }
  };

  return (
    <>
      <div className="overflow-hidden border rounded-md subtle-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flows.map((flow) => (
              <TableRow
                key={flow.id}
                className="transition-colors hover:bg-muted/40"
              >
                <TableCell className="font-medium">{flow.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{flow.description}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(flow.status)}>
                    {getStatusIcon(flow.status)}
                    <span className="ml-1 capitalize">{flow.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(flow.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {flow.lastRun 
                    ? format(new Date(flow.lastRun), "MMM d, yyyy") 
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedFlow(flow);
                        setEditMode(false);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedFlow(flow);
                        setEditMode(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRunFlow(flow)}
                      disabled={flow.status === 'running'}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
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
              <DialogTitle>
                {editMode ? "Edit Flow" : "View Flow"}: {selectedFlow.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <FlowEditor 
                flow={selectedFlow} 
                readOnly={!editMode}
                onRun={editMode ? handleRunFlow : undefined}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
