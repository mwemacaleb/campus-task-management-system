import { useEffect, useState } from "react";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Clock, Plus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Transaction {
  id: number;
  amount: number;
  transaction_type: "topup" | "escrow" | "release" | "refund";
  description: string;
  task: number | null;
  created_at: string;
}

interface WalletData {
  balance: number;
  escrow_balance: number;
  transactions: Transaction[];
}

const TYPE_META: Record<string, { label: string; icon: any; color: string; sign: string }> = {
  topup:   { label: "Top Up",          icon: Plus,            color: "text-emerald-600", sign: "+" },
  escrow:  { label: "Escrow Hold",     icon: Clock,           color: "text-amber-600",   sign: "-" },
  release: { label: "Payment",         icon: TrendingUp,      color: "text-blue-600",    sign: "+" },
  refund:  { label: "Refund",          icon: ArrowUpCircle,   color: "text-purple-600",  sign: "+" },
};

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [topping, setTopping] = useState(false);
  const [topupMsg, setTopupMsg] = useState("");
  const [topupErr, setTopupErr] = useState("");

  const fetchWallet = () => {
    setLoading(true);
    api.get("/payments/wallet/")
      .then((r) => setWallet(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopUp = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setTopupErr("Enter a valid amount."); return; }
    setTopping(true); setTopupMsg(""); setTopupErr("");
    try {
      const res = await api.post("/payments/topup/", { amount: val });
      setTopupMsg(res.data.message);
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      setTopupErr(err.response?.data?.error || "Top-up failed.");
    } finally { setTopping(false); }
  };

  if (loading) {
    return <div className="px-4 py-16 text-center text-muted-foreground">Loading wallet...</div>;
  }

  if (!wallet) {
    return <div className="px-4 py-16 text-center text-destructive">Failed to load wallet.</div>;
  }

  return (
    <div className="px-4 py-6 container max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-2xl p-5 text-primary-foreground"
        >
          <div className="flex items-center gap-2 mb-3 opacity-80">
            <WalletIcon size={16} />
            <span className="text-xs font-medium">Available</span>
          </div>
          <p className="text-2xl font-extrabold">KSh {Number(wallet.balance).toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-amber-50 border border-amber-100 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3 text-amber-600">
            <Clock size={16} />
            <span className="text-xs font-medium">In Escrow</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">KSh {Number(wallet.escrow_balance).toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Top-up form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border shadow-sm p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <ArrowDownCircle size={16} className="text-primary" /> Top Up Wallet
        </h2>

        <div className="flex gap-2 mb-2">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in KSh"
            className="flex-1 px-3 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
          />
          <button
            onClick={handleTopUp}
            disabled={topping || !amount}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {topping ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {[500, 1000, 2000, 5000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="px-3 py-1 rounded-full text-xs font-medium border hover:bg-muted transition-colors"
            >
              +{v.toLocaleString()}
            </button>
          ))}
        </div>

        {topupMsg && <p className="text-xs text-emerald-600 mt-2 font-medium">{topupMsg}</p>}
        {topupErr && <p className="text-xs text-destructive mt-2">{topupErr}</p>}
      </motion.div>

      {/* Transaction history */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border shadow-sm p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Transaction History</h2>

        {wallet.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx) => {
              const meta = TYPE_META[tx.transaction_type] ?? TYPE_META.topup;
              const Icon = meta.icon;
              const isCredit = tx.transaction_type === "topup" || tx.transaction_type === "release" || tx.transaction_type === "refund";
              return (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-muted shrink-0`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-emerald-600" : "text-amber-600"}`}>
                    {meta.sign}KSh {Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
