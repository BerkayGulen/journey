"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query. Returns false on the server / first paint,
 * then the real match after mount. Used to switch the history detail view
 * between vertical columns (wide) and horizontal rows (narrow / mobile).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}
