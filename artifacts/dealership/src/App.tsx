import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { useGetSettings } from "@workspace/api-client-react";
import { AIChatbot } from "@/components/AIChatbot";
import { RecentlyViewed } from "@/components/RecentlyViewed";

import Home from "@/pages/index";
import About from "@/pages/about";
import Inventory from "@/pages/inventory";
import CarDetail from "@/pages/car-detail";
import Showroom from "@/pages/showroom";
import Team from "@/pages/team";
import Services from "@/pages/services";
import Financing from "@/pages/financing";
import TradeIn from "@/pages/trade-in";
import TestDrive from "@/pages/test-drive";
import Testimonials from "@/pages/testimonials";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import PrivacyPolicy from "@/pages/privacy";
import TermsConditions from "@/pages/terms";
import Compare from "@/pages/compare";
import Wishlist from "@/pages/wishlist";
import KRACalculator from "@/pages/kra-calculator";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/index";
import AdminCars from "@/pages/admin/cars/index";
import AdminNewCar from "@/pages/admin/cars/new";
import AdminEditCar from "@/pages/admin/cars/edit";
import AdminInquiries from "@/pages/admin/inquiries/index";
import AdminBookings from "@/pages/admin/bookings/index";
import AdminTradeIns from "@/pages/admin/trade-ins/index";
import AdminFinancing from "@/pages/admin/financing/index";
import AdminTestimonials from "@/pages/admin/testimonials/index";
import AdminBlog from "@/pages/admin/blog/index";
import AdminTeam from "@/pages/admin/team/index";
import AdminSettings from "@/pages/admin/settings/index";

import "@/lib/api-setup";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function AppContexts({ children }: { children: React.ReactNode }) {
  const { data: settings } = useGetSettings();
  const kesRate = settings?.usdToKesRate ?? 130;
  return (
    <CurrencyProvider kesRate={kesRate}>
      <LanguageProvider>
        <CompareProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              {children}
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CompareProvider>
      </LanguageProvider>
    </CurrencyProvider>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/cars/:slug" component={CarDetail} />
        <Route path="/showroom" component={Showroom} />
        <Route path="/team" component={Team} />
        <Route path="/services" component={Services} />
        <Route path="/financing" component={Financing} />
        <Route path="/trade-in" component={TradeIn} />
        <Route path="/test-drive" component={TestDrive} />
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsConditions} />
        <Route path="/compare" component={Compare} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/kra-calculator" component={KRACalculator} />

        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/cars" component={AdminCars} />
        <Route path="/admin/cars/new" component={AdminNewCar} />
        <Route path="/admin/cars/:id/edit" component={AdminEditCar} />
        <Route path="/admin/inquiries" component={AdminInquiries} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin/trade-ins" component={AdminTradeIns} />
        <Route path="/admin/financing" component={AdminFinancing} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/team" component={AdminTeam} />
        <Route path="/admin/services" component={AdminSettings} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
      {!isAdmin && <AIChatbot />}
      {!isAdmin && <RecentlyViewed />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContexts>
            <Router />
          </AppContexts>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
