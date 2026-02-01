import { GameResponse, CharacterProfile, StoryLog } from "./types";
import { SCENARIOS, getInitialScenario, getRandomScenario } from "./gameScenarios";

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

// Generate scene image using placeholder service (no AI)
export const generateSceneImage = async (prompt: string): Promise<string> => {
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Use a placeholder image service with scene-appropriate images
  // We'll use Unsplash Source API for relevant Melbourne images
  const keywords = extractKeywords(prompt);
  const query = keywords.join(',') || 'melbourne,australia';
  
  // Return Unsplash image URL
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
};

// Extract keywords from image prompt for better placeholder images
function extractKeywords(prompt: string): string[] {
  const keywords: string[] = [];
  
  if (prompt.toLowerCase().includes('luxury') || prompt.toLowerCase().includes('hotel')) {
    keywords.push('luxury', 'hotel', 'melbourne');
  } else if (prompt.toLowerCase().includes('airport')) {
    keywords.push('airport', 'travel', 'melbourne');
  } else if (prompt.toLowerCase().includes('apartment') || prompt.toLowerCase().includes('room')) {
    keywords.push('apartment', 'interior', 'modern');
  } else if (prompt.toLowerCase().includes('job') || prompt.toLowerCase().includes('work')) {
    keywords.push('work', 'office', 'business');
  } else if (prompt.toLowerCase().includes('food') || prompt.toLowerCase().includes('delivery')) {
    keywords.push('food', 'delivery', 'bicycle');
  } else if (prompt.toLowerCase().includes('university') || prompt.toLowerCase().includes('campus')) {
    keywords.push('university', 'campus', 'melbourne');
  } else if (prompt.toLowerCase().includes('city') || prompt.toLowerCase().includes('melbourne')) {
    keywords.push('melbourne', 'city', 'skyline');
  } else if (prompt.toLowerCase().includes('cleaning')) {
    keywords.push('cleaning', 'work', 'building');
  } else {
    keywords.push('melbourne', 'australia');
  }
  
  return keywords.slice(0, 3);
}
