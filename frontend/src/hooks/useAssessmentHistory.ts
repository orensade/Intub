import { useState, useEffect, useCallback } from "react";
import type { HistoryItem, AnalysisResult } from "../types";

const STORAGE_KEY = "intub_assessment_history";
const MAX_HISTORY_ITEMS = 10;

export function useAssessmentHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (err) {
      console.error("Failed to load assessment history:", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setHistory(items);
    } catch (err) {
      console.error("Failed to save assessment history:", err);
    }
  }, []);

  // Add a new assessment to history
  const addAssessment = useCallback(
    (result: AnalysisResult, thumbnail?: string) => {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        score: result.score,
        risk_category: result.risk_category,
        concerns: result.concerns,
        images_analyzed: result.images_analyzed,
        thumbnail,
      };

      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updatedHistory);
      return newItem.id;
    },
    [history, saveHistory]
  );

  // Get a specific assessment by ID
  const getAssessment = useCallback(
    (id: string): HistoryItem | undefined => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  // Delete an assessment from history
  const deleteAssessment = useCallback(
    (id: string) => {
      const updatedHistory = history.filter((item) => item.id !== id);
      saveHistory(updatedHistory);
    },
    [history, saveHistory]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return {
    history,
    addAssessment,
    getAssessment,
    deleteAssessment,
    clearHistory,
  };
}

// Helper function to create a thumbnail from an image file
export async function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Create a small thumbnail (60x60)
        const size = 60;
        canvas.width = size;
        canvas.height = size;

        // Calculate crop to make it square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) {
    return "Just now";
  } else if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diff < 2 * day) {
    return "Yesterday";
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} days ago`;
  } else {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}
