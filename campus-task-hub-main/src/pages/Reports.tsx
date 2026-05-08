import { useEffect, useState } from "react";
import { FileText, Download, ClipboardList, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  assigned: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const bidStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const endpoint = user.role === "poster" ? "/tasks/my-tasks/" : "/bids/my-bids/";
    api.get(endpoint)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleExport = () => {
    const rows = filteredData.map((item: any) => {
      if (user?.role === "poster") {
        return [item.title, item.category, item.status, `KSh ${item.budget}`, item.bid_count ?? 0, item.created_at?.slice(0, 10)].join(",");
      } else {
        return [item.task_title, item.status, `KSh ${item.proposed_price}`, item.created_at?.slice(0, 10)].join(",");
      }
    });
    const header = user?.role === "poster"
      ? "Title,Category,Status,Budget,Bids,Posted"
      : "Task,Bid Status,Your Price,Date";
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <FileText size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Reports</h2>
        <p className="text-muted-foreground mb-6">Sign in to view your reports.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">Sign In</button>
      </div>
    );
  }

  const filterOptions = user.role === "poster"
    ? ["all", "open", "assigned", "completed", "cancelled"]
    : ["all", "pending", "accepted", "rejected"];

  const filteredData = filter === "all"
    ? data
    : data.filter((item: any) => (user.role === "poster" ? item.status : item.status) === filter);

  const totalValue = user.role === "poster"
    ? data.reduce((sum: number, t: any) => sum + Number(t.budget || 0), 0)
    : data.filter((b: any) => b.status === "accepted").reduce((sum: number, b: any) => sum + Number(b.proposed_price || 0), 0);

  return (
    <div className="px-4 py-6 container max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        {user.role === "poster" ? "Your posted tasks summary" : "Your bids and applications summary"}
      </p>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
            <ClipboardList size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{data.length}</p>
          <p className="text-xs text-muted-foreground">{user.role === "poster" ? "Tasks Posted" : "Bids Placed"}</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mb-2">
            <DollarSign size={18} className="text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">KSh {Number(totalValue).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{user.role === "poster" ? "Total Budget Posted" : "Total Accepted Value"}</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
            <FileText size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {user.role === "poster"
              ? data.filter((t: any) => t.status === "completed").length
              : data.filter((b: any) => b.status === "accepted").length}
          </p>
          <p className="text-xs text-muted-foreground">{user.role === "poster" ? "Completed" : "Accepted Bids"}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {f === "all" ? "All" : statusLabels[f] ?? f}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={36} className="mx-auto mb-3 opacity-30" />
          <p>No records found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {user.role === "poster" ? (
                  <>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Task</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">Budget</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">Bids</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">Posted</th>
                  </>
                ) : (
                  <>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Task</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">Your Price</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item: any, i: number) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {user.role === "poster" ? (
                    <>
                      <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">{item.title}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize hidden md:table-cell">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusColors[item.status])}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">KSh {Number(item.budget).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{item.bid_count ?? 0}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{item.created_at?.slice(0, 10)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">{item.task_title}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", bidStatusColors[item.status])}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">KSh {Number(item.proposed_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{item.created_at?.slice(0, 10)}</td>
                    </>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
