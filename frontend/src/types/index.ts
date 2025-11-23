export interface AnalysisResult {
  score: number;
  risk_category: "Easy" | "Moderate" | "Difficult";
  concerns: string[];
  images_analyzed: number;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  score: number;
  risk_category: "Easy" | "Moderate" | "Difficult";
  concerns: string[];
  images_analyzed: number;
  thumbnail?: string; // Base64 encoded thumbnail of first image
}
