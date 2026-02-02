import { GameResponse, CharacterProfile, StoryLog } from "./types";
import { SCENARIOS, getInitialScenario, getRandomScenario } from "./gameScenarios";
import { getScenarioImage, getImageByKeywords } from "./imageMapper";

// This replaces geminiService.ts - no AI needed!
export const getNextStep = async (
  profile: CharacterProfile,
  lastAction: string,
  history: StoryLog[],
  inventory: string[]
): Promise<GameResponse> => {
  // Simulate a small delay to make it feel like processing
  await new Promise(resolve => setTimeout(resolve, 300));

  // Determine which scenario to show based on history and choices
  let scenarioId: string;

  if (history.length === 0) {
    // First scenario - based on character class
    scenarioId = getInitialScenario(profile.class);
  } else {
    // Try to find matching next scenario from the last choice
    const lastLog = history[history.length - 1];
    
    // Parse the scenario from history or use action-based logic
    // For simplicity, we'll use a keyword-based matching system
    scenarioId = determineNextScenario(lastAction, profile.class, history, inventory);
  }

  const scenario = SCENARIOS[scenarioId];
  
  if (!scenario) {
    // Fallback to random scenario if not found
    scenarioId = getRandomScenario(profile.class);
    const fallbackScenario = SCENARIOS[scenarioId];
    return convertToGameResponse(fallbackScenario || SCENARIOS[getInitialScenario(profile.class)]);
  }

  return convertToGameResponse(scenario);
};

// Convert scenario template to game response
function convertToGameResponse(scenario: any): GameResponse {
  return {
    id: scenario.id, // Include scenario ID for image mapping
    story_text: scenario.story_text,
    image_prompt: scenario.image_prompt,
    choices: scenario.choices.map((choice: any) => ({
      id: choice.id,
      text: choice.text,
      required_item: choice.required_item,
      is_risky: choice.is_risky
    })),
    stats_update: scenario.stats_update,
    new_items: scenario.new_items || [],
    game_state: scenario.game_state
  };
}

// Determine next scenario based on the action taken
function determineNextScenario(
  action: string,
  profileClass: string,
  history: StoryLog[],
  inventory: string[]
): string {
  const actionLower = action.toLowerCase();

  // Search through all scenarios for matching next_scenario
  for (const [scenarioId, scenario] of Object.entries(SCENARIOS)) {
    const matchingChoice = scenario.choices.find(choice => 
      choice.text.toLowerCase().includes(actionLower) ||
      actionLower.includes(choice.text.toLowerCase().substring(0, 20))
    );
    
    if (matchingChoice && matchingChoice.next_scenario) {
      return matchingChoice.next_scenario;
    }
  }

  // Keyword-based fallback matching
  if (actionLower.includes('hotel') || actionLower.includes('five star')) {
    return 'minister_hotel';
  } else if (actionLower.includes('apartment') || actionLower.includes('docklands')) {
    return 'business_apartment';
  } else if (actionLower.includes('job') || actionLower.includes('work')) {
    if (profileClass === 'Business Family') return 'business_job_search';
    if (profileClass === 'Middle Class') return 'middle_job_hunt';
    return 'lower_community_help';
  } else if (actionLower.includes('uber eats') || actionLower.includes('delivery')) {
    return 'business_uber_eats';
  } else if (actionLower.includes('bicycle') || actionLower.includes('bike')) {
    return 'business_buy_bicycle';
  } else if (actionLower.includes('clean')) {
    return 'middle_cleaning_job';
  } else if (actionLower.includes('footscray') || actionLower.includes('shared house')) {
    return 'middle_footscray';
  } else if (actionLower.includes('university') || actionLower.includes('enrol')) {
    return 'minister_university';
  } else if (actionLower.includes('myki')) {
    return 'middle_get_myki';
  } else if (actionLower.includes('help desk') || actionLower.includes('assistance')) {
    return 'lower_help_desk';
  } else if (actionLower.includes('scam') || actionLower.includes('agent')) {
    return 'lower_agent_call';
  }

  // Check progression - if day >= 25, move toward success
  if (history.length >= 15) {
    return 'success_settled';
  }

  // Default: return a random scenario for their class
  return getRandomScenario(profileClass as any);
}

