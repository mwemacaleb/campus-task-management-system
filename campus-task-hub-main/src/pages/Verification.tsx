import { useState } from "react";
import {
  ShieldCheck, Upload, Mail, CheckCircle,
  Clock, XCircle, Phone, CreditCard, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const ALLOWED_EDU_DOMAINS = [".edu", ".ac.ke", ".ac.ug", ".ac.tz", ".ac.za"];

export default function Verification() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Tasker fields
  const [eduEmail, setEduEmail] = useState("");
  const [idUploaded, setIdUploaded] = useState(false);

  // Poster fields
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");

  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <ShieldCheck size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-foreground mb-2">Verify Your Account</h2>
        <p className="text-muted-foreground mb-6">Sign in to verify your account.</p>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
          Sign In
        </button>
      </div>
    );
  }

  // Already verified
  if (user.is_verified || user.verification_status === "approved") {
    return (
      <div className="px-4 py-16 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-success" />
        <h2 className="text-xl font-bold text-foreground mb-2">Verified!</h2>
        <p className="text-muted-foreground mb-6">
          Your account is fully verified.{" "}
          {user.role === "tasker" ? "You can bid on tasks." : "You can post tasks."}
        </p>
        <button onClick={() => navigate(user.role === "tasker" ? "/tasks" : "/dashboard")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
          {user.role === "tasker" ? "Browse Tasks" : "Go to Dashboard"}
        </button>
      </div>
    );
  }

  // Pending review
  if (user.verification_status === "pending" && !submitted) {
    return (
      <div className="px-4 py-16 text-center max-w-sm mx-auto">
        <Clock size={48} className="mx-auto mb-4 text-warning" />
        <h2 className="text-xl font-bold text-foreground mb-2">Under Review</h2>
        <p className="text-muted-foreground mb-2">
          Your verification request has been submitted and is awaiting admin approval.
        </p>
        {user.role === "tasker" && (
          <p className="text-sm text-muted-foreground mb-4">
            Submitted email: <span className="font-medium text-foreground">{user.verification_email}</span>
          </p>
        )}
        {user.role === "poster" && (
          <p className="text-sm text-muted-foreground mb-4">
            Phone on file: <span className="font-medium text-foreground">{user.phone}</span>
          </p>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium mb-6">
          <Clock size={14} /> Pending admin review
        </div>

        <div className="space-y-3">
          <button
            onClick={async () => { setIsLoading(true); await refreshUser(); setIsLoading(false); }}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Checking..." : "Check Approval Status"}
          </button>
          <button
            onClick={() => navigate(user.role === "tasker" ? "/tasks" : "/dashboard")}
            className="w-full py-2.5 rounded-xl border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
          >
            {user.role === "tasker" ? "Browse tasks while you wait" : "Go to dashboard while you wait"}
          </button>
        </div>
      </div>
    );
  }

  // Success after just submitting
  if (submitted) {
    return (
      <div className="px-4 py-16 text-center">
        <Clock size={48} className="mx-auto mb-4 text-warning" />
        <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted!</h2>
        <p className="text-muted-foreground mb-6">
          Your verification is pending admin review. You'll get full access once approved.
        </p>
        <button onClick={() => navigate(user.role === "tasker" ? "/tasks" : "/dashboard")} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
          {user.role === "tasker" ? "Browse Tasks" : "Go to Dashboard"}
        </button>
      </div>
    );
  }

  const isRejected = user.verification_status === "rejected";

  const handleSubmitTasker = async () => {
    if (!eduEmail) { setError("Please enter your university email address."); return; }
    if (!idUploaded) { setError("Please upload your student ID before submitting."); return; }
    setIsLoading(true); setError("");
    try {
      await api.post("/auth/verify/", { edu_email: eduEmail });
      await refreshUser();
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleSubmitPoster = async () => {
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    if (!idNumber.trim()) { setError("Please enter your national ID number."); return; }
    setIsLoading(true); setError("");
    try {
      await api.post("/auth/verify-poster/", { phone: phone.trim(), id_number: idNumber.trim() });
      await refreshUser();
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="px-4 py-6 container max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        {user.role === "tasker" ? "Student Verification" : "Identity Verification"}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        {user.role === "tasker"
          ? "Verify your student status to start earning"
          : "Verify your identity to start posting tasks"}
      </p>

      {/* Rejected banner */}
      {isRejected && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Previous request rejected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please re-submit with valid information.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">
          {error}
        </div>
      )}

      {/* ── TASKER FORM ── */}
      {user.role === "tasker" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">University Email</h3>
                <p className="text-xs text-muted-foreground">Must end in .edu or .ac.ke</p>
              </div>
            </div>
            <input
              type="email"
              value={eduEmail}
              onChange={(e) => setEduEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Accepted: <span className="font-medium">.edu · .ac.ke · .ac.ug · .ac.tz · .ac.za</span>
            </p>
          </div>

          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", idUploaded ? "bg-success/10" : "bg-primary/10")}>
                {idUploaded ? <CheckCircle size={20} className="text-success" /> : <Upload size={20} className="text-primary" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">University ID</h3>
                <p className="text-xs text-muted-foreground">{idUploaded ? "ID noted" : "Photo or scan of your student ID"}</p>
              </div>
            </div>
            {!idUploaded ? (
              <button
                onClick={() => setIdUploaded(true)}
                className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Upload size={24} />
                <span className="text-sm font-medium">Tap to upload your ID</span>
                <span className="text-xs">JPG, PNG or PDF · max 5MB</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <p className="text-sm text-success font-medium">✓ ID uploaded</p>
                <button onClick={() => setIdUploaded(false)} className="text-xs text-muted-foreground underline">Remove</button>
              </div>
            )}
          </div>

          <StepsInfo steps={[
            "Submit your university email and student ID",
            "An admin reviews your request (usually within 24 hours)",
            "Once approved, your account is verified and you can place bids",
          ]} />

          <button
            onClick={handleSubmitTasker}
            disabled={isLoading || !eduEmail || !idUploaded}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Verification Request"}
          </button>
        </div>
      )}

      {/* ── POSTER FORM ── */}
      {user.role === "poster" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Phone Number</h3>
                <p className="text-xs text-muted-foreground">Your active mobile number</p>
              </div>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">National ID Number</h3>
                <p className="text-xs text-muted-foreground">Your government-issued ID number</p>
              </div>
            </div>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <StepsInfo steps={[
            "Submit your phone number and national ID",
            "An admin verifies your identity (usually within 24 hours)",
            "Once approved, you can post tasks and hire students",
          ]} />

          <button
            onClick={handleSubmitPoster}
            disabled={isLoading || !phone.trim() || !idNumber.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Identity Verification"}
          </button>
        </div>
      )}
    </div>
  );
}

function StepsInfo({ steps }: { steps: string[] }) {
  return (
    <div className="bg-muted/50 rounded-xl border p-4">
      <p className="text-xs font-semibold text-foreground mb-2">How verification works</p>
      <ol className="space-y-1">
        {steps.map((step, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="font-bold text-primary">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
