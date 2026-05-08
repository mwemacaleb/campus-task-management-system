import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardList, MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

const stepLabels = ["Details", "Location & Time", "Budget"];

export default function PostTask() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get("/payments/wallet/").then((res) => {
      setWalletBalance(Number(res.data.balance));
    }).catch(() => {});
  }, [user]);

  const [form, setForm] = useState({
    title: "",
    category: "tech",
    description: "",
    location: "",
    date: "",
    time: "",
    budget: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const deadline = form.date && form.time
        ? `${form.date}T${form.time}:00`
        : null;

      await api.post("/tasks/create/", {
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location,
        budget: form.budget,
        deadline: deadline,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError("Failed to post task. Please check all fields and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <ClipboardList size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Sign in to post a task</h2>
        <p className="text-muted-foreground mb-6">Create an account to start posting tasks for students.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Task Posted!</h2>
        <p className="text-muted-foreground mb-6">Your task is live. Students will start applying soon.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          View My Posts
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 container max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Post a Task</h1>
      <p className="text-muted-foreground text-sm mb-6">Find a student to help you out</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {step === 0 && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Task Title</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g., Fix my laptop WiFi"
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="tech">Tech</option>
                <option value="cleaning">Cleaning</option>
                <option value="errands">Errands</option>
                <option value="tutoring">Tutoring</option>
                <option value="moving">Moving</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe what you need done..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g., Dorm Hall B, Room 204"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Budget (KSh)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">KSh</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  placeholder="500"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
            {walletBalance !== null && form.budget && Number(form.budget) > walletBalance && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Insufficient wallet balance</p>
                  <p className="text-xs mt-0.5">
                    Your balance is KSh {walletBalance.toLocaleString()}. Top up your wallet before hiring a tasker.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/wallet")}
                      className="underline font-semibold"
                    >
                      Top Up
                    </button>
                  </p>
                </div>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Summary</p>
              <p><strong>Title:</strong> {form.title || "—"}</p>
              <p><strong>Location:</strong> {form.location || "—"}</p>
              <p><strong>Date:</strong> {form.date || "—"} at {form.time || "—"}</p>
              <p><strong>Budget:</strong> {form.budget ? `KSh ${Number(form.budget).toLocaleString()}` : "—"}</p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 rounded-lg border text-foreground font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post Task"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}