// Fixed image database for reliable, consistent visuals
const SCENE_IMAGES: Record<string, string> = {
  // Airport & Travel
  airport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
  luggage: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&h=600&fit=crop',
  
  // Luxury (Minister Son)
  luxury_hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  luxury_car: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
  casino: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&h=600&fit=crop',
  shopping: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&h=600&fit=crop',
  fine_dining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
  
  // Housing
  apartment: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  shared_room: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
  hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
  
  // Work
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  warehouse: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop',
  delivery: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=600&fit=crop',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
  
  // Transport
  bicycle: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
  tram: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800&h=600&fit=crop',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
  
  // City & Melbourne
  melbourne_city: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop',
  melbourne_skyline: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
  federation_square: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&h=600&fit=crop',
  
  // Food & Shopping
  grocery_store: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=600&fit=crop',
  srilankan_food: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  market: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop',
  
  // University & Education
  university: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
  library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
  
  // Success & Celebration
  celebration: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop',
  success: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
  
  // Struggle
  worried: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop',
  help: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
  
  // Default
  default: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop'
};

// Generate scene image using pre-organized local images instead of AI
export const generateSceneImage = async (imagePrompt: string, scenarioId?: string): Promise<string> => {
  // Simulate small loading delay for smooth UX
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // First try to get image by scenario ID if provided
  if (scenarioId) {
    const scenarioImage = getScenarioImage(scenarioId);
    if (scenarioImage) {
      return scenarioImage;
    }
  }
  
  // Fall back to keyword matching based on image prompt
  return getImageByKeywords(imagePrompt);
};

/* OLD AI VERSION - Kept for reference, now replaced with local images
export const generateSceneImageWithAI = async (prompt: string): Promise<string> => {
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Create comic-style prompt for better visuals
  const comicPrompt = enhancePromptForComicStyle(prompt);
  
  // Use Pollinations AI - free, no API key needed, generates relevant images
  // Format: https://image.pollinations.ai/prompt/{encoded_prompt}
  const encodedPrompt = encodeURIComponent(comicPrompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&enhance=true`;
  
  return pollinationsUrl;
};
*/

