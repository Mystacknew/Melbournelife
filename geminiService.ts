
import { GoogleGenAI, Type } from "@google/genai";
import { GameResponse, CharacterProfile, StoryLog } from "./types";

const SYSTEM_INSTRUCTION = `
You are the Game Engine for "Melbourne Life" (මෙල්බර්න් ලයිෆ්).
The story follows a Sri Lankan student moving to Melbourne.

CHOICE SYSTEM:
- Provide 3 to 4 varied choices for every scene.
- SYNERGY: If the player has specific items in their inventory, at least ONE choice MUST leverage that item. Mark this choice with "required_item".
- RISK: Some choices should be dangerous but rewarding. Mark these with "is_risky: true".
- Variety: One choice should be "Safe", one "Risky/Athal", and one "Item-Dependent".

CHARACTER CLASS LOGIC:
- "ඇමති පුතා": Luxury life, no money issues, VIP treatment.
- "Lower Class": Survival mode. Frequent scams, high stress, public transport struggles.

SCAM MECHANICS - THE "CONTRACTOR AIYA":
- For Middle/Lower class: Trigger scenarios where payments are delayed ("next week දෙන්නම්", "Customer සල්ලි දැම්මේ නෑ"). 
- Result: $0 money_change, +20 stress_change.

LANGUAGE:
- Use authentic spoken Sinhala (Katha Bhashawa) with Singlish slang. 
- Tone: Real, funny, and sometimes stressful.

OUTPUT FORMAT:
Strictly output ONLY a valid JSON object.
`;

export const getNextStep = async (
  profile: CharacterProfile, 
  lastAction: string, 
  history: StoryLog[],
  inventory: string[]
): Promise<GameResponse> => {
  // Always create a new instance right before the call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const historyContext = history.map(h => `Action: ${h.action} -> Event: ${h.summary}`).join('\n');
  const prompt = `
CHARACTER PROFILE:
Name: ${profile.name} | Age: ${profile.age} | Gender: ${profile.gender}
Relationship: ${profile.status} | Social Class: ${profile.class}

Inventory: ${inventory.join(', ') || 'None'}
History:
${historyContext}

Current Action: "${lastAction}"

Task: Generate 3-4 choices. If they have items like 'Uber Bag' or 'Myki Card', create specific choices for them and set the 'required_item' property to the item name.
`;
  
  try {
    // Upgraded to gemini-3-pro-preview for complex reasoning and game logic tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story_text: { type: Type.STRING },
            image_prompt: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              minItems: 3,
              maxItems: 4,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  required_item: { type: Type.STRING },
                  is_risky: { type: Type.BOOLEAN }
                },
                required: ["id", "text"]
              }
            },
            stats_update: {
              type: Type.OBJECT,
              properties: {
                money_change: { type: Type.NUMBER },
                stress_change: { type: Type.NUMBER },
                energy_change: { type: Type.NUMBER },
                day_change: { type: Type.NUMBER }
              },
              required: ["money_change", "stress_change", "energy_change", "day_change"]
            },
            new_items: { type: Type.ARRAY, items: { type: Type.STRING } },
            game_state: { type: Type.STRING }
          },
          required: ["story_text", "image_prompt", "choices", "stats_update", "game_state"]
        }
      }
    });

    // Directly access the .text property (correct implementation per guidelines)
    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    if (e.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET");
    }
    // Attempt to extract JSON from text if available in the error response
    const text = (e as any).response?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw e;
  }
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  // Always create a new instance right before the call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Digital comic style illustration of: ${prompt}. Vivid colors, Melbourne setting, Sri Lankan character vibes.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (e: any) { 
    console.error(e);
  }
  return null;
};
