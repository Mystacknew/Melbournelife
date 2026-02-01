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

// Generate scene image using fixed database
export const generateSceneImage = async (prompt: string): Promise<string> => {
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const promptLower = prompt.toLowerCase();
  
  // Match prompt to specific images
  if (promptLower.includes('airport')) return SCENE_IMAGES.airport;
  if (promptLower.includes('luggage')) return SCENE_IMAGES.luggage;
  if (promptLower.includes('bmw') || promptLower.includes('luxury car')) return SCENE_IMAGES.luxury_car;
  if (promptLower.includes('five star') || promptLower.includes('luxury') && promptLower.includes('hotel')) return SCENE_IMAGES.luxury_hotel;
  if (promptLower.includes('casino') || promptLower.includes('poker')) return SCENE_IMAGES.casino;
  if (promptLower.includes('shopping') || promptLower.includes('mall')) return SCENE_IMAGES.shopping;
  if (promptLower.includes('fine dining') || promptLower.includes('restaurant') && promptLower.includes('elegant')) return SCENE_IMAGES.fine_dining;
  
  if (promptLower.includes('apartment') || promptLower.includes('docklands')) return SCENE_IMAGES.apartment;
  if (promptLower.includes('shared') && (promptLower.includes('room') || promptLower.includes('house'))) return SCENE_IMAGES.shared_room;
  if (promptLower.includes('hostel') || promptLower.includes('shelter')) return SCENE_IMAGES.hostel;
  
  if (promptLower.includes('warehouse') || promptLower.includes('amazon')) return SCENE_IMAGES.warehouse;
  if (promptLower.includes('delivery') || promptLower.includes('uber eats')) return SCENE_IMAGES.delivery;
  if (promptLower.includes('bicycle') || promptLower.includes('bike')) return SCENE_IMAGES.bicycle;
  if (promptLower.includes('cleaning') || promptLower.includes('clean')) return SCENE_IMAGES.cleaning;
  if (promptLower.includes('office') || promptLower.includes('business meeting')) return SCENE_IMAGES.office;
  if (promptLower.includes('restaurant') || promptLower.includes('cafe')) return SCENE_IMAGES.restaurant;
  if (promptLower.includes('retail') || promptLower.includes('grocery') && promptLower.includes('work')) return SCENE_IMAGES.retail;
  
  if (promptLower.includes('tram') || promptLower.includes('melbourne tram')) return SCENE_IMAGES.tram;
  if (promptLower.includes('bus')) return SCENE_IMAGES.bus;
  
  if (promptLower.includes('federation square')) return SCENE_IMAGES.federation_square;
  if (promptLower.includes('melbourne') && promptLower.includes('skyline')) return SCENE_IMAGES.melbourne_skyline;
  if (promptLower.includes('city') || promptLower.includes('cbd')) return SCENE_IMAGES.melbourne_city;
  
  if (promptLower.includes('grocery') || promptLower.includes('coles') || promptLower.includes('woolworths')) return SCENE_IMAGES.grocery_store;
  if (promptLower.includes('sri lankan') && promptLower.includes('food')) return SCENE_IMAGES.srilankan_food;
  if (promptLower.includes('market')) return SCENE_IMAGES.market;
  
  if (promptLower.includes('university') || promptLower.includes('campus')) return SCENE_IMAGES.university;
  if (promptLower.includes('library')) return SCENE_IMAGES.library;
  
  if (promptLower.includes('celebrat')) return SCENE_IMAGES.celebration;
  if (promptLower.includes('success') || promptLower.includes('settled')) return SCENE_IMAGES.success;
  
  if (promptLower.includes('worried') || promptLower.includes('stressed') || promptLower.includes('scam')) return SCENE_IMAGES.worried;
  if (promptLower.includes('help') || promptLower.includes('community')) return SCENE_IMAGES.help;
  
  // Default Melbourne city image
  return SCENE_IMAGES.default;
};
