
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import CrewCard from "@/components/CrewCard";
import CreateCrewDialog from "@/components/CreateCrewDialog";
import { mockCrews } from "@/lib/data";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus, RefreshCw, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [crews, setCrews] = useState(mockCrews);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const [filterStatus, setFilterStatus] = useState<"all" | "idle" | "running" | "completed" | "error">("all");

  const sortedAndFilteredCrews = [...crews]
    .filter((crew) => filterStatus === "all" || crew.status === filterStatus)
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const refreshCrews = () => {
    console.log("Refreshing crews...");
    // This would fetch updated crews from the server in a real app
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-medium tracking-tight">Welcome to CrewAI Hub</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your AI crews for automated workflows
              </p>
            </div>
            <CreateCrewDialog />
          </div>

          {crews.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xl font-medium">Your Crews</div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={filterStatus}
                    onValueChange={(value: any) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSortOrder("newest")}
                        className={sortOrder === "newest" ? "bg-muted" : ""}
                      >
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOrder("oldest")}
                        className={sortOrder === "oldest" ? "bg-muted" : ""}
                      >
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOrder("alphabetical")}
                        className={sortOrder === "alphabetical" ? "bg-muted" : ""}
                      >
                        Alphabetical
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="ghost" size="icon" onClick={refreshCrews}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {sortedAndFilteredCrews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No crews match your current filters.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setFilterStatus("all")}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
                  {sortedAndFilteredCrews.map((crew) => (
                    <CrewCard key={crew.id} crew={crew} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 animate-slideUp">
              <EmptyState
                icon={<Package className="h-16 w-16 opacity-20" />}
                title="No crews yet"
                description="Create your first CrewAI crew to start building automated workflows with multiple AI agents."
                action={<CreateCrewDialog />}
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t subtle-border py-6 px-6">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CrewAI Hub. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" className="text-muted-foreground">
              Documentation
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              GitHub
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              Support
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
