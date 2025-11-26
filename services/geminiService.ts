import { GoogleGenAI } from "@google/genai";
import { SimulationConfig, SimulationStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeExperiment = async (
  config: SimulationConfig,
  stats: SimulationStats,
  userQuestion?: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert Physics Laboratory Assistant named "Newton".
      
      Current Experiment: Simple Pendulum.
      
      Experimental Parameters:
      - Gravity (g): ${config.gravity.toFixed(2)} m/s²
      - String Length (L): ${config.length.toFixed(2)} m
      - Bob Mass (m): ${config.mass.toFixed(2)} kg
      - Damping Coefficient: ${config.damping.toFixed(3)}
      
      Observed Data:
      - Observed Period (T): ${stats.period > 0 ? stats.period.toFixed(4) + ' s' : 'Not yet determined'}
      - Max Velocity: ${stats.maxVelocity.toFixed(3)} m/s
      - Total Energy: ${stats.totalEnergy.toFixed(3)} J
      
      Theoretical Period Formula: T ≈ 2π√(L/g)
      Theoretical T = ${(2 * Math.PI * Math.sqrt(config.length / config.gravity)).toFixed(4)} s
      
      User Question/Context: ${userQuestion || "Analyze the consistency of the observed period with the theoretical value. Briefly explain any discrepancies (like damping or large angle approximation) and comment on the relationship between variables."}
      
      Provide a concise, scientific analysis (max 150 words). Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are a helpful, precise, and encouraging physics tutor.",
      }
    });

    return response.text || "Analysis complete, but no text returned.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to perform AI analysis. Please check your network connection or API key.";
  }
};

export const askGeneralPhysicsQuestion = async (question: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: "You are a physics expert. Answer succinctly and conceptually.",
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
     console.error("Gemini Question Error:", error);
     return "Error retrieving answer.";
  }
}