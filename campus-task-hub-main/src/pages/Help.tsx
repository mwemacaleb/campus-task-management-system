import { useState } from "react";
import { ChevronDown, HelpCircle, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Create Account' on the home page. Enter your full name, email, and password. If you are a student who wants to earn money by completing tasks, check the 'Register as Student' checkbox. Residents who want to post tasks leave it unchecked.",
      },
      {
        q: "What is the difference between a Resident and a Student account?",
        a: "Residents (Posters) are community members who need tasks done — they post tasks, set budgets, and hire students. Students (Taskers) are verified university students who browse tasks, place bids, and earn money by completing them.",
      },
      {
        q: "How do I verify my student account?",
        a: "After signing up as a student, you will be redirected to the Verification page. Enter your university .edu email and click 'Verify Account'. Your account will be marked as verified immediately.",
      },
    ],
  },
  {
    category: "Posting & Finding Tasks",
    items: [
      {
        q: "How do I post a task?",
        a: "Sign in as a Resident, then click 'Post Task' in the navigation. Fill in the task title, category, description, location, date/time, and budget. Click 'Post Task' to publish it live.",
      },
      {
        q: "What categories are available?",
        a: "Tasks can be categorised as: Tech (IT help, repairs), Cleaning (home or office cleaning), Errands (shopping, deliveries), Tutoring (academic help), and Moving (furniture or relocation assistance).",
      },
      {
        q: "How do I search for tasks?",
        a: "Go to the Task Marketplace page. Use the search bar to find tasks by keyword, or click a category filter button (Tech, Cleaning, etc.) to narrow results.",
      },
    ],
  },
  {
    category: "Bidding & Hiring",
    items: [
      {
        q: "How do I bid on a task?",
        a: "Open any task from the marketplace, then click 'Place a Bid'. Enter your message explaining why you are a good fit and your proposed price, then submit. The task poster will review your application.",
      },
      {
        q: "How do I hire a student?",
        a: "Go to 'My Posts' in your dashboard, click a task, then click 'View Applicants'. You will see all bids. Click 'Hire' next to the student you want — this assigns the task to them and automatically rejects all other bids.",
      },
      {
        q: "Can I bid on a task I already bid on?",
        a: "No. Each student can only place one bid per task. If you have already bid, the bid button will be replaced with a confirmation message.",
      },
      {
        q: "How do I mark a task as complete?",
        a: "Once the work is done, go to 'My Posts', find the task with status 'In Progress', and click the green 'Mark Complete' button. This records the task as completed and allows both parties to leave reviews.",
      },
    ],
  },
  {
    category: "Payments & Earnings",
    items: [
      {
        q: "How are payments handled?",
        a: "Payments are handled directly between the resident and the student outside the platform. Community Tasker facilitates the connection — agree on payment method with the other party before starting the task.",
      },
      {
        q: "Where can I see my earnings?",
        a: "Students can view all completed tasks (their earnings history) on the Earnings page accessible from the bottom navigation.",
      },
    ],
  },
  {
    category: "Reviews & Ratings",
    items: [
      {
        q: "How do I leave a review?",
        a: "After a task is marked as completed, both parties can leave a review. Reviews include a star rating (1–5) and an optional comment. Reviews are visible on the reviewer's profile.",
      },
      {
        q: "Where can I see my ratings?",
        a: "Visit your Profile page. Your average rating and all received reviews are displayed there.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200 mt-0.5",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Help() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? faqs.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((section) => section.items.length > 0)
    : faqs;

  return (
    <div className="px-4 py-6 container max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={28} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Help Centre</h1>
        <p className="text-muted-foreground text-sm mt-1">Find answers to common questions</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* FAQ sections */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No results for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((section) => (
            <div key={section.category} className="bg-card rounded-xl border shadow-sm p-5">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
                {section.category}
              </h2>
              {section.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Contact section */}
      <div className="mt-8 bg-muted/50 rounded-xl border p-6 text-center">
        <MessageSquare size={24} className="mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold text-foreground mb-1">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Can't find what you're looking for? Check the documentation or browse tasks.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Browse Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
