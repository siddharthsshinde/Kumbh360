import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface Props {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 72 }: Props) {
  const progress = Math.min(pullDistance / threshold, 1);
  const show = pullDistance > 4 || isRefreshing;

  if (!show) return null;

  return (
    <motion.div
      style={{ height: isRefreshing ? 48 : pullDistance * 0.65 }}
      className="flex items-center justify-center overflow-hidden"
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : { rotate: progress * 270 }}
        transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7F00] shadow-md"
      >
        <RefreshCw className="h-4 w-4 text-white" />
      </motion.div>
    </motion.div>
  );
}
