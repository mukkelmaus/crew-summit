
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Home, 
  Users, 
  User, 
  Package, 
  Terminal,
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      duration: 2000,
    });
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="border-b subtle-border sticky top-0 z-10 glass-effect">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-medium">CrewSUMMIT</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/crews')}
          >
            <Users className="h-4 w-4" />
            <span>Crews</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/agents')}
          >
            <User className="h-4 w-4" />
            <span>Agents</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => navigate('/flows')}
          >
            <Terminal className="h-4 w-4" />
            <span>Flows</span>
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={navigateToSettings}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
