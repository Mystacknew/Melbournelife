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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a storytelling engine for "Melbourne Life" - a narrative game about Sri Lankan immigrants in Melbourne.

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
  "story_text": "Engaging narrative in Singlish/Sinhala style (2-3 sentences)",
  "image_prompt": "Detailed scene description for image generation",
  "choices": [
    {"id": "c1", "text": "Choice 1 text"},
    {"id": "c2", "text": "Choice 2 text"},
    {"id": "c3", "text": "Choice 3 text"}
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

IMPORTANT:
- story_text should mix English and Sinhala naturally (e.g., "මචං, you need to find රස්සාවක්")
- Reflect the player's social class in opportunities and challenges
- Minister's son: Easy access to resources, connections, money
- Business Family: Moderate resources, some connections
- Middle Class: Limited resources, must work hard
- Lower Class: Severe struggles, exploitation, survival mode
- Money changes should be realistic (-50 to +500 typically)
- Stress/Energy changes between -30 to +30
- Include Melbourne-specific locations (Footscray, Box Hill, CBD, etc.)
- Add cultural authenticity (Lankan community, food, language)
- Make choices meaningful with clear consequences
- game_state can be "ongoing", "gameover_broke", "gameover_deported", "gameover_health", "success_pr", "success_stable"

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
