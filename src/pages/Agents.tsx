
import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentCard } from "@/components/AgentCard";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { Agent, AgentRole } from "@/lib/types";
import { AgentService } from "@/services/api";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadAgents = async () => {
    setLoading(true);
    try {
      const agentData = await AgentService.getAgents();
      setAgents(agentData);
      setFilteredAgents(agentData);
    } catch (error) {
      console.error("Failed to load agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    // Apply filters whenever the filter criteria change
    let result = [...agents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        agent => 
          agent.name.toLowerCase().includes(query) || 
          agent.description.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(agent => agent.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(agent => agent.status === statusFilter);
    }
    
    setFilteredAgents(result);
  }, [agents, searchQuery, roleFilter, statusFilter]);

  const handleAgentDelete = async (id: string) => {
    try {
      await AgentService.deleteAgent(id);
      toast.success("Agent deleted successfully");
      loadAgents();
    } catch (error) {
      console.error("Failed to delete agent:", error);
      toast.error("Failed to delete agent");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Create and manage AI agents with specific roles and capabilities.
          </p>
        </div>
        <CreateAgentDialog onAgentCreated={loadAgents} />
      </div>
      
      <Separator />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>
            Find agents by name, role, or status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-10">Loading agents...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">No agents found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {agents.length === 0
                ? "Create your first agent to get started."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
          </div>
          {agents.length === 0 && (
            <Button onClick={() => document.querySelector<HTMLButtonElement>("button:has(.mr-2)")?.click()}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={() => handleAgentDelete(agent.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
