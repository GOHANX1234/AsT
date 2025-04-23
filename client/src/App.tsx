import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminResellers from "@/pages/admin/resellers";
import AdminTokens from "@/pages/admin/tokens";
import AdminApi from "@/pages/admin/api";
import ResellerDashboard from "@/pages/reseller/dashboard";
import ResellerGenerate from "@/pages/reseller/generate";
import ResellerKeys from "@/pages/reseller/keys";
import ResellerApi from "@/pages/reseller/api";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Admin pages */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/resellers" component={AdminResellers} />
      <Route path="/admin/tokens" component={AdminTokens} />
      <Route path="/admin/api" component={AdminApi} />
      
      {/* Reseller pages */}
      <Route path="/reseller" component={ResellerDashboard} />
      <Route path="/reseller/generate" component={ResellerGenerate} />
      <Route path="/reseller/keys" component={ResellerKeys} />
      <Route path="/reseller/api" component={ResellerApi} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
