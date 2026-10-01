"use client";

import * as React from "react";

export interface NodePosition {
  x: number;
  y: number;
}

export type NodePositionsMap = Record<string, NodePosition>;

interface LayoutStoragePayload {
  version: 1;
  rootUnitId: string;
  updatedAt: string;
  positions: NodePositionsMap;
}

const STORAGE_VERSION = 1;
const MAX_STORED_ENTRIES = 500;
const MAX_UNDO_STEPS = 20;

/**
 * Generates the versioned storage key per Part 5.
 * Format: oms.orgchart.layout.v1.{userId}.{rootUnitId}
 */
function getStorageKey(userId: string, rootUnitId: string): string {
  return `oms.orgchart.layout.v1.${userId || "default"}.${rootUnitId || "root"}`;
}

export interface UseOrgChartLayoutPersistenceOptions {
  userId?: string;
  rootUnitId?: string;
  activeUnitIds?: Set<string>;
}

export function useOrgChartLayoutPersistence({
  userId = "default",
  rootUnitId = "root",
  activeUnitIds,
}: UseOrgChartLayoutPersistenceOptions) {
  const [positions, setPositions] = React.useState<NodePositionsMap>({});
  const [history, setHistory] = React.useState<NodePositionsMap[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLoadedRef = React.useRef(false);

  const storageKey = React.useMemo(
    () => getStorageKey(userId, rootUnitId),
    [userId, rootUnitId]
  );

  // 1. Load persisted layout on mount or key change
  React.useEffect(() => {
    isLoadedRef.current = false;
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setPositions({});
        setHistory([{}]);
        setHistoryIndex(0);
        isLoadedRef.current = true;
        return;
      }

      const parsed: LayoutStoragePayload = JSON.parse(raw);

      // Discard whole entry if version doesn't match per Part 5
      if (parsed.version !== STORAGE_VERSION || parsed.rootUnitId !== rootUnitId) {
        localStorage.removeItem(storageKey);
        setPositions({});
        setHistory([{}]);
        setHistoryIndex(0);
        isLoadedRef.current = true;
        return;
      }

      let loadedPositions = parsed.positions || {};

      // Drop entries for units that no longer exist (if activeUnitIds provided)
      if (activeUnitIds && activeUnitIds.size > 0) {
        const pruned: NodePositionsMap = {};
        for (const [unitId, pos] of Object.entries(loadedPositions)) {
          if (activeUnitIds.has(unitId)) {
            pruned[unitId] = pos;
          }
        }
        loadedPositions = pruned;
      }

      setPositions(loadedPositions);
      setHistory([loadedPositions]);
      setHistoryIndex(0);
      isLoadedRef.current = true;
    } catch {
      // Private browsing or quota limits degrade gracefully to auto-layout without throwing
      setPositions({});
      setHistory([{}]);
      setHistoryIndex(0);
      isLoadedRef.current = true;
    }
  }, [storageKey, rootUnitId]);

  // 2. Debounced save to localStorage (500ms after last position change)
  const saveToStorage = React.useCallback(
    (newPositions: NodePositionsMap) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          if (typeof window === "undefined") return;

          // Cap at 500 entries per Part 5
          const entries = Object.entries(newPositions);
          let cappedPositions = newPositions;
          if (entries.length > MAX_STORED_ENTRIES) {
            cappedPositions = Object.fromEntries(entries.slice(0, MAX_STORED_ENTRIES));
          }

          const payload: LayoutStoragePayload = {
            version: STORAGE_VERSION,
            rootUnitId,
            updatedAt: new Date().toISOString(),
            positions: cappedPositions,
          };

          localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch {
          // Graceful fallback for quota limits/private browsing
        }
      }, 500);
    },
    [storageKey, rootUnitId]
  );

  // 3. Update positions with Undo/Redo tracking
  const updatePositions = React.useCallback(
    (
      newOrUpdater:
        | NodePositionsMap
        | ((prev: NodePositionsMap) => NodePositionsMap),
      trackHistory = true
    ) => {
      setPositions((prev) => {
        const next =
          typeof newOrUpdater === "function"
            ? newOrUpdater(prev)
            : newOrUpdater;

        saveToStorage(next);

        if (trackHistory) {
          setHistory((prevHistory) => {
            // Truncate any redo future when new action happens
            const currentHistory = prevHistory.slice(0, historyIndex + 1);
            const updatedHistory = [...currentHistory, next];
            // Cap at 20 steps
            if (updatedHistory.length > MAX_UNDO_STEPS) {
              return updatedHistory.slice(updatedHistory.length - MAX_UNDO_STEPS);
            }
            return updatedHistory;
          });
          setHistoryIndex((prevIndex) =>
            Math.min(prevIndex + 1, MAX_UNDO_STEPS - 1)
          );
        }

        return next;
      });
    },
    [historyIndex, saveToStorage]
  );

  // 4. Set single node position
  const setNodePosition = React.useCallback(
    (unitId: string, pos: NodePosition, trackHistory = true) => {
      updatePositions(
        (prev) => ({
          ...prev,
          [unitId]: pos,
        }),
        trackHistory
      );
    },
    [updatePositions]
  );

  // 5. Undo (Cmd+Z)
  const undo = React.useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetState = history[prevIndex];
      if (targetState) {
        setHistoryIndex(prevIndex);
        setPositions(targetState);
        saveToStorage(targetState);
      }
    }
  }, [historyIndex, history, saveToStorage]);

  // 6. Redo (Cmd+Shift+Z)
  const redo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetState = history[nextIndex];
      if (targetState) {
        setHistoryIndex(nextIndex);
        setPositions(targetState);
        saveToStorage(targetState);
      }
    }
  }, [historyIndex, history, saveToStorage]);

  // 7. Reset Layout (Clears custom positions)
  const resetLayout = React.useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch {}

    updatePositions({}, true);
  }, [storageKey, updatePositions]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasCustomPositions = Object.keys(positions).length > 0;

  return {
    positions,
    setNodePosition,
    updatePositions,
    undo,
    redo,
    resetLayout,
    canUndo,
    canRedo,
    hasCustomPositions,
    isLoaded: isLoadedRef.current,
  };
}
