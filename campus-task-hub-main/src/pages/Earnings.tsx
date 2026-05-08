import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function Earnings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchEarnings = async () => {
      try {
        const response = await api.get("/tasks/my-earnings/");
        setEarnings(response.data);
      } catch {
        setError("Failed to load earnings.");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <TrendingUp size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Earnings</h2>
        <p className="text-muted-foreground mb-6">Sign in to track your earnings.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">Sign In</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading earnings...</p>
      </div>
    );
  }

  const total = earnings.reduce((sum, t) => sum + Number(t.budget), 0);

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Earnings</h1>
      <p className="text-muted-foreground text-sm mb-6">Your completed task earnings</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Total card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border shadow-sm p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
            <TrendingUp size={20} className="text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-3xl font-extrabold text-foreground">KSh {total.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{earnings.length} task{earnings.length !== 1 ? "s" : ""} completed</p>
      </motion.div>

      {/* Earnings list */}
      <h2 className="text-lg font-semibold text-foreground mb-3">History</h2>
      {earnings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">No earnings yet</p>
          <p className="text-sm">Complete tasks to start earning.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {earnings.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-foreground text-sm">{task.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Posted by {task.poster?.username} · {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="font-bold text-success text-lg">+KSh {Number(task.budget).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
