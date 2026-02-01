import { GameResponse, ProfileClass } from "./types";

interface ScenarioTemplate {
  id: string;
  story_text: string;
  image_prompt: string;
  choices: Array<{
    id: string;
    text: string;
    required_item?: string;
    is_risky?: boolean;
    next_scenario?: string;
  }>;
  stats_update: {
    money_change: number;
    stress_change: number;
    energy_change: number;
    day_change: number;
  };
  new_items?: string[];
  game_state: string;
}

// Pre-defined scenarios for different social classes
export const SCENARIOS: Record<string, ScenarioTemplate> = {
  // Initial arrival scenarios
  "arrival_minister_son": {
    id: "arrival_minister_son",
    story_text: "මචං, airport එකට ආව ගමන් BMW එකක් wait කරනවා. Driver කෙනෙක් ඉන්නවා your luggage collect කරන්න. VIP treatment එකක් තමයි. Melbourne CBD එකට යන්න ready ද?",
    image_prompt: "Luxury BMW at Melbourne Airport arrival terminal, chauffeur waiting with sign",
    choices: [
      { id: "c1", text: "BMW එකට get වෙලා five star hotel එකට යමු", next_scenario: "minister_hotel" },
      { id: "c2", text: "Crown Casino එකට යමු, රාත්‍රිය විනෝද කරමු", is_risky: true, next_scenario: "minister_casino" },
      { id: "c3", text: "Shopping mall එකක් යමු, winter clothes ගන්න ඕනේ", next_scenario: "minister_shopping" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: -5, day_change: 0 },
    new_items: ["Passport", "Cash", "Phone"],
    game_state: "ongoing"
  },

  "arrival_business": {
    id: "arrival_business",
    story_text: "Airport එකට ආව ගමන් අප්පච්චි arrange කරපු Uber එකක් එනවා. City එකට යද්දී traffic එක බලලා stress වෙනවා. පස්සෙ apartment එක rent කරන්න තියනවා.",
    image_prompt: "Uber car waiting at Melbourne Airport, business traveler with suitcases",
    choices: [
      { id: "c1", text: "Uber එකෙන් apartment එකට direct යමු", next_scenario: "business_apartment" },
      { id: "c2", text: "පළවෙනි day Coles එකට යමු groceries ගන්න", next_scenario: "business_groceries" },
      { id: "c3", text: "Myki card එකක් ගන්න public transport station එකට යමු", next_scenario: "business_myki" }
    ],
    stats_update: { money_change: -50, stress_change: 10, energy_change: -10, day_change: 0 },
    new_items: ["Passport", "Cash", "Phone", "Backpack"],
    game_state: "ongoing"
  },

  "arrival_middle": {
    id: "arrival_middle",
    story_text: "මචං airport bus එකක් අල්ලගෙන city එකට යන්න වෙනවා. Luggage එක heavy හින්දා අතේ pain. මාර stress එකක්. Shared accommodation එකක් තියනවා Footscray area එකේ.",
    image_prompt: "Budget traveler at Melbourne Airport bus stop with heavy luggage, looking tired",
    choices: [
      { id: "c1", text: "Skybus එකෙන් city එකට යමු ($20)", next_scenario: "middle_skybus" },
      { id: "c2", text: "Public bus එකක් නගිමු, cheaper ($5)", next_scenario: "middle_bus" },
      { id: "c3", text: "කෙනෙක්ට කතා කරලා shared taxi එකක් බලමු", is_risky: true, next_scenario: "middle_shared_taxi" }
    ],
    stats_update: { money_change: 0, stress_change: 30, energy_change: -20, day_change: 0 },
    new_items: ["Passport", "Cash", "Phone"],
    game_state: "ongoing"
  },

  "arrival_lower": {
    id: "arrival_lower",
    story_text: "Aiyoo බං, මේ මොනව කරන්නද කියලා හිතෙනවා. Agent කෙනා කිව්වා airport එකට එන්න කියලා, ඒත් phone number එක off. Luggage එක පිටිපස්සේ වෙච්ච හින්දා delay වෙලා තියනවා. මට මාර බය.",
    image_prompt: "Worried Sri Lankan student at Melbourne Airport lost luggage counter, looking stressed",
    choices: [
      { id: "c1", text: "Airport help desk එකට යමු, assistance එකක් අහමු", next_scenario: "lower_help_desk" },
      { id: "c2", text: "Sri Lankan community group එකක් call කරලා බලමු", next_scenario: "lower_community" },
      { id: "c3", text: "Budget hotel එකක් හොයලා මුලින්ම යමු, එක safe", is_risky: false, next_scenario: "lower_budget_hotel" }
    ],
    stats_update: { money_change: 0, stress_change: 60, energy_change: -30, day_change: 0 },
    new_items: ["Passport", "Phone"],
    game_state: "ongoing"
  },

  // Follow-up scenarios
  "minister_hotel": {
    id: "minister_hotel",
    story_text: "Five star hotel එකේ Presidential Suite එකක්. View එක මාරයි - Yarra River, city lights. Room service කතා කරලා dinner එක order කරනවා. Life is good මචං!",
    image_prompt: "Luxury hotel suite in Melbourne with Yarra River view, elegant interior",
    choices: [
      { id: "c1", text: "Room service කාලා rest එකක් ගනිමු", next_scenario: "minister_rest" },
      { id: "c2", text: "Rooftop bar එකට යමු, networking කරමු", next_scenario: "minister_networking" },
      { id: "c3", text: "University එකට call කරලා enrollment කරමු", next_scenario: "minister_university" }
    ],
    stats_update: { money_change: -500, stress_change: -20, energy_change: 10, day_change: 1 },
    new_items: ["Laptop", "Winter Jacket"],
    game_state: "ongoing"
  },

  "business_apartment": {
    id: "business_apartment",
    story_text: "Apartment එක Docklands area එකේ. ඇත්තටම හොඳ place එකක්. Roommates 2 දෙනෙක් ඉන්නවා - Australian කෙනෙක් සහ Indian කෙනෙක්. Friendly ඒත් rent share කරන්න වෙනවා.",
    image_prompt: "Modern shared apartment in Melbourne Docklands, two roommates greeting new tenant",
    choices: [
      { id: "c1", text: "Groceries ගෙන්න Coles එකට යමු", next_scenario: "business_groceries" },
      { id: "c2", text: "Part-time job එකක් හොයන්න පටන් ගනිමු", next_scenario: "business_job_search" },
      { id: "c3", text: "ඉස්සෙල්ලා rest එකක් ගෙන හෙට පටන් ගනිමු", next_scenario: "business_rest" }
    ],
    stats_update: { money_change: -800, stress_change: 5, energy_change: -10, day_change: 1 },
    new_items: ["Myki Card"],
    game_state: "ongoing"
  },

  "middle_skybus": {
    id: "middle_skybus",
    story_text: "Skybus එක comfortable හිතියට වඩා. Southern Cross Station එකට ගිහින් shared house එකට යන්න tram එකක් නගින්න වෙනවා. පස්සෙ walking කෑල්ලක් තියනවා.",
    image_prompt: "SkyBus arriving at Southern Cross Station Melbourne, passengers with luggage",
    choices: [
      { id: "c1", text: "Tram එකෙන් Footscray එකට යමු", required_item: "Myki Card", next_scenario: "middle_footscray" },
      { id: "c2", text: "මුලින් Myki card එකක් ගනිමු station එකේ", next_scenario: "middle_get_myki" },
      { id: "c3", text: "Uber එකක් ගනිමු, tired වැඩියි", is_risky: false, next_scenario: "middle_uber_home" }
    ],
    stats_update: { money_change: -20, stress_change: 10, energy_change: -15, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_get_myki": {
    id: "middle_get_myki",
    story_text: "Myki card machine එක භාවිතා කරන්න ටිකක් අමාරුයි පළවෙන්නෙ. Tourist කෙනෙක් help කරනවා. $10 top up කරලා card එක ගත්තා. Now public transport use කරන්න පුලුවන්!",
    image_prompt: "Myki card vending machine at Melbourne station, friendly tourist helping newcomer",
    choices: [
      { id: "c1", text: "හරි, දැන් tram එකෙන් Footscray යමු", next_scenario: "middle_footscray" },
      { id: "c2", text: "පළවෙනි දවසේ area එක පොඩ්ඩක් බලලා යමු", next_scenario: "middle_explore_city" },
      { id: "c3", text: "Sri Lankan කඩයක් හොයලා කන්න එකක් කාලා යමු", next_scenario: "middle_srilankan_food" }
    ],
    stats_update: { money_change: -10, stress_change: 5, energy_change: -5, day_change: 0 },
    new_items: ["Myki Card"],
    game_state: "ongoing"
  },

  "lower_help_desk": {
    id: "lower_help_desk",
    story_text: "Help desk එකේ lady කෙනෙක් helpful වුණා. Luggage track කරලා බලනවා කිව්වා, 2-3 days වෙන්න පුළුවන් කියලා. Emergency accommodation phone number එකක් දුන්නා. බය නං තව හිතෙනවා.",
    image_prompt: "Airport help desk staff member assisting worried student, information pamphlets on desk",
    choices: [
      { id: "c1", text: "Emergency hostel එකට යන්න number එකට call කරමු", next_scenario: "lower_emergency_hostel" },
      { id: "c2", text: "Agent ගේ number එක ආයෙත් try කරමු", is_risky: true, next_scenario: "lower_agent_call" },
      { id: "c3", text: "Facebook Sri Lankan group එකක post එකක් දාලා help එකක් අහමු", next_scenario: "lower_facebook_help" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: -10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "business_job_search": {
    id: "business_job_search",
    story_text: "Seek.com.au එකේ බැලුවම පොඩි jobs ගොඩක් තියනවා. Retail, hospitality, warehouse වැඩ. පළවෙනි අවුරුද්දට student visa එකේ work limit එක 48 hours per fortnight. Resume එකක් හදාගන්න වෙයි.",
    image_prompt: "Young person browsing job websites on laptop in Melbourne apartment",
    choices: [
      { id: "c1", text: "Coles/Woolworths retail jobs apply කරමු", next_scenario: "business_retail_apply" },
      { id: "c2", text: "Restaurant/Cafe වැඩ බලමු, tips හොඳයි", next_scenario: "business_hospitality" },
      { id: "c3", text: "Uber Eats delivery job එකක් try කරමු", required_item: "Phone", next_scenario: "business_uber_eats" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -10, day_change: 1 },
    new_items: ["Laptop"],
    game_state: "ongoing"
  },

  "business_uber_eats": {
    id: "business_uber_eats",
    story_text: "Uber Eats signup කරලා account එක activate කරන්න documents යවන්න වෙනවා. Bicycle එකක් හෝ scooter එකක් ඕනේ. Initial investment එක වැඩියි පොඩ්ඩක්.",
    image_prompt: "Food delivery cyclist with thermal bag in Melbourne CBD streets",
    choices: [
      { id: "c1", text: "Second-hand bicycle එකක් $150ට ගනිමු", next_scenario: "business_buy_bicycle" },
      { id: "c2", text: "කෙනෙකුගෙන් bike එකක් rent කරගනිමු", is_risky: true, next_scenario: "business_rent_bicycle" },
      { id: "c3", text: "මේ idea එක drop කරලා වෙන වැඩක් බලමු", next_scenario: "business_job_search" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -5, day_change: 1 },
    new_items: ["Uber Account"],
    game_state: "ongoing"
  },

  "business_buy_bicycle": {
    id: "business_buy_bicycle",
    story_text: "Gumtree එකෙන් second-hand mountain bike එකක් $150ට ගත්තා. Helmet, lock, lights ගත්තම තව $50 ගියා. දැන් delivery කරන්න ready. එකපාරක් $5-8 එක්ක වැඩක් කරන්න පුළුවන්.",
    image_prompt: "Second-hand bicycle with delivery bag, helmet and lock ready for Uber Eats",
    choices: [
      { id: "c1", text: "පළවෙනි shift එක start කරමු - lunch time busy", required_item: "Bicycle", next_scenario: "business_first_delivery" },
      { id: "c2", text: "City routes පොඩ්ඩක් හදාගෙන practice කරමු", next_scenario: "business_practice_routes" },
      { id: "c3", text: "Evening shift එක try කරමු, tips වැඩියි", is_risky: false, next_scenario: "business_evening_delivery" }
    ],
    stats_update: { money_change: -200, stress_change: 5, energy_change: -10, day_change: 1 },
    new_items: ["Bicycle", "Uber Bag"],
    game_state: "ongoing"
  },

  "business_first_delivery": {
    id: "business_first_delivery",
    story_text: "පළවෙනි delivery එක nervous හිතුනත් හොඳට වැඩ උනා! GPS follow කරලා restaurant එකට ගිහින් food collect කරලා customer ට deliver කළා. $7.50 හම්බුනා + $5 tip! මාර සතුටක්.",
    image_prompt: "Happy delivery person handing food order to customer in Melbourne apartment building",
    choices: [
      { id: "c1", text: "තව orders accept කරමු, momentum එක maintain කරමු", next_scenario: "business_delivery_streak" },
      { id: "c2", text: "පොඩි break එකක් ගෙන දිගටම කරමු", next_scenario: "business_delivery_break" },
      { id: "c3", text: "අද හරි, හෙට පටන් ගනිමු regular වැඩට", next_scenario: "business_day_routine" }
    ],
    stats_update: { money_change: 12.50, stress_change: -5, energy_change: -20, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  // Scam scenario (Lower/Middle class)
  "lower_agent_call": {
    id: "lower_agent_call",
    story_text: "අම්මෝ බං! Agent කිව්වා accommodation payment එක තාම receive වෙලා නෑ කියලා. Contract එක signed නේද? දැන් ඔහු කිව්වා තව $500 deposit එකක් දාන්න. මොකද්ද මේ?",
    image_prompt: "Worried student on phone call looking at contract papers, suspicious situation",
    choices: [
      { id: "c1", text: "මුදල් යවමු, නැත්නම් ගෙදර නැති වෙයි", is_risky: true, next_scenario: "lower_scam_trap" },
      { id: "c2", text: "Police/Scam watch එකට report කරලා බලමු", next_scenario: "lower_report_scam" },
      { id: "c3", text: "Sri Lankan community help line එකට call කරමු", next_scenario: "lower_community_help" }
    ],
    stats_update: { money_change: 0, stress_change: 40, energy_change: -20, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "lower_scam_trap": {
    id: "lower_scam_trap",
    story_text: "ඔබෝ මචං! $500 transfer කළාට පස්සේ agent ගේ phone number එක off වෙලා. මේක scam එකක් වුණා! මුදල් ගියා, තැනක් නෑ. දැන් මොකද කරන්නේ? මාර stress එකක්.",
    image_prompt: "Devastated person looking at empty bank account on phone, Melbourne streets background",
    choices: [
      { id: "c1", text: "Bank එකට යලා fraud report එකක් දාමු", next_scenario: "lower_fraud_report" },
      { id: "c2", text: "Emergency accommodation අහලා බලමු කොහෙ හරි", next_scenario: "lower_emergency_shelter" },
      { id: "c3", text: "මේ ගේමෙන් ඉවරයි, දෙනවද මේ stress එකේ?", next_scenario: "stress_gameover" }
    ],
    stats_update: { money_change: -500, stress_change: 30, energy_change: -15, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "stress_gameover": {
    id: "stress_gameover",
    story_text: "මචං stress level එක වැඩියෙන් ගියා. Melbourne survival මේක ඔයාට අමාරු වුණා. Return ticket එක book කරලා Lanka එකට යන්න හිතෙනවා. Next time වඩාත් careful වෙලා ඒව බලාගෙන try කරමු!",
    image_prompt: "Exhausted person at Melbourne airport departure terminal, looking defeated",
    choices: [],
    stats_update: { money_change: 0, stress_change: 100, energy_change: 0, day_change: 1 },
    new_items: [],
    game_state: "gameover"
  },

  // Success scenario
  "minister_university": {
    id: "minister_university",
    story_text: "University administration එක VIP treatment දුන්නා. Course enrollment smooth ඒක. International student coordinator මිනිහා personally help කළා. Campus tour එකත් premium. Life එක easy mode මචං!",
    image_prompt: "Prestigious Melbourne university campus tour, international student coordinator with VIP student",
    choices: [
      { id: "c1", text: "Classes start වෙන්න wait කරමු, එතකෝ enjoy කරමු", next_scenario: "minister_leisure" },
      { id: "c2", text: "Student clubs වලට join වෙලා friends හදාගනිමු", next_scenario: "minister_social" },
      { id: "c3", text: "පොඩි internship එකක් හොයලා experience ගනිමු", next_scenario: "minister_internship" }
    ],
    stats_update: { money_change: -5000, stress_change: -10, energy_change: 10, day_change: 3 },
    new_items: ["Student ID", "Laptop"],
    game_state: "ongoing"
  },

  // Day 30 success scenarios
  "success_settled": {
    id: "success_settled",
    story_text: "මචං! Day 30 වෙනවා Melbourne එකේ. ඔයා survive කළා! Part-time job එකක් හම්බුනා, apartment එක stable, routine එකක් හැදිලා. දැන් PR pathway එක plan කරන්න පුළුවන්. Congratulations!",
    image_prompt: "Happy settled immigrant celebrating 30 days in Melbourne, city skyline background",
    choices: [],
    stats_update: { money_change: 0, stress_change: -50, energy_change: 50, day_change: 0 },
    new_items: [],
    game_state: "success"
  },

  // Generic continuing scenarios
  "middle_footscray": {
    id: "middle_footscray",
    story_text: "Footscray shared house එකට ආවා. Roommates 4 දෙනෙක් - Vietnamese, Indian, Filipino සහ Australian. ගොඩක් diversity. Rent $200 weekly. කාමරය පොඩියි but කමක් නෑ.",
    image_prompt: "Shared house in Footscray Melbourne, multicultural roommates greeting new tenant",
    choices: [
      { id: "c1", text: "කාමරේ settle වෙලා හෙට job හොයමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Roommates එක්ක කතා කරලා area එක ගැන දැනගනිමු", next_scenario: "middle_learn_area" },
      { id: "c3", text: "ඉස්සෙල්ලා rest ගෙන හෙට fresh mind එකෙන් start", next_scenario: "middle_rest_first_day" }
    ],
    stats_update: { money_change: -200, stress_change: 10, energy_change: -20, day_change: 1 },
    new_items: ["Backpack"],
    game_state: "ongoing"
  },

  "middle_job_hunt": {
    id: "middle_job_hunt",
    story_text: "Footscray market area එකේ කඩ වල vacancy signs තියනවා. Kitchen hand, cleaner, retail assistant කියලා jobs. Resume print කරලා යන්න වෙනවා. Competition වැඩියි student ල අතරේ.",
    image_prompt: "Job seeker walking through Footscray market area looking at vacancy signs in shop windows",
    choices: [
      { id: "c1", text: "Market වල shops වලට යලා direct apply කරමු", next_scenario: "middle_direct_apply" },
      { id: "c2", text: "Cleaning job agency එකකට register කරමු", next_scenario: "middle_cleaning_job" },
      { id: "c3", text: "Woolworths/Coles online apply කරමු", next_scenario: "middle_retail_online" }
    ],
    stats_update: { money_change: -10, stress_change: 20, energy_change: -15, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_cleaning_job": {
    id: "middle_cleaning_job",
    story_text: "Cleaning agency එක interview කාල දුන්නා job එක! Office buildings වල cleaning night shift. $25 per hour. වැඩ hard ඒත් මුදල් හොඳයි. Police check සහ ABN number ඕනේ.",
    image_prompt: "Cleaning supplies and uniform ready for office cleaning job in Melbourne",
    choices: [
      { id: "c1", text: "පළවෙනි shift එකට යමු, සල්ලි හම්බවෙයි", next_scenario: "middle_first_cleaning_shift" },
      { id: "c2", text: "Documents හදාගෙන හිටිය next week start කරමු", next_scenario: "middle_prepare_docs" },
      { id: "c3", text: "තව හොඳ job එකක් හොයන්න try කරමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -10, day_change: 2 },
    new_items: ["Cleaning Kit", "High-Vis Vest"],
    game_state: "ongoing"
  },

  "middle_first_cleaning_shift": {
    id: "middle_first_cleaning_shift",
    story_text: "පළවෙනි cleaning shift එක මාර අමාරුයි! 6PM-2AM දක්වා CBD office tower එකක වැඩ. කකුල් pain, අත් ගල් වෙනවා වගේ. ඒත් $200 හම්බුනා! Proud feeling එකක්.",
    image_prompt: "Tired but satisfied cleaning worker finishing night shift at Melbourne office building",
    choices: [
      { id: "c1", text: "දිගටම කරමු, මුදල් save කරමු", next_scenario: "middle_regular_work" },
      { id: "c2", text: "පොඩි celebrate එකක් කරමු roommates එක්ක", next_scenario: "middle_celebrate" },
      { id: "c3", text: "වැඩිය hard නේ, easy job එකක් බලමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: 200, stress_change: 25, energy_change: -40, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_regular_work": {
    id: "middle_regular_work",
    story_text: "Regular rhythm එකක් හැදිලා. Monday-Friday cleaning job, weekend වලට rest. Bank account එකේ balance එක grow වෙනවා. Life stable වෙලා එනවා පොඩි පොඩි.",
    image_prompt: "Improving life in Melbourne, money saving up, established routine",
    choices: [
      { id: "c1", text: "University classes start කරලා balance කරමු", next_scenario: "middle_study_work_balance" },
      { id: "c2", text: "දැන් car license ගෙන vehicle එකක් ගනිමු", next_scenario: "middle_car_plan" },
      { id: "c3", text: "දිගටම වැඩ කරලා PR plan කරමු", next_scenario: "success_settled" }
    ],
    stats_update: { money_change: 800, stress_change: -10, energy_change: 20, day_change: 10 },
    new_items: ["Tax File Number"],
    game_state: "ongoing"
  }
};

// Helper function to get random scenario continuation if specific next is not set
export function getRandomScenario(profileClass: ProfileClass): string {
  const classScenarios: Record<ProfileClass, string[]> = {
    "ඇමති පුතා": ["minister_hotel", "minister_university", "minister_leisure"],
    "Business Family": ["business_apartment", "business_job_search", "business_uber_eats"],
    "Middle Class": ["middle_footscray", "middle_job_hunt", "middle_cleaning_job"],
    "Lower Class": ["lower_help_desk", "lower_emergency_hostel", "lower_community"]
  };

  const scenarios = classScenarios[profileClass] || classScenarios["Middle Class"];
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

// Get initial scenario based on class
export function getInitialScenario(profileClass: ProfileClass): string {
  const initialScenarios: Record<ProfileClass, string> = {
    "ඇමති පුතා": "arrival_minister_son",
    "Business Family": "arrival_business",
    "Middle Class": "arrival_middle",
    "Lower Class": "arrival_lower"
  };

  return initialScenarios[profileClass] || "arrival_middle";
}
