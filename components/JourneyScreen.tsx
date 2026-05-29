"use client";

import { AnchorProvider } from "@/lib/anchors";
import ConnectionCanvas from "@/components/ConnectionCanvas";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Wordmark from "@/components/Wordmark";

export default function JourneyScreen() {
  return (
    <AnchorProvider>
      <main className="relative h-full w-full overflow-hidden">
        <div className="bg-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <ConnectionCanvas />
        <LeftSidebar />
        <RightSidebar />
        <Wordmark />
      </main>
    </AnchorProvider>
  );
}
