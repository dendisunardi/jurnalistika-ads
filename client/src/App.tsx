import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AdvertiserDashboard from "@/pages/advertiser/dashboard";
import CreateAd from "@/pages/advertiser/create-ad";
import MyAds from "@/pages/advertiser/my-ads";
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Role-based routing
  if ((user as any)?.role === 'admin') {
    return (
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Advertiser routes
  return (
    <Switch>
      <Route path="/" component={AdvertiserDashboard} />
      <Route path="/advertiser/dashboard" component={AdvertiserDashboard} />
      <Route path="/advertiser/create-ad" component={CreateAd} />
      <Route path="/advertiser/my-ads" component={MyAds} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
