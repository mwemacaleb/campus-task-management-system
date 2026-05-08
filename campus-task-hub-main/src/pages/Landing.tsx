import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap, ClipboardList, UserCheck, HandshakeIcon, ArrowRight } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Post a Task", desc: "Describe what you need done and set your budget." },
  { icon: UserCheck, title: "Get Matched", desc: "Verified students apply and you pick the best fit." },
  { icon: HandshakeIcon, title: "Get it Done", desc: "Task completed, payment released. Simple." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground px-4 py-16 md:py-24">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
            Campus Tasks,
            <br />
            Trusted Hands.
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Connect with verified university students for everyday tasks — from tech help to errands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-card text-foreground font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Briefcase size={22} />
              I need a task done
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <GraduationCap size={22} />
              I want to earn
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16 md:py-20">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <step.icon size={26} className="text-primary-foreground" />
                </div>
                <div className="text-xs font-bold text-muted-foreground mb-2">STEP {i + 1}</div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-muted/50">
        <div className="container max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            ["1,200+", "Tasks Completed"],
            ["500+", "Verified Students"],
            ["4.9★", "Avg Rating"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-extrabold text-primary">{num}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8">Join hundreds of students and residents in your community.</p>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Create an Account
        </button>
      </section>
    </div>
  );
}
