
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
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AgentService } from "@/services/api";
import { AgentRole } from "@/lib/types";

// Form validation schema
const agentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.enum(["researcher", "writer", "analyst", "designer", "developer", "reviewer", "custom"] as const),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  llm: z.string().min(1, { message: "Please select an LLM model." }),
  tools: z.array(z.string()).min(1, { message: "Select at least one tool." }),
  memory: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const llmOptions = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "llama-3", label: "Llama 3" },
  { value: "mistral-large", label: "Mistral Large" },
];

const toolOptions = [
  { value: "web-search", label: "Web Search" },
  { value: "document-analysis", label: "Document Analysis" },
  { value: "code-interpreter", label: "Code Interpreter" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "text-generation", label: "Text Generation" },
  { value: "image-generation", label: "Image Generation" },
  { value: "text-to-speech", label: "Text to Speech" },
  { value: "speech-to-text", label: "Speech to Text" },
];

const memoryOptions = [
  { value: "", label: "None" },
  { value: "short-term", label: "Short-term Memory" },
  { value: "long-term", label: "Long-term Memory" },
  { value: "episodic", label: "Episodic Memory" },
];

interface CreateAgentDialogProps {
  onAgentCreated?: () => void;
}

export function CreateAgentDialog({ onAgentCreated }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      role: "researcher",
      description: "",
      llm: "gpt-4",
      tools: ["web-search"],
      memory: "",
    },
  });

  const onSubmit = async (values: AgentFormValues) => {
    setLoading(true);
    try {
      // Ensure all required fields are present
      const agentData = {
        name: values.name,
        role: values.role,
        description: values.description,
        llm: values.llm,
        tools: values.tools,
        memory: values.memory
      };
      
      await AgentService.createAgent(agentData);
      setOpen(false);
      form.reset();
      toast.success("Agent created successfully");
      if (onAgentCreated) onAgentCreated();
    } catch (error) {
      toast.error("Failed to create agent");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolSelection = (toolValue: string) => {
    const currentTools = form.getValues("tools");
    if (currentTools.includes(toolValue)) {
      form.setValue(
        "tools",
        currentTools.filter((t) => t !== toolValue)
      );
    } else {
      form.setValue("tools", [...currentTools, toolValue]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Configure a new AI agent with specific capabilities and tools.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Research Assistant" {...field} />
                  </FormControl>
                  <FormDescription>A unique name for your agent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The primary role of this agent.</FormDescription>
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
                      placeholder="Performs web research and collects information from various sources." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Describe what this agent does.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="llm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an LLM" />
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
                  <FormDescription>
                    The language model that powers this agent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tools"
              render={() => (
                <FormItem>
                  <FormLabel>Tools</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {toolOptions.map((tool) => {
                      const isSelected = form.watch("tools").includes(tool.value);
                      return (
                        <Button
                          key={tool.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToolSelection(tool.value)}
                          className="flex items-center"
                        >
                          {tool.label}
                          {isSelected && <X className="ml-2 h-3 w-3" />}
                        </Button>
                      );
                    })}
                  </div>
                  <FormDescription>
                    Select tools that this agent can use.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="memory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memory Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select memory type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {memoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optional: Choose a memory type for this agent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
