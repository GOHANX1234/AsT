import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "@/lib/protected-route";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminResellers from "@/pages/admin/resellers";
import AdminTokens from "@/pages/admin/tokens";
import AdminApi from "@/pages/admin/api";
import ResellerDashboard from "@/pages/reseller/dashboard";
import ResellerGenerate from "@/pages/reseller/generate";
import ResellerKeys from "@/pages/reseller/keys";
import ResellerApi from "@/pages/reseller/api";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      {/* Auth page */}
      <Route path="/" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin pages */}
      <ProtectedRoute path="/admin" component={AdminDashboard} role="admin" />
      <ProtectedRoute path="/admin/resellers" component={AdminResellers} role="admin" />
      <ProtectedRoute path="/admin/tokens" component={AdminTokens} role="admin" />
      <ProtectedRoute path="/admin/api" component={AdminApi} role="admin" />
      
      {/* Reseller pages */}
      <ProtectedRoute path="/reseller" component={ResellerDashboard} role="reseller" />
      <ProtectedRoute path="/reseller/generate" component={ResellerGenerate} role="reseller" />
      <ProtectedRoute path="/reseller/keys" component={ResellerKeys} role="reseller" />
      <ProtectedRoute path="/reseller/api" component={ResellerApi} role="reseller" />
      
      {/* Fallback to 404 */}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  // Set dark mode on component mount
  useEffect(() => {
    // Apply dark mode forcefully
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Ensure dark mode persists
    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      }
      if (!document.body.classList.contains('dark')) {
        document.body.classList.add('dark');
      }
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class" forcedTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
