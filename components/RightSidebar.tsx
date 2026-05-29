"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { historyCourses, layout } from "@/data/courses";
import { useAnchorRef } from "@/lib/anchors";

const collapsedWidth = layout.rightCollapsedWidth;
const expandedWidth = Math.round(collapsedWidth * layout.rightExpandFactor);

function HistoryStripView({ id, color }: { id: string; color: string }) {
  const anchorRef = useAnchorRef(`history-${id}`);
  return (
    <div
      ref={anchorRef}
      className="w-full flex-1"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export default function RightSidebar() {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      className="absolute right-0 top-0 z-10 flex h-full flex-col justify-end"
      style={{ width: collapsedWidth }}
      animate={{ width: hovered ? expandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Strips start from the bottom and occupy the lower ~quarter. */}
      <div
        className="flex w-full flex-col"
        style={{ height: `${layout.historyHeightRatio * 100}%` }}
      >
        {historyCourses.map((strip) => (
          <HistoryStripView key={strip.id} id={strip.id} color={strip.color} />
        ))}
      </div>
    </motion.div>
  );
}
