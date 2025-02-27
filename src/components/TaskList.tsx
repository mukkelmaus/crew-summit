
import { useState } from "react";
import { Task } from "@/lib/types";
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
import { Clock, CheckCircle, XCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TaskListProps {
  tasks: Task[];
  agentMap?: Record<string, string>;
}

export default function TaskList({ tasks, agentMap = {} }: TaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  if (!tasks.length) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12 opacity-20" />}
        title="No tasks yet"
        description="This crew doesn't have any tasks. Add a task to get started."
        action={
          <Button size="sm" variant="outline">
            Add Task
          </Button>
        }
      />
    );
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="overflow-hidden border rounded-md subtle-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="transition-colors hover:bg-muted/40"
            >
              <TableCell className="font-medium">{task.description}</TableCell>
              <TableCell>{agentMap[task.assignedTo] || task.assignedTo}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(task.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
