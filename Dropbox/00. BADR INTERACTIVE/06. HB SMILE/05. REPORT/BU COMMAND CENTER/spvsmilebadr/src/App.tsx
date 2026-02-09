import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Knowledge from "./pages/Knowledge";
import PublicDocument from "./pages/PublicDocument";
import FeedbackPage from "./pages/FeedbackPage";
import { ESATSurveyForm } from "./components/public/ESATSurveyForm";
import { ESATThankYou } from "./components/public/ESATThankYou";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/doc/:slug" element={<PublicDocument />} />
            <Route path="/feedback/:token" element={<FeedbackPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Index />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Knowledge />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AppLayout>
                    <Admin />
                  </AppLayout>
                </AdminRoute>
              }
            />
            <Route path="/survey/:token" element={<ESATSurveyForm />} />
            <Route path="/survey/:token/thank-you" element={<ESATThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
