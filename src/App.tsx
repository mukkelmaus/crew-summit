
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Index from "@/pages/Index";
import Agents from "@/pages/Agents";
import Crews from "@/pages/Crews";
import CrewDetail from "@/pages/CrewDetail";
import Flows from "@/pages/Flows";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import ApiErrorBoundary from "@/components/ApiErrorBoundary";
import { handleError } from "@/lib/errorHandler";
import "./App.css";

// Create a client with global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      meta: {
        onError: (error: unknown) => {
          // Let our error handler process the error
          handleError(error, true);
        }
      }
    },
    mutations: {
      meta: {
        onError: (error: unknown) => {
          // Let our error handler process the error
          handleError(error, true);
        }
      }
    }
  },
});

// Layout component that includes the Header for all routes
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="crewai-ui-theme">
        <QueryClientProvider client={queryClient}>
          <ApiErrorBoundary>
            <Router>
              <Routes>
                <Route path="/" element={<AppLayout><Index /></AppLayout>} />
                <Route path="/agents" element={<AppLayout><Agents /></AppLayout>} />
                <Route path="/crews" element={<AppLayout><Crews /></AppLayout>} />
                <Route path="/crew/:id" element={<AppLayout><CrewDetail /></AppLayout>} />
                <Route path="/flows" element={<AppLayout><Flows /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
              </Routes>
            </Router>
          </ApiErrorBoundary>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
