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

  // ============================================
  // MINISTER SON EXCLUSIVE SCAM SCENARIOS
  // Rich kid problems: Clubbing, Gold Diggers, Drink & Drive, Fake Friends
  // ============================================

  // CLUBBING INVITATION - VIP Lifestyle Trap
  "minister_clubbing_invite": {
    id: "minister_clubbing_invite",
    story_text: "Uni එකේ හම්බවුන rich kid gang එක invite කරනවා - 'Machi, Friday night Revolver Upstairs! VIP table, bottle service! 🍾 ඔයාගේ ගාව BMW තියෙන්නේ, come pick us up!' ඔයා cool වෙන්න ඕනේ නේ! VIP table $2000, but connections important ද?",
    image_prompt: "Melbourne nightclub VIP area, champagne bottles, luxury party scene",
    choices: [
      { id: "c1", text: "VIP table එක book කරලා party hard! 🥳", is_risky: true, next_scenario: "minister_clubbing_chaos" },
      { id: "c2", text: "යමු, but drinks only - VIP table unnecessary", next_scenario: "minister_clubbing_smart" },
      { id: "c3", text: "Nah machi, assignment deadline තියනවා 📚", next_scenario: "minister_study_focus" }
    ],
    stats_update: { money_change: 0, stress_change: 10, energy_change: -5, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_clubbing_chaos": {
    id: "minister_clubbing_chaos",
    story_text: "VIP table $2000! Vodka bottles, everyone posting Instagram stories tagging you! 📱 ඔයා maaaara famous! But... 3am, ඔයා heavily drunk. 'Friends' කිව්වා 'Machi, BMW එක drive කරලා McDonald's යමු!' ඔයා keys ගත්තා... 🚗🍺",
    image_prompt: "Drunk party scene, car keys in hand, friends pressuring to drive",
    choices: [
      { id: "c1", text: "මම drive කරන්නම්, I can handle it! 🚗", is_risky: true, next_scenario: "minister_drink_drive" },
      { id: "c2", text: "Uber ගමු, BMW එක හෙට ගනිමු 🚕", next_scenario: "minister_smart_choice" },
      { id: "c3", text: "Club එකේ sleep කරලා morning drive 😴", next_scenario: "minister_stay_safe" }
    ],
    stats_update: { money_change: -2000, stress_change: 20, energy_change: -40, day_change: 1 },
    new_items: ["VIP Wristband"],
    game_state: "ongoing"
  },

  // DRINK AND DRIVE - MAJOR CONSEQUENCE
  "minister_drink_drive": {
    id: "minister_drink_drive",
    story_text: "🚨 POLICE LIGHTS! Random breath test, Chapel Street. ඔයාගේ BAC 0.12 - limit 0.05! License SUSPENDED 12 months! Court date, $2500 fine, criminal record! 😱 Worse - BMW impounded 30 days ($1500). Appachchi ට call කරන්න වෙනවා explain කරන්න... ලංකාවේ news spread වෙයි! 'ඇමති පුතා Australia වල drunk driving!' 📰 Social media comments destroying your family name!",
    image_prompt: "Police breath test at night, driver in shock, flashing lights, impounded car",
    choices: [
      { id: "c1", text: "Lawyer hire කරලා fight කරමු 👨‍⚖️", next_scenario: "minister_court_case" },
      { id: "c2", text: "Appachchi ට honestly කියලා help ඉල්ලමු 📞", next_scenario: "minister_family_shame" },
      { id: "c3", text: "Low profile, accept fine, learn lesson 😔", next_scenario: "minister_humble_lesson" }
    ],
    stats_update: { money_change: -4000, stress_change: 90, energy_change: -60, day_change: 7 },
    new_items: ["Criminal Record", "Suspended License"],
    game_state: "ongoing"
  },

  "minister_family_shame": {
    id: "minister_family_shame",
    story_text: "Appachchi phone එක pick කරන්නේ නැති දවස් 3ක්. Finally call back - 'පුතා, මොකක්ද මේ කළේ? අපේ family name!' 😢 Amma crying in background. Media interviews refuse කරනවා. Appachchi lawyer arrange කළා but conditions - 'No more partying, serious about studies, or come back to Sri Lanka!' Reputation damage control start!",
    image_prompt: "Video call with disappointed parents, student looking ashamed, serious conversation",
    choices: [
      { id: "c1", text: "Promise keep කරලා prove කරමු 💪", next_scenario: "minister_redemption" },
      { id: "c2", text: "ලංකාවට යමු, Australia life over 😔", next_scenario: "return_srilanka" },
      { id: "c3", text: "Low profile maintain කරමු, slowly rebuild 🏗️", next_scenario: "minister_rebuild" }
    ],
    stats_update: { money_change: 0, stress_change: 50, energy_change: -30, day_change: 14 },
    new_items: ["Family Pressure"],
    game_state: "ongoing"
  },

  // GOLD DIGGER GIRLFRIEND SCAM
  "minister_gold_digger": {
    id: "minister_gold_digger",
    story_text: "Uni එකේ 'Natasha' කියලා ලස්සන Model looking එකෙක් ඔයාට approach කළා. 'OMG your BMW is so nice! Are you from a good family?' 💕 2 weeks dating - ඇයි always expensive restaurants suggest කරන්නේ? Designer gifts expect කරනවා? ඇයි ඇගේ friends always ඔයාගේ ගාව money situation ගැන අහන්නේ? 🤔",
    image_prompt: "Beautiful woman at expensive restaurant, looking at man's wallet/watch, red flags",
    choices: [
      { id: "c1", text: "ඇය genuine! Birthday gift - Tiffany necklace ($3000) 💎", is_risky: true, next_scenario: "minister_gold_digger_trap" },
      { id: "c2", text: "Test කරමු - cheap date suggest කරලා reaction බලමු 🧪", next_scenario: "minister_gold_digger_test" },
      { id: "c3", text: "Red flags වැඩියි, slowly distance ගමු 🚩", next_scenario: "minister_dodge_bullet" }
    ],
    stats_update: { money_change: -500, stress_change: 15, energy_change: -10, day_change: 14 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_gold_digger_trap": {
    id: "minister_gold_digger_trap",
    story_text: "Tiffany necklace gift කළා! ඇය 'OMG baby you're the best!' 😍 One week later - 'Baby, my rent is due, can you help? $2000 just for this month!' ඔයා help කළා. Next month - 'My car needs fixing! $1500?' Pattern එක පේනවද? 🚩 Then one day, ඇගේ 'ex-boyfriend' message - 'Bro, she did the same to me! She has 3 other rich boyfriends right now!' 💀 ඔයා spent $8000+ on professional gold digger!",
    image_prompt: "Shocked man reading messages exposing girlfriend's scheme, expensive gifts scattered",
    choices: [
      { id: "c1", text: "Confront her and demand items back 😤", next_scenario: "minister_gold_digger_confront" },
      { id: "c2", text: "Ghost her, lesson learned, move on 👻", next_scenario: "minister_lesson_learned" },
      { id: "c3", text: "Expose her on social media warning others 📢", next_scenario: "minister_expose_scammer" }
    ],
    stats_update: { money_change: -8000, stress_change: 70, energy_change: -40, day_change: 30 },
    new_items: ["Trust Issues", "Expensive Lesson"],
    game_state: "ongoing"
  },

  "minister_gold_digger_test": {
    id: "minister_gold_digger_test",
    story_text: "Picnic at park suggest කළා instead of restaurant. ඇගේ face! 😒 'Eww, picnic? That's so... basic. Let's go somewhere nice na baby?' ඔයා insist කළා. ඇය 'sick' වුණා suddenly. Next day, ඇගේ Instagram story - වෙන rich looking guy එක්ක dinner at Vue de Monde! 🍽️ Bullet dodged machi! ඇය gold digger confirm! ඔයාගේ intelligence save කළා thousands!",
    image_prompt: "Man smiling at phone seeing Instagram story, relieved expression, dodged scam",
    choices: [
      { id: "c1", text: "Good riddance! Focus on real connections 💪", next_scenario: "minister_genuine_friends" },
      { id: "c2", text: "Screenshot save කරලා future reference 📱", next_scenario: "minister_wisdom_gained" },
      { id: "c3", text: "Friends ට warning share කරමු 🗣️", next_scenario: "minister_friend_warning" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 10, day_change: 1 },
    new_items: ["Scam Radar"],
    game_state: "ongoing"
  },

  // FAKE FRIEND MONEY SCAM
  "minister_fake_friend_scam": {
    id: "minister_fake_friend_scam",
    story_text: "Uni friend 'Dinesh' - ඔයා trust කරන close friend. One day crying call - 'Machi, emergency! Amma hospital Sri Lanka, need $5000 for surgery! I'll pay back next month promise! ඔයා one පාරක් help කළා!' 😢 ඔයාගේ ගාව money තියනවා, Dinesh genuine feeling...",
    image_prompt: "Friend desperately asking for money, emotional manipulation, student uncertain",
    choices: [
      { id: "c1", text: "Of course machi! Transfer now! 💸", is_risky: true, next_scenario: "minister_friend_scam_victim" },
      { id: "c2", text: "Hospital details send කරන්න, direct pay කරන්නම් 🏥", next_scenario: "minister_friend_scam_dodge" },
      { id: "c3", text: "Sorry machi, I don't lend money to friends 🙅", next_scenario: "minister_friend_boundaries" }
    ],
    stats_update: { money_change: 0, stress_change: 30, energy_change: -10, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  "minister_friend_scam_victim": {
    id: "minister_friend_scam_victim",
    story_text: "$5000 transfer කළා. 'Thanks machi, I'll never forget this!' 🙏 One month - 'Machi, just few more weeks?' Two months - 'Bro, things rough, soon!' Three months - phone number changed, Instagram blocked, disappeared from uni! 😱 Mutual friends ට අහනකොට - 'Bro, Dinesh already left to Canada! ඔයා 4th person he scammed!' Professional friendship scammer! ඇමති පුතා ද scam වෙන්නේ! 💀",
    image_prompt: "Blocked contact on phone, realization of being scammed by friend, empty wallet",
    choices: [
      { id: "c1", text: "Parents ට නොකියා absorb the loss 😔", next_scenario: "minister_silent_loss" },
      { id: "c2", text: "Police report file කරමු 🚔", next_scenario: "minister_police_report" },
      { id: "c3", text: "Lankan community එකේ expose කරමු 📢", next_scenario: "minister_community_expose" }
    ],
    stats_update: { money_change: -5000, stress_change: 60, energy_change: -30, day_change: 90 },
    new_items: ["Trust Issues", "Friend Scam Experience"],
    game_state: "ongoing"
  },

  "minister_friend_scam_dodge": {
    id: "minister_friend_scam_dodge",
    story_text: "'Hospital bill direct pay කරන්නම්, details send කරන්න!' ඔයා intelligent! 🧠 Dinesh suddenly - 'Umm... actually hospital is in rural area, no direct payment, cash only...' More questions = more excuses. Finally - 'Forget it machi, I'll ask someone else!' and blocked you! 😂 Later found out - no sick amma, professional scammer! ඔයාගේ $5000 safe because you asked questions! Smart rich kid!",
    image_prompt: "Student smiling, realizing they avoided scam, phone showing blocked contact",
    choices: [
      { id: "c1", text: "Other friends ට warning share කරමු 🗣️", next_scenario: "minister_warning_friends" },
      { id: "c2", text: "Move on, some people are just trash 🗑️", next_scenario: "minister_move_on" },
      { id: "c3", text: "More careful about who I trust now 🔒", next_scenario: "minister_trust_wisely" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: 5, day_change: 1 },
    new_items: ["Scam Prevention Skill"],
    game_state: "ongoing"
  },

  // MINISTER SON SMART CHOICES - REWARDS
  "minister_smart_choice": {
    id: "minister_smart_choice",
    story_text: "Uber ගත්තා, BMW එක club parking එකේ safe. Smart decision! 🧠 Morning Uber back ගියා car ගන්න - no police, no drama, no criminal record! Friends කිව්වා 'Machi you're boring!' but ඔයාගේ license, record, reputation all intact! This is how rich kids stay rich - smart decisions!",
    image_prompt: "Next morning picking up car safely, feeling good about smart decision",
    choices: [
      { id: "c1", text: "Gym යමු, hangover recover කරමු 💪", next_scenario: "minister_healthy_life" },
      { id: "c2", text: "Assignment finish කරමු, productive day 📚", next_scenario: "minister_study_focus" },
      { id: "c3", text: "Real friends එක්ක proper lunch plan 🍽️", next_scenario: "minister_genuine_friends" }
    ],
    stats_update: { money_change: -50, stress_change: -20, energy_change: 10, day_change: 1 },
    new_items: ["Good Decision Streak"],
    game_state: "ongoing"
  },

  "minister_genuine_friends": {
    id: "minister_genuine_friends",
    story_text: "Finally genuine friends හම්බවුණා! Not impressed by money, actually care about you as a person. Study sessions, gym together, home-cooked meals share කරනවා. Real friendship! 🤝 ඔයාට realize වුණා - fake friends always ask for money/favors, real friends just want your company. Quality > Quantity!",
    image_prompt: "Group of genuine friends studying together, casual setting, real friendship",
    choices: [
      { id: "c1", text: "Study group maintain කරමු 📚", next_scenario: "minister_academic_success" },
      { id: "c2", text: "Weekend trips plan කරමු together 🚗", next_scenario: "minister_road_trip" },
      { id: "c3", text: "Small business idea discuss කරමු 💡", next_scenario: "minister_friend_startup" }
    ],
    stats_update: { money_change: 0, stress_change: -30, energy_change: 20, day_change: 7 },
    new_items: ["Real Friends"],
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
  },

  // Contractor Scam Scenarios
  contractor_scam_start: {
    id: "contractor_scam_start",
    story_text: "ඔයාගේ cleaning job වල, contractor අයියා සතියක් වැඩ කරලා ඉන්න මුදල් ගෙවන්නේ නෑ. 'මචං දැන් cash flow issue එකක් තියෙනවා, අනිද්දා දෙන්නම්' කියලා දෙන්නේ විතරක් තමා කතා.",
    image_prompt: "cleaning_struggles",
    choices: [
      { id: "c1", text: "කොහොමහරි wait කරමු, රස්සාව නැති වෙන්න ඕනේ නෑනේ", next_scenario: "contractor_payment_delay_1" },
      { id: "c2", text: "කෙලින්ම අහමු කොහොමද මේ, මට මුදල් ඕන", next_scenario: "contractor_confrontation" },
      { id: "c3", text: "අනිත් cleaners ලගට කතා කරලා බලමු මොකද වෙන්නේ කියලා", next_scenario: "contractor_group_action" }
    ],
    stats_update: { money_change: 0, stress_change: 25, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_payment_delay_1: {
    id: "contractor_payment_delay_1",
    story_text: "සතියක් බලාගෙන ඉදලා අහපු විට contractor අයියා කියනවා 'මචං ඒ client එක තාම pay කරේ නෑ, ඔයා මොකක්ද කරන්නේ බලපං, මං හදාගන්නම්'. තව සතියක් wait කරන්න වෙනවා.",
    image_prompt: "financial_stress",
    choices: [
      { id: "c1", text: "තව සතියක් wait කරමු, අනික් job එකක් හොයාගමු මේ අතරෙ", next_scenario: "contractor_payment_delay_2" },
      { id: "c2", text: "Fair Work Ombudsman එකට complaint එකක් දාමු", next_scenario: "contractor_legal_action" },
      { id: "c3", text: "ගෙදර අයට කතා කරලා මුදල් විදියක් කරගන්න ඕන වෙයි", next_scenario: "contractor_family_loan" }
    ],
    stats_update: { money_change: -50, stress_change: 30, energy_change: -15, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_payment_delay_2: {
    id: "contractor_payment_delay_2",
    story_text: "දෙවෙනි සතියේත් මුදල් නෑ. Contractor අයියා කියනවා 'මචං ඔයා හොඳ කොල්ලෙක්, මට විශ්වාසයි. මේ weekend එක extra shift එකක් කරලා දෙන්නද? මං හොඳටම pay කරන්නම් හැමදේම එකතු කරලා'. Trap එකක්ද මේ?",
    image_prompt: "difficult_decision",
    choices: [
      { id: "c1", text: "එපා, මුලින්ම තියන මුදල් දෙන්න කියමු", next_scenario: "contractor_confrontation" },
      { id: "c2", text: "Extra shift කරලා බලමු, maybe ඇත්තටම pay කරයි", next_scenario: "contractor_extra_work_scam" },
      { id: "c3", text: "අනික් Lankan cleaners ලගට කතා කරලා advice එකක් ගමු", next_scenario: "contractor_group_action" }
    ],
    stats_update: { money_change: -80, stress_change: 40, energy_change: -20, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_extra_work_scam: {
    id: "contractor_extra_work_scam",
    story_text: "Weekend එකේ 16 hours වැඩ කළා. දැන් contractor අයියා කියනවා 'අනේ මචං, ඔය weekend rate එක ඔයාට කිව්වේ නෑනේ, weekday rate එකේ තමා calculate කරේ. ඒකත් මට තාම client payment එක ආවේ නෑ'. ඔයාට දැන් 3 weeks pay නෑ.",
    image_prompt: "exhausted_worker",
    choices: [
      { id: "c1", text: "Fair Work කෙලින්ම contact කරමු, මේක illegal", next_scenario: "contractor_legal_action" },
      { id: "c2", text: "අනික් cleaners එක්ක එකතු වෙලා group එකක් හදමු", next_scenario: "contractor_group_action" },
      { id: "c3", text: "Job එක leave කරලා හරි honest workplace එකක් හොයමු", next_scenario: "contractor_quit" }
    ],
    stats_update: { money_change: -30, stress_change: 50, energy_change: -35, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_motivational_talk: {
    id: "contractor_motivational_talk",
    story_text: "Contractor අයියා හැමදාම කතා කරන්නේ ගේන්න මුදල් ගැන නෙමෙයි. 'මචං ඔයාලා අලුතෙන් ආපු අයට hard work කරන්න ඕන. මම වගේ කෙනෙක් වෙන්න ඕන නම් sacrifice කරන්න වෙනවා. මං පළවෙනි දවසේ ඉඳන් දවසට 18 hours වැඩ කළා'. එත් මුදල් ගෙවන්නේ නෑ.",
    image_prompt: "mentor_talk",
    choices: [
      { id: "c1", text: "ඔව් අයියේ, hard work කරන්නම් (වහලුන් වගේ වැඩ කරනවා)", next_scenario: "contractor_exploitation_continues" },
      { id: "c2", text: "අයියේ motivation එක හොඳයි, ඒත් pay කරන්න ඕන තියෙන දේ", next_scenario: "contractor_confrontation" },
      { id: "c3", text: "මේ manipulation එකක් විතරයි, වෙන job එකක් හොයමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: 0, stress_change: 20, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_female_favoritism: {
    id: "contractor_female_favoritism",
    story_text: "Contractor අයියා single girls ට extra shifts, good locations, හොඳ pay කරනවා. ඔයාලගේ වගේ boys ට බාරදෙනවා hard, dirty jobs. Rashmi නම් කෙල්ල payment වලට කිසිම delay එකක් නෑ, extra bonuses තියෙනවා. 'අදයි හෙටයි කියලා boy කෙනෙක් girl කෙනෙක් වෙන්නේ, මං fair විතරයි වෙන්නේ' කියලා contractor අයියා ගොන්නු.",
    image_prompt: "workplace_inequality",
    choices: [
      { id: "c1", text: "Silent වෙලා ඉන්නවා, රස්සාව තිබ්බොත් හරි", next_scenario: "contractor_exploitation_continues" },
      { id: "c2", text: "මේක discrimination, Fair Work එකට කියමු", next_scenario: "contractor_legal_action" },
      { id: "c3", text: "Lankan community එකේ අනිත් boys එක්ක කතා කරලා action ගමු", next_scenario: "contractor_group_action" }
    ],
    stats_update: { money_change: -20, stress_change: 35, energy_change: -15, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_confrontation: {
    id: "contractor_confrontation",
    story_text: "ඔයා කෙලින්ම contractor අයියාට කතා කරනවා pay ගැන. ඔහු කියනවා 'අනේ මචං, ඔයා මාර demanding විශාලයි. අනිත් අය complaint නැතිව වැඩ කරනවා, ඔයා විතරක්ද මේ රටට ආවේ? හෙට ඉඳන් වැඩට එන්න එපා, මං call කරන්නම්'. Job එක ගියා වගේ.",
    image_prompt: "job_loss",
    choices: [
      { id: "c1", text: "Sorry අයියේ කියලා job එක save කරගමු", next_scenario: "contractor_exploitation_continues" },
      { id: "c2", text: "Fair Work Ombudsman එකට යමු proper complaints දාගෙන", next_scenario: "contractor_legal_action" },
      { id: "c3", text: "වෙන cleaning company එකක් හොයමු, Melbourne වල තව ඕන තරම් තියනවා", next_scenario: "middle_cleaning_job" }
    ],
    stats_update: { money_change: 0, stress_change: 45, energy_change: -25, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_group_action: {
    id: "contractor_group_action",
    story_text: "ඔයා අනික් Lankan cleaners 5දෙනෙක් එක්ක කතා කරනවා. හැමෝටම pay issues තියනවා. එකතු වෙලා contractor අයියාට කියනවා හැමෝම එකතු වෙලා, මුදල් ගෙවන්න නැත්නම් හැමෝම එකට leave කරනවා කියලා. ඔහුට බයයි වෙනවා.",
    image_prompt: "team_unity",
    choices: [
      { id: "c1", text: "දැන් හරියට pay කරනවා, ඒත් හැමෝම එකට බලාගෙන ඉන්නවා", next_scenario: "contractor_group_victory" },
      { id: "c2", text: "Fair Work complaint එකක් දාලා legal protection ගමු", next_scenario: "contractor_legal_victory" },
      { id: "c3", text: "මුලු group එකම වෙන company එකකට join වෙමු", next_scenario: "middle_cleaning_job" }
    ],
    stats_update: { money_change: 350, stress_change: -30, energy_change: 10, day_change: 3 },
    new_items: ["Group Support"],
    game_state: "ongoing"
  },

  contractor_group_victory: {
    id: "contractor_group_victory",
    story_text: "Contractor අයියා හැමෝගේම payment හරියට කරනවා. ඔහු දන්නවා group එකක් එකට කතා කරන කොට ඔහුට power නෑ කියලා. දැන් ඔයාලට හරියට weekly pay, proper shifts, හොඳ locations තියනවා. Lankan community power!",
    image_prompt: "celebration",
    choices: [
      { id: "c1", text: "මේ job එකේ දිගටම හරි conditions වලින් වැඩ කරමු", next_scenario: "middle_stable_work" },
      { id: "c2", text: "වෙන opportunities හොයමු දැන් stable base එකක් තියෙන නිසා", next_scenario: "middle_job_hunt" },
      { id: "c3", text: "අපේම cleaning business එකක් start කරන්න plan කරමු", next_scenario: "middle_entrepreneurship" }
    ],
    stats_update: { money_change: 200, stress_change: -40, energy_change: 20, day_change: 7 },
    new_items: ["Fair Work Rights Knowledge"],
    game_state: "ongoing"
  },

  contractor_legal_action: {
    id: "contractor_legal_action",
    story_text: "ඔයා Fair Work Ombudsman එකට complaint එකක් දානවා. ඔවුන් investigation එකක් කරනවා. Pay slips නැතිව, cash payments කරපු එක හින්දා contractor අයියාට හොඳ trouble එකක් වෙනවා. ඔයාට back pay හම්බ වෙනවා, ඒත් job එක නැතිවෙනවා.",
    image_prompt: "legal_justice",
    choices: [
      { id: "c1", text: "දැන් වෙන honest employer කෙනෙක් ලගට යමු", next_scenario: "contractor_legal_victory" },
      { id: "c2", text: "මේ experience එකෙන් ඉගෙනගත්ත දේවල් share කරමු community එකට", next_scenario: "middle_community_leader" },
      { id: "c3", text: "Uber Eats වගේ වෙන income source එකක් හොයමු", next_scenario: "business_uber_eats" }
    ],
    stats_update: { money_change: 800, stress_change: -20, energy_change: -10, day_change: 21 },
    new_items: ["Legal Victory", "Fair Work Knowledge"],
    game_state: "ongoing"
  },

  contractor_legal_victory: {
    id: "contractor_legal_victory",
    story_text: "Fair Work investigation එකෙන් ඔයාට 3 weeks back pay + penalty rates හම්බවෙනවා. Contractor අයියාට fine එකක් දෙනවා. ඔයාගේ story අනික් Lankan workers ලට inspiration එකක් වෙනවා. දැන් proper rights දන්න කෙනෙක් විදියට ඔයා Melbourne Lankan community එකේ respected වෙනවා.",
    image_prompt: "success_celebration",
    choices: [
      { id: "c1", text: "වෙන good cleaning company එකකට join වෙමු", next_scenario: "middle_stable_work" },
      { id: "c2", text: "Community එකේ workers rights ගැන awareness කරමු", next_scenario: "middle_community_leader" },
      { id: "c3", text: "University studies පටන්ගමු දැන් stable income එකක් තියෙන නිසා", next_scenario: "minister_university" }
    ],
    stats_update: { money_change: 1200, stress_change: -50, energy_change: 30, day_change: 30 },
    new_items: ["Fair Work Victory", "Community Respect"],
    game_state: "ongoing"
  },

  contractor_exploitation_continues: {
    id: "contractor_exploitation_continues",
    story_text: "ඔයා silent වෙලා වැඩ කරනවා. Contractor අයියා දිගටම exploit කරනවා - late payments, extra work, poor conditions. ඔයාගේ stress වැඩිවෙනවා, health එක පහළ යනවා. Melbourne dream එක nightmare එකක් වෙලා යනවා.",
    image_prompt: "burnout",
    choices: [
      { id: "c1", text: "තව කොච්චර කාලයක්ද මෙහෙම? Job එක leave කරමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Lankan community support group එකකට යමු help එකක් ගන්න", next_scenario: "lower_community" },
      { id: "c3", text: "දිගටම කරමු, options නෑනේ", next_scenario: "lower_survival_mode" }
    ],
    stats_update: { money_change: 150, stress_change: 60, energy_change: -40, day_change: 14 },
    new_items: [],
    game_state: "ongoing"
  },

  contractor_family_loan: {
    id: "contractor_family_loan",
    story_text: "Sri Lanka එකේ parents ලට call කරලා $500ක් විදියක් කරගන්න කියනවා. ඔවුන් disappointed, worried. 'අපි හිතුවේ Melbourne වල සල්ලි හොයාගෙන ඉන්නවා කියලා' කියලා අම්මා කියනවා. Guilt + Stress maximum.",
    image_prompt: "family_call",
    choices: [
      { id: "c1", text: "මුදල් ගන්නවා, වැඩේ හරි කරගෙන ආපහු එවන්නම් කියලා promise කරනවා", next_scenario: "middle_comeback_attempt" },
      { id: "c2", text: "නෑ, මං විදියක් හදාගන්නම්, Uber Eats වැඩ කරමු", next_scenario: "business_uber_eats" },
      { id: "c3", text: "Sri Lanka එකට ආපහු යන්න හිතනවා, failure එකක් විදියට", next_scenario: "game_over_return_home" }
    ],
    stats_update: { money_change: 500, stress_change: 70, energy_change: -30, day_change: 3 },
    new_items: ["Family Debt"],
    game_state: "ongoing"
  },

  contractor_quit: {
    id: "contractor_quit",
    story_text: "ඔයා contractor අයියාට කෙලින්ම කියනවා 'මට වැඩ කරන්න බෑ මෙහෙම conditions වලින්, මං යනවා'. ඔහු උත්සාහ කරනවා convince කරන්න, threats දෙනවා, ඒත් ඔයා determined. දැන් ඔයාට income එකක් නෑ, ඒත් mental peace තියනවා.",
    image_prompt: "new_beginning",
    choices: [
      { id: "c1", text: "වෙන honest cleaning company එකක් හොයමු", next_scenario: "middle_cleaning_job" },
      { id: "c2", text: "Uber Eats, Doordash වගේ delivery jobs බලමු", next_scenario: "business_uber_eats" },
      { id: "c3", text: "Lankan community එකෙන් job leads අහලා බලමු", next_scenario: "lower_community" }
    ],
    stats_update: { money_change: -100, stress_change: -30, energy_change: 10, day_change: 1 },
    new_items: ["Self Respect"],
    game_state: "ongoing"
  },

  // AusPost Scam Scenarios
  auspost_scam_start: {
    id: "auspost_scam_start",
    story_text: "Facebook Lankan group එකේ post එකක් - 'AusPost parcel sorting, $35/hour, cash job, anyone interested message me'. ඔයා message කරනවා. ගොල්ලෝ කියනවා '$200 training fee + $150 uniform deposit, refundable after first month'.",
    image_prompt: "job_opportunity",
    choices: [
      { id: "c1", text: "$350 දෙලා බලමු, good job එකක් නම් හොඳයි", next_scenario: "auspost_scam_trap" },
      { id: "c2", text: "Suspicious නේ, AusPost website එකෙන් verify කරමු", next_scenario: "auspost_verify" },
      { id: "c3", text: "Lankan community එකේ elders ලගට අහලා බලමු legitimate ද කියලා", next_scenario: "auspost_saved" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -5, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  auspost_scam_trap: {
    id: "auspost_scam_trap",
    story_text: "$350 bank transfer කළා. එයාලා kiyනවා 'හෙට training, address එක SMS එකක් එන්නම්'. SMS එකක් ආවේ නෑ. Call කරනවා - number blocked. Facebook profile deleted. ගල් ගහනවා. Scam එකක් හම්බ වෙලා.",
    image_prompt: "scam_realization",
    choices: [
      { id: "c1", text: "Police complaint එකක් දාමු, bank එකට කියමු", next_scenario: "auspost_police_report" },
      { id: "c2", text: "Lankan community එකට warn කරමු මේ scam එක ගැන", next_scenario: "middle_community_leader" },
      { id: "c3", text: "අඬනවා නවත්වලා වෙන job එකක් හොයමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: -350, stress_change: 80, energy_change: -40, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  auspost_verify: {
    id: "auspost_verify",
    story_text: "ඔයා AusPost official website එකෙන් check කරනවා. Direct recruitment එකෙන් විතරයි apply කරන්න පුළුවන්, කවදාවත් cash fees ඉල්ලන්නේ නෑ. මේක clear scam එකක්. ඔයාගේ smart thinking හින්දා $350 save වුනා.",
    image_prompt: "smart_decision",
    choices: [
      { id: "c1", text: "Lankan community එකට warn කරමු මේ scam එක ගැන", next_scenario: "middle_community_leader" },
      { id: "c2", text: "AusPost official website එකෙන් apply කරමු properly", next_scenario: "auspost_proper_application" },
      { id: "c3", text: "වෙන legitimate jobs හොයමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 5, day_change: 1 },
    new_items: ["Scam Awareness"],
    game_state: "ongoing"
  },

  auspost_saved: {
    id: "auspost_saved",
    story_text: "ඔයා Lankan community එකේ uncle කෙනෙක්ට කතා කරනවා. ඔහු කියනවා 'පුතේ මේ scam එකක්, මං මාස 3කට කලින් මේ එකම post එක දැක්කා, හැමදාම එනවා මේ වගේ'. Community wisdom එක හින්දා ඔයා save වුනා.",
    image_prompt: "community_support",
    choices: [
      { id: "c1", text: "Uncle ට thanks කියලා legitimate job leads අහමු", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Facebook group එකේ scam එක report කරමු", next_scenario: "middle_community_leader" },
      { id: "c3", text: "Lankan community events වලට active වෙලා network කරමු", next_scenario: "middle_community_integration" }
    ],
    stats_update: { money_change: 0, stress_change: -25, energy_change: 10, day_change: 1 },
    new_items: ["Community Trust"],
    game_state: "ongoing"
  },

  auspost_police_report: {
    id: "auspost_police_report",
    story_text: "Police station එකට report කරනවා. Officer කියනවා 'Unfortunately these scams are very common, we'll add it to the file but recovery is unlikely'. Bank එකත් කියනවා voluntary transfer එකක් නිසා refund කරන්න බෑ. මුදල් ගියා, lesson එකක් ඉගෙන ගත්තා.",
    image_prompt: "police_station",
    choices: [
      { id: "c1", text: "Lankan community එකට warn කරලා අනිත් අය save කරමු", next_scenario: "middle_community_leader" },
      { id: "c2", text: "වැඩේ හරි කරගෙන extra shifts වලින් cover කරමු", next_scenario: "middle_cleaning_job" },
      { id: "c3", text: "මේ experience එකෙන් ඉගෙනගෙන careful වෙමු", next_scenario: "middle_job_hunt" }
    ],
    stats_update: { money_change: -50, stress_change: -30, energy_change: -20, day_change: 3 },
    new_items: ["Hard Lesson"],
    game_state: "ongoing"
  },

  auspost_proper_application: {
    id: "auspost_proper_application",
    story_text: "AusPost official career portal එකෙන් apply කරනවා. දැන් හරියට interview process, background checks හැම දෙයක්ම legitimate විදියට වෙනවා. ටිකක් කල් යයි, ඒත් proper job එකක්.",
    image_prompt: "job_interview",
    choices: [
      { id: "c1", text: "Interview එකට හොඳට prepare වෙමු", next_scenario: "auspost_interview_success" },
      { id: "c2", text: "මේ අතරෙ වෙන job එකකුත් හොයමු backup එකක් විදියට", next_scenario: "middle_job_hunt" },
      { id: "c3", text: "Lankan community එකෙන් AusPost experience තියන අය ලග tips අහමු", next_scenario: "middle_community_integration" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: -5, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  auspost_interview_success: {
    id: "auspost_interview_success",
    story_text: "Interview එක success! Casual position එකක් හම්බ වෙනවා $32/hour. Proper pay slips, superannuation, penalty rates හැම දෙයක්ම හරියට. මේක ඔයාගේ Melbourne life එකේ turning point එකක් වෙන්න පුළුවන්.",
    image_prompt: "success_celebration",
    choices: [
      { id: "c1", text: "මේ job එකෙන් stable වෙලා permanent බලමු", next_scenario: "middle_stable_work" },
      { id: "c2", text: "දැන් student visa එකකට යන්න හිතමු", next_scenario: "minister_university" },
      { id: "c3", text: "Future planning කරමු, savings, PR pathway", next_scenario: "middle_future_planning" }
    ],
    stats_update: { money_change: 600, stress_change: -50, energy_change: 20, day_change: 14 },
    new_items: ["AusPost Job", "Proper Employment"],
    game_state: "ongoing"
  },

  // PR Pathway Scenarios
  pr_consultation_start: {
    id: "pr_consultation_start",
    story_text: "Australia එකේ permanent resident වෙන්න හිතනවා. Migration agent කෙනෙක් ලගට consultation එකකට යන්න ඕන. ඔවුන්ගේ fees $200-500 විතරයි consultation එකකට. ඔයාගේ social class එක මත depend වෙනවා ඔයාගේ options.",
    image_prompt: "Professional migration agent office in Melbourne, consultation meeting",
    choices: [
      { id: "c1", text: "$200 දෙලා basic consultation එකක් ගමු", next_scenario: "pr_consultation_middle" },
      { id: "c2", text: "$500 premium agent එකක් try කරමු", next_scenario: "pr_consultation_premium" },
      { id: "c3", text: "Free online resources බලලා විදියක් හදාගමු", next_scenario: "pr_diy_research" }
    ],
    stats_update: { money_change: 0, stress_change: 20, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  pr_consultation_minister: {
    id: "pr_consultation_minister",
    story_text: "Migration agent ඔයාගේ background එක අහලා VIP treatment දෙනවා. 'Sir, ඔබට business visa, investment visa හැම දෙයක්ම qualify වෙනවා. $50,000 business investment එකකින් PR එක guaranteed'. ඔබේ family connections + money = easy pathway.",
    image_prompt: "Luxury migration consultation office, VIP client meeting",
    choices: [
      { id: "c1", text: "Business visa pathway එකට යමු - family money use කරලා", next_scenario: "pr_minister_business_visa" },
      { id: "c2", text: "Student → Work → PR pathway easy කරගමු university වලින්", next_scenario: "minister_university" },
      { id: "c3", text: "Investment visa - $250,000 invest කරලා PR fast track", next_scenario: "pr_minister_investment" }
    ],
    stats_update: { money_change: -500, stress_change: -30, energy_change: 10, day_change: 2 },
    new_items: ["VIP Migration Plan"],
    game_state: "ongoing"
  },

  pr_consultation_business: {
    id: "pr_consultation_business",
    story_text: "Agent කියනවා 'ඔබේ family business background එකක් තියනවා, 186/482 Employer Sponsored visa වලට try කරන්න පුළුවන්. හෝ business visa pathway එකකුත් තියනවා moderate investment එකකින්'.",
    image_prompt: "Business migration consultation, professional office setting",
    choices: [
      { id: "c1", text: "Employer sponsored pathway - job offer එකක් හොයමු", next_scenario: "pr_business_employer_sponsored" },
      { id: "c2", text: "Business Innovation visa - $100k invest කරමු", next_scenario: "pr_business_innovation" },
      { id: "c3", text: "Skilled Independent pathway - points maximize කරමු", next_scenario: "pr_skilled_pathway" }
    ],
    stats_update: { money_change: -350, stress_change: -10, energy_change: -5, day_change: 2 },
    new_items: ["Business PR Plan"],
    game_state: "ongoing"
  },

  pr_consultation_middle: {
    id: "pr_consultation_middle",
    story_text: "Agent කියනවා 'ඔබට skilled migration pathway එක තමා realistic. ඒකට professional job experience + English test + points 65+ ඕන. හෝ employer sponsored visa එකක් හොයන්න ඕන. මාර hard pathway එකක්, 3-5 years යයි'.",
    image_prompt: "Serious migration consultation, middle class client looking stressed",
    choices: [
      { id: "c1", text: "Skilled pathway - IELTS කරලා points හදාගමු (hard way)", next_scenario: "pr_middle_skilled_grind" },
      { id: "c2", text: "Regional sponsorship හොයමු - එහෙම ටිකක් easy", next_scenario: "pr_middle_regional" },
      { id: "c3", text: "දැනට වැඩ කරමු, පස්සේ හිතමු PR ගැන", next_scenario: "middle_stable_work" }
    ],
    stats_update: { money_change: -200, stress_change: 30, energy_change: -15, day_change: 1 },
    new_items: ["PR Reality Check"],
    game_state: "ongoing"
  },

  pr_consultation_lower: {
    id: "pr_consultation_lower",
    story_text: "Agent honestly කියනවා 'ඔබේ current situation එකෙන් PR එක මාරම hard. Skilled pathway එකට qualifications නෑ, employer sponsored එකට stable job නෑ. Best option - partner visa හෝ 5+ years wait කරලා humanitarian grounds'. බොහොම අමාරුයි.",
    image_prompt: "Difficult migration consultation, agent delivering bad news",
    choices: [
      { id: "c1", text: "දිගටම කරගෙන ඉන්නවා, දවසක හරි වෙයි", next_scenario: "lower_survival_mode" },
      { id: "c2", text: "Skills develop කරලා qualify වෙන්න try කරමු (long shot)", next_scenario: "pr_lower_upskill" },
      { id: "c3", text: "Partner හොයමු relationship visa එකක් හරි හදාගමු", next_scenario: "lower_relationship_pathway" }
    ],
    stats_update: { money_change: -200, stress_change: 60, energy_change: -25, day_change: 1 },
    new_items: ["Harsh Reality"],
    game_state: "ongoing"
  },

  // Driver's License Scenarios
  drivers_license_test: {
    id: "drivers_license_test",
    story_text: "Australian driver's license එකක් ගන්න VicRoads test එකට යනවා. Sri Lankan license එකෙන් 3 months විතරයි drive කරන්න පුළුවන්. Computer test + driving test pass කරන්න ඕන. ඔයාගේ class එක මත experience එක වෙනස් වෙනවා.",
    image_prompt: "VicRoads testing center, driving test in progress",
    choices: [
      { id: "c1", text: "VicRoads කෙලින්ම test book කරමු - minister son advantage", next_scenario: "license_minister_easy" },
      { id: "c2", text: "Driving school classes + test - business/middle class way", next_scenario: "license_proper_preparation" },
      { id: "c3", text: "පරණ license එකෙන් drive කරගෙන ඉන්නවා - lower class risk", next_scenario: "license_illegal_driving" }
    ],
    stats_update: { money_change: 0, stress_change: 15, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  license_minister_easy: {
    id: "license_minister_easy",
    story_text: "ඔයාට car එකක් තියනවා, driving instructor premium එකක් hire කරනවා. Test එකේදී instructor හරියට train කරපු නිසා pass. දවසකට license එකත් අතට. Easy! Professional photo shoot එකක් කරලා license photo එකත් perfect.",
    image_prompt: "Young professional with new driver's license, luxury car in background",
    choices: [
      { id: "c1", text: "දැන් Melbourne එක පුරා freely drive කරමු", next_scenario: "minister_leisure" },
      { id: "c2", text: "Car upgrade එකක් කරමු - BMW/Mercedes", next_scenario: "minister_car_upgrade" },
      { id: "c3", text: "Friends ලව අරගෙන road trips යමු", next_scenario: "minister_social_life" }
    ],
    stats_update: { money_change: -800, stress_change: -40, energy_change: 10, day_change: 14 },
    new_items: ["VIC License", "Freedom"],
    game_state: "ongoing"
  },

  license_proper_preparation: {
    id: "license_proper_preparation",
    story_text: "Driving school classes $400, VicRoads test fees $150. Theory test pass කළා, ඒත් driving test 1st attempt fail - parallel parking අමාරුයි. 2nd attempt $150 more. Pass කළාම license $50. Total investment ~$750. Worth it!",
    image_prompt: "Driving school lesson, learner driver practicing parallel parking",
    choices: [
      { id: "c1", text: "දැන් license තියනවා, second hand car එකක් බලමු", next_scenario: "middle_car_purchase" },
      { id: "c2", text: "Public transport save කරලා මාසෙකට $200+ save වෙනවා", next_scenario: "middle_stable_work" },
      { id: "c3", text: "Uber/delivery jobs හොයමු දැන් license තියෙන නිසා", next_scenario: "business_uber_eats" }
    ],
    stats_update: { money_change: -750, stress_change: 20, energy_change: -30, day_change: 28 },
    new_items: ["VIC License"],
    game_state: "ongoing"
  },

  license_illegal_driving: {
    id: "license_illegal_driving",
    story_text: "ටික සල්ලි save කරන්න, Sri Lankan license එකෙන් drive කරනවා (3 months පසුව illegal). දවසක් police check point එකක හම්බ වෙනවා. 'Your international license is expired, this is illegal' - Fine $500 + court summons.",
    image_prompt: "Police checkpoint, officer checking driver's license",
    choices: [
      { id: "c1", text: "Fine එක ගෙවලා කෙලින්ම license test book කරමු", next_scenario: "license_lower_struggle" },
      { id: "c2", text: "Court එකට යලා mercy අයද යන්න පුළුවන් - lower class sympathy", next_scenario: "license_court_mercy" },
      { id: "c3", text: "දැන් car නෑ, public transport බලාගෙන යමු", next_scenario: "lower_survival_mode" }
    ],
    stats_update: { money_change: -500, stress_change: 70, energy_change: -30, day_change: 3 },
    new_items: [],
    game_state: "ongoing"
  },

  // Cash-in-Hand Restaurant Job
  cash_job_restaurant: {
    id: "cash_job_restaurant",
    story_text: "Burwood/Box Hill එකේ Asian restaurant එකක් offer කරනවා cash job එකක්. $15/hour (legal minimum $23), no super, no pay slips. 'We pay cash, you work hard, no questions asked'. Exploitation clear ඇති, ඒත් desperate times...",
    image_prompt: "Busy Asian restaurant kitchen, workers cooking",
    choices: [
      { id: "c1", text: "Minister son - 'No way, මම legal jobs විතරයි'", next_scenario: "cash_job_minister_reject" },
      { id: "c2", text: "Business/Middle - 'Temporary විතරයි, better job හොයනකම්'", next_scenario: "cash_job_accept_temporary" },
      { id: "c3", text: "Lower class - 'මට option නෑ, කරමු'", next_scenario: "cash_job_exploitation" }
    ],
    stats_update: { money_change: 0, stress_change: 25, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  cash_job_minister_reject: {
    id: "cash_job_minister_reject",
    story_text: "ඔයාට මේ වගේ exploitation accept කරන්න ඕන නෑ. Family support තියනවා, legal job එකක් හොයගන්න time තියනවා. Lankan community එකේ uncle කෙනෙක් හරහා proper restaurant management trainee job එකක් හොයාගන්නවා $28/hour.",
    image_prompt: "Professional restaurant management role, well-dressed trainee",
    choices: [
      { id: "c1", text: "Proper hospitality career එකක් develop කරමු", next_scenario: "minister_career_path" },
      { id: "c2", text: "මේක side income විතරයි, main focus university/business", next_scenario: "minister_university" },
      { id: "c3", text: "Experience ගත්තම අපේම restaurant එකක් start කරමු", next_scenario: "minister_business_venture" }
    ],
    stats_update: { money_change: 500, stress_change: -30, energy_change: 10, day_change: 7 },
    new_items: ["Proper Job", "Career Path"],
    game_state: "ongoing"
  },

  cash_job_accept_temporary: {
    id: "cash_job_accept_temporary",
    story_text: "3 months temporary විතරයි කරමු කියලා start කරනවා. $15/hour × 40 hours = $600/week cash. Boss මාර කතා, 'Good boy, you work hard'. ඒත් secretly better jobs apply කරනවා. වැඩේ hard, stress වැඩි, ඒත් survive වෙන්න පුළුවන්.",
    image_prompt: "Restaurant kitchen worker, tired but determined",
    choices: [
      { id: "c1", text: "දිගටම කරලා better job හම්බ වෙනකම් බලාගෙන ඉන්නවා", next_scenario: "cash_job_exit_success" },
      { id: "c2", text: "Fair Work කියලා legal pathway ගමු - risky but right", next_scenario: "cash_job_legal_action" },
      { id: "c3", text: "Boss ව දැන් trust කරනවා, promotion අහමු", next_scenario: "cash_job_promotion_trap" }
    ],
    stats_update: { money_change: 600, stress_change: 40, energy_change: -35, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  cash_job_exploitation: {
    id: "cash_job_exploitation",
    story_text: "Options නැති නිසා accept කරනවා. Boss දන්නවා ඔයාට alternatives නෑ කියලා. $15/hour → $12/hour drop කරනවා. 'Business slow, you take or leave'. දවසට 12 hours වැඩ, rest නෑ, breaks නෑ. Health පහළ යනවා.",
    image_prompt: "Exhausted restaurant worker, long hours in hot kitchen",
    choices: [
      { id: "c1", text: "දිගටම කරනවා, මොකද කරන්නද වෙන මොකක්?", next_scenario: "cash_job_burnout" },
      { id: "c2", text: "Lankan community help desk එකට යලා බලමු", next_scenario: "lower_community" },
      { id: "c3", text: "Fair Work අනිත් workers එක්ක එකතු වෙලා complaint", next_scenario: "cash_job_group_action" }
    ],
    stats_update: { money_change: 480, stress_change: 65, energy_change: -50, day_change: 7 },
    new_items: [],
    game_state: "ongoing"
  },

  // Myki Inspector Scenarios
  myki_inspector_encounter: {
    id: "myki_inspector_encounter",
    story_text: "Tram එකේ යද්දී inspectors නැගලා 'Myki please'. ඔයාගේ Myki card එක tap කරන්න අමතක වුනා (හෝ balance නෑ). $250 fine එක issue කරනවා. ඔයාගේ response එක class එකෙන් වෙනස් වෙනවා.",
    image_prompt: "Myki inspectors on Melbourne tram checking tickets",
    choices: [
      { id: "c1", text: "Minister son - 'Sorry sir, genuine mistake' + pay කෙලින්ම", next_scenario: "myki_minister_pay" },
      { id: "c2", text: "Business/Middle - 'Can I explain?' + appeal එකක් try කරනවා", next_scenario: "myki_appeal_attempt" },
      { id: "c3", text: "Lower class - 'මට $250 නෑ sir, please' + beg කරනවා", next_scenario: "myki_lower_desperation" }
    ],
    stats_update: { money_change: 0, stress_change: 40, energy_change: -15, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  myki_minister_pay: {
    id: "myki_minister_pay",
    story_text: "ඔයා $250 card එකෙන් කෙලින්ම ගෙවනවා. Inspector කියනවා 'Thank you sir, make sure to touch on next time'. ඔයාට මේක විශාල issue එකක් නෙමෙයි - එක coffee date එකක වියදම විතරයි. Lesson learned.",
    image_prompt: "Casual payment with credit card on tram",
    choices: [
      { id: "c1", text: "Auto top-up Myki එකක් setup කරලා මේ වගේ නැවත නොවෙන්න", next_scenario: "minister_leisure" },
      { id: "c2", text: "දැන් Uber විතරක් යමු, public transport අපිට සුදුසු නෑ", next_scenario: "minister_hotel" },
      { id: "c3", text: "එපා වෙලා car එකක් මිලදී ගමු", next_scenario: "minister_car_upgrade" }
    ],
    stats_update: { money_change: -250, stress_change: -20, energy_change: 5, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  myki_appeal_attempt: {
    id: "myki_appeal_attempt",
    story_text: "ඔයා politely explain කරනවා 'This is my first offense, I'm genuinely sorry, I'm a student/worker'. Inspector කියනවා 'You can appeal online'. Appeal letter එකක් ලියනවා. 50/50 chance - එක්කෝ fine waive වෙනවා, නැත්නම් pay කරන්න වෙනවා.",
    image_prompt: "Person writing formal appeal letter at computer",
    choices: [
      { id: "c1", text: "Appeal accept වෙලා fine waive! Lucky!", next_scenario: "myki_appeal_success" },
      { id: "c2", text: "Appeal reject, $250 installments වලින් ගෙවමු", next_scenario: "myki_payment_plan" },
      { id: "c3", text: "Ignore කරලා බලමු මොකද වෙන්නේ - risky", next_scenario: "myki_ignore_consequences" }
    ],
    stats_update: { money_change: 0, stress_change: 25, energy_change: -20, day_change: 14 },
    new_items: [],
    game_state: "ongoing"
  },

  myki_lower_desperation: {
    id: "myki_lower_desperation",
    story_text: "ඔයා honestly කියනවා 'Sir මට $250 pay කරන්න බෑ, මං cleaning jobs කරගෙන යනවා, rent ගෙවන්න අමාරුයි'. Inspector කියනවා 'Sorry mate, it's the law, you can apply for payment plan'. Desperate situation එකක්.",
    image_prompt: "financial_stress",
    choices: [
      { id: "c1", text: "Payment plan apply කරලා මාසෙකට $50 ගෙවමු", next_scenario: "myki_payment_plan_struggle" },
      { id: "c2", text: "Fine ignore කරලා දිගටම risk කරමු (bad idea)", next_scenario: "myki_ignore_consequences" },
      { id: "c3", text: "Lankan community help අහලා බලමු", next_scenario: "lower_community" }
    ],
    stats_update: { money_change: 0, stress_change: 80, energy_change: -30, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  // Car Accident with Sri Lankan License
  car_accident_srilankan_license: {
    id: "car_accident_srilankan_license",
    story_text: "Roundabout එකක හිටිය අනික් car එකකට හැපුණා. කුඩා accident එකක්. Police ආවා, ඔවුන් අහනවා license එක. ඔයා Sri Lankan license එක + international permit දානවා. ඔයාගේ class එක මත මේ situation එක හැසිරෙන විදිය වෙනස් වෙනවා.",
    image_prompt: "car_accident",
    choices: [
      { id: "c1", text: "Minister son - lawyer කෙලින්ම call කරනවා + insurance හරි", next_scenario: "accident_minister_protected" },
      { id: "c2", text: "Business - Insurance තියනවා, claim process කරමු", next_scenario: "accident_business_insurance" },
      { id: "c3", text: "Middle/Lower - Insurance නෑ, මහා problem එකක්", next_scenario: "accident_no_insurance" }
    ],
    stats_update: { money_change: 0, stress_change: 70, energy_change: -35, day_change: 0 },
    new_items: [],
    game_state: "ongoing"
  },

  accident_minister_protected: {
    id: "accident_minister_protected",
    story_text: "ඔයා කෙලින්ම family lawyer call කරනවා. ඔහු police එක්ක කතා කරනවා, insurance company handle කරනවා. Full comprehensive insurance තිබ්බ නිසා හැම දෙයක්ම cover. ඔයාට කිසිම financial hit එකක් නෑ. Car repair/replace හැම දෙයක්ම insurance එකෙන්.",
    image_prompt: "Lawyer handling car accident case, insurance documentation",
    choices: [
      { id: "c1", text: "දැන් VIC license එක ගෙන වැඩේ හරි කරගමු", next_scenario: "license_minister_easy" },
      { id: "c2", text: "Car upgrade එකක් කරලා safer vehicle එකක් ගමු", next_scenario: "minister_car_upgrade" },
      { id: "c3", text: "දැන් driver කෙනෙක් hire කරමු, driving stress නෑ", next_scenario: "minister_leisure" }
    ],
    stats_update: { money_change: -1500, stress_change: -20, energy_change: -10, day_change: 7 },
    new_items: ["Legal Protection"],
    game_state: "ongoing"
  },

  accident_business_insurance: {
    id: "accident_business_insurance",
    story_text: "Third party insurance එක තියනවා (basic). Claim කරනවා. ඒත් no-claim bonus නැති වෙනවා, next year premium වැඩි වෙනවා. Own car repairs $2000 own pocket එකෙන්. Lesson expensive ඇති ඒත් manage කරන්න පුළුවන්.",
    image_prompt: "Car insurance claim paperwork, damaged vehicle",
    choices: [
      { id: "c1", text: "Repairs කරලා careful driving පටන්ගමු", next_scenario: "business_stable_life" },
      { id: "c2", text: "දැන් VIC license proper එකක් ගෙන legal වෙමු", next_scenario: "license_proper_preparation" },
      { id: "c3", text: "Public transport use කරලා මාස කිහිපයක් car නැතිව ඉන්නවා", next_scenario: "business_apartment" }
    ],
    stats_update: { money_change: -2000, stress_change: 30, energy_change: -25, day_change: 14 },
    new_items: [],
    game_state: "ongoing"
  },

  accident_no_insurance: {
    id: "accident_no_insurance",
    story_text: "Insurance නෑ. අනික් party damage $3500. ඔයාගේ car damage $2000. Police report හින්දා Sri Lankan license validity check කරනවා - expired! Driving without valid license charge එකක්. Fine $800. Court date එකක්. Total disaster - $6300+.",
    image_prompt: "Serious car accident aftermath, police report, financial crisis",
    choices: [
      { id: "c1", text: "Payment plan එකක් negotiate කරන්න try කරමු", next_scenario: "accident_payment_plan" },
      { id: "c2", text: "Legal aid එකක් හොයමු, community support ගමු", next_scenario: "accident_legal_aid" },
      { id: "c3", text: "මේක handle කරන්න බෑ, Sri Lanka එකට යන්න හිතනවා", next_scenario: "game_over_return_home" }
    ],
    stats_update: { money_change: -800, stress_change: 95, energy_change: -60, day_change: 3 },
    new_items: ["Court Summons"],
    game_state: "ongoing"
  },

  accident_payment_plan: {
    id: "accident_payment_plan",
    story_text: "අනික් party එක්ක payment plan එකක් - මාසෙකට $300 × 12 months. Court fine එක $800 වරාවටම. Car sell කරලා $1500 හම්බ කරගෙන partially ගෙවනවා. දැන් car නෑ, debt තියනවා, stress maximum.",
    image_prompt: "Debt collection notice, payment plan documents, stress",
    choices: [
      { id: "c1", text: "Extra shifts හොයලා debt cover කරන්න කැපකරමු", next_scenario: "lower_survival_mode" },
      { id: "c2", text: "Lankan community support group වලින් help ගමු", next_scenario: "lower_community" },
      { id: "c3", text: "දිගටම කරගෙන යමු, කොහොමහරි survive වෙමු", next_scenario: "lower_emergency_hostel" }
    ],
    stats_update: { money_change: -2300, stress_change: 40, energy_change: -30, day_change: 30 },
    new_items: ["Heavy Debt"],
    game_state: "ongoing"
  },

  // ===============================================
  // 🔥 SCAM SCENARIOS WITH ROASTING SINHALA SLANGS
  // ===============================================

  // CONTRACTOR AIYA SCAM - Cleaning Job
  "cleaning_contractor_scam": {
    id: "cleaning_contractor_scam",
    story_text: "මචං, Facebook එකේ 'Melbourne Lankan Jobs' group එකේ contractor අයියා කෙනෙක් post දාලා - 'Cleaning job, $35/hour, immediate start!' ඔයා excited වෙලා call කළා. අයියා කිව්වා 'මචං ABN ඕනේ නෑ, cash pay කරන්නම්, trust me bro!' 🤡 පළවෙනි week training කියලා free වැඩ කරවගත්තා. දෙවෙනි week 'invoice issue' කියලා. තුන්වෙනි week phone off! ඔබේ 3 weeks pay - $1200 gone! 💀",
    image_prompt: "Frustrated Sri Lankan worker calling contractor who won't answer phone, cleaning supplies scattered",
    choices: [
      { id: "c1", text: "Fair Work Australia complaint දාමු - legal ගහමු මේ පරඩ්ඩියට! 😤", next_scenario: "contractor_fair_work" },
      { id: "c2", text: "Facebook එකේ expose කරමු - community එකට warn කරමු 📢", next_scenario: "contractor_expose" },
      { id: "c3", text: "කමක් නෑ මචං, lesson learned - move on 😔", next_scenario: "contractor_move_on" }
    ],
    stats_update: { money_change: -1200, stress_change: 50, energy_change: -30, day_change: 21 },
    new_items: [],
    game_state: "ongoing"
  },

  "contractor_fair_work": {
    id: "contractor_fair_work",
    story_text: "Fair Work එකට complaint දැම්මා. ඒත් මචං, ඒගොල්ලෝ කිව්වා 'Evidence ඕනේ - contract, messages, bank transfers.' ඔයා ළඟ මොකුත් නෑ - cash deal, no contract, WhatsApp messages delete වෙලා! 😭 Contractor අයියා smart - ඔයාව legally protect වෙන විදියට scam කරලා. Fair Work කිව්වා 'Sorry, we can't help without evidence.' දැන් ඔයාට තේරුණා ඇයි 'cash job' කියන්නේ trap එකක් කියලා!",
    image_prompt: "Disappointed person leaving Fair Work office, realizing they have no evidence",
    choices: [
      { id: "c1", text: "දැන් ඉඳන් proper job එකක් හොයමු - lesson learned 📝", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Community එකට warn කරලා අනිත් අයව බේරගමු", next_scenario: "contractor_expose" },
      { id: "c3", text: "Mental health support ගමු - stress handle කරන්න බෑ", next_scenario: "mental_health_support" }
    ],
    stats_update: { money_change: 0, stress_change: 30, energy_change: -20, day_change: 7 },
    new_items: ["Life Lesson"],
    game_state: "ongoing"
  },

  "contractor_expose": {
    id: "contractor_expose",
    story_text: "Facebook group එකේ contractor අයියාගේ photo, name, number post කළා warning එක්ක. Comments 200ක් ආවා! 🔥 'මටත් මේ ගෑණි කළා same scam!' 'මේක serial scammer!' Turns out, මේ මිනිහා 50+ students scam කරලා! Media pickup කරලා SBS Sinhala interview request ආවා. Contractor panic වෙලා ඔයාගේ $600 refund කළා 'please delete post' කියලා. 😂 Power of community!",
    image_prompt: "Viral Facebook post exposing scammer, community support comments flooding in",
    choices: [
      { id: "c1", text: "Post delete නොකරමු - community protection 💪", next_scenario: "community_hero" },
      { id: "c2", text: "$600 ගෙන post delete කරමු - at least something 💰", next_scenario: "partial_refund" },
      { id: "c3", text: "SBS interview accept කරමු - full expose! 📺", next_scenario: "media_expose" }
    ],
    stats_update: { money_change: 600, stress_change: -20, energy_change: 10, day_change: 3 },
    new_items: ["Community Respect"],
    game_state: "ongoing"
  },

  // DANDENONG GERMAN TECH AIYA CAR SCAM
  "dandenong_car_scam": {
    id: "dandenong_car_scam",
    story_text: "Dandenong South industrial area එකේ 'German Tech Auto Sales' කියලා කඩයක් තියනවා. Aiya කෙනෙක් BMW 320i 2008 model එකක් පෙන්නනවා - '$5,500 only මචං! Import from Japan, mint condition, log book service!' 🚗 Engine sound smooth, body clean. Aiya දිව ගහනවා 'මචං මේක grab කරන්න, හෙට තව buyer කෙනෙක් එනවා!' ඔයා FOMO hit වෙලා $5000 cash දුන්නා. 2 weeks later - engine මළ! Mechanic කිව්වා 'Bro, මේකේ engine එක sawdust වලින් patch කරලා, transmission dying, total write-off!' 💀",
    image_prompt: "Broken down BMW on roadside, angry buyer calling dealer who won't answer",
    choices: [
      { id: "c1", text: "ACCC Consumer complaint + CAV complaint දාමු 📋", next_scenario: "car_scam_complaint" },
      { id: "c2", text: "Dealer එක්ක confront වෙන්න යමු - refund ඉල්ලමු 😤", next_scenario: "car_dealer_confront" },
      { id: "c3", text: "Part out කරලා whatever salvage කරමු 🔧", next_scenario: "car_salvage" }
    ],
    stats_update: { money_change: -5000, stress_change: 70, energy_change: -40, day_change: 14 },
    new_items: ["Broken Car"],
    game_state: "ongoing"
  },

  "car_dealer_confront": {
    id: "car_dealer_confront",
    story_text: "Dealer ගාවට ගියා. Aiya මුණ බල බල කියනවා 'Machan, ඔයා test drive කළානෙ! As is where is sale, no warranty!' ඔයා argue කරනකොට shop එකෙන් thugs 3ක් ආවා - 'Problem එකක් තියනවද bro?' 😰 Police call කළත් ඒගොල්ලෝ කිව්වා 'Civil matter, we can't help.' CCTV බලනකොට ඔයාම cash දුන්නා receipt නැතිව - legally ඔයා screwed! German Tech Aiya wins. Lesson: RACV inspection before buying ANY used car!",
    image_prompt: "Confrontation at dodgy car dealer, intimidating scene, buyer realizing mistake",
    choices: [
      { id: "c1", text: "Walk away කරලා legal options බලමු", next_scenario: "car_legal_options" },
      { id: "c2", text: "Lankan community Facebook warning post", next_scenario: "car_community_warning" },
      { id: "c3", text: "Accept loss, sell for scrap, move on 😔", next_scenario: "car_salvage" }
    ],
    stats_update: { money_change: 0, stress_change: 40, energy_change: -30, day_change: 2 },
    new_items: [],
    game_state: "ongoing"
  },

  // GIRLFRIEND/BOYFRIEND SCAM - Illicit Affair
  "love_scam_intro": {
    id: "love_scam_intro",
    story_text: "Tinder එකේ match උනේ 'Shenaya' කියලා ලස්සන එකෙක් එක්ක. 3 months dating - restaurant dates, movies, weekend trips. ඔයා පට්ටම fall වෙලා! 💕 Birthday එකට iPhone 15 Pro gift කළා ($1,800). One day, random number එකකින් call එකක් - 'Bro, ඔයා Shenaya එක්ක date කරනවද? ඒකගේ husband මම! ඒක married, kids 2යි, husband PR holder!' 🤯 ඔයාගේ world collapse! Shenaya ghosted - iPhone, gifts, emotions all gone!",
    image_prompt: "Shocked person receiving devastating phone call, discovering partner's secret marriage",
    choices: [
      { id: "c1", text: "Husband එක්ක meet වෙලා situation explain කරමු 🤝", next_scenario: "love_scam_husband" },
      { id: "c2", text: "Shenaya confront කරන්න try කරමු 😤", next_scenario: "love_scam_confront" },
      { id: "c3", text: "Block everything, forget, move on 💔", next_scenario: "love_scam_move_on" }
    ],
    stats_update: { money_change: -2500, stress_change: 80, energy_change: -50, day_change: 90 },
    new_items: ["Broken Heart", "Trust Issues"],
    game_state: "ongoing"
  },

  "love_scam_husband": {
    id: "love_scam_husband",
    story_text: "Husband එක්ක cafe එකක meet උනා. Turns out, ඔයා victim number 5! 😱 Shenaya serial scammer - married students target කරලා gifts ගන්නවා, husband ගෙදර නැති වෙලාවට boyfriends maintain කරනවා. Husband කිව්වා 'I'm filing divorce, you're welcome to be witness.' ඔයා evidence දුන්නා - chat screenshots, gift receipts. Husband ඔයාට beer එකක් ගෙවලා 'Sorry you got caught up bro.' Weird bonding moment!",
    image_prompt: "Two men talking seriously at cafe, showing phone evidence, unexpected alliance",
    choices: [
      { id: "c1", text: "Witness statement දෙමු - justice 🏛️", next_scenario: "love_scam_justice" },
      { id: "c2", text: "මේකෙන් ඉවත් වෙමු - drama enough", next_scenario: "love_scam_move_on" },
      { id: "c3", text: "Shenaya expose කරමු publicly 📢", next_scenario: "love_scam_expose" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 10, day_change: 1 },
    new_items: ["Character Development"],
    game_state: "ongoing"
  },

  // COE CANCELLATION DRAMA
  "coe_cancelled": {
    id: "coe_cancelled",
    story_text: "University email ආවා - 'Your COE has been cancelled due to unsatisfactory course progression.' 😱 Attendance 60% (minimum 80%), failed 3 subjects. Immigration notified! ඔයාට 28 days තියනවා appeal submit කරන්න or visa automatically cancel! Student visa rule - maintain enrollment or go home! Panic mode activated! 🚨",
    image_prompt: "Student in shock reading university email about COE cancellation, visa crisis",
    choices: [
      { id: "c1", text: "University appeal submit කරමු - medical/compassionate grounds 📝", next_scenario: "coe_appeal" },
      { id: "c2", text: "Migration agent consult කරමු - professional help 👔", next_scenario: "coe_migration_agent" },
      { id: "c3", text: "වෙන university/course එකකට transfer try කරමු 🔄", next_scenario: "coe_transfer" }
    ],
    stats_update: { money_change: 0, stress_change: 90, energy_change: -60, day_change: 1 },
    new_items: ["COE Cancellation Notice"],
    game_state: "ongoing"
  },

  "coe_appeal": {
    id: "coe_appeal",
    story_text: "Appeal submit කළා - doctor certificate, personal statement, study plan. University panel review කළා. 2 weeks suspense! 😰 Finally email ආවා - 'Appeal GRANTED with conditions: Maintain 80% attendance, pass all subjects, fortnightly progress meetings.' ඔයාට second chance එකක්! Don't waste it! 💪 Immigration නුදුරේ still watching.",
    image_prompt: "Student relieved reading appeal granted email, second chance given",
    choices: [
      { id: "c1", text: "Serious mode - 100% attendance from now 📚", next_scenario: "study_serious_mode" },
      { id: "c2", text: "Part-time work reduce කරලා study focus 🎯", next_scenario: "work_life_balance" },
      { id: "c3", text: "Tutor hire කරලා grades boost කරමු 👨‍🏫", next_scenario: "hire_tutor" }
    ],
    stats_update: { money_change: 0, stress_change: -30, energy_change: 20, day_change: 14 },
    new_items: ["Second Chance", "Study Plan"],
    game_state: "ongoing"
  },

  // VISA AGENT SCAM - Regional Pressure
  "visa_agent_scam": {
    id: "visa_agent_scam",
    story_text: "Visa agent uncle කෙනෙක් Dandenong office එකේ. ඔයාගේ visa situation check කරලා කිව්වා 'Machan, ඔයාගේ visa risky! Melbourne competitive වැඩියි. Regional Australia යන්න - Tasmania, Adelaide. PR fast track!' 🤔 Agent charge $3,500 for 'regional sponsorship arrangement.' 'Trust me bro, මගේ contacts තියනවා!' Agent ගේ office එක fancy, certificates wall එකේ. Legit feeling!",
    image_prompt: "Visa agent office with certificates on wall, concerned student being pressured",
    choices: [
      { id: "c1", text: "Agent trust කරලා regional package ගමු 💰", is_risky: true, next_scenario: "visa_agent_trap" },
      { id: "c2", text: "MARA registered ද check කරලා verify කරමු 🔍", next_scenario: "visa_agent_verify" },
      { id: "c3", text: "Second opinion ගමු - another agent consult 👀", next_scenario: "visa_second_opinion" }
    ],
    stats_update: { money_change: 0, stress_change: 40, energy_change: -20, day_change: 3 },
    new_items: [],
    game_state: "ongoing"
  },

  "visa_agent_trap": {
    id: "visa_agent_trap",
    story_text: "$3,500 pay කළා. Agent documents 'prepare' කළා 6 weeks. Then silence. Phone calls - no answer. Office visit - 'Uncle sick, next week.' 2 months later - office closed! 🏚️ Google search කරනකොට - 5 star reviews all fake, multiple complaints, NOT MARA registered! ඔයාගේ $3,500 + visa still uncertain. Scammed by professional scammer! 💀",
    image_prompt: "Closed down visa agent office, 'For Lease' sign, devastated student outside",
    choices: [
      { id: "c1", text: "Police complaint + MARA complaint file 🚔", next_scenario: "visa_scam_report" },
      { id: "c2", text: "Legit MARA agent hire කරලා fix කරමු 👔", next_scenario: "legit_migration_agent" },
      { id: "c3", text: "DIY visa application try කරමු - research 📚", next_scenario: "diy_visa_application" }
    ],
    stats_update: { money_change: -3500, stress_change: 70, energy_change: -40, day_change: 60 },
    new_items: ["Scam Victim Experience"],
    game_state: "ongoing"
  },

  "visa_agent_verify": {
    id: "visa_agent_verify",
    story_text: "MARA website check කළා - Uncle ගේ name NOT REGISTERED! 😱 ඔයා save වුණා! Agent එකට call කරලා confront කරනකොට 'Machan I'm MARA pending application, no problem!' Lie! Unregistered agent illegal. ඔයා politely decline කරලා walk out. $3,500 save වුණා + scam avoided! Smart move! 🧠",
    image_prompt: "Person checking MARA website on phone, relieved expression, walking away from office",
    choices: [
      { id: "c1", text: "Proper MARA registered agent හොයමු ✅", next_scenario: "legit_migration_agent" },
      { id: "c2", text: "Immigration lawyer consult කරමු 👨‍⚖️", next_scenario: "immigration_lawyer" },
      { id: "c3", text: "Community එකට warning share කරමු 📢", next_scenario: "community_warning_agent" }
    ],
    stats_update: { money_change: 0, stress_change: -20, energy_change: 10, day_change: 1 },
    new_items: ["Scam Detector Skill"],
    game_state: "ongoing"
  },

  // JOB BROKER SCAM - Friend's "Connection"
  "job_broker_scam": {
    id: "job_broker_scam",
    story_text: "Friend කෙනෙක් introduce කළා 'job broker aiya' කෙනෙක්. 'Machan, මේ aiya warehouse manager job හොයාදෙනවා, $32/hour! Fee එක $800 only, job guarantee!' 🤝 Aiya professional looking - suit, business card. WhatsApp group එකේ 'success stories' share කරනවා - screenshots of people thanking him. Sounds legit?",
    image_prompt: "Job broker in suit showing WhatsApp success stories, student considering offer",
    choices: [
      { id: "c1", text: "Fee ගෙවලා job ගමු - friend recommended නේ 💰", is_risky: true, next_scenario: "job_broker_trap" },
      { id: "c2", text: "Success story contacts verify කරමු 🔍", next_scenario: "job_broker_verify" },
      { id: "c3", text: "Reject කරලා myself apply කරමු 💪", next_scenario: "direct_job_apply" }
    ],
    stats_update: { money_change: 0, stress_change: 20, energy_change: -10, day_change: 1 },
    new_items: [],
    game_state: "ongoing"
  },

  "job_broker_trap": {
    id: "job_broker_trap",
    story_text: "$800 ගෙව්වා. Aiya 'processing' කරනවා 3 weeks. Interview date දුන්නා - fake company, fake address! 😤 'Success stories' all staged - paid actors! ඔයාගේ friend ද victim - ඔයා refer කළාට $100 commission ගත්තා without knowing scam! Classic pyramid recruitment scam. Police complaint - 'Civil matter, file in VCAT.' $800 gone, trust broken with friend! 💔",
    image_prompt: "Empty warehouse where fake interview was supposed to be, realization of scam",
    choices: [
      { id: "c1", text: "VCAT complaint file කරමු 📋", next_scenario: "vcat_complaint" },
      { id: "c2", text: "Friend එක්ක situation explain කරලා reconcile 🤝", next_scenario: "friend_reconcile" },
      { id: "c3", text: "Social media expose + move on 📢", next_scenario: "job_scam_expose" }
    ],
    stats_update: { money_change: -800, stress_change: 50, energy_change: -30, day_change: 21 },
    new_items: ["Trust Issues"],
    game_state: "ongoing"
  },

  "job_broker_verify": {
    id: "job_broker_verify",
    story_text: "Smart move! Success story එකක contact ඉල්ලුවා. Aiya hesitate කළා - 'Privacy bro.' ඔයා insist කළා. Finally number එකක් දුන්නා - call කරනකොට number disconnected! 🚩 Red flag! ABN check කරනකොට - no registered business! ඔයා aiya ට 'No thanks' කියලා walk away. $800 save වුණා! Friend ට ද explain කළා - ඒයත් shocked. Scam network exposed! 💪",
    image_prompt: "Person doing research on laptop, finding red flags, avoiding scam",
    choices: [
      { id: "c1", text: "Direct job applications යමු 📝", next_scenario: "direct_job_apply" },
      { id: "c2", text: "Recruitment agency (legit) register කරමු 🏢", next_scenario: "legit_recruitment" },
      { id: "c3", text: "Community warning post දාමු 📢", next_scenario: "job_scam_warning" }
    ],
    stats_update: { money_change: 0, stress_change: -10, energy_change: 10, day_change: 2 },
    new_items: ["Scam Detector Skill"],
    game_state: "ongoing"
  },

  // CLEANING CONTRACTOR NOT PAYING FOR MONTHS
  "cleaning_unpaid_months": {
    id: "cleaning_unpaid_months",
    story_text: "Cleaning contractor aiya එක්ක මාස 3ක් වැඩ කළා. Invoice total: $4,500! Every week 'next week pay කරන්නම්' කියනවා. Now 12 weeks overdue! 😤 ඔයා desprate - rent, bills, food. Aiya excuses: 'Client pay කළේ නෑ', 'Bank issue', 'COVID impact.' Meanwhile aiya Instagram එකේ new BMW, Bali holiday posts! 🤬",
    image_prompt: "Worker confronting contractor while he shows off BMW, rage and betrayal",
    choices: [
      { id: "c1", text: "Fair Work complaint + legal letter 📋", next_scenario: "unpaid_fair_work" },
      { id: "c2", text: "Work site එකේ scene එකක් දාමු - public pressure 📢", next_scenario: "unpaid_public_scene" },
      { id: "c3", text: "Small Claims Court file කරමු 🏛️", next_scenario: "unpaid_small_claims" }
    ],
    stats_update: { money_change: 0, stress_change: 80, energy_change: -50, day_change: 84 },
    new_items: ["Unpaid Invoices"],
    game_state: "ongoing"
  },

  "unpaid_fair_work": {
    id: "unpaid_fair_work",
    story_text: "Fair Work complaint submit කළා. Investigation started. 8 weeks later - verdict: 'Contractor must pay $4,500 + $500 penalty within 14 days!' 🎉 Aiya panic mode! Pay කළා finally, cash hand-delivered! 'Sorry machan, business tough.' ඔයා legally won! But lesson learned - ABN, written contracts, payment terms ALWAYS! Never trust 'machan' again.",
    image_prompt: "Fair Work victory letter, contractor reluctantly handing over cash payment",
    choices: [
      { id: "c1", text: "Proper job එකක් හොයමු - no more contractor work", next_scenario: "middle_job_hunt" },
      { id: "c2", text: "Own ABN ගෙන self-employed වෙමු 💼", next_scenario: "own_abn" },
      { id: "c3", text: "Money save කරලා emergency fund build 🏦", next_scenario: "build_savings" }
    ],
    stats_update: { money_change: 5000, stress_change: -40, energy_change: 30, day_change: 60 },
    new_items: ["Legal Victory", "Life Lessons"],
    game_state: "ongoing"
  },

  // MENTAL HEALTH SUPPORT
  "mental_health_support": {
    id: "mental_health_support",
    story_text: "Stress overload! GP visit කළා. Doctor recommend කළා mental health care plan - 10 free psychology sessions Medicare එකෙන්. Psychologist එක්ක talk therapy start. 😌 ඔයා realize වුණා - scam වෙනවා, struggle කරනවා, lonely වෙනවා normal කියලා. Tools ඉගෙන ගත්තා - stress management, healthy boundaries, scam detection. Mental health = survival skill!",
    image_prompt: "Person in therapy session, feeling supported, Melbourne city through window",
    choices: [
      { id: "c1", text: "Therapy continue කරලා heal වෙමු 💚", next_scenario: "healing_journey" },
      { id: "c2", text: "Support group join කරමු - shared experiences 👥", next_scenario: "support_group" },
      { id: "c3", text: "Tools use කරලා fresh start ගමු 🌟", next_scenario: "fresh_start" }
    ],
    stats_update: { money_change: 0, stress_change: -40, energy_change: 30, day_change: 14 },
    new_items: ["Mental Health Plan", "Coping Skills"],
    game_state: "ongoing"
  },

  // COMMUNITY HERO PATH
  "community_hero": {
    id: "community_hero",
    story_text: "ඔයාගේ scam expose post viral වුණා! 🔥 SBS interview, community WhatsApp groups, student unions share. ඔයා informal 'scam watchdog' වුණා. New students ඔයාගෙන් advice ඉල්ලනවා. Melbourne Lankan community appreciate කරනවා. Volunteer work lead to actual job offer - community organization admin role, $28/hour! Karma real! 💪",
    image_prompt: "Community recognition ceremony, person receiving appreciation from Lankan community",
    choices: [
      { id: "c1", text: "Job offer accept කරමු - stable career path 💼", next_scenario: "community_job" },
      { id: "c2", text: "Volunteer continue + studies focus 📚", next_scenario: "study_volunteer_balance" },
      { id: "c3", text: "YouTube/TikTok start කරලා scam awareness grow 📺", next_scenario: "content_creator" }
    ],
    stats_update: { money_change: 0, stress_change: -30, energy_change: 20, day_change: 30 },
    new_items: ["Community Respect", "Network Connections"],
    game_state: "ongoing"
  },

  // FRESH START AFTER STRUGGLES
  "fresh_start": {
    id: "fresh_start",
    story_text: "Hard lessons learned! Scam victims, unpaid wages, heartbreak - ඔයා survive කළා. Now smarter, stronger, more careful. New job, stable accommodation, proper visa situation. PR pathway clear. Day 60+ in Melbourne - ඔයා no longer naive fresh-off-boat student. ඔයා Melbourne veteran! 🏆",
    image_prompt: "Confident person walking through Melbourne CBD, sunrise, hopeful future",
    choices: [
      { id: "c1", text: "PR application process start කරමු 📋", next_scenario: "pr_application_start" },
      { id: "c2", text: "Career advancement focus - promotions! 📈", next_scenario: "career_advancement" },
      { id: "c3", text: "Community give back - mentor new students 🤝", next_scenario: "mentor_students" }
    ],
    stats_update: { money_change: 500, stress_change: -50, energy_change: 50, day_change: 7 },
    new_items: ["Melbourne Survival Skills", "Wisdom"],
    game_state: "ongoing"
  },

  // PR APPLICATION START
  "pr_application_start": {
    id: "pr_application_start",
    story_text: "Day 85! PR EOI (Expression of Interest) submit කළා. Points: Age 30, English IELTS 7 (20 points), Bachelor degree (15 points), 2 years work experience (5 points), regional study (5 points). Total: 70 points! Invitation waiting... 🤞 ස්වප්නය real වෙන්න ළඟයි!",
    image_prompt: "Person submitting PR application online, hopeful expression, Australian flag in background",
    choices: [
      { id: "c1", text: "Wait කරද්දී points boost කරමු - NAATI/PY 📚", next_scenario: "pr_boost_points" },
      { id: "c2", text: "Patient වෙලා wait කරමු - anxiety manage 🧘", next_scenario: "pr_waiting" },
      { id: "c3", text: "Backup plan - employer sponsorship explore 💼", next_scenario: "employer_sponsorship" }
    ],
    stats_update: { money_change: -4000, stress_change: 30, energy_change: -20, day_change: 3 },
    new_items: ["EOI Submitted"],
    game_state: "ongoing"
  },

  // FINAL SUCCESS - PR GRANTED
  "pr_granted": {
    id: "pr_granted",
    story_text: "DAY 90! 📧 Email notification: 'Your Permanent Residency visa has been GRANTED!' 🎉🎉🎉 Tears of joy! 3 months of struggle, scams, heartbreak, hustle - ALL WORTH IT! ඔයා official Australian Permanent Resident! No more visa stress, work restrictions, uncertainty. 25 chapters, countless challenges - ඔයා beat the system! 🏆 මෙල්බර්න් ජීවිතේ ජය ගත්තා!",
    image_prompt: "Ecstatic person holding PR grant letter, Australian flag, Melbourne skyline, tears of joy",
    choices: [],
    stats_update: { money_change: 0, stress_change: -100, energy_change: 100, day_change: 0 },
    new_items: ["PR Visa", "Australian Dream"],
    game_state: "victory"
  }
};

// Helper function to get random scenario continuation if specific next is not set
export function getRandomScenario(profileClass: ProfileClass): string {
  // Class-appropriate scam scenarios - DIFFERENT problems for DIFFERENT classes!
  const scamChance = Math.random();
  
  // MINISTER SON SCAMS - Rich kid problems: fake friends, gold diggers, VIP lifestyle traps
  const ministerScams = [
    "minister_clubbing_invite",
    "minister_gold_digger", 
    "minister_fake_friend_scam",
    "minister_gambling_addiction"
  ];
  
  // BUSINESS FAMILY SCAMS - Mid-tier problems: investment scams, car scams
  const businessScams = [
    "dandenong_car_scam",
    "visa_agent_scam",
    "job_broker_scam"
  ];
  
  // MIDDLE/LOWER CLASS SCAMS - Working class problems: contractor scams, unpaid wages
  const workingClassScams = [
    "cleaning_contractor_scam",
    "dandenong_car_scam", 
    "visa_agent_scam",
    "job_broker_scam",
    "cleaning_unpaid_months",
    "coe_cancelled"
  ];
  
  // Apply class-appropriate scams with probability
  if (profileClass === "ඇමති පුතා" && scamChance < 0.25) {
    // Minister son gets RICH KID scams, not working class scams!
    return ministerScams[Math.floor(Math.random() * ministerScams.length)];
  } else if (profileClass === "Business Family" && scamChance < 0.20) {
    return businessScams[Math.floor(Math.random() * businessScams.length)];
  } else if (profileClass === "Middle Class" && scamChance < 0.30) {
    return workingClassScams[Math.floor(Math.random() * workingClassScams.length)];
  } else if (profileClass === "Lower Class" && scamChance < 0.35) {
    return workingClassScams[Math.floor(Math.random() * workingClassScams.length)];
  }
  
  // Class-appropriate regular scenarios
  const classScenarios: Record<ProfileClass, string[]> = {
    "ඇමති පුතා": ["minister_hotel", "minister_university", "minister_leisure", "minister_business_connection", "minister_genuine_friends", "minister_smart_choice"],
    "Business Family": ["business_apartment", "business_job_search", "business_uber_eats", "business_warehouse_job", "business_smart_shopping"],
    "Middle Class": ["middle_footscray", "middle_job_hunt", "middle_cleaning_job", "middle_srilankan_food"],
    "Lower Class": ["lower_help_desk", "lower_emergency_hostel", "lower_community", "lower_desperate_job_hunt"]
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
