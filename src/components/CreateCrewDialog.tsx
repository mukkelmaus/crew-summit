
import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Agent } from "@/lib/types";
import { AgentService, CrewService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const crewFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  agentIds: z.array(z.string()).min(1, { message: "Select at least one agent." }),
  config: z.object({
    verbose: z.boolean().default(true),
    maxIterations: z.number().int().min(1).max(100),
    taskExecutionStrategy: z.enum(["sequential", "parallel"])
  })
});

type CrewFormValues = z.infer<typeof crewFormSchema>;

interface CreateCrewDialogProps {
  onCrewCreated?: () => void;
}

export default function CreateCrewDialog({ onCrewCreated }: CreateCrewDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<CrewFormValues>({
    resolver: zodResolver(crewFormSchema),
    defaultValues: {
      name: "",
      description: "",
      agentIds: [],
      config: {
        verbose: true,
        maxIterations: 5,
        taskExecutionStrategy: "sequential"
      }
    },
  });

  useEffect(() => {
    if (open) {
      loadAgents();
    }
  }, [open]);

  const loadAgents = async () => {
    try {
      setLoadingAgents(true);
      const loadedAgents = await AgentService.getAgents();
      setAgents(loadedAgents);
    } catch (error) {
      console.error("Failed to load agents:", error);
      toast({
        title: "Error",
        description: "Failed to load available agents.",
        variant: "destructive",
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const onSubmit = async (values: CrewFormValues) => {
    setLoading(true);
    try {
      const crewData = {
        name: values.name,
        description: values.description,
        agents: agents.filter(a => values.agentIds.includes(a.id)),
        tasks: [],
        config: {
          verbose: values.config.verbose,
          maxIterations: values.config.maxIterations,
          taskExecutionStrategy: values.config.taskExecutionStrategy
        }
      };
      
      await CrewService.createCrew(crewData);
      setOpen(false);
      form.reset();
      toast({
        title: "Crew created",
        description: "The crew has been successfully created.",
      });
      
      if (onCrewCreated) onCrewCreated();
    } catch (error) {
      console.error("Failed to create crew:", error);
      toast({
        title: "Error",
        description: "Failed to create crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    const currentAgentIds = form.getValues("agentIds");
    if (currentAgentIds.includes(agentId)) {
      form.setValue(
        "agentIds",
        currentAgentIds.filter((id) => id !== agentId)
      );
    } else {
      form.setValue("agentIds", [...currentAgentIds, agentId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="create-crew-button">
          <Plus className="mr-2 h-4 w-4" />
          Create Crew
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Crew</DialogTitle>
          <DialogDescription>
            Create a new crew of AI agents to work together on tasks.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crew Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Research Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose of this crew..." 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <FormLabel>Configuration</FormLabel>
                  
                  <FormField
                    control={form.control}
                    name="config.verbose"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Verbose Mode</FormLabel>
                          <FormDescription>
                            Enable detailed logging of crew operations
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="config.maxIterations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Iterations</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of iterations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="config.taskExecutionStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Execution Strategy</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sequential">Sequential</SelectItem>
                              <SelectItem value="parallel">Parallel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How tasks are executed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="agentIds"
                render={() => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Agents</FormLabel>
                    <FormDescription>
                      Choose agents to include in this crew
                    </FormDescription>
                    <FormMessage />
                    
                    {loadingAgents ? (
                      <div className="flex items-center justify-center h-[300px] border rounded-md p-2">
                        <p className="text-muted-foreground">Loading agents...</p>
                      </div>
                    ) : agents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] border rounded-md p-4">
                        <p className="text-muted-foreground mb-4">No agents available</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpen(false)}
                        >
                          Create Agents First
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] border rounded-md p-2">
                        <div className="space-y-2">
                          {agents.map((agent) => {
                            const isSelected = form.watch("agentIds").includes(agent.id);
                            return (
                              <div
                                key={agent.id}
                                className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                                  isSelected ? "bg-muted" : ""
                                }`}
                                onClick={() => toggleAgentSelection(agent.id)}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                  isSelected 
                                    ? "bg-primary border-primary text-primary-foreground" 
                                    : "border-input"
                                }`}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{agent.name}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-2">
                                    {agent.description}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {agent.role}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {agent.llm}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingAgents}>
                {loading ? "Creating..." : "Create Crew"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
