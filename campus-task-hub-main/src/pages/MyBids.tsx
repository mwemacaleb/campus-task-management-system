import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import api from "@/lib/api";

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", label: "Pending" },
  accepted: { icon: CheckCircle, color: "text-success", label: "Accepted" },
  rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
};

export default function MyBids() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchBids = async () => {
      try {
        const response = await api.get("/bids/my-bids/");
        setBids(response.data);
      } catch {
        setError("Failed to load bids.");
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <FileText size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">My Bids</h2>
        <p className="text-muted-foreground mb-6">Sign in to see your bids.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">Sign In</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading your bids...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">My Bids</h1>
      <p className="text-muted-foreground text-sm mb-6">Track your task applications</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No bids yet. Browse tasks and place your first bid!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map((bid, i) => {
            const config = statusConfig[bid.status] ?? statusConfig.pending;
            const Icon = config.icon;
            return (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{bid.task_title}</h3>
                  <span className={cn("flex items-center gap-1 shrink-0 text-xs font-medium", config.color)}>
                    <Icon size={14} />
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">"{bid.message}"</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">KSh {Number(bid.proposed_price).toLocaleString()}</span>
                  <span>{new Date(bid.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
