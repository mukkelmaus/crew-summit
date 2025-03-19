
import { Flow, FlowNode, FlowEdge, FlowNodeType } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Network, 
  GitBranch, 
  RefreshCw,
  UserCheck,
  Database,
  Filter,
  Download,
  Zap,
  Bot
} from "lucide-react";

export const flowTemplates = [
  {
    id: "sequential-workflow",
    name: "Sequential Workflow",
    description: "A simple linear workflow with sequential execution of tasks",
    icon: <Network className="h-12 w-12 text-primary" />,
    tags: ["beginner", "sequential"],
    nodeCount: 4,
  },
  {
    id: "conditional-branching",
    name: "Conditional Branching",
    description: "A workflow with decision points and multiple execution paths",
    icon: <GitBranch className="h-12 w-12 text-primary" />,
    tags: ["intermediate", "conditional"],
    nodeCount: 5,
  },
  {
    id: "parallel-processing",
    name: "Parallel Processing",
    description: "Execute multiple tasks simultaneously and then combine results",
    icon: <Share2 className="h-12 w-12 text-primary" />,
    tags: ["advanced", "parallel"],
    nodeCount: 6,
  },
  {
    id: "approval-workflow",
    name: "Human Approval Workflow",
    description: "Workflow that requires human approval at critical steps",
    icon: <UserCheck className="h-12 w-12 text-primary" />,
    tags: ["intermediate", "approval"],
    nodeCount: 5,
  },
  {
    id: "data-processing",
    name: "Data Processing Pipeline",
    description: "Extract, transform, and load data in a multi-stage pipeline",
    icon: <Database className="h-12 w-12 text-primary" />,
    tags: ["advanced", "data"],
    nodeCount: 7,
  },
  {
    id: "recurring-task",
    name: "Recurring Task",
    description: "Execute tasks on a schedule with loop control",
    icon: <RefreshCw className="h-12 w-12 text-primary" />,
    tags: ["intermediate", "automation"],
    nodeCount: 3,
  },
];

