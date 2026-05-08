import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck, DollarSign, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export default function ApplicantManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hiring, setHiring] = useState<number | null>(null);
  const [hiredId, setHiredId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, bidsRes] = await Promise.all([
          api.get(`/tasks/${id}/`),
          api.get(`/bids/task/${id}/`),
        ]);
        setTask(taskRes.data);
        setBids(bidsRes.data);
      } catch {
        setError("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleHire = async (bidId: number) => {
    setHiring(bidId);
    try {
      await api.patch(`/bids/respond/${bidId}/`, { status: "accepted" });
      setHiredId(bidId);
      setBids((prev) =>
        prev.map((b) =>
          b.id === bidId
            ? { ...b, status: "accepted" }
            : { ...b, status: "rejected" }
        )
      );
    } catch {
      setError("Failed to hire applicant. Please try again.");
    } finally {
      setHiring(null);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading applicants...</p>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => navigate("/dashboard")} className="text-primary mt-4 underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to My Posts</span>
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">{task?.title}</h1>
        <p className="text-sm text-muted-foreground">KSh {Number(task?.budget).toLocaleString()} · {task?.location}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-4">
        Applicants ({bids.length})
      </h2>

      {bids.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">No applicants yet</p>
          <p className="text-sm">Students will start applying soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map((bid, i) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border shadow-sm p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {bid.tasker.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{bid.tasker.username}</h3>
                      {bid.tasker.is_verified && (
                        <ShieldCheck size={14} className="text-success" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Star size={12} className="text-warning fill-warning" />
                      <span>New</span>
                      <span>· {new Date(bid.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  KSh {Number(bid.proposed_price).toLocaleString()}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <MessageSquare size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{bid.message}</p>
              </div>

              <button
                onClick={() => handleHire(bid.id)}
                disabled={hiredId !== null || hiring === bid.id}
                className={cn(
                  "w-full py-2.5 rounded-lg font-medium text-sm transition-all",
                  bid.status === "accepted"
                    ? "bg-success/10 text-success"
                    : bid.status === "rejected" && hiredId !== null
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : hiredId !== null
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {hiring === bid.id
                  ? "Hiring..."
                  : bid.status === "accepted"
                    ? "✓ Hired!"
                    : bid.status === "rejected" && hiredId !== null
                      ? "Not selected"
                      : "Hire"}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
