import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AuthWrapper from "@/components/AuthWrapper";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import GroupChats from './pages/GroupChats';
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EventDetail from "./pages/EventDetail";
import ModifierEvenement from './pages/ModifierEvenement';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import CreerEvenement from './pages/CreerEvenement';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/achat-reussi" element={<SuccessPage />} />
            <Route path="/achat-annule" element={<CancelPage />} />
            <Route path="/creer-un-evenement" element={<AuthWrapper><CreerEvenement /></AuthWrapper>} />
            <Route path="/events" element={<AuthWrapper><Events /></AuthWrapper>} />
            <Route path="/messages" element={<AuthWrapper><GroupChats /></AuthWrapper>} />
            <Route path="/events/:id" element={<AuthWrapper><EventDetail /></AuthWrapper>} />
            <Route path="/events/edit/:id" element={<AuthWrapper><ModifierEvenement /></AuthWrapper>} />
            <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
       
            <Route path="*" element={<NotFound />} />
          </Routes>
     
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
