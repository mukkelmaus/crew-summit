
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Home, 
  Users, 
  User, 
  Package, 
  Terminal,
  Moon,
  Sun,
  Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Load saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      duration: 2000,
    });
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/crews', label: 'Crews', icon: Users },
    { path: '/agents', label: 'Agents', icon: User },
    { path: '/flows', label: 'Flows', icon: Terminal }
  ];

  return (
    <header className="border-b subtle-border sticky top-0 z-10 glass-effect">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-medium">CrewSUMMIT</h1>
        </div>

        {!isMobile && (
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-2 ${location.pathname === item.path ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => navigateTo(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        )}

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
            onClick={() => navigateTo('/settings')}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          {isMobile && (
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Navigation</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-2 p-4">
                  {navigationItems.map((item) => (
                    <Button 
                      key={item.path}
                      variant={location.pathname === item.path ? "default" : "outline"} 
                      className="w-full justify-start gap-2"
                      onClick={() => navigateTo(item.path)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </header>
  );
}
