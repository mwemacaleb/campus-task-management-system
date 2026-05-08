import { MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  created_at: string;
  status: string;
  bid_count: number;
}

export default function TaskCard({ task }: { task: Task }) {
  const navigate = useNavigate();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <button
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="w-full text-left bg-card rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </h3>
        <span className={cn(
          "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full",
          categoryColors[task.category]
        )}>
          {categoryLabels[task.category]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-foreground">KSh {Number(task.budget).toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {task.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {timeAgo(task.created_at)}
        </span>
      </div>
    </button>
  );
}