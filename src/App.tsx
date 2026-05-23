import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard";
import Lotes from "./pages/Lotes";
import LoteDetalle from "./pages/LoteDetalle";
import Alertas from "./pages/Alertas";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound.tsx";
import Asesores from "./pages/Asesores";
import Meteorologia from "./pages/Meteorologia";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Usuarios from "./pages/admin/Usuarios";
import LotesGlobales from "./pages/admin/LotesGlobales";
import AntigravityConsole from "./pages/AntigravityConsole";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lotes" element={<Lotes />} />
              <Route path="/lotes/:id" element={<LoteDetalle />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/meteorologia" element={<Meteorologia />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/asesores" element={<Asesores />} />
              <Route path="/antigravity" element={<AntigravityConsole />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<Usuarios />} />
              <Route path="/admin/lotes" element={<LotesGlobales />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;
