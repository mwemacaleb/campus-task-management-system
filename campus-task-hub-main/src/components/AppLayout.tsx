import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, PlusCircle, User, LogOut, ClipboardList, BarChart2, FileText, DollarSign, HelpCircle, UserPlus, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mobile bottom nav — 4 items per role (keeps it clean on small screens)
const publicMobileNav = [
  { path: "/login", icon: User, label: "Sign In" },
  { path: "/signup", icon: UserPlus, label: "Sign Up" },
];

const posterMobileNav = [
  { path: "/dashboard", icon: ClipboardList, label: "My Posts" },
  { path: "/post-task", icon: PlusCircle, label: "Post Task" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Profile" },
];

const taskerMobileNav = [
  { path: "/tasks", icon: Search, label: "Browse" },
  { path: "/my-bids", icon: FileText, label: "My Bids" },
  { path: "/earnings", icon: DollarSign, label: "Earnings" },
  { path: "/profile", icon: User, label: "Profile" },
];

// Desktop nav
const posterDesktopNav = [
  { path: "/dashboard", icon: ClipboardList, label: "My Posts" },
  { path: "/post-task", icon: PlusCircle, label: "Post Task" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/reports", icon: FileText, label: "Reports" },
  { path: "/profile", icon: User, label: "Profile" },
];

const taskerDesktopNav = [
  { path: "/tasks", icon: Search, label: "Browse Jobs" },
  { path: "/my-bids", icon: FileText, label: "My Bids" },
  { path: "/earnings", icon: DollarSign, label: "Earnings" },
  { path: "/reports", icon: BarChart2, label: "Reports" },
  { path: "/profile", icon: User, label: "Profile" },
];

const publicDesktopNav: { path: string; icon: any; label: string }[] = [];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const mobileNav = !isAuthenticated
    ? publicMobileNav
    : user?.role === "poster"
      ? posterMobileNav
      : taskerMobileNav;

  const desktopNav = !isAuthenticated
    ? publicDesktopNav
    : user?.role === "poster"
      ? posterDesktopNav
      : taskerDesktopNav;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b bg-card shadow-sm sticky top-0 z-50">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CT</span>
          </div>
          <span className="font-bold text-lg text-foreground">Community Tasker</span>
        </button>

        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {desktopNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate("/help")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === "/help"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <HelpCircle size={16} />
                Help
              </button>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Verification banner */}
      {isAuthenticated && !user?.is_verified && user?.verification_status !== "pending" && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center">
          <p className="text-sm text-warning font-medium">
            ⚠️{" "}
            {user?.role === "tasker"
              ? "Verify your student account to start bidding on tasks."
              : "Verify your identity to start posting tasks."}{" "}
            <button onClick={() => navigate("/verify")} className="underline font-semibold">
              Verify now
            </button>
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {mobileNav.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
