import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, ClipboardList, TrendingUp, Star, CheckCircle, DollarSign, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  tech: "#3b82f6",
  cleaning: "#22c55e",
  errands: "#eab308",
  tutoring: "#a855f7",
  moving: "#f97316",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#eab308",
  assigned: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const CATEGORY_LABELS: Record<string, string> = {
  tech: "Tech",
  cleaning: "Cleaning",
  errands: "Errands",
  tutoring: "Tutoring",
  moving: "Moving",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  assigned: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tasks/stats/")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role === "poster") {
    return (
      <div className="px-4 py-16 text-center">
        <Lock size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Admin Only</h2>
        <p className="text-muted-foreground mb-6">Platform analytics are managed by the admin.</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-500">{error || "No data available."}</p>
      </div>
    );
  }

  const categoryData = stats.by_category.map((item: any) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    count: item.count,
    fill: CATEGORY_COLORS[item.category] || "#94a3b8",
  }));

  const statusData = stats.by_status.map((item: any) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status] || "#94a3b8",
  }));

  const completionRate = stats.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  const summaryCards = [
    { label: "Total Tasks", value: stats.total_tasks, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { label: "Total Users", value: stats.total_users, icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Total Bids", value: stats.total_bids, icon: TrendingUp, color: "bg-yellow-100 text-yellow-600" },
    { label: "Completed Tasks", value: stats.completed_tasks, icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { label: "Total Reviews", value: stats.total_reviews, icon: Star, color: "bg-orange-100 text-orange-600" },
    { label: "Total Value (KSh)", value: `KSh ${Number(stats.total_value).toLocaleString()}`, icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div className="px-4 py-6 container max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Analytics</h1>
      <p className="text-muted-foreground text-sm mb-6">Platform-wide data analysis and insights</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border shadow-sm p-4"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Completion rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border shadow-sm p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Task Completion Rate</p>
          <span className="text-sm font-bold text-success">{completionRate}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-success h-3 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.completed_tasks} of {stats.total_tasks} tasks completed
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Tasks by category — bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border shadow-sm p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Tasks by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Tasks by status — pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border shadow-sm p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Task Status Breakdown</h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* User breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl border shadow-sm p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">User Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <p className="text-3xl font-extrabold text-blue-600">{stats.total_posters}</p>
            <p className="text-xs text-muted-foreground mt-1">Residents (Posters)</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-50">
            <p className="text-3xl font-extrabold text-purple-600">{stats.total_taskers}</p>
            <p className="text-xs text-muted-foreground mt-1">Students (Taskers)</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
