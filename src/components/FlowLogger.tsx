
import { useState, useEffect } from "react";
import { Flow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle
} from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  nodeId?: string;
  message: string;
  details?: string;
}

interface FlowLoggerProps {
  flow: Flow;
}

export default function FlowLogger({ flow }: FlowLoggerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
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
        message: `Flow "${flow.name}" started execution`,
      });
      
      // Add logs for each node
      flow.nodes.forEach((node, index) => {
        const nodeTime = new Date(startTime.getTime() + (index + 1) * 3000);
        
        sampleLogs.push({
          id: `node-${node.id}-start`,
          timestamp: nodeTime.toISOString(),
          level: "info",
          nodeId: node.id,
          message: `Node "${node.label}" (${node.type}) execution started`,
        });
        
        // Add random success/warning/error for demonstration
        const outcome = Math.random();
        const outcomeTime = new Date(nodeTime.getTime() + 2000);
        
        if (outcome > 0.8) {
          // Error
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "error",
            nodeId: node.id,
            message: `Error executing node "${node.label}"`,
            details: "Sample error message: Connection refused",
          });
        } else if (outcome > 0.6) {
          // Warning
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "warning",
            nodeId: node.id,
            message: `Warning in node "${node.label}"`,
            details: "Operation completed with warnings: Slow response time",
          });
        } else {
          // Success
          sampleLogs.push({
            id: `node-${node.id}-end`,
            timestamp: outcomeTime.toISOString(),
            level: "success",
            nodeId: node.id,
            message: `Node "${node.label}" executed successfully`,
          });
        }
      });
      
      // Final log
      const endTime = new Date(startTime.getTime() + (flow.nodes.length + 2) * 3000);
      sampleLogs.push({
        id: "final",
        timestamp: endTime.toISOString(),
        level: flow.status === "completed" ? "success" : "error",
        message: flow.status === "completed"
          ? `Flow "${flow.name}" completed successfully`
          : `Flow "${flow.name}" failed with errors`,
      });
      
      return sampleLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };
    
    setLogs(generateSampleLogs());
  }, [flow]);
  
  // Filter logs based on search term and log level
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    
    return matchesSearch && matchesLevel;
  });
  
  const getLogIcon = (level: string) => {
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
  
  const getLogClass = (level: string) => {
    switch (level) {
      case "info":
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "error":
        return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
      case "success":
        return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      default:
        return "";
    }
  };
  
  const handleDownloadLogs = () => {
    const logText = logs.map(log => 
      `[${format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}] [${log.level.toUpperCase()}] ${log.message}${log.details ? ` - ${log.details}` : ''}`
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
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredLogs.length > 0 ? (
        <ScrollArea className="h-[400px] border rounded-md">
          <div className="p-2 space-y-2">
            {filteredLogs.map((log) => (
              <div 
                key={log.id}
                className={`p-3 border rounded-md ${getLogClass(log.level)}`}
              >
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {getLogIcon(log.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                    )}
                    {log.nodeId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Node ID: {log.nodeId}
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
            {searchTerm || logLevel !== 'all'
              ? "Try adjusting your search or filter"
              : "Run the flow to generate logs"}
          </p>
        </div>
      )}
    </div>
  );
}
