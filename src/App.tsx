import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Agencias from "./pages/Agencias";
import Usuarios from "./pages/Usuarios";
import Experiencias from "./pages/Experiencias";
import Viajes from "./pages/Viajes";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FormAgencies from "./pages/auth/Agency-Form";
import Guides from "./pages/Guides";
import Categories from "./pages/Categories";
import ViajeDetails from "./pages/ViajeDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guides"
                element={
                  <ProtectedRoute allowedRoles={["agencia"]}>
                    <Guides />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/experiencias"
                element={
                  <ProtectedRoute allowedRoles={["agencia"]}>
                    <Experiencias />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/viajes"
                element={
                  <ProtectedRoute allowedRoles={["agencia"]}>
                    <Viajes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/viajes/:id"
                element={
                  <ProtectedRoute allowedRoles={["agencia"]}>
                    <ViajeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agencias"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Agencias />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agencia-form"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <FormAgencies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categorias"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facturacion"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facturacion-agencias"
                element={
                  <ProtectedRoute allowedRoles={["agencia"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
