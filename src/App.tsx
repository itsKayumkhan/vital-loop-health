import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { UserProvider } from "@/context/UserContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Orders from "./pages/Orders";

import Programs from "./pages/Programs";
import Services from "./pages/Services";
import Supplements from "./pages/Supplements";
import ProductDetail from "./pages/ProductDetail";
import WhyUs from "./pages/WhyUs";
import Contact from "./pages/Contact";
import Biomarkers from "./pages/Biomarkers";
import CGMIntakeForm from "./pages/CGMIntakeForm";
import SleepIntakeForm from "./pages/SleepIntakeForm";
import MentalIntakeForm from "./pages/MentalIntakeForm";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import CoachIntakeForm from "./pages/CoachIntakeForm";
import AdminPanel from "./pages/AdminPanel";
import Affiliate from "./pages/Affiliate";
import CRM from "./pages/CRM";
import EmbedPortal from "./pages/EmbedPortal";
import EmbedCRM from "./pages/EmbedCRM";
import BrandStyleGuide from "./pages/BrandStyleGuide";
import WebflowIntegrationDocs from "./pages/WebflowIntegrationDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <UserProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Index />} />

                                <Route path="/programs" element={<Programs />} />
                                <Route path="/services" element={<Services />} />
                                <Route path="/biomarkers" element={<Biomarkers />} />
                                <Route path="/supplements" element={<Supplements />} />
                                <Route path="/supplements/:id" element={<ProductDetail />} />
                                <Route path="/product/:handle" element={<ProductDetail />} />
                                <Route path="/why-us" element={<WhyUs />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/cgm-intake" element={<CGMIntakeForm />} />
                                <Route path="/sleep-assessment" element={<SleepIntakeForm />} />
                                <Route path="/mental-assessment" element={<MentalIntakeForm />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
                                <Route path="/portal/admin" element={<ProtectedRoute requireRole="admin"><AdminPanel /></ProtectedRoute>} />
                                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                                <Route path="/intake/:specialty" element={<ProtectedRoute><CoachIntakeForm /></ProtectedRoute>} />
                                <Route path="/affiliate" element={<Affiliate />} />
                                <Route path="/crm" element={<ProtectedRoute requireStaff><CRM /></ProtectedRoute>} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </BrowserRouter>
                    </TooltipProvider>
                </UserProvider>
            </AuthProvider>
        </QueryClientProvider>
    </HelmetProvider>
);

export default App;
