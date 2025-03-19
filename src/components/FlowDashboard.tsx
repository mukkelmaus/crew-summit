
import { useState } from "react";
import { Flow, FlowNodeType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import FlowList from "./FlowList";
import FlowHistory from "./FlowHistory";
import { getFlows } from "@/lib/localDatabase";
import { Activity, Clock, Filter, PlayCircle, PlusCircle, Search, Timeline } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FlowDashboard() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load flows from local database on component mount
  useState(() => {
    async function loadFlows() {
      try {
        const loadedFlows = await getFlows();
        setFlows(loadedFlows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading flows:", error);
        toast({
          title: "Error loading flows",
          description: "Could not load flows from local database",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }

    loadFlows();
  }, [toast]);

  // Filter flows based on search term and status filter
  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          flow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || flow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunFlow = (flow: Flow) => {
    // Implementation will be added later
    toast({
      title: "Flow started",
      description: `Flow ${flow.name} has been started`,
    });
  };

  // Get stats for the dashboard
  const activeFlows = flows.filter(flow => flow.status === "running").length;
  const completedFlows = flows.filter(flow => flow.status === "completed").length;
  const errorFlows = flows.filter(flow => flow.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flow Dashboard</h1>
          <p className="text-muted-foreground">
            Manage, monitor and control your automation workflows
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Flow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flows</CardTitle>
            <Timeline className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flows.length}</div>
            <p className="text-xs text-muted-foreground">
              Total workflows configured
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlows}</div>
            <p className="text-xs text-muted-foreground">
              Currently running workflows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedFlows}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed workflows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorFlows}</div>
            <p className="text-xs text-muted-foreground">
              Workflows with execution errors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flows..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Flows</TabsTrigger>
          <TabsTrigger value="all">All Flows</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <FlowList 
            flows={filteredFlows.filter(flow => flow.status === "running")} 
            crewId="all" 
            onRunFlow={handleRunFlow}
          />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <FlowList 
            flows={filteredFlows} 
            crewId="all" 
            onRunFlow={handleRunFlow}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <FlowHistory flows={flows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
