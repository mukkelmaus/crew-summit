import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/lib/types";
import { 
  Check, 
  Clock, 
  AlertCircle, 
  Code, 
  FileText, 
  Search, 
  BarChart, 
  PenTool, 
  Eye 
} from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
  onDelete?: () => void;
}

const getRoleIcon = (role: Agent['role']) => {
  switch (role) {
    case 'researcher':
      return <Search className="h-4 w-4" />;
    case 'writer':
      return <FileText className="h-4 w-4" />;
    case 'analyst':
      return <BarChart className="h-4 w-4" />;
    case 'designer':
      return <PenTool className="h-4 w-4" />;
    case 'developer':
      return <Code className="h-4 w-4" />;
    case 'reviewer':
      return <Eye className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusIcon = (status: Agent['status']) => {
  switch (status) {
    case 'idle':
      return <Clock className="h-3 w-3" />;
    case 'working':
      return <span className="animate-pulse">•</span>;
    case 'completed':
      return <Check className="h-3 w-3" />;
    case 'error':
      return <AlertCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

const getStatusClass = (status: Agent['status']) => {
  switch (status) {
    case 'idle':
      return 'status-badge-idle';
    case 'working':
      return 'status-badge-running';
    case 'completed':
      return 'status-badge-completed';
    case 'error':
      return 'status-badge-error';
    default:
      return '';
  }
};

export default function AgentCard({ agent, compact = false, onDelete }: AgentCardProps) {
  const avatarLetters = agent.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const roleColorMap: Record<Agent['role'], string> = {
    'researcher': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'writer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'analyst': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'designer': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'developer': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'reviewer': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'custom': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };

  if (compact) {
    return (
      <div className="flex items-center p-2 space-x-3 rounded-md subtle-border">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {avatarLetters}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{agent.name}</p>
        </div>
        <Badge variant="outline" className={getStatusClass(agent.status)}>
          {getStatusIcon(agent.status)}
          <span className="ml-1 text-xs">{agent.status}</span>
        </Badge>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {avatarLetters}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <div className="flex items-center mt-1 space-x-2">
                <Badge className={`flex items-center ${roleColorMap[agent.role]}`}>
                  {getRoleIcon(agent.role)}
                  <span className="ml-1 capitalize">{agent.role}</span>
                </Badge>
                <Badge variant="outline" className={getStatusClass(agent.status)}>
                  {getStatusIcon(agent.status)}
                  <span className="ml-1 capitalize">{agent.status}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
        <div className="mt-4">
          <div className="text-sm mb-1">
            <span className="font-medium">LLM:</span> {agent.llm}
          </div>
          <div className="text-sm">
            <span className="font-medium">Tools:</span>{" "}
            <div className="mt-1 flex flex-wrap gap-1">
              {agent.tools.map((tool) => (
                <Badge key={tool} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
