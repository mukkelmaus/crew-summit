
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TaskService } from "@/services/api";
import { Agent } from "@/lib/types";

// Form validation schema
const taskFormSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  assignedTo: z.string().min(1, { message: "Please select an agent." }),
  requiresApproval: z.boolean().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateTaskDialogProps {
  agents: Agent[];
  crewId?: string;
  onTaskCreated?: () => void;
}

export function CreateTaskDialog({ agents, crewId, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: "",
      assignedTo: "",
      requiresApproval: false,
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    setLoading(true);
    try {
      const taskData = {
        description: values.description,
        assignedTo: values.assignedTo,
        requiresApproval: values.requiresApproval,
      };
      
      await TaskService.createTask(taskData);
      setOpen(false);
      form.reset();
      toast.success("Task created successfully");
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task and assign it to an agent.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what the agent should do..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific about what you want the agent to accomplish.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The agent responsible for completing this task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requiresApproval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Approval</FormLabel>
                    <FormDescription>
                      Task output will require human approval before being considered complete.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskDialog;
