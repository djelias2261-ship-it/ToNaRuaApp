import { GoogleGenAI } from "@google/genai";
import { LocationData } from "../types";

// Helper to get API key safely
const getApiKey = () => {
  return process.env.API_KEY || '';
};

// Initialize Gemini Client
// We create a new instance per call or lazily to ensure key presence
const createClient = () => new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Uses Gemini to "find" a location and provide context about it.
 * Simulates a geocoding service using the LLM's knowledge + Grounding.
 */
export const findPlace = async (query: string): Promise<LocationData> => {
  if (!query) throw new Error("Query is empty");
  
  const ai = createClient();
  
  // We use the model to structure the location data
  const modelId = "gemini-2.5-flash"; 
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Find the location for: "${query}" in Brazil. 
      Return a JSON object with: 
      - address (full formatted address)
      - lat (approximate latitude as number)
      - lng (approximate longitude as number)
      - description (short description of the place).
      If specific coordinates aren't known, estimate them based on the city center.`,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleMaps: {} }], // Use Grounding to verify
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return {
        address: data.address || query,
        lat: data.lat || -23.5505, // Default SP
        lng: data.lng || -46.6333,
        description: data.description
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback for demo purposes if API fails or quota exceeded
    return {
        address: query,
        lat: -23.5 + (Math.random() * 0.1),
        lng: -46.6 + (Math.random() * 0.1),
        description: "Localização aproximada (Offline)"
    };
  }
};

/**
 * Calculates a route summary, distance, and pricing using Gemini reasoning.
 */
export const calculateRouteInfo = async (origin: string, destination: string): Promise<{
    distance: string;
    duration: string;
    price: number;
    summary: string;
}> => {
    const ai = createClient();
    const modelId = "gemini-2.5-flash";

    try {
        const prompt = `
        Calculate a ride estimation from "${origin}" to "${destination}" in Brazil.
        Assume a standard city driving speed.
        
        Return a JSON object with:
        - distance (e.g., "12 km")
        - duration (e.g., "25 min")
        - price (number, estimated price in BRL, assume roughly R$ 2.50 per km + base fee of R$ 5.00)
        - summary (a short route description, e.g., "Via Av. Paulista and Rebouças")
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // Thinking budget disabled for speed
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No content");
        
        const data = JSON.parse(text);
        return {
            distance: data.distance || "5 km",
            duration: data.duration || "15 min",
            price: typeof data.price === 'number' ? data.price : 15.00,
            summary: data.summary || "Rota direta"
        };

    } catch (error) {
        console.error("Route Calc Error:", error);
        return {
            distance: "Desconhecida",
            duration: "Calculando...",
            price: 20.00,
            summary: "Rota alternativa"
        };
    }
};