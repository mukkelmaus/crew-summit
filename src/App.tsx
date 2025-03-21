
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Agents from "@/pages/Agents";
import Crews from "@/pages/Crews";
import CrewDetail from "@/pages/CrewDetail";
import Flows from "@/pages/Flows";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="crewai-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/crews" element={<Crews />} />
              <Route path="/crew/:id" element={<CrewDetail />} />
              <Route path="/flows" element={<Flows />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
