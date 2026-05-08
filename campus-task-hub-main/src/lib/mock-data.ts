export interface Task {
  id: string;
  title: string;
  description: string;
  category: "tech" | "cleaning" | "errands" | "tutoring" | "moving";
  budget: number;
  distance: number;
  postedBy: string;
  postedAt: string;
  location: string;
  date: string;
  time: string;
  status: "open" | "in_progress" | "completed";
  applicants?: Applicant[];
}

export interface Applicant {
  id: string;
  name: string;
  rating: number;
  verified: boolean;
  message: string;
  proposedPrice: number;
  appliedAt: string;
}

export interface Bid {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  proposedPrice: number;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
}

export interface Earning {
  id: string;
  taskTitle: string;
  amount: number;
  completedAt: string;
  paidBy: string;
}

export const mockApplicants: Applicant[] = [
  { id: "a1", name: "Jordan Lee", rating: 4.8, verified: true, message: "I've fixed many WiFi issues. Can come today!", proposedPrice: 30, appliedAt: "1 hour ago" },
  { id: "a2", name: "Priya Sharma", rating: 4.5, verified: true, message: "CS major, experienced with networking.", proposedPrice: 35, appliedAt: "2 hours ago" },
  { id: "a3", name: "Carlos M.", rating: 4.2, verified: false, message: "Happy to help out.", proposedPrice: 25, appliedAt: "3 hours ago" },
];

export const mockBids: Bid[] = [
  { id: "b1", taskId: "1", taskTitle: "Fix my laptop WiFi issues", message: "I can fix this today!", proposedPrice: 30, status: "pending", submittedAt: "1 hour ago" },
  { id: "b2", taskId: "4", taskTitle: "Help move furniture to new apartment", message: "Strong and available!", proposedPrice: 55, status: "accepted", submittedAt: "1 day ago" },
  { id: "b3", taskId: "2", taskTitle: "Deep clean apartment before move-out", message: "Experienced cleaner.", proposedPrice: 75, status: "rejected", submittedAt: "2 days ago" },
];

export const mockEarnings: Earning[] = [
  { id: "e1", taskTitle: "Set up printer network", amount: 30, completedAt: "Feb 18, 2026", paidBy: "Sarah M." },
  { id: "e2", taskTitle: "Move boxes to storage", amount: 45, completedAt: "Feb 15, 2026", paidBy: "James K." },
  { id: "e3", taskTitle: "Grocery delivery", amount: 20, completedAt: "Feb 10, 2026", paidBy: "Emily R." },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Fix my laptop WiFi issues",
    description: "My laptop keeps disconnecting from the campus WiFi. Need someone who can troubleshoot network settings, possibly reinstall drivers, and ensure stable connection. Must be comfortable with Windows 11.",
    category: "tech",
    budget: 35,
    distance: 0.3,
    postedBy: "Sarah M.",
    postedAt: "2 hours ago",
    location: "Dorm Hall B, Room 204",
    date: "2026-02-25",
    time: "3:00 PM",
    status: "open",
    applicants: [
      { id: "a1", name: "Jordan Lee", rating: 4.8, verified: true, message: "I've fixed many WiFi issues!", proposedPrice: 30, appliedAt: "1 hour ago" },
      { id: "a2", name: "Priya Sharma", rating: 4.5, verified: true, message: "CS major here.", proposedPrice: 35, appliedAt: "2 hours ago" },
    ],
  },
  {
    id: "2",
    title: "Deep clean apartment before move-out",
    description: "Need help deep cleaning a 2-bedroom apartment before lease ends. Includes kitchen, bathroom, floors, and windows. Cleaning supplies will be provided.",
    category: "cleaning",
    budget: 80,
    distance: 1.2,
    postedBy: "James K.",
    postedAt: "5 hours ago",
    location: "Oakwood Apartments, Unit 12",
    date: "2026-03-01",
    time: "10:00 AM",
    status: "in_progress",
    applicants: [
      { id: "a3", name: "Carlos M.", rating: 4.2, verified: false, message: "Happy to help.", proposedPrice: 75, appliedAt: "3 hours ago" },
    ],
  },
  {
    id: "3",
    title: "Pick up groceries from Trader Joe's",
    description: "Need someone to pick up a list of about 15 items from Trader Joe's and deliver to my dorm. List will be shared via text. Must have own transportation.",
    category: "errands",
    budget: 25,
    distance: 2.5,
    postedBy: "Emily R.",
    postedAt: "1 day ago",
    location: "Campus Dorm C",
    date: "2026-02-24",
    time: "5:00 PM",
    status: "completed",
  },
  {
    id: "4",
    title: "Help move furniture to new apartment",
    description: "Moving from one apartment to another nearby. Need help carrying a couch, desk, bookshelf, and several boxes. Should take about 2-3 hours.",
    category: "moving",
    budget: 60,
    distance: 0.8,
    postedBy: "Michael T.",
    postedAt: "3 hours ago",
    location: "Pine Street Apartments",
    date: "2026-02-28",
    time: "9:00 AM",
    status: "open",
  },
  {
    id: "5",
    title: "Calculus II tutoring session",
    description: "Need help preparing for midterm exam. Looking for someone who got an A in Calc II. Two 1-hour sessions preferred. Willing to meet at the library.",
    category: "tutoring",
    budget: 40,
    distance: 0.1,
    postedBy: "Alex W.",
    postedAt: "30 minutes ago",
    location: "Main Library, Study Room 3",
    date: "2026-02-26",
    time: "2:00 PM",
    status: "open",
  },
  {
    id: "6",
    title: "Set up smart home devices",
    description: "Just bought some smart plugs, a doorbell camera, and smart lights. Need someone tech-savvy to set them all up and connect to my WiFi.",
    category: "tech",
    budget: 45,
    distance: 1.5,
    postedBy: "Linda P.",
    postedAt: "6 hours ago",
    location: "Elm Street, House 42",
    date: "2026-02-27",
    time: "1:00 PM",
    status: "open",
  },
];

export const categoryColors: Record<string, string> = {
  tech: "bg-primary/10 text-primary",
  cleaning: "bg-accent/10 text-accent",
  errands: "bg-warning/10 text-warning",
  tutoring: "bg-success/10 text-success",
  moving: "bg-destructive/10 text-destructive",
};

export const categoryLabels: Record<string, string> = {
  tech: "Tech",
  cleaning: "Cleaning",
  errands: "Errands",
  tutoring: "Tutoring",
  moving: "Moving",
};

export const statusColors: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

export const statusLabels: Record<string, string> = {
  open: "Waiting for Bids",
  in_progress: "In Progress",
  completed: "Completed",
};
