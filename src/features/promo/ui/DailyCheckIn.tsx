import { useState, useEffect } from "react";
import { X, Gift, Check, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = [
  { day: 1, credits: 2 },
  { day: 2, credits: 2 },
  { day: 3, credits: 3 },
  { day: 4, credits: 3 },
  { day: 5, credits: 4 },
  { day: 6, credits: 4 },
  { day: 7, credits: 15, isBonus: true },
];

const TOTAL_CREDITS = DAYS.reduce((sum, d) => sum + d.credits, 0);

export function DailyCheckIn() {
  const [open, setOpen] = useState(false);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const last = localStorage.getItem("era2_checkin_date");
    const today = new Date().toDateString();
    if (last === today) return;

    const savedStreak = parseInt(localStorage.getItem("era2_checkin_streak") || "0");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? Math.min(savedStreak + 1, 7) : 1;

    setStreak(newStreak);
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleCheckin = () => {
    localStorage.setItem("era2_checkin_date", new Date().toDateString());
    localStorage.setItem("era2_checkin_streak", String(streak));
    setOpen(false);
  };

  const current = DAYS[streak - 1];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[400px] max-w-[90vw] rounded-[20px] p-6 text-center"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.45)",
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={16} />
            </button>

            <div className="relative w-16 h-16 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full blur-lg opacity-50"
                style={{ background: "radial-gradient(circle, #ff7a3d, transparent 70%)" }}
                aria-hidden
              />
              <div className="gradient-accent glow-accent relative w-16 h-16 rounded-full flex items-center justify-center">
                <Flame size={28} className="text-white" fill="currentColor" fillOpacity={0.2} strokeWidth={2} />
              </div>
            </div>

            <h2 className="text-[22px] font-bold text-foreground tracking-tight mb-1.5">
              Заходите 7 дней подряд
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              и получите до <span className="font-mono tabular-nums text-foreground font-semibold">{TOTAL_CREDITS}</span> кредитов бесплатно
            </p>

            <div
              className="rounded-[14px] py-3 px-4 mb-5 flex items-center justify-center gap-2"
              style={{
                background: "rgba(232,84,32,0.08)",
                border: "1px solid rgba(232,84,32,0.22)",
              }}
            >
              <span className="text-sm text-foreground">
                Вы на <span className="font-semibold">{streak}-м</span> дне
              </span>
              <span className="w-1 h-1 rounded-full" style={{ background: "rgba(232,84,32,0.4)" }} aria-hidden />
              <span
                className="text-sm font-bold font-mono tabular-nums"
                style={{ color: "hsl(var(--primary))" }}
              >
                +{current.credits} cr
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-6">
              {DAYS.map((d) => {
                const done = d.day < streak;
                const active = d.day === streak;
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full aspect-square rounded-[10px] flex items-center justify-center text-[12px] font-bold font-mono tabular-nums transition-all ${active ? "day-pill-active" : ""}`}
                      style={{
                        background: done
                          ? "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)"
                          : d.isBonus
                            ? "linear-gradient(135deg, #ffc15e, #ff9d3d)"
                            : active
                              ? "hsl(var(--card))"
                              : "hsl(var(--secondary))",
                        boxShadow: done
                          ? "0 4px 12px -4px rgba(232,84,32,0.55)"
                          : d.isBonus
                            ? "0 4px 12px -4px rgba(255,157,61,0.5)"
                            : active
                              ? "0 0 0 1.5px hsl(var(--primary))"
                              : "0 0 0 1px hsl(var(--border))",
                        color: done || d.isBonus
                          ? "#fff"
                          : active
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {done ? (
                        <Check size={14} strokeWidth={2.5} />
                      ) : d.isBonus ? (
                        <Gift size={14} strokeWidth={2.25} />
                      ) : (
                        `+${d.credits}`
                      )}
                    </div>
                    <span
                      className="text-[10px] font-mono tabular-nums"
                      style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCheckin}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-semibold text-white transition-all hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)",
                boxShadow: "0 8px 22px -8px rgba(232,84,32,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              Забрать <span className="font-mono tabular-nums">+{current.credits}</span> кредитов
            </button>
          </motion.div>

          <style>{`
            @keyframes day-pill-pulse {
              0%, 100% { box-shadow: 0 0 0 1.5px hsl(var(--primary)), 0 0 0 0 rgba(232,84,32,0.4); }
              50% { box-shadow: 0 0 0 1.5px hsl(var(--primary)), 0 0 0 5px rgba(232,84,32,0); }
            }
            .day-pill-active {
              animation: day-pill-pulse 2s ease-out infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
