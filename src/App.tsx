import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { applyReaderSettingsToDocument, getUserSettings, onSettingsChange } from "@/lib/settingsStorage";
import { Navigation } from "@/components/Navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import Index from "./pages/Index";
import Bible from "./pages/Bible";
import Search from "./pages/Search";
import Bookmarks from "./pages/Bookmarks";
import Prayer from "./pages/Prayer";
import Plans from "./pages/Plans";
import PlanDetail from "./pages/PlanDetail";
import Notes from "./pages/Notes";
import Progress from "./pages/Progress";
import More from "./pages/More";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Apply stored reader settings on first load + keep in sync
    const apply = () => applyReaderSettingsToDocument(getUserSettings());
    apply();
    return onSettingsChange(apply);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bible" element={<Bible />} />
            <Route path="/search" element={<Search />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/prayer" element={<Prayer />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:planId" element={<PlanDetail />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/more" element={<More />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
