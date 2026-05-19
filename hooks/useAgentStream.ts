import { useState } from 'react';
import { streamSSE } from '../services/sse';

type AgentResult = {
  agent: string;
  summary: string;
  final_score?: number;
};

export const useAgentStream = () => {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const startAnalysis = (startupName: string) => {
    setIsAnalyzing(true);
    setResults([]); // Clear previous results
    setFinalScore(null);

    // Make sure to replace localhost with your machine's local IP (e.g., 192.168.1.x)
    // if you are testing on a physical device. 'localhost' works for iOS Simulator.
    // Use '10.0.2.2' for Android Emulator.
    const baseUrl = 'http://localhost:8000'; 
    const url = `${baseUrl}/api/analyze?startup_name=${encodeURIComponent(startupName)}`;

    const connection = streamSSE(
      url,
      (data) => {
        console.log('Agent Update:', data.agent);

        setResults((prev) => [...prev, data]);

        if (data.final_score !== undefined) {
          setFinalScore(data.final_score);
        }

        // Close the connection when the final agent finishes
        if (data.agent === 'The CVO') {
          setIsAnalyzing(false);
          connection.close();
        }
      },
      (error) => {
        console.error('SSE Error:', error);
        setIsAnalyzing(false);
        connection.close();
      }
    );
  };

  return { startAnalysis, results, isAnalyzing, finalScore };
};

