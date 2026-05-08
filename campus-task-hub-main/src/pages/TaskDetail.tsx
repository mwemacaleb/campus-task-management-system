import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categoryColors: Record<string, string> = {
  tech: "bg-blue-100 text-blue-700",
  cleaning: "bg-green-100 text-green-700",
  errands: "bg-yellow-100 text-yellow-700",
  tutoring: "bg-purple-100 text-purple-700",
  moving: "bg-orange-100 text-orange-700",
};

const categoryLabels: Record<string, string> = {
  tech: "Tech",
  cleaning: "Cleaning",
  errands: "Errands",
  tutoring: "Tutoring",
  moving: "Moving",
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidMessage, setBidMessage] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}/`);
        setTask(response.data);
        setBidPrice(response.data.budget);
      } catch (err) {
        setTask(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleBidSubmit = async () => {
    setBidError("");
    setBidLoading(true);
    try {
      await api.post(`/bids/place/${id}/`, {
        message: bidMessage,
        proposed_price: bidPrice,
      });
      setApplied(true);
      setBidOpen(false);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setBidError(err.response.data.error);
      } else {
        setBidError("Failed to submit bid. Please try again.");
      }
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-muted-foreground">Task not found.</p>
        <button
          onClick={() => navigate("/tasks")}
          className="text-primary mt-4 underline"
        >
          Back to tasks
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
          <span className={cn(
            "shrink-0 text-xs font-medium px-3 py-1 rounded-full",
            categoryColors[task.category]
          )}>
            {categoryLabels[task.category]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">KSh {Number(task.budget).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} />
            {task.location}
          </div>
          {task.deadline && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                {new Date(task.deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                {new Date(task.deadline).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-2">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {task.description}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-foreground mb-2">Location</h2>
          <div className="rounded-xl bg-muted h-40 flex items-center justify-center border">
            <div className="text-center text-muted-foreground">
              <MapPin size={24} className="mx-auto mb-1 opacity-40" />
              <p className="text-sm">{task.location}</p>
              <p className="text-xs opacity-60">Map view coming soon</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground border-t pt-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {task.poster?.username}
            </p>
            <p className="text-xs">
              Posted {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Only Taskers can bid */}
        {user?.role === "tasker" && task.status === "open" && (
          <button
            onClick={() => applied ? null : setBidOpen(true)}
            disabled={applied}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-lg transition-all",
              applied
                ? "bg-success/10 text-success cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {applied ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} />
                Bid Submitted!
              </span>
            ) : (
              "Place a Bid"
            )}
          </button>
        )}

        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign in to Apply
          </button>
        )}
      </div>

      {/* Bidding Modal */}
      <Dialog open={bidOpen} onOpenChange={setBidOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
            <DialogDescription>
              Send a message and your proposed price to the poster.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {bidError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {bidError}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Your Message
              </label>
              <textarea
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                placeholder="Why are you a great fit for this task?"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Proposed Price (KSh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">KSh</span>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
            <button
              onClick={handleBidSubmit}
              disabled={bidLoading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {bidLoading ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}