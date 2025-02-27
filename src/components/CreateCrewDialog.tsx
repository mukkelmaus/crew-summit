
import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentRoles, llmOptions, toolOptions } from "@/lib/data";
import { Plus, X, UserPlus, Brain, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AgentSchema = z.object({
  name: z.string().min(2, {
    message: "Agent name must be at least 2 characters.",
  }),
  role: z.string(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  llm: z.string(),
  tools: z.array(z.string()).min(1, {
    message: "Select at least one tool.",
  }),
});

const TaskSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  assignedTo: z.string().optional(),
});

const CrewSchema = z.object({
  name: z.string().min(2, {
    message: "Crew name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  taskExecutionStrategy: z.enum(["sequential", "parallel"]),
  maxIterations: z.coerce.number().int().min(1).max(100),
  verbose: z.boolean().default(true),
});

export default function CreateCrewDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("crew");
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const { toast } = useToast();

  const crewForm = useForm<z.infer<typeof CrewSchema>>({
    resolver: zodResolver(CrewSchema),
    defaultValues: {
      name: "",
      description: "",
      taskExecutionStrategy: "sequential",
      maxIterations: 5,
      verbose: true,
    },
  });

  const agentForm = useForm<z.infer<typeof AgentSchema>>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      name: "",
      role: "researcher",
      description: "",
      llm: "gpt-4",
      tools: [],
    },
  });

  const taskForm = useForm<z.infer<typeof TaskSchema>>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      description: "",
      assignedTo: "",
    },
  });

  const handleAgentRoleChange = (value: string) => {
    if (value in agentRoles) {
      agentForm.setValue("description", agentRoles[value as keyof typeof agentRoles]);
    }
  };

  const onSubmitAgent = (data: z.infer<typeof AgentSchema>) => {
    setAgents([...agents, { ...data, id: `agent-${Date.now()}` }]);
    setSelectedTools([]);
    agentForm.reset();
  };

  const onSubmitTask = (data: z.infer<typeof TaskSchema>) => {
    setTasks([...tasks, { ...data, id: `task-${Date.now()}` }]);
    taskForm.reset();
  };

  const onSubmitCrew = (data: z.infer<typeof CrewSchema>) => {
    if (agents.length === 0) {
      toast({
        title: "Cannot create crew",
        description: "Add at least one agent to your crew.",
        variant: "destructive",
      });
      setActiveTab("agents");
      return;
    }

    const newCrew = {
      ...data,
      agents,
      tasks,
      id: `crew-${Date.now()}`,
      status: "idle",
      createdAt: new Date().toISOString(),
      config: {
        verbose: data.verbose,
        maxIterations: data.maxIterations,
        taskExecutionStrategy: data.taskExecutionStrategy,
      },
    };

    toast({
      title: "Crew created successfully",
      description: `${data.name} crew is ready to run.`,
    });

    console.log("New crew created:", newCrew);
    setOpen(false);
    resetForms();
  };

  const resetForms = () => {
    crewForm.reset();
    agentForm.reset();
    taskForm.reset();
    setAgents([]);
    setTasks([]);
    setSelectedTools([]);
    setActiveTab("crew");
  };

  const addTool = (tool: string) => {
    const currentTools = agentForm.getValues("tools") || [];
    if (!currentTools.includes(tool)) {
      setSelectedTools([...currentTools, tool]);
      agentForm.setValue("tools", [...currentTools, tool]);
    }
  };

  const removeTool = (tool: string) => {
    const currentTools = agentForm.getValues("tools") || [];
    const updatedTools = currentTools.filter((t) => t !== tool);
    setSelectedTools(updatedTools);
    agentForm.setValue("tools", updatedTools);
  };

  const removeAgent = (id: string) => {
    setAgents(agents.filter((agent) => agent.id !== id));
    // Also update tasks that were assigned to this agent
    setTasks(
      tasks.map((task) =>
        task.assignedTo === id ? { ...task, assignedTo: "" } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForms();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Crew
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a New Crew</DialogTitle>
          <DialogDescription>
            Configure your crew with agents and tasks to automate workflows.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="crew" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Crew Details
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <Workflow className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="crew" className="p-1">
              <Form {...crewForm}>
                <form className="space-y-6">
                  <FormField
                    control={crewForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crew Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Content Creation Team" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your crew and its purpose.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={crewForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this crew does..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the crew's purpose and capabilities.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={crewForm.control}
                      name="taskExecutionStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Execution Strategy</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sequential">Sequential</SelectItem>
                              <SelectItem value="parallel">Parallel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How tasks will be executed by the crew.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={crewForm.control}
                      name="maxIterations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Iterations</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of iterations for the crew.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6 p-1">
              <div className="space-y-6">
                {agents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Added Agents</h3>
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-3 border rounded-md subtle-border"
                        >
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {agent.description}
                            </div>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {agent.role}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {agent.llm}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => removeAgent(agent.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                <Form {...agentForm}>
                  <form onSubmit={agentForm.handleSubmit(onSubmitAgent)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={agentForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Research Specialist" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agentForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleAgentRoleChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.keys(agentRoles).map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={agentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe this agent's capabilities..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={agentForm.control}
                      name="llm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language Model</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select LLM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {llmOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={agentForm.control}
                      name="tools"
                      render={() => (
                        <FormItem>
                          <FormLabel>Tools</FormLabel>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {toolOptions.map((tool) => (
                                <Badge
                                  key={tool.value}
                                  variant={
                                    selectedTools.includes(tool.value) ? "default" : "outline"
                                  }
                                  className="cursor-pointer"
                                  onClick={() => {
                                    if (selectedTools.includes(tool.value)) {
                                      removeTool(tool.value);
                                    } else {
                                      addTool(tool.value);
                                    }
                                  }}
                                >
                                  {tool.label}
                                  {selectedTools.includes(tool.value) && (
                                    <X className="ml-1 h-3 w-3" />
                                  )}
                                </Badge>
                              ))}
                            </div>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Add Agent
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 p-1">
              <div className="space-y-6">
                {tasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Added Tasks</h3>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 border rounded-md subtle-border"
                        >
                          <div>
                            <div className="font-medium">{task.description}</div>
                            {task.assignedTo && (
                              <div className="text-sm text-muted-foreground">
                                Assigned to:{" "}
                                {agents.find((a) => a.id === task.assignedTo)
                                  ?.name || "Unknown Agent"}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => removeTask(task.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                <Form {...taskForm}>
                  <form
                    onSubmit={taskForm.handleSubmit(onSubmitTask)}
                    className="space-y-4"
                  >
                    <FormField
                      control={taskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what needs to be done..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taskForm.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            You can leave this empty to assign tasks later or let CrewAI
                            decide.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Add Task
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={crewForm.handleSubmit(onSubmitCrew)}>
            Create Crew
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
