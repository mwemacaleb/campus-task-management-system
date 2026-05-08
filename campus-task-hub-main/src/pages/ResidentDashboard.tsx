import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ClipboardList, Users, ChevronRight, PlusCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  open: "Waiting for Bids",
  assigned: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const categoryLabels: Record<string, string> = {
  tech: "Tech",
  cleaning: "Cleaning",
  errands: "Errands",
  tutoring: "Tutoring",
  moving: "Moving",
};

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await api.get("/tasks/my-tasks/");
        setTasks(response.data);
      } catch {
        setError("Failed to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchMyTasks();
  }, [user]);

  const handleMarkComplete = async (taskId: number) => {
    setCompleting(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status/`, { status: "completed" });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "completed" } : t))
      );
    } catch {
      setError("Failed to mark task as complete.");
    } finally {
      setCompleting(null);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <ClipboardList size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">My Posts</h2>
        <p className="text-muted-foreground mb-6">Sign in to manage your tasks.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Posts</h1>
          <p className="text-muted-foreground text-sm">Manage your active tasks</p>
        </div>
        <button
          onClick={() => navigate("/post-task")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <PlusCircle size={16} />
          New Task
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground line-clamp-1">{task.title}</h3>
                <span className={cn(
                  "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full",
                  statusColors[task.status]
                )}>
                  {statusLabels[task.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {categoryLabels[task.category]} · KSh {Number(task.budget).toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {task.bid_count || 0} applicant{task.bid_count !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-2">
                {task.status !== "completed" && task.status !== "cancelled" && (
                  <button
                    onClick={() => navigate(`/tasks/${task.id}/applicants`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronRight size={14} />
                    View Applicants
                  </button>
                )}
                {task.status === "assigned" && (
                  <button
                    onClick={() => handleMarkComplete(task.id)}
                    disabled={completing === task.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success/10 text-success border border-success/20 text-sm font-medium hover:bg-success/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    {completing === task.id ? "Completing..." : "Mark Complete"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
