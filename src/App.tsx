
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import Agents from "@/pages/Agents";
import Crews from "@/pages/Crews";
import Flows from "@/pages/Flows";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="crewsummit-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/crews" element={<Crews />} />
            <Route path="/flows" element={<Flows />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
