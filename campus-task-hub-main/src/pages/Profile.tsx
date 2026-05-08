import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, ShieldCheck, LogOut, Star,
  Pencil, Check, X, TrendingUp, Briefcase, Clock, CheckCircle,
} from "lucide-react";
import api from "@/lib/api";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  none:     { label: "Not submitted",   className: "bg-muted text-muted-foreground" },
  pending:  { label: "Pending review",  className: "bg-amber-100 text-amber-700" },
  approved: { label: "Verified",        className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected",        className: "bg-red-100 text-red-600" },
};

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews]   = useState<any[]>([]);
  const [stats, setStats]       = useState<Record<string, any> | null>(null);

  // Edit state
  const [editing, setEditing]         = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio]         = useState("");
  const [saving, setSaving]           = useState(false);
  const [editError, setEditError]     = useState("");

  useEffect(() => {
    if (!user) return;
    api.get(`/reviews/user/${user.id}/`).then((r) => setReviews(r.data)).catch(() => {});
    api.get("/auth/profile/stats/").then((r) => setStats(r.data)).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <User size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Your Profile</h2>
        <p className="text-muted-foreground mb-6">Sign in to see your profile.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
          Sign In
        </button>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const badge = STATUS_BADGE[user.verification_status ?? "none"] ?? STATUS_BADGE.none;

  const startEdit = () => {
    setEditUsername(user.username);
    setEditBio(user.bio ?? "");
    setEditError("");
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    setEditError("");
    try {
      await api.patch("/auth/profile/update/", {
        username: editUsername.trim(),
        bio: editBio.trim(),
      });
      await refreshUser();
      setEditing(false);
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 container max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      {/* ── Identity card ── */}
      <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xl font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full text-lg font-bold px-2 py-1 rounded border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            ) : (
              <h2 className="text-lg font-bold text-foreground truncate">{user.username}</h2>
            )}
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>
          {!editing ? (
            <button onClick={startEdit} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit profile">
              <Pencil size={16} className="text-muted-foreground" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving} className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors" title="Save">
                <Check size={16} className="text-primary" />
              </button>
              <button onClick={cancelEdit} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Cancel">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {editing ? (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        ) : user.bio ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
        ) : null}

        {editError && (
          <p className="text-xs text-destructive bg-red-50 px-3 py-2 rounded-lg border border-red-200">{editError}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail size={16} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate">{user.email}</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <ShieldCheck size={16} className={user.is_verified ? "text-emerald-600" : "text-muted-foreground"} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
              {badge.label}
            </span>
            {!user.is_verified && user.role === "tasker" && user.verification_status !== "pending" && (
              <button onClick={() => navigate("/verify")} className="ml-auto text-xs text-primary font-medium hover:underline">
                Verify now →
              </button>
            )}
            {user.verification_status === "pending" && (
              <span className="ml-auto text-xs text-muted-foreground">awaiting admin</span>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Star size={16} className="text-amber-400 shrink-0" />
            <span className="text-sm text-foreground">
              {avgRating
                ? `${avgRating} ★ (${reviews.length} review${reviews.length !== 1 ? "s" : ""})`
                : "No ratings yet"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats card ── */}
      {stats && (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            {user.role === "poster" ? "Posting Stats" : "Earning Stats"}
          </h3>
          {user.role === "poster" ? (
            <div className="grid grid-cols-2 gap-3">
              <StatItem icon={<Briefcase size={18} className="text-primary" />}   label="Posted"      value={stats.tasks_posted} />
              <StatItem icon={<Clock size={18} className="text-amber-500" />}      label="Open"        value={stats.tasks_open} />
              <StatItem icon={<TrendingUp size={18} className="text-blue-500" />}  label="In Progress" value={stats.tasks_in_progress} />
              <StatItem icon={<CheckCircle size={18} className="text-emerald-600" />} label="Completed" value={stats.tasks_completed} />
              <div className="col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Spent</span>
                <span className="text-lg font-bold text-primary">KSh {stats.total_spent?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatItem icon={<Briefcase size={18} className="text-primary" />}    label="Bids Placed"    value={stats.bids_placed} />
              <StatItem icon={<CheckCircle size={18} className="text-emerald-600" />} label="Bids Accepted" value={stats.bids_accepted} />
              <StatItem icon={<Clock size={18} className="text-amber-500" />}       label="Pending Bids"  value={stats.bids_pending} />
              <StatItem icon={<TrendingUp size={18} className="text-blue-500" />}   label="Tasks Done"    value={stats.tasks_completed} />
              <div className="col-span-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Earned</span>
                <span className="text-lg font-bold text-emerald-700">KSh {stats.total_earned?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Reviews</h3>
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{review.reviewer?.username}</span>
                  <span className="text-xs text-amber-500 font-semibold">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && <p className="text-xs text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => { logout(); navigate("/"); }}
        className="w-full py-2.5 rounded-xl border text-destructive font-medium hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-muted/50 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value ?? 0}</p>
      </div>
    </div>
  );
}
