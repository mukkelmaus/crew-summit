
import { useState, useEffect } from "react";
import { Flow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  Code,
  Database
} from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: "system" | "node" | "agent" | "data" | "api";
  nodeId?: string;
  message: string;
  details?: string;
  tags?: string[];
}

interface FlowLoggerProps {
  flow: Flow;
}

export default function FlowLogger({ flow }: FlowLoggerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [logCategory, setLogCategory] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Generate sample logs for demonstration
  useEffect(() => {
    const generateSampleLogs = () => {
      const sampleLogs: LogEntry[] = [];
      const startTime = flow.lastRun ? new Date(flow.lastRun) : new Date();
      
      // Add some initial logs
      sampleLogs.push({
        id: "1",
        timestamp: startTime.toISOString(),
        level: "info",
        category: "system",
        message: `Flow "${flow.name}" started execution`,
        tags: ["flow-start", "system-event"]
      });
      
      // Add logs for each node
      flow.nodes.forEach((node, index) => {
        const nodeTime = new Date(startTime.getTime() + (index + 1) * 3000);
        
        // System log for node start
        sampleLogs.push({
          id: `node-${node.id}-start`,
          timestamp: nodeTime.toISOString(),
          level: "info",
          category: "node",
          nodeId: node.id,
          message: `Node "${node.label}" (${node.type}) execution started`,
          tags: ["node-execution", node.type]
        });
        
        // Add API call log for some nodes
        if (node.type === 'task' || node.type === 'data_operation') {
          const apiTime = new Date(nodeTime.getTime() + 1000);
          sampleLogs.push({
            id: `node-${node.id}-api`,
            timestamp: apiTime.toISOString(),
            level: "info",
            category: "api",
            nodeId: node.id,
            message: `API call initiated for "${node.label}"`,
            details: `Endpoint: /api/v1/${node.type === 'task' ? 'tasks' : 'data'}`,
            tags: ["api-call", "external-service"]
          });
        }
        
        // Add data operation logs for data_operation nodes
        if (node.type === 'data_operation') {
          const dataTime = new Date(nodeTime.getTime() + 1500);
          sampleLogs.push({
            id: `node-${node.id}-data`,
            timestamp: dataTime.toISOString(),
            level: "info",
            category: "data",
            nodeId: node.id,
            message: `Data ${node.data.dataOperation || 'operation'} for "${node.label}"`,
            details: `Source: ${node.data.dataSource || 'default'}`,
            tags: ["data-operation", node.data.dataOperation || 'default']
          });
        }
        
        // Add agent activity logs for task nodes
        if (node.type === 'task' && node.data.agentId) {
          const agentTime = new Date(nodeTime.getTime() + 1800);
          sampleLogs.push({
            id: `node-${node.id}-agent`,
            timestamp: agentTime.toISOString(),
            level: "info",
            category: "agent",
            nodeId: node.id,
            message: `Agent processing task in node "${node.label}"`,
            details: `Agent ID: ${node.data.agentId}`,
            tags: ["agent-activity", "processing"]
          });
        }
        
        // Add random success/warning/error for demonstration
        const outcome = Math.random();
        const outcomeTime = new Date(nodeTime.getTime() + 2000);
        
        if (outcome > 0.8) {
          // Error
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "error",
            category: "node",
            nodeId: node.id,
            message: `Error executing node "${node.label}"`,
            details: "Sample error message: Connection refused",
            tags: ["execution-error", "connection-issue"]
          });
        } else if (outcome > 0.6) {
          // Warning
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "warning",
            category: "node",
            nodeId: node.id,
            message: `Warning in node "${node.label}"`,
            details: "Operation completed with warnings: Slow response time",
            tags: ["execution-warning", "performance-issue"]
          });
        } else {
          // Success
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "success",
            category: "node",
            nodeId: node.id,
            message: `Node "${node.label}" executed successfully`,
            tags: ["execution-success"]
          });
        }
      });
      
      // Final log
      const endTime = new Date(startTime.getTime() + (flow.nodes.length + 2) * 3000);
      sampleLogs.push({
        id: "final",
        timestamp: endTime.toISOString(),
        level: flow.status === "completed" ? "success" : "error",
        category: "system",
        message: flow.status === "completed"
          ? `Flow "${flow.name}" completed successfully`
          : `Flow "${flow.name}" failed with errors`,
        tags: [flow.status === "completed" ? "flow-complete" : "flow-error", "system-event"]
      });
      
      return sampleLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };
    
    setLogs(generateSampleLogs());
  }, [flow]);
  
  // Filter logs based on search term, log level, and category
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (log.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ?? false);
    
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesCategory = logCategory === 'all' || log.category === logCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });
  
  const getLogIcon = (level: string, category: string) => {
    if (category === "api") return <Code className="h-4 w-4 text-purple-500" />;
    if (category === "data") return <Database className="h-4 w-4 text-blue-500" />;
    if (category === "agent") return <Clock className="h-4 w-4 text-cyan-500" />;
    
    switch (level) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getLogClass = (level: string, category: string) => {
    // Base classes by level
    const baseClass = {
      "info": "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
      "warning": "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
      "error": "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
      "success": "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
    }[level] || "";
    
    // Add category-specific accents
    if (category === "api") {
      return `${baseClass} border-l-4 border-l-purple-500`;
    } else if (category === "data") {
      return `${baseClass} border-l-4 border-l-blue-500`;
    } else if (category === "agent") {
      return `${baseClass} border-l-4 border-l-cyan-500`;
    } else if (category === "system") {
      return `${baseClass} border-l-4 border-l-gray-500`;
    }
    
    return baseClass;
  };
  
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "system":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "node":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "agent":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      case "data":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "api":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  const getTagBadgeColor = (tag: string) => {
    if (tag.includes("error")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    } else if (tag.includes("warn")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    } else if (tag.includes("success")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    } else if (tag.includes("api")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    } else if (tag.includes("data")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    } else if (tag.includes("agent")) {
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300";
    } else if (tag.includes("flow")) {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300";
    } else if (tag.includes("node")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
    } 
    return "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300";
  };
  
  const handleDownloadLogs = () => {
    const logText = logs.map(log => 
      `[${format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}] [${log.level.toUpperCase()}] [${log.category.toUpperCase()}] ${log.message}${log.details ? ` - ${log.details}` : ''}${log.tags ? ` #${log.tags.join(' #')}` : ''}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-logs-${flow.id}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Flow Logs</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant={autoRefresh ? "default" : "outline"} 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs, details, or tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={logCategory} onValueChange={setLogCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="node">Node</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox id="show-timestamps" checked={showTimestamps} onCheckedChange={setShowTimestamps} />
          <label htmlFor="show-timestamps" className="cursor-pointer">Show Timestamps</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="show-details" checked={showDetails} onCheckedChange={setShowDetails} />
          <label htmlFor="show-details" className="cursor-pointer">Show Details</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="show-tags" checked={showTags} onCheckedChange={setShowTags} />
          <label htmlFor="show-tags" className="cursor-pointer">Show Tags</label>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="text-xs text-muted-foreground">
          {filteredLogs.length} of {logs.length} logs shown
        </div>
      </div>
      
      {filteredLogs.length > 0 ? (
        <ScrollArea className="h-[400px] border rounded-md">
          <div className="p-2 space-y-2">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className={`p-3 border rounded-md ${getLogClass(log.level, log.category)}`}
              >
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {getLogIcon(log.level, log.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.message}</span>
                        <Badge className={getCategoryBadgeColor(log.category)} variant="outline">
                          {log.category}
                        </Badge>
                      </div>
                      {showTimestamps && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.timestamp), "HH:mm:ss")}
                        </span>
                      )}
                    </div>
                    {showDetails && log.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                    )}
                    {log.nodeId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Node ID: {log.nodeId}
                      </div>
                    )}
                    {showTags && log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {log.tags.map((tag, index) => (
                          <Badge 
                            key={`${log.id}-tag-${index}`} 
                            variant="secondary"
                            className={`text-xs ${getTagBadgeColor(tag)}`}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No logs found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm || logLevel !== 'all' || logCategory !== 'all'
              ? "Try adjusting your search or filters"
              : "Run the flow to generate logs"}
          </p>
        </div>
      )}
    </div>
  );
}
