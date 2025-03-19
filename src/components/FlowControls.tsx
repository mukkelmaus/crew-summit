
import { useState } from "react";
import { Flow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  RefreshCw,
  AlertTriangle,
  ClipboardCopy,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveFlow } from "@/lib/localDatabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FlowControlsProps {
  flow: Flow;
  onStatusChange?: (flow: Flow) => void;
}

export default function FlowControls({ flow, onStatusChange }: FlowControlsProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleStart = async () => {
    if (flow.status === "running") {
      toast({
        title: "Flow already running",
        description: "This flow is already in progress",
      });
      return;
    }
    
    const updatedFlow: Flow = {
      ...flow,
      status: "running",
      lastRun: new Date().toISOString(),
    };
    
    try {
      await saveFlow(updatedFlow);
      if (onStatusChange) {
        onStatusChange(updatedFlow);
      }
      
      toast({
        title: "Flow started",
        description: `${flow.name} is now running`,
      });
    } catch (error) {
      console.error("Error starting flow:", error);
      toast({
        title: "Error starting flow",
        description: "Could not start the flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePause = async () => {
    if (flow.status !== "running") {
      toast({
        title: "Cannot pause",
        description: "Only running flows can be paused",
        variant: "destructive",
      });
      return;
    }
    
    const updatedFlow: Flow = {
      ...flow,
      status: "idle", // We use idle for paused state as well
    };
    
    try {
      await saveFlow(updatedFlow);
      if (onStatusChange) {
        onStatusChange(updatedFlow);
      }
      
      toast({
        title: "Flow paused",
        description: `${flow.name} has been paused`,
      });
    } catch (error) {
      console.error("Error pausing flow:", error);
      toast({
        title: "Error pausing flow",
        description: "Could not pause the flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStop = async () => {
    if (flow.status !== "running") {
      toast({
        title: "Cannot stop",
        description: "Only running flows can be stopped",
        variant: "destructive",
      });
      return;
    }
    
    const updatedFlow: Flow = {
      ...flow,
      status: "completed",
    };
    
    try {
      await saveFlow(updatedFlow);
      if (onStatusChange) {
        onStatusChange(updatedFlow);
      }
      
      toast({
        title: "Flow stopped",
        description: `${flow.name} has been stopped`,
      });
    } catch (error) {
      console.error("Error stopping flow:", error);
      toast({
        title: "Error stopping flow",
        description: "Could not stop the flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (flow.status === "running") {
      toast({
        title: "Cannot reset",
        description: "Please stop the flow before resetting",
        variant: "destructive",
      });
      return;
    }
    
    const updatedFlow: Flow = {
      ...flow,
      status: "idle",
    };
    
    try {
      await saveFlow(updatedFlow);
      if (onStatusChange) {
        onStatusChange(updatedFlow);
      }
      
      toast({
        title: "Flow reset",
        description: `${flow.name} has been reset to idle state`,
      });
    } catch (error) {
      console.error("Error resetting flow:", error);
      toast({
        title: "Error resetting flow",
        description: "Could not reset the flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = () => {
    navigator.clipboard.writeText(JSON.stringify(flow, null, 2));
    
    toast({
      title: "Flow configuration copied",
      description: "Flow configuration has been copied to clipboard",
    });
  };

  const isRunning = flow.status === "running";
  const hasErrors = flow.status === "error";

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant={isRunning ? "secondary" : "default"}
          size="sm"
          onClick={handleStart}
          disabled={isRunning}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isRunning ? "Running..." : "Start"}
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handlePause}
          disabled={!isRunning}
        >
          <PauseCircle className="h-4 w-4 mr-2" />
          Pause
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={!isRunning}
        >
          <StopCircle className="h-4 w-4 mr-2" />
          Stop
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isRunning || flow.status === "idle"}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        {hasErrors && (
          <Button 
            variant="destructive"
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Errors
          </Button>
        )}
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the flow "{flow.name}" and all its execution history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                toast({
                  title: "Flow deleted",
                  description: `${flow.name} has been deleted`,
                });
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
