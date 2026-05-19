import React, { createContext, useContext, useState, ReactNode } from 'react';
import { streamSSE } from '../services/sse';

export type AgentResult = {
  agent: string;
  summary: string;
  final_score?: number;
};

interface DueDiligenceContextType {
  startupName: string;
  isAnalyzing: boolean;
  results: AgentResult[];
  finalScore: number | null;
  startAnalysis: (name: string) => void;
}

const DueDiligenceContext = createContext<DueDiligenceContextType | undefined>(undefined);

export const DueDiligenceProvider = ({ children }: { children: ReactNode }) => {
  const [startupName, setStartupName] = useState('');
  const [results, setResults] = useState<AgentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const startAnalysis = (name: string) => {
    setStartupName(name);
    setIsAnalyzing(true);
    setResults([]);
    setFinalScore(null);

    // Using localhost for local development (updates to machine local IP if needed for physical devices)
    const baseUrl = 'http://localhost:8000';
    const url = `${baseUrl}/api/analyze?startup_name=${encodeURIComponent(name)}`;

    const connection = streamSSE(
      url,
      (data) => {
        console.log('SSE Agent Data:', data);
        setResults((prev) => {
          // Prevent duplicates if any
          const exists = prev.some((r) => r.agent === data.agent);
          if (exists) {
            return prev.map((r) => (r.agent === data.agent ? data : r));
          }
          return [...prev, data];
        });

        if (data.final_score !== undefined) {
          setFinalScore(data.final_score);
        }

        if (data.agent === 'The CVO') {
          setIsAnalyzing(false);
          connection.close();
        }
      },
      (error) => {
        console.error('SSE Connection Error:', error);
        setIsAnalyzing(false);
        connection.close();
      }
    );
  };

  return (
    <DueDiligenceContext.Provider
      value={{
        startupName,
        isAnalyzing,
        results,
        finalScore,
        startAnalysis,
      }}
    >
      {children}
    </DueDiligenceContext.Provider>
  );
};

export const useDueDiligence = () => {
  const context = useContext(DueDiligenceContext);
  if (!context) {
    throw new Error('useDueDiligence must be used within a DueDiligenceProvider');
  }
  return context;
};
