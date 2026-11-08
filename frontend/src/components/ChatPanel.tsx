import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { APP_NAME } from "../constants/brand";

export default function ChatPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-swiss bg-surface p-6 space-y-4 text-left shadow-subtle"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Terminal className="w-4 h-4 text-primary" />
        <h2 className="font-serif text-lg font-bold text-ink-primary">
          {APP_NAME} AI Coach
        </h2>
      </div>

      <div className="h-72 overflow-y-auto space-y-3 p-3 bg-surface-subtle rounded border border-border">
        <div className="bg-surface p-3 rounded border border-border text-xs text-ink-secondary w-fit shadow-subtle">
          Interview guidance prompt stream ready...
        </div>
      </div>
    </motion.div>
  );
}
