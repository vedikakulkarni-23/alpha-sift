import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import CompaniesPage from "@/pages/CompaniesPage";
import CompanyDetailPage from "@/pages/CompanyDetailPage";
import AddCompanyPage from "@/pages/AddCompanyPage";
import ListsPage from "@/pages/ListsPage";
import SavedPage from "@/pages/SavedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/companies" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/new" element={<AddCompanyPage />} />
            <Route path="/company/:id" element={<CompanyDetailPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/saved" element={<SavedPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
