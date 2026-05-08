import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TaskMarketplace from "./pages/TaskMarketplace";
import TaskDetail from "./pages/TaskDetail";
import PostTask from "./pages/PostTask";
import Verification from "./pages/Verification";
import Profile from "./pages/Profile";
import ResidentDashboard from "./pages/ResidentDashboard";
import ApplicantManagement from "./pages/ApplicantManagement";
import MyBids from "./pages/MyBids";
import Earnings from "./pages/Earnings";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/tasks" element={<TaskMarketplace />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/:id/applicants" element={<ApplicantManagement />} />
              <Route path="/post-task" element={<PostTask />} />
              <Route path="/verify" element={<Verification />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<ResidentDashboard />} />
              <Route path="/my-bids" element={<MyBids />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/help" element={<Help />} />
              <Route path="/wallet" element={<Wallet />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
