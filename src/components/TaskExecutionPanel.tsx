
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Task, TaskStatus } from "@/lib/types";
import { TaskService } from "@/services/api";

interface TaskExecutionPanelProps {
  taskId: string;
}

export function TaskExecutionPanel({ taskId }: TaskExecutionPanelProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      try {
        const taskData = await TaskService.getTask(taskId);
        setTask(taskData);
        
        // Simulate progress based on status
        switch(taskData.status) {
          case "pending":
            setProgress(0);
            break;
          case "in_progress":
            setProgress(50);
            setExecuting(true);
            break;
          case "completed":
            setProgress(100);
            break;
          case "failed":
            setProgress(100);
            break;
          default:
            setProgress(0);
        }
        
        // Simulate logs for demo
        if (taskData.status !== "pending") {
          setLogs([
            "Initializing task...",
            "Loading required tools...",
            "Connecting to language model...",
            taskData.status === "completed" 
              ? "Task completed successfully!"
              : taskData.status === "failed"
                ? "Error: Task execution failed."
                : "Executing task..."
          ]);
        }
      } catch (error) {
        console.error("Failed to load task:", error);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
    
    loadTask();
  }, [taskId]);

  // Execute task
  const handleExecute = async () => {
    if (!task) return;
    
    setExecuting(true);
    setProgress(0);
    
    // Update task status
    try {
      const updatedTask = await TaskService.updateTask(task.id, { 
        status: "in_progress" 
      });
      setTask(updatedTask);
      
      // Simulate task execution with progress
      setLogs([...logs, "Initializing task execution..."]);
      
      // Simulate progress updates
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        
        if (currentProgress === 30) {
          setLogs(prev => [...prev, "Loading required data..."]);
        }
        
        if (currentProgress === 50) {
          setLogs(prev => [...prev, "Processing information..."]);
        }
        
        if (currentProgress === 70) {
          setLogs(prev => [...prev, "Generating results..."]);
        }
        
        if (currentProgress === 90) {
          setLogs(prev => [...prev, "Finalizing output..."]);
        }
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setLogs(prev => [...prev, "Task completed successfully!"]);
          
          // Update task as completed
          TaskService.updateTask(task.id, {
            status: "completed",
            completedAt: new Date().toISOString(),
            output: "Task execution completed. Generated output for the requested task."
          }).then(completedTask => {
            setTask(completedTask);
            toast.success("Task completed successfully");
          });
          
          setExecuting(false);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Failed to execute task:", error);
      toast.error("Failed to execute task");
      setExecuting(false);
    }
  };

  // Pause execution
  const handlePause = async () => {
    if (!task) return;
    
    try {
      setExecuting(false);
      setLogs(prev => [...prev, "Task execution paused."]);
      toast.info("Task execution paused");
    } catch (error) {
      console.error("Failed to pause task:", error);
      toast.error("Failed to pause task");
    }
  };

  // Reset task
  const handleReset = async () => {
    if (!task) return;
    
    try {
      const resetTask = await TaskService.updateTask(task.id, {
        status: "pending",
        output: null,
        completedAt: null
      });
      
      setTask(resetTask);
      setProgress(0);
      setExecuting(false);
      setLogs([]);
      toast.info("Task has been reset");
    } catch (error) {
      console.error("Failed to reset task:", error);
      toast.error("Failed to reset task");
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><Play className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "completed":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "awaiting_approval":
        return <Badge><Clock className="h-3 w-3 mr-1" /> Awaiting Approval</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Task...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Progress value={undefined} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Task Not Found</CardTitle>
          <CardDescription>The requested task could not be found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>{task.description}</CardTitle>
            <CardDescription>Assigned to Agent ID: {task.assignedTo}</CardDescription>
          </div>
          <div>{getStatusBadge(task.status)}</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Execution Progress</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {progress === 100 
              ? task.status === "completed" 
                ? "Completed" 
                : "Failed" 
              : `${progress}% complete`}
          </p>
        </div>
        
        {logs.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Execution Logs</p>
              <ScrollArea className="h-32 rounded-md border p-2">
                {logs.map((log, index) => (
                  <p key={index} className="text-xs mb-1">
                    <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span> {log}
                  </p>
                ))}
              </ScrollArea>
            </div>
          </>
        )}
        
        {task.output && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Task Output</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{task.output}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Created: {new Date(task.createdAt).toLocaleString()}
          {task.completedAt && (
            <span className="ml-4">
              Completed: {new Date(task.completedAt).toLocaleString()}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {(task.status === "pending" || task.status === "awaiting_approval") && (
            <Button onClick={handleExecute} disabled={executing}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          )}
          
          {task.status === "in_progress" && (
            <Button onClick={handlePause} variant="outline" disabled={!executing}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {(task.status === "completed" || task.status === "failed") && (
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
