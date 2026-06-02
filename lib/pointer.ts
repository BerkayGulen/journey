"use client";

import { useEffect, useState } from "react";

/**
 * True when the primary pointer can't hover (touch devices). Used to switch
 * the hover-reveal sidebars to a tap-to-expand interaction on mobile, where
 * hover doesn't exist. Defaults to false on the server / first paint.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return coarse;
}
