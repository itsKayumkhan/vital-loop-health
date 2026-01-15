import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Services from "./pages/Services";
import Programs from "./pages/Programs";
import NutritionProgram from "./pages/programs/NutritionProgram";
import PerformanceProgram from "./pages/programs/PerformanceProgram";
import WellnessProgram from "./pages/programs/WellnessProgram";
import MentalPerformanceProgram from "./pages/programs/MentalPerformanceProgram";
import SleepProgram from "./pages/programs/SleepProgram";
import Supplements from "./pages/Supplements";
import ProductDetail from "./pages/ProductDetail";
import WhyUs from "./pages/WhyUs";
import Contact from "./pages/Contact";
import CGMIntakeForm from "./pages/CGMIntakeForm";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import CoachIntakeForm from "./pages/CoachIntakeForm";
import AdminPanel from "./pages/AdminPanel";
import Affiliate from "./pages/Affiliate";
import CRM from "./pages/CRM";
import EmbedPortal from "./pages/EmbedPortal";
import EmbedCRM from "./pages/EmbedCRM";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/services" element={<Services />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/nutrition" element={<NutritionProgram />} />
              <Route path="/programs/performance" element={<PerformanceProgram />} />
              <Route path="/programs/wellness" element={<WellnessProgram />} />
              <Route path="/programs/mental-performance" element={<MentalPerformanceProgram />} />
              <Route path="/programs/sleep" element={<SleepProgram />} />
              <Route path="/supplements" element={<Supplements />} />
              <Route path="/supplements/:id" element={<ProductDetail />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cgm-intake" element={<CGMIntakeForm />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
              <Route path="/portal/admin" element={<ProtectedRoute requireRole="admin"><AdminPanel /></ProtectedRoute>} />
              <Route path="/intake/:specialty" element={<ProtectedRoute><CoachIntakeForm /></ProtectedRoute>} />
              <Route path="/affiliate" element={<Affiliate />} />
              <Route path="/crm" element={<ProtectedRoute requireStaff><CRM /></ProtectedRoute>} />
              {/* Embed routes for Webflow integration - no navbar/footer */}
              <Route path="/embed/portal" element={<EmbedPortal />} />
              <Route path="/embed/crm" element={<EmbedCRM />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
