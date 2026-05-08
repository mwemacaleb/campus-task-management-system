import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import SkeletonCard from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const categoryLabels: Record<string, string> = {
  tech: "Tech",
  cleaning: "Cleaning",
  errands: "Errands",
  tutoring: "Tutoring",
  moving: "Moving",
};

const categories = ["all", "tech", "cleaning", "errands", "tutoring", "moving"];

export default function TaskMarketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = category !== "all" ? `?category=${category}` : "";
        const response = await api.get(`/tasks/${params}`);
        setTasks(response.data);
      } catch (err) {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [category]);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Task Marketplace</h1>
      <p className="text-muted-foreground text-sm mb-6">Find tasks near campus</p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize",
              category === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {cat === "all" ? "All" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length > 0
            ? filtered.map((task) => <TaskCard key={task.id} task={task} />)
            : (
              <div className="text-center py-12 text-muted-foreground">
                <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No tasks found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )
        }
      </div>
    </div>
  );
}
