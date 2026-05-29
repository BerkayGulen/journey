"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * AnchorRegistry — a lightweight shared registry mapping a stable id to the
 * live DOM element(s) under it. Sidebar blocks/strips register themselves here;
 * the connection canvas reads their `getBoundingClientRect()` each animation
 * frame to anchor the organic lines. DOM is the single source of truth, so
 * Framer Motion transforms (hover-expand, carousel scroll) are tracked for free.
 *
 * An id can map to MULTIPLE elements: the left carousel renders each course
 * block twice (for a seamless infinite loop), so both copies register under the
 * same `course-{id}` key and the canvas crossfades between them.
 */
interface AnchorRegistryValue {
  /** Add (`true`) or remove (`false`) an element under an id. */
  register: (id: string, el: HTMLElement, add: boolean) => void;
  /** The live id → element-set map (mutated in place; read inside rAF loops). */
  elements: Map<string, Set<HTMLElement>>;
}

const AnchorContext = createContext<AnchorRegistryValue | null>(null);

export function AnchorProvider({ children }: { children: ReactNode }) {
  // Stable Map kept in state (initializer runs once); mutated in place, never
  // via setState — so it's a render-safe value rather than a ref.
  const [elements] = useState(() => new Map<string, Set<HTMLElement>>());

  const register = useCallback(
    (id: string, el: HTMLElement, add: boolean) => {
      let set = elements.get(id);
      if (add) {
        if (!set) {
          set = new Set();
          elements.set(id, set);
        }
        set.add(el);
      } else if (set) {
        set.delete(el);
        if (set.size === 0) elements.delete(id);
      }
    },
    [elements],
  );

  const value = useMemo<AnchorRegistryValue>(
    () => ({ register, elements }),
    [register, elements],
  );

  return <AnchorContext.Provider value={value}>{children}</AnchorContext.Provider>;
}

function useAnchorRegistry(): AnchorRegistryValue {
  const ctx = useContext(AnchorContext);
  if (!ctx) {
    throw new Error("useAnchorRegistry must be used within an <AnchorProvider>");
  }
  return ctx;
}

/**
 * Returns a callback ref that registers the element under `id` for the lifetime
 * of the node (handling the specific node on mount/unmount so multiple copies
 * coexist). Attach to any block/strip an organic line connects to.
 */
export function useAnchorRef(id: string) {
  const { register } = useAnchorRegistry();
  const prev = useRef<HTMLElement | null>(null);
  return useCallback(
    (el: HTMLElement | null) => {
      if (prev.current) register(id, prev.current, false);
      prev.current = el;
      if (el) register(id, el, true);
    },
    [register, id],
  );
}

/** Access the live id → element-set map (used by the connection canvas). */
export function useAnchorElements() {
  return useAnchorRegistry().elements;
}
