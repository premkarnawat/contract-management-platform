import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BlueprintBuilder from "./pages/BlueprintBuilder";
import ContractCreation from "./pages/ContractCreation";
import ContractView from "./pages/ContractView";
import ContractEdit from "./pages/ContractEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/blueprints" element={<BlueprintBuilder />} />
          <Route path="/contracts/new" element={<ContractCreation />} />
          <Route path="/contracts/:id" element={<ContractView />} />
          <Route path="/contracts/:id/edit" element={<ContractEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
