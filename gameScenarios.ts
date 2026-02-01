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

  // Minister son paths - continued
  "minister_casino": {
    id: "minister_casino",
    story_text: "Crown Casino එකට ගියාම VIP entrance එක දුන්නා. Poker table එකේ $1000 bet කරන්න පුළුවන්. පවුලේ connections නිසා everyone knows you. Risky but fun!",
    image_prompt: "Luxury casino interior Melbourne Crown, VIP poker table with well-dressed players",
    choices: [
      { id: "c1", text: "Poker game එකක් ගහමු, skills test කරමු", is_risky: true, next_scenario: "minister_poker_win" },
      { id: "c2", text: "Bar එකේ ඉදලා networking කරමු", next_scenario: "minister_networking" },
      { id: "c3", text: "දැන් හොඳයි hotel එකට යමු, හෙට fresh වෙලා", next_scenario: "minister_hotel" }
    ],
    stats_update: { money_change: -100, stress_change: 5, energy_change: -10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_poker_win": {
    id: "minister_poker_win",
    story_text: "අම්මෝ බං! Poker hand එක royal flush! $5000 හම්බුනා! Table එකේ හිටිය businessman කෙනෙක් impressed වෙලා business card එක දුන්නා. Life එක මාර easy!",
    image_prompt: "Winning poker hand on casino table, celebration with champagne",
    choices: [
      { id: "c1", text: "තව rounds play කරමු, momentum එක තියනවා", is_risky: true, next_scenario: "minister_gambling_addiction" },
      { id: "c2", text: "Businessman එක්ක කතා කරලා connections හදමු", next_scenario: "minister_business_connection" },
      { id: "c3", text: "ජයගහණ celebrate කරලා hotel එකට යමු", next_scenario: "minister_hotel" }
    ],
    stats_update: { money_change: 5000, stress_change: -15, energy_change: -5, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_shopping": {
    id: "minister_shopping",
    story_text: "Melbourne Central shopping complex එකේ premium brands. Gucci, Louis Vuitton සේරම. Winter collection එක ගත්තා - jacket $800, boots $400. Instagram story එකක් දාලා.",
    image_prompt: "Luxury shopping bags from premium brands in Melbourne shopping center",
    choices: [
      { id: "c1", text: "තව පොඩි කඩ වලත් බලමු, souvenirs ගනිමු", next_scenario: "minister_lifestyle" },
      { id: "c2", text: "කෑම කන්න හොඳ restaurant එකකට යමු", next_scenario: "minister_fine_dining" },
      { id: "c3", text: "University එකට යන්න වෙලාව, enrollment කරමු", next_scenario: "minister_university" }
    ],
    stats_update: { money_change: -1200, stress_change: -10, energy_change: -5, day_change: 0 },
    new_items: ["Winter Jacket", "Designer Boots"],
    game_state: "ongoing"
  },

  "minister_business_connection": {
    id: "minister_business_connection",
    story_text: "Businessman මිනිහා තමයි real estate developer කෙනෙක්. Internship offer එකක් කළා - $30/hour. එයාගේ office එක CBD එකේ premium tower එකක. Connection එකක් හම්බුණා!",
    image_prompt: "Business meeting in modern Melbourne office tower, city view from window",
    choices: [
      { id: "c1", text: "Internship එක accept කරලා start කරමු", next_scenario: "minister_internship" },
      { id: "c2", text: "පොඩ්ඩක් හිතලා university work balance කරලා decide කරමු", next_scenario: "minister_university" },
      { id: "c3", text: "තව networking කරලා options බලමු", next_scenario: "minister_social" }
    ],
    stats_update: { money_change: 0, stress_change: 5, energy_change: -10, day_change: 1 },
    new_items: ["Business Card"],
    game_state: "ongoing"
  },

  "minister_internship": {
    id: "minister_internship",
    story_text: "Real estate office එකේ වැඩ පටන් ගත්තා. Property valuations, client meetings, market research. මාර professional environment එකක්. Weekly $1200 හම්බවෙනවා!",
    image_prompt: "Young professional working in modern Melbourne real estate office",
    choices: [
      { id: "c1", text: "Work hard කරලා full-time offer එකක් හොයමු", next_scenario: "minister_career_path" },
      { id: "c2", text: "Study + work balance කරමු", next_scenario: "minister_balanced_life" },
      { id: "c3", text: "Connections use කරලා own business start කරමු", is_risky: true, next_scenario: "minister_startup" }
    ],
    stats_update: { money_change: 1200, stress_change: 15, energy_change: -25, day_change: 5 },
    new_items: ["Laptop", "Work Portfolio"],
    game_state: "ongoing"
  },

  // Business family expanded paths
  "business_groceries": {
    id: "business_groceries",
    story_text: "Coles එකේ shopping කරද්දී prices බලලා shock! Milk $4, Rice $15! Budget manage කරන්න ඕනේ. Roommates tips දුන්නා - ALDI cheaper කියලා.",
    image_prompt: "Shopping in Australian supermarket, comparing prices on shelves",
    choices: [
      { id: "c1", text: "Meal prep කරලා week එකට හදාගනිමු", next_scenario: "business_meal_prep" },
      { id: "c2", text: "ALDI එකට යමු, savings කරමු", next_scenario: "business_smart_shopping" },
      { id: "c3", text: "Sri Lankan කඩ එකක් හොයමු, අපේ කෑම ගනිමු", next_scenario: "business_srilankan_shop" }
    ],
    stats_update: { money_change: -80, stress_change: 10, energy_change: -10, day_change: 0 },
    new_items: ["Groceries"],
    game_state: "ongoing"
  },

  "business_srilankan_shop": {
    id: "business_srilankan_shop",
    story_text: "Footscray එකේ Sri Lankan කඩයක් හම්බුනා! අච්චාරු, පාපඩම්, තේ කොළ සේරම තියනවා. කඩේ uncle කෙනෙක් job එකක් ගැන කිව්වා - warehouse helper.",
    image_prompt: "Sri Lankan grocery store in Footscray Melbourne, shelves with familiar products",
    choices: [
      { id: "c1", text: "Uncle ට කතා කරලා job details අහමු", next_scenario: "business_warehouse_job" },
      { id: "c2", text: "සාමාන් ගෙන දැන් apartment එකට යමු", next_scenario: "business_apartment" },
      { id: "c3", text: "Community එක්ක connect වෙමු, contacts හදමු", next_scenario: "business_community_network" }
    ],
    stats_update: { money_change: -50, stress_change: -15, energy_change: -5, day_change: 0 },
    new_items: ["Rice", "Spices"],
    game_state: "ongoing"
  },

  "business_warehouse_job": {
    id: "business_warehouse_job",
    story_text: "Warehouse job interview ගියා. Amazon fulfillment center එක. Night shift 10PM-6AM, $27/hour. Physical work වැඩියි but මුදල් හොඳයි.",
    image_prompt: "Large warehouse interior with boxes and forklifts, workers in high-vis vests",
    choices: [
      { id: "c1", text: "Job එක accept කරලා පළවෙනි shift එකට යමු", next_scenario: "business_warehouse_first_day" },
      { id: "c2", text: "තව options බලලා decide කරමු", next_scenario: "business_job_search" },
      { id: "c3", text: "Part-time කරලා study එක්ක balance කරමු", next_scenario: "business_part_time_warehouse" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "business_warehouse_first_day": {
    id: "business_warehouse_first_day",
    story_text: "පළවෙනි shift එක මාර hard! 8 hours non-stop boxes lift කරනවා. Supervisor strict. ඒත් team එක friendly. $216 හම්බුනා පළවෙනි දවසට!",
    image_prompt: "Tired warehouse worker after first night shift, satisfied with paycheck",
    choices: [
      { id: "c1", text: "දිගටම කරමු, මුදල් save කරමු", next_scenario: "business_warehouse_grind" },
      { id: "c2", text: "Forklift license එකක් ගෙන promotion බලමු", next_scenario: "business_forklift_training" },
      { id: "c3", text: "වැඩිය hard, easy job එකක් බලමු", next_scenario: "business_job_search" }
    ],
    stats_update: { money_change: 216, stress_change: 20, energy_change: -40, day_change: 1 },
    new_items: ["High-Vis Vest", "Work Boots"],
    game_state: "ongoing"
  },

  "business_myki": {
    id: "business_myki",
    story_text: "Myki card top up කරලා tram journey එකක් try කළා. Melbourne tram system එක පට්ට! Free tram zone CBD එකේ. City explore කරන්න පුළුවන්.",
    image_prompt: "Melbourne tram on city street, iconic green and yellow colors",
    choices: [
      { id: "c1", text: "City එක explore කරමු, landmarks බලමු", next_scenario: "business_explore_melbourne" },
      { id: "c2", text: "Apartment එකට direct යමු", next_scenario: "business_apartment" },
      { id: "c3", text: "University campus එක බලලා එමු", next_scenario: "business_university_visit" }
    ],
    stats_update: { money_change: -10, stress_change: -10, energy_change: -5, day_change: 0 },
    new_items: ["Myki Card"],
    game_state: "ongoing"
  },

  // Middle class expanded scenarios
  "middle_bus": {
    id: "middle_bus",
    story_text: "Public bus එක slow but cheap. 2 hours journey ඇතුළේ Footscray එකට ගියා. Luggage එක carry කරනවා අමාරු වුණත් $15 save කළා!",
    image_prompt: "Public bus journey in Melbourne suburbs, passenger with luggage looking tired",
    choices: [
      { id: "c1", text: "Shared house එකට finally ගිහින් rest එකක් ගනිමු", next_scenario: "middle_footscray" },
      { id: "c2", text: "පළවෙනි day area එක පොඩ්ඩක් explore කරමු", next_scenario: "middle_explore_footscray" },
      { id: "c3", text: "Sri Lankan කඩයක් හොයමු, කන්න එකක් කාලා යමු", next_scenario: "middle_srilankan_food" }
    ],
    stats_update: { money_change: -5, stress_change: 15, energy_change: -25, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_shared_taxi": {
    id: "middle_shared_taxi",
    story_text: "Facebook group එකේ post කළා shared taxi එකක්. 3 දෙනෙක් එක්ක $15/person. එක journey එකේම contacts 3ක් හම්බුනා - හැමෝම students!",
    image_prompt: "Shared taxi with international students, friendly conversation during ride",
    choices: [
      { id: "c1", text: "New friends එක්ක WhatsApp group එකක් හදමු", next_scenario: "middle_student_network" },
      { id: "c2", text: "Shared house එකට ගිහින් settle වෙමු", next_scenario: "middle_footscray" },
      { id: "c3", text: "අනික් students එක්ක job tips අහමු", next_scenario: "middle_job_tips" }
    ],
    stats_update: { money_change: -15, stress_change: -10, energy_change: -15, day_change: 0 },
    new_items: ["Phone Contacts"],
    game_state: "ongoing"
  },

  "middle_explore_city": {
    id: "middle_explore_city",
    story_text: "Melbourne CBD එක explore කළා - Federation Square, Flinders Street Station, Yarra River. Photo ගණනක් ගත්තා Instagram එකට. City එක පට්ට beautiful!",
    image_prompt: "Federation Square Melbourne with tourists, iconic architecture and city skyline",
    choices: [
      { id: "c1", text: "තව පොඩ්ඩක් බලලා enjoy කරමු", next_scenario: "middle_melbourne_tourism" },
      { id: "c2", text: "දැන් වැඩ බලන්න පටන් ගමු", next_scenario: "middle_job_hunt" },
      { id: "c3", text: "Shared house එකට යන්න වෙලාව වෙලා", next_scenario: "middle_footscray" }
    ],
    stats_update: { money_change: -20, stress_change: -15, energy_change: -10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_srilankan_food": {
    id: "middle_srilankan_food",
    story_text: "Sri Lankan කෑම කඩයක් හම්බුනා Footscray එකේ! Rice & curry $12. Taste එක හරියට අපේ ගෙදර වගේ. Aunty කතා කරලා job පැත්තෙ help කරනවා කිව්වා.",
    image_prompt: "Sri Lankan restaurant in Footscray, plate of rice and curry, friendly aunty serving",
    choices: [
      { id: "c1", text: "Aunty එක්ක job opportunities ගැන කතා කරමු", next_scenario: "middle_aunty_help" },
      { id: "c2", text: "Restaurant එකේම වැඩක් අහලා බලමු", next_scenario: "middle_restaurant_job" },
      { id: "c3", text: "කාලා දැන් house එකට යමු", next_scenario: "middle_footscray" }
    ],
    stats_update: { money_change: -12, stress_change: -20, energy_change: 10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_direct_apply": {
    id: "middle_direct_apply",
    story_text: "Market වල කඩ වලට resume දුන්නා. Vietnamese grocery එකක් interview call එකක් දුන්නා same day! $22/hour retail assistant. පොඩි start එකක්.",
    image_prompt: "Small Vietnamese grocery store in Footscray, shopkeeper interviewing candidate",
    choices: [
      { id: "c1", text: "Interview එකට හොඳටම prepare වෙලා යමු", next_scenario: "middle_retail_interview" },
      { id: "c2", text: "තව options බලලා compare කරමු", next_scenario: "middle_job_hunt" },
      { id: "c3", text: "Accept කරලා පළවෙනි shift start කරමු", next_scenario: "middle_retail_work" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_retail_online": {
    id: "middle_retail_online",
    story_text: "Coles online application submit කළා. Automated response එකක් ආවා - screening process කියලා. 2-3 weeks wait කරන්න වෙනවා. Slow process!",
    image_prompt: "Person filling online job application on laptop, waiting for response",
    choices: [
      { id: "c1", text: "Wait කරද්දී වෙන jobs apply කරමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Direct කඩ වලට යලා fast results ගනිමු", next_scenario: "middle_direct_apply" },
      { id: "c3", text: "Cleaning agency එකක් try කරමු", next_scenario: "middle_cleaning_job" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -5, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  // Lower class expanded with more struggle
  "lower_emergency_hostel": {
    id: "lower_emergency_hostel",
    story_text: "Emergency hostel එකට ගියා - shared room 8 people එක්ක. Bunk bed එකක්. Safe ඒත් privacy නෑ. $15/night. මුදල් ඉක්මනට ඉවර වෙයි!",
    image_prompt: "Budget hostel dormitory room with bunk beds, backpackers settling in",
    choices: [
      { id: "c1", text: "ඉක්මනින්ම job හොයන්න පටන් ගනිමු", next_scenario: "lower_desperate_job_hunt" },
      { id: "c2", text: "Hostel එකේ අය එක්ක network කරමු", next_scenario: "lower_hostel_friends" },
      { id: "c3", text: "Cheaper option එකක් හොයමු - homeless shelter", is_risky: true, next_scenario: "lower_shelter" }
    ],
    stats_update: { money_change: -15, stress_change: 30, energy_change: -20, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "lower_community": {
    id: "lower_community",
    story_text: "Sri Lankan community help line call කළා. Uncle කෙනෙක් pick up කළා - Dandenong area එකේ shared room එකක් $80/week. එයා එන්න කිව්වා.",
    image_prompt: "Helpful Sri Lankan community volunteer on phone, offering assistance",
    choices: [
      { id: "c1", text: "Uncle එක්ක meet වෙලා room එක බලමු", next_scenario: "lower_dandenong_room" },
      { id: "c2", text: "තව options ටිකක් compare කරලා decide කරමු", next_scenario: "lower_compare_options" },
      { id: "c3", text: "Community center එකට ගිහින් help අහමු", next_scenario: "lower_community_center" }
    ],
    stats_update: { money_change: 0, stress_change: -15, energy_change: -10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "lower_facebook_help": {
    id: "lower_facebook_help",
    story_text: "Facebook post එක දැම්මට පස්සේ messages 15ක් ආවා! Some helpful, some scams. Akka කෙනෙක් genuine help offer කළා - Sunshine area එකේ spare room.",
    image_prompt: "Phone screen showing Facebook messages, mix of helpful and suspicious offers",
    choices: [
      { id: "c1", text: "Genuine looking akka message එකට reply කරමු", next_scenario: "lower_sunshine_room" },
      { id: "c2", text: "පොලිසියට scam messages report කරමු", next_scenario: "lower_report_scams" },
      { id: "c3", text: "Community organization එකකට යමු safe option එකට", next_scenario: "lower_community" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -15, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "lower_desperate_job_hunt": {
    id: "lower_desperate_job_hunt",
    story_text: "Jobs desperate වෙලා හොයද්දී Facebook group එකේ කෙනෙක් farm work offer කළා. Rural Victoria - $15/hour picking fruits. Accommodation free ඒත් remote.",
    image_prompt: "Rural farm work opportunity advertisement, fruit picking in Victorian countryside",
    choices: [
      { id: "c1", text: "Farm job එක accept කරලා country side යමු", next_scenario: "lower_farm_work" },
      { id: "c2", text: "Melbourne එකේම රැඳිලා city jobs හොයමු", next_scenario: "lower_city_jobs" },
      { id: "c3", text: "Cash jobs එහෙම හොයමු - fast money", is_risky: true, next_scenario: "lower_cash_jobs" }
    ],
    stats_update: { money_change: 0, stress_change: 35, energy_change: -20, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  // Success and milestone scenarios
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
  },

  // Additional diverse scenarios
  "minister_leisure": {
    id: "minister_leisure",
    story_text: "University classes start වෙන්න සති 2ක් තියනවා. මේ කාලේ Great Ocean Road trip එකක්, Melbourne Cup racing, nightlife explore කරන්න පුළුවන්. VIP lifestyle මචං!",
    image_prompt: "Luxury lifestyle in Melbourne, Great Ocean Road scenic drive with expensive car",
    choices: [
      { id: "c1", text: "Great Ocean Road road trip යමු, Instagram worthy!", next_scenario: "minister_road_trip" },
      { id: "c2", text: "Melbourne Cup racing event එකට යමු VIP box එකෙන්", next_scenario: "minister_racing" },
      { id: "c3", text: "St Kilda beach clubs එකක් try කරමු", next_scenario: "minister_nightlife" }
    ],
    stats_update: { money_change: -800, stress_change: -20, energy_change: 10, day_change: 3 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_social": {
    id: "minister_social",
    story_text: "University social clubs වලට join වෙලා international students meet කරනවා. Leadership positions වලට apply කරන්න පුළුවන්. Network එක build වෙනවා.",
    image_prompt: "University social club event, diverse international students networking",
    choices: [
      { id: "c1", text: "Sri Lankan students club එකක් start කරමු", next_scenario: "minister_sri_lankan_club" },
      { id: "c2", text: "Business club එකක් join වෙලා CEO paths explore කරමු", next_scenario: "minister_business_club" },
      { id: "c3", text: "Sports club එකක් try කරමු - cricket/rugby", next_scenario: "minister_sports" }
    ],
    stats_update: { money_change: -100, stress_change: -10, energy_change: -10, day_change: 2 },
    new_items: ["Club Membership"],
    game_state: "ongoing"
  },

  "business_practice_routes": {
    id: "business_practice_routes",
    story_text: "City එකේ bike routes practice කරනවා. Bike lanes හොයාගන්න, traffic patterns learn කරන්න. Safe ව වැඩ කරන්න මේව දැනගන්න ඕනේ.",
    image_prompt: "Cyclist practicing delivery routes in Melbourne CBD, learning bike lanes",
    choices: [
      { id: "c1", text: "දැන් confident, first delivery shift එකට යමු", next_scenario: "business_first_delivery" },
      { id: "c2", text: "තව දවසක් practice කරලා perfect කරමු", next_scenario: "business_more_practice" },
      { id: "c3", text: "Evening shift එක try කරමු", next_scenario: "business_evening_delivery" }
    ],
    stats_update: { money_change: 0, stress_change: -5, energy_change: -15, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "business_evening_delivery": {
    id: "business_evening_delivery",
    story_text: "Evening 6PM-10PM shift එක busy වැඩියි! Orders non-stop එනවා. Tips හොඳයි customers ල generous. 4 hours වලට $120 හම්බුනා!",
    image_prompt: "Night delivery cyclist in Melbourne, lit streets with restaurants and customers",
    choices: [
      { id: "c1", text: "දිගටම evening shifts කරමු, money හොඳයි", next_scenario: "business_delivery_streak" },
      { id: "c2", text: "Different time slots try කරලා best time හොයමු", next_scenario: "business_optimize_shifts" },
      { id: "c3", text: "හෙට day shift එකක් try කරමු", next_scenario: "business_first_delivery" }
    ],
    stats_update: { money_change: 120, stress_change: 10, energy_change: -30, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "business_delivery_streak": {
    id: "business_delivery_streak",
    story_text: "මුදල් හොඳට හම්බවෙනවා delivery වලින්! සතියකට $600-800 collect වෙනවා. දැන් car එකක් ගන්න හිතනවා වැඩ easy කරන්න.",
    image_prompt: "Successful delivery person counting weekly earnings, happy and motivated",
    choices: [
      { id: "c1", text: "Car license ගෙන vehicle delivery upgrade කරමු", next_scenario: "business_car_upgrade" },
      { id: "c2", text: "Bicycle එකෙන්ම දිගටම, පොඩියෙන් පොඩියට save කරමු", next_scenario: "business_save_money" },
      { id: "c3", text: "University classes start කරලා balance කරමු", next_scenario: "business_study_delivery_balance" }
    ],
    stats_update: { money_change: 700, stress_change: 5, energy_change: -20, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  "business_day_routine": {
    id: "business_day_routine",
    story_text: "Daily routine එකක් හැදිලා - morning delivery, afternoon rest, evening delivery or study. Life balance වෙලා එනවා slowly. Melbourne lifestyle එකට adjust වෙනවා.",
    image_prompt: "Balanced daily routine in Melbourne, work-life balance visualization",
    choices: [
      { id: "c1", text: "දැන් stable, PR pathway plan කරමු", next_scenario: "success_settled" },
      { id: "c2", text: "තව income sources හොයමු - second job", next_scenario: "business_second_job" },
      { id: "c3", text: "Skills improve කරලා better job හොයමු", next_scenario: "business_upskill" }
    ],
    stats_update: { money_change: 400, stress_change: -15, energy_change: 10, day_change: 5 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_learn_area": {
    id: "middle_learn_area",
    story_text: "Roommates එක්ක කතා කරලා Footscray area එක ගැන දැනගන්නවා. Cheap shops, libraries, parks, job opportunities. Vietnamese, African, Lankan communities එහෙම ගොඩක්.",
    image_prompt: "Multicultural Footscray neighborhood, diverse shops and community centers",
    choices: [
      { id: "c1", text: "Area එක explore කරලා familiarize වෙමු", next_scenario: "middle_explore_footscray" },
      { id: "c2", text: "දැන් job hunt එකට focus කරමු", next_scenario: "middle_job_hunt" },
      { id: "c3", text: "Library card එකක් ගෙන resources use කරමු", next_scenario: "middle_library_resources" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: -5, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_rest_first_day": {
    id: "middle_rest_first_day",
    story_text: "පළවෙනි දවස rest ගන්නවා. Jet lag එක recover වෙනවා. Room එකේ settle වෙලා හෙට fresh mind එකෙන් plan කරන්න හිතනවා.",
    image_prompt: "Person resting in shared room after long journey, recovering from travel",
    choices: [
      { id: "c1", text: "හෙට patan job hunt start කරමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Area එක පොඩ්ඩක් explore කරලා familiarize වෙමු", next_scenario: "middle_explore_footscray" },
      { id: "c3", text: "Roommates එක්ක bond කරලා tips ගනිමු", next_scenario: "middle_learn_area" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 50, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_prepare_docs": {
    id: "middle_prepare_docs",
    story_text: "Police check, Tax File Number (TFN), ABN - මේව හදාගන්න applications submit කරනවා. Process එක 5-7 days. Wait කරන්න වෙනවා.",
    image_prompt: "Person filling official documents for work in Australia, TFN and ABN applications",
    choices: [
      { id: "c1", text: "Wait කරද්දී වෙන job එකක් හොයමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "University ගිහින් student services use කරමු", next_scenario: "middle_student_services" },
      { id: "c3", text: "Docs ready වෙනකන් area එක explore කරමු", next_scenario: "middle_explore_footscray" }
    ],
    stats_update: { money_change: -50, stress_change: 10, energy_change: -10, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  "middle_celebrate": {
    id: "middle_celebrate",
    story_text: "පළවෙනි paycheck celebrate කරන්න roommates එක්ක pizza order කරලා movie night එකක්. Small victories count! හෙට onwards positive mindset එකෙන්.",
    image_prompt: "Group of roommates celebrating with pizza, happy multicultural gathering",
    choices: [
      { id: "c1", text: "දැන් regular work mode එකට යමු", next_scenario: "middle_regular_work" },
      { id: "c2", text: "වෙන side hustle එකක් හොයමු extra money වලට", next_scenario: "middle_side_hustle" },
      { id: "c3", text: "Study start කරන planning කරමු", next_scenario: "middle_study_planning" }
    ],
    stats_update: { money_change: -30, stress_change: -25, energy_change: 10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "lower_report_scam": {
    id: "lower_report_scam",
    story_text: "Scam Watch Australia වෙබ්සයිට් එකට report කළා. Police station එකක්ට ගිහින් complaint එකක් දැම්මා. මුදල් එපා වුණත් system එකට report කරන එක වැදගත්.",
    image_prompt: "Police station in Melbourne, person filing scam report, serious atmosphere",
    choices: [
      { id: "c1", text: "දැන් accommodation හොයන්න community help අහමු", next_scenario: "lower_community_help" },
      { id: "c2", text: "Budget hostel එකක් හොයමු වෙන්න", next_scenario: "lower_emergency_hostel" },
      { id: "c3", text: "Facebook group වල ආයෙ try කරමු carefully", next_scenario: "lower_facebook_help" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -15, day_change: 1 },
    new_items: ["Police Report"],
    game_state: "ongoing"
  },

  "lower_fraud_report": {
    id: "lower_fraud_report",
    story_text: "Bank එකට ගිහින් fraud dispute එකක් file කළා. Process එක long but bank එක investigate කරනවා කිව්වා. Reversal chance පොඩියි but try කළා.",
    image_prompt: "Bank teller helping customer file fraud report, official banking environment",
    choices: [
      { id: "c1", text: "Wait කරද්දී emergency accommodation හොයමු", next_scenario: "lower_emergency_shelter" },
      { id: "c2", text: "Community organizations වලින් help අහමු", next_scenario: "lower_community_help" },
      { id: "c3", text: "දැන් ඉතිං වැඩ හොයලා recover වෙන්න පටන් ගනිමු", next_scenario: "lower_desperate_job_hunt" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -10, day_change: 1 },
    new_items: ["Bank Dispute Number"],
    game_state: "ongoing"
  },

  "lower_community_help": {
    id: "lower_community_help",
    story_text: "Sri Lankan community welfare organization එකක් help කළා! Temporary accommodation 1 week free, job connections, counselling services provide කරනවා. දැන් hope එකක් පෙන්නවා.",
    image_prompt: "Community welfare center, volunteers helping new immigrants with support services",
    choices: [
      { id: "c1", text: "Organization එකේ help එකෙන් job interview එකකට යමු", next_scenario: "lower_community_job" },
      { id: "c2", text: "Counselling sessions වලට යලා mental health එක බලාගනිමු", next_scenario: "lower_mental_health" },
      { id: "c3", text: "Temp accommodation එකේ ඉඳලා permanent තැනක් හොයමු", next_scenario: "lower_find_permanent_room" }
    ],
    stats_update: { money_change: 0, stress_change: -30, energy_change: 20, day_change: 2 },
    new_items: ["Community Support Card"],
    game_state: "ongoing"
  },

  "lower_emergency_shelter": {
    id: "lower_emergency_shelter",
    story_text: "Salvation Army emergency shelter එකක් හම්බුනා. Basic bed, meals included, safe. 2 weeks දක්වා stay කරන්න පුළුවන්. Social workers job hunt එකට help කරනවා.",
    image_prompt: "Emergency shelter facility, clean and safe basic accommodation",
    choices: [
      { id: "c1", text: "Social worker help එකෙන් job applications යවමු", next_scenario: "lower_social_worker_help" },
      { id: "c2", text: "Shelter එකේ අය එක්ක network කරලා opportunities හොයමු", next_scenario: "lower_shelter_network" },
      { id: "c3", text: "දිගටම survive කරමු, කොහොමහරි මේ phase එක pass වෙයි", next_scenario: "lower_survival_mode" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 15, day_change: 1 },
    new_items: [],
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
