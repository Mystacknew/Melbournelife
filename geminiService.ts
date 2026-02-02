import { GameResponse, ProfileClass, GameStats } from './types';

declare global {
  interface Window {
    aistudio?: {
      GoogleGenerativeAI: new (apiKey: string) => {
        getGenerativeModel: (config: { model: string }) => {
          generateContent: (prompt: string) => Promise<{
            response: {
              text: () => string;
            };
          }>;
        };
      };
    };
  }
}

export async function generateScene(
  context: string,
  choice: string,
  profile: { name: string; age: number; gender: string; status: string; class: ProfileClass },
  stats: GameStats,
  inventory: string[]
): Promise<GameResponse> {
  const apiKey = localStorage.getItem('mlife_gemini_key');
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add your API key in settings.');
  }

  if (!window.aistudio) {
    throw new Error('Gemini API library not loaded');
  }

  const genAI = new window.aistudio.GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are a storytelling engine for "Melbourne Life" - a HARD MODE survival game about Sri Lankan immigrants in Melbourne.
The game is DIFFICULT with 25 chapters required to reach PR. Include SCAMS, BETRAYALS, and ROASTING SINHALA LANGUAGE!

Current Profile:
- Name: ${profile.name}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Status: ${profile.status}
- Social Class: ${profile.class}

Current Stats:
- Money: $${stats.money}
- Stress: ${stats.stress}/100
- Energy: ${stats.energy}/100
- Health: ${stats.health}/100
- Visa Days Left: ${stats.visaDaysLeft}
- Day: ${stats.day}

Current Inventory: ${inventory.join(', ') || 'None'}

Previous Context: ${context}
Player's Choice: ${choice}

Generate the next story segment as JSON with this exact structure:
{
  "story_text": "Roasting narrative in Sinhala+English slang style (2-4 sentences)",
  "image_prompt": "Detailed scene description for image generation",
  "choices": [
    {"id": "c1", "text": "Choice 1 - often leads to scam/trap"},
    {"id": "c2", "text": "Choice 2 - risky but might work"},
    {"id": "c3", "text": "Choice 3 - safe but slower progress"}
  ],
  "stats_update": {
    "money_change": 0,
    "stress_change": 0,
    "energy_change": 0,
    "day_change": 0
  },
  "new_items": [],
  "game_state": "ongoing"
}

🔥 SCAM SCENARIOS TO INCLUDE (randomly integrate these):
1. CLEANING CONTRACTOR SCAM: "Aiya" promises $35/hr, takes 3 weeks work, disappears without paying
2. DANDENONG CAR SCAM: "German Tech" aiya sells broken cars with sawdust in engine
3. GIRLFRIEND/BOYFRIEND SCAM: Person is secretly married, extracts gifts/money
4. COE CANCELLATION: University cancels enrollment, visa at risk
5. VISA AGENT SCAM: Fake MARA agent takes $3500, office closes down
6. JOB BROKER SCAM: "Friend's connection" charges $800 for fake job
7. UNPAID WAGES: Contractor doesn't pay for months while showing off BMW on Instagram

🗣️ ROASTING SINHALA SLANGS TO USE:
- "මචං" (bro), "පරඩ්ඩිය" (idiot), "ගෑණි" (derogatory for person)
- "ඔබෝ!" (exclamation of distress), "අම්මෝ!" (oh mother!)
- "Trust me bro!", "Machan", "Lankan aiya/akka"
- "scam වෙලා" (got scammed), "සල්ලි ගියා" (money gone)
- "💀", "🤡", "😤", "🔥" emojis for emphasis
- Sarcastic phrases like "Life is good machan!" when things go wrong

DIFFICULTY RULES:
- Minister's son: Some scams but can recover with money
- Business Family: Moderate scams, need to be careful
- Middle Class: HIGH RISK of scams, limited resources
- Lower Class: VERY HIGH scam risk, desperate choices lead to traps
- Money losses should be PAINFUL: -$500 to -$5000 for scams
- Stress increases dramatically: +40 to +80 for scams
- Day changes realistic: 7-30 days for scam recoveries
- Make game HARD - PR at Day 90 is the goal, many obstacles!

Melbourne locations: Dandenong, Footscray, Sunshine, Box Hill, Clayton, CBD, Werribee
Include: Sri Lankan shops, community Facebook groups, contractor networks, visa agents

Return ONLY valid JSON, no markdown formatting.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const gameResponse: GameResponse = JSON.parse(cleanedText);
    
    // Validate the response structure
    if (!gameResponse.story_text || !gameResponse.choices || !gameResponse.stats_update) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return gameResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate story content. Please check your API key and try again.');
  }
}

export async function generateImagePrompt(sceneDescription: string): Promise<string> {
  // Generate comic-style image using Pollinations AI
  const comicPrompt = `digital illustration, comic book style, vibrant colors, ${sceneDescription}, Sri Lankan immigrant in Melbourne, cinematic lighting, detailed faces, emotional storytelling, high quality, 4k`;
  const encodedPrompt = encodeURIComponent(comicPrompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&enhance=true`;
}