export function FlowTemplateSelector({ onSelect }: { onSelect: (flow: Flow) => void }) {
  const generateFlowFromTemplate = (templateId: string): Flow => {
    const now = new Date().toISOString();
    const crewId = "default-crew";
    
    switch (templateId) {
      case "sequential-workflow": {
        const nodes: FlowNode[] = [
          {
            id: `node-${uuidv4()}`,
            type: "event",
            label: "Start",
            data: {
              description: "Starting point of the workflow",
            },
            position: { x: 250, y: 50 },
          },
          {
            id: `node-${uuidv4()}`,
            type: "task",
            label: "Process Data",
            data: {
              description: "Process incoming data",
            },
            position: { x: 250, y: 150 },
          },
          {
            id: `node-${uuidv4()}`,
            type: "task",
            label: "Generate Report",
            data: {
              description: "Create a summary report",
            },
            position: { x: 250, y: 250 },
          },
          {
            id: `node-${uuidv4()}`,
            type: "event",
            label: "End",
            data: {
              description: "Workflow completed",
            },
            position: { x: 250, y: 350 },
          },
        ];
        
        // Create edges connecting the nodes sequentially
        const edges: FlowEdge[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push({
            id: `edge-${uuidv4()}`,
            source: nodes[i].id,
            target: nodes[i + 1].id,
          });
        }
        
        return {
          id: uuidv4(),
          name: "Sequential Workflow",
          description: "A simple workflow with sequential steps",
          crewId,
          nodes,
          edges,
          createdAt: now,
          status: "idle",
        };
      }
      
      case "conditional-branching": {
        const startNodeId = `node-${uuidv4()}`;
        const conditionNodeId = `node-${uuidv4()}`;
        const successNodeId = `node-${uuidv4()}`;
        const failureNodeId = `node-${uuidv4()}`;
        const endNodeId = `node-${uuidv4()}`;
        
        const nodes: FlowNode[] = [
          {
            id: startNodeId,
            type: "event",
            label: "Start",
            data: {
              description: "Starting point of the workflow",
            },
            position: { x: 250, y: 50 },
          },
          {
            id: conditionNodeId,
            type: "condition",
            label: "Check Condition",
            data: {
              description: "Evaluate a condition",
              condition: "result > 0",
            },
            position: { x: 250, y: 150 },
          },
          {
            id: successNodeId,
            type: "task",
            label: "Success Path",
            data: {
              description: "Execute when condition is true",
            },
            position: { x: 100, y: 250 },
          },
          {
            id: failureNodeId,
            type: "task",
            label: "Failure Path",
            data: {
              description: "Execute when condition is false",
            },
            position: { x: 400, y: 250 },
          },
          {
            id: endNodeId,
            type: "event",
            label: "End",
            data: {
              description: "Workflow completed",
            },
            position: { x: 250, y: 350 },
          },
        ];
        
        const edges: FlowEdge[] = [
          {
            id: `edge-${uuidv4()}`,
            source: startNodeId,
            target: conditionNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: conditionNodeId,
            target: successNodeId,
            sourceHandle: "true",
            type: "success",
          },
          {
            id: `edge-${uuidv4()}`,
            source: conditionNodeId,
            target: failureNodeId,
            sourceHandle: "false",
            type: "failure",
          },
          {
            id: `edge-${uuidv4()}`,
            source: successNodeId,
            target: endNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: failureNodeId,
            target: endNodeId,
          },
        ];
        
        return {
          id: uuidv4(),
          name: "Conditional Workflow",
          description: "A workflow with conditional branching",
          crewId,
          nodes,
          edges,
          createdAt: now,
          status: "idle",
        };
      }
      
      case "parallel-processing": {
        const startNodeId = `node-${uuidv4()}`;
        const parallelNodeId = `node-${uuidv4()}`;
        const task1NodeId = `node-${uuidv4()}`;
        const task2NodeId = `node-${uuidv4()}`;
        const task3NodeId = `node-${uuidv4()}`;
        const sequenceNodeId = `node-${uuidv4()}`;
        const endNodeId = `node-${uuidv4()}`;
        
        const nodes: FlowNode[] = [
          {
            id: startNodeId,
            type: "event",
            label: "Start",
            data: {
              description: "Starting point of the workflow",
            },
            position: { x: 250, y: 50 },
          },
          {
            id: parallelNodeId,
            type: "parallel",
            label: "Split Tasks",
            data: {
              description: "Execute tasks in parallel",
            },
            position: { x: 250, y: 150 },
          },
          {
            id: task1NodeId,
            type: "task",
            label: "Task 1",
            data: {
              description: "Parallel task 1",
            },
            position: { x: 100, y: 250 },
          },
          {
            id: task2NodeId,
            type: "task",
            label: "Task 2",
            data: {
              description: "Parallel task 2",
            },
            position: { x: 250, y: 250 },
          },
          {
            id: task3NodeId,
            type: "task",
            label: "Task 3",
            data: {
              description: "Parallel task 3",
            },
            position: { x: 400, y: 250 },
          },
          {
            id: sequenceNodeId,
            type: "sequence",
            label: "Combine Results",
            data: {
              description: "Combine results from parallel tasks",
            },
            position: { x: 250, y: 350 },
          },
          {
            id: endNodeId,
            type: "event",
            label: "End",
            data: {
              description: "Workflow completed",
            },
            position: { x: 250, y: 450 },
          },
        ];
        
        const edges: FlowEdge[] = [
          {
            id: `edge-${uuidv4()}`,
            source: startNodeId,
            target: parallelNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: parallelNodeId,
            target: task1NodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: parallelNodeId,
            target: task2NodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: parallelNodeId,
            target: task3NodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: task1NodeId,
            target: sequenceNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: task2NodeId,
            target: sequenceNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: task3NodeId,
            target: sequenceNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: sequenceNodeId,
            target: endNodeId,
          },
        ];
        
        return {
          id: uuidv4(),
          name: "Parallel Processing Workflow",
          description: "A workflow with parallel task execution",
          crewId,
          nodes,
          edges,
          createdAt: now,
          status: "idle",
        };
      }
      
      case "approval-workflow": {
        const startNodeId = `node-${uuidv4()}`;
        const taskNodeId = `node-${uuidv4()}`;
        const approvalNodeId = `node-${uuidv4()}`;
        const successNodeId = `node-${uuidv4()}`;
        const failureNodeId = `node-${uuidv4()}`;
        
        const nodes: FlowNode[] = [
          {
            id: startNodeId,
            type: "event",
            label: "Start",
            data: {
              description: "Starting point of the workflow",
            },
            position: { x: 250, y: 50 },
          },
          {
            id: taskNodeId,
            type: "task",
            label: "Prepare Document",
            data: {
              description: "Create document for approval",
            },
            position: { x: 250, y: 150 },
          },
          {
            id: approvalNodeId,
            type: "human_approval",
            label: "Human Approval",
            data: {
              description: "Requires human approval",
              requiresApproval: true,
              approver: "admin",
            },
            position: { x: 250, y: 250 },
          },
          {
            id: successNodeId,
            type: "task",
            label: "Document Approved",
            data: {
              description: "Process approved document",
            },
            position: { x: 100, y: 350 },
          },
          {
            id: failureNodeId,
            type: "task",
            label: "Document Rejected",
            data: {
              description: "Handle document rejection",
            },
            position: { x: 400, y: 350 },
          },
        ];
        
        const edges: FlowEdge[] = [
          {
            id: `edge-${uuidv4()}`,
            source: startNodeId,
            target: taskNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: taskNodeId,
            target: approvalNodeId,
          },
          {
            id: `edge-${uuidv4()}`,
            source: approvalNodeId,
            target: successNodeId,
            sourceHandle: "approved",
            type: "approval",
          },
          {
            id: `edge-${uuidv4()}`,
            source: approvalNodeId,
            target: failureNodeId,
            sourceHandle: "rejected",
            type: "rejection",
          },
        ];
        
        return {
          id: uuidv4(),
          name: "Approval Workflow",
          description: "A workflow with human approval steps",
          crewId,
          nodes,
          edges,
          createdAt: now,
          status: "idle",
          humanInterventionPoints: [
            {
              nodeId: approvalNodeId,
              type: "approval",
              status: "pending",
            },
          ],
        };
      }
      
      // Create other templates similarly
      default:
        // Return a basic flow template
        return {
          id: uuidv4(),
          name: "Basic Flow",
          description: "A simple workflow template",
          crewId,
          nodes: [
            {
              id: `node-${uuidv4()}`,
              type: "event",
              label: "Start",
              data: {
                description: "Starting point of the workflow",
              },
              position: { x: 250, y: 50 },
            },
            {
              id: `node-${uuidv4()}`,
              type: "task",
              label: "Task",
              data: {
                description: "Sample task",
              },
              position: { x: 250, y: 150 },
            },
          ],
          edges: [
            {
              id: `edge-${uuidv4()}`,
              source: "node-1",
              target: "node-2",
            },
          ],
          createdAt: now,
          status: "idle",
        };
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flowTemplates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  {template.nodeCount} nodes
                </Badge>
              </div>
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-center py-4">
              {template.icon}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => onSelect(generateFlowFromTemplate(template.id))}
            >
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