// Enhanced prompt function - kept for reference if needed later
function enhancePromptForComicStyle(originalPrompt: string): string {
  const promptLower = originalPrompt.toLowerCase();
  
  // Base style for all images
  const baseStyle = "digital illustration, comic book style, vibrant colors, detailed, cinematic lighting, ";
  
  // Detect scene type and enhance accordingly
  let enhancedPrompt = baseStyle;
  
  if (promptLower.includes('airport')) {
    enhancedPrompt += "Melbourne Tullamarine Airport arrival terminal, Sri Lankan traveler with luggage, busy terminal, modern architecture, excited expression";
  } else if (promptLower.includes('bmw') || promptLower.includes('luxury car')) {
    enhancedPrompt += "black BMW luxury sedan, chauffeur holding door open, Sri Lankan businessman arriving, Melbourne cityscape background";
  } else if (promptLower.includes('five star') || (promptLower.includes('luxury') && promptLower.includes('hotel'))) {
    enhancedPrompt += "luxurious five-star hotel lobby in Melbourne, marble floors, grand chandelier, elegant reception desk, young Sri Lankan man checking in";
  } else if (promptLower.includes('casino')) {
    enhancedPrompt += "Crown Casino Melbourne interior, poker tables, bright lights, excited young people, city lights through windows";
  } else if (promptLower.includes('shopping') || promptLower.includes('mall')) {
    enhancedPrompt += "modern shopping mall in Melbourne, luxury stores, young Sri Lankan shopper with bags, bright storefronts";
  } else if (promptLower.includes('apartment') || promptLower.includes('docklands')) {
    enhancedPrompt += "modern apartment in Melbourne Docklands, city view through windows, minimalist furniture, young professional unpacking";
  } else if (promptLower.includes('shared') && (promptLower.includes('room') || promptLower.includes('house'))) {
    enhancedPrompt += "shared house bedroom in Melbourne suburbs, bunk beds, personal belongings, modest furnishing, Sri Lankan student settling in";
  } else if (promptLower.includes('hostel') || promptLower.includes('shelter')) {
    enhancedPrompt += "budget hostel dormitory, multiple beds, backpackers, tired Sri Lankan immigrant with minimal belongings";
  } else if (promptLower.includes('warehouse') || promptLower.includes('amazon')) {
    enhancedPrompt += "large warehouse interior, boxes and shelves, workers in high-vis vests, Sri Lankan worker carrying packages";
  } else if (promptLower.includes('uber eats') || promptLower.includes('delivery')) {
    enhancedPrompt += "delivery rider on bicycle in Melbourne streets, Uber Eats bag on back, city buildings, busy traffic, determined expression";
  } else if (promptLower.includes('cleaning')) {
    enhancedPrompt += "office cleaning scene at night, Sri Lankan cleaner with equipment, empty office, fluorescent lights, working hard";
  } else if (promptLower.includes('contractor') && promptLower.includes('scam')) {
    enhancedPrompt += "frustrated Sri Lankan worker talking to contractor, unpaid wages discussion, tense atmosphere, office setting";
  } else if (promptLower.includes('restaurant') && promptLower.includes('kitchen')) {
    enhancedPrompt += "busy Asian restaurant kitchen, Sri Lankan cook working, steam and heat, intense work environment";
  } else if (promptLower.includes('tram') || promptLower.includes('melbourne tram')) {
    enhancedPrompt += "iconic Melbourne tram on city street, passengers inside, Sri Lankan commuter, CBD buildings in background";
  } else if (promptLower.includes('myki') && promptLower.includes('inspector')) {
    enhancedPrompt += "myki inspector checking tickets on Melbourne tram, worried Sri Lankan passenger, other commuters watching";
  } else if (promptLower.includes('university') || promptLower.includes('campus')) {
    enhancedPrompt += "Melbourne university campus, modern buildings, diverse students walking, Sri Lankan student with backpack, hopeful expression";
  } else if (promptLower.includes('job interview') || promptLower.includes('professional meeting')) {
    enhancedPrompt += "professional office interview setting, Sri Lankan candidate sitting across from interviewer, resume on desk, nervous but confident";
  } else if (promptLower.includes('pr') && promptLower.includes('consultation')) {
    enhancedPrompt += "migration agent office, professional consultation, Sri Lankan client reviewing documents, hope and determination";
  } else if (promptLower.includes('driver') && (promptLower.includes('test') || promptLower.includes('license'))) {
    enhancedPrompt += "VicRoads testing center, Sri Lankan learner driver in car, driving instructor beside them, Melbourne suburban street";
  } else if (promptLower.includes('car accident')) {
    enhancedPrompt += "minor car accident scene in Melbourne, damaged vehicles, police attending, worried Sri Lankan driver, suburban roundabout";
  } else if (promptLower.includes('celebration') || promptLower.includes('success')) {
    enhancedPrompt += "joyful celebration scene, Sri Lankan immigrant smiling with visa approval letter, Melbourne skyline background, achievement moment";
  } else if (promptLower.includes('community') && promptLower.includes('lankan')) {
    enhancedPrompt += "Sri Lankan community gathering in Melbourne, people sharing food, temple or community center, supportive atmosphere";
  } else if (promptLower.includes('footscray') || promptLower.includes('suburbs')) {
    enhancedPrompt += "Footscray Melbourne street scene, diverse community, shops with different languages, Sri Lankan newcomer exploring";
  } else if (promptLower.includes('grocery') || promptLower.includes('coles') || promptLower.includes('woolworths')) {
    enhancedPrompt += "Australian supermarket interior, shelves with products, Sri Lankan shopper checking prices, shopping cart";
  } else if (promptLower.includes('stressed') || promptLower.includes('worried') || promptLower.includes('burnout')) {
    enhancedPrompt += "exhausted Sri Lankan immigrant worker, tired expression, late at night, Melbourne city lights, showing fatigue";
  } else if (promptLower.includes('legal') || promptLower.includes('fair work')) {
    enhancedPrompt += "Fair Work office, legal documents, Sri Lankan worker filing complaint, professional legal environment";
  } else if (promptLower.includes('rent') && promptLower.includes('late')) {
    enhancedPrompt += "worried Sri Lankan tenant with landlord, unpaid rent notice, apartment setting, financial stress visible";
  } else if (promptLower.includes('visa') && promptLower.includes('expired')) {
    enhancedPrompt += "immigration office, expiring visa document, stressed Sri Lankan person, official government building";
  } else {
    // Generic Melbourne immigrant experience
    enhancedPrompt += originalPrompt + ", Sri Lankan immigrant in Melbourne, realistic, emotional, story-driven scene";
  }
  
  // Add quality enhancers
  enhancedPrompt += ", high quality, professional, 4k, detailed faces, atmospheric";
  
  return enhancedPrompt;
}
