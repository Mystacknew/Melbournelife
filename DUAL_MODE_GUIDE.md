# Melbourne Life - Dual Mode System Guide

## Overview
Melbourne Life now supports **TWO game modes** that players can choose from during character registration:

### 🎭 Predefined Story Mode (Default)
- Uses **32 curated, pre-generated images** organized by story chapters
- Instant image loading from local storage
- No API key required
- Consistent, professionally crafted visual experience
- Perfect for players who want a polished, traditional story game

### 🤖 AI Creative Mode
- Uses **Google Gemini API** to generate unique images for every scenario
- Dynamic, personalized visual experience
- Requires player's own Gemini API key
- Each playthrough has unique imagery
- Perfect for players who want creative freedom and variety

---

## Image Organization Structure

All predefined story images are stored in `/public/images/story/` with the following chapter structure:

```
public/images/story/
├── arrival/        (3 images) - Airport, apartment views
├── student/        (5 images) - Campus, lectures, library, cafeteria, job search
├── work/           (4 images) - Retail, cafe, warehouse, team meeting
├── career/         (4 images) - Resume, interview, office, networking
├── social/         (4 images) - Friends, sports, beach, park walks
├── finance/        (3 images) - Budget, bank, shopping
├── housing/        (3 images) - House inspection, shared house, moving
├── transport/      (3 images) - Tram, bicycle, train
├── health/         (1 image)  - Gym
└── success/        (2 images) - Graduation, celebration
```

**Total: 32 images** covering all major story scenarios

---

## How Mode Selection Works

### 1. Character Registration Screen
After creating their character profile, players see a **Game Mode** section with two buttons:

**Predefined Stories** (Green)
- Click to use the 32 curated images
- No additional setup required
- Instant gameplay

**AI Creative Mode** (Purple)
- Click to enable AI-generated images
- Prompts for Gemini API key input
- Shows privacy notice and setup instructions

### 2. API Key Management (AI Mode Only)
When AI Creative Mode is selected:
- Modal appears requesting Gemini API key
- Link provided to get free API key: https://aistudio.google.com/apikey
- Key is stored **locally in browser** (localStorage)
- Key is never sent to any server except Google's API
- Can be removed by switching back to Predefined mode

### 3. Game Settings Persistence
Game settings are saved with each game state:
```typescript
interface GameSettings {
  storyMode: 'predefined' | 'ai-creative';
  geminiApiKey?: string;
}
```

When players save/load games, their mode preference is restored.

---

## Implementation Details

### Key Files Modified

**App.tsx**
- Added mode selection UI in `renderRegister()`
- Added `gameSettings` state management
- Updated `startGame()` to sync mode with settings
- Added mode indicator badge in game UI
- Updated image generation calls to use current mode

**scenarioEngine.ts**
- `generateSceneImage()` function now accepts mode parameters
- Routes to local images for predefined mode
- Routes to Gemini API for AI creative mode
- Fallback to Pollinations AI if Gemini fails

**imageMapper.ts**
- Maps scenario IDs to local image paths
- Keyword-based fallback matching
- 100+ scenario mappings covering all story branches

**geminiImageService.ts**
- Handles Gemini API image generation
- Enhances prompts for better results
- Error handling and fallbacks

**types.ts**
- Added `StoryMode` type
- Added `GameSettings` interface
- Updated `GameState` to include settings

---

## Privacy & Security

### API Key Storage
✅ **Local Only**: Keys stored in browser's localStorage
✅ **No Server**: Never sent to Melbourne Life servers
✅ **Direct to Google**: AI requests go straight to Google's API
✅ **User Control**: Can remove key anytime

### Data Flow
```
Predefined Mode:
Player Action → Local Image Lookup → Display

AI Creative Mode:
Player Action → Prompt → Google Gemini API → Generated Image → Display
```

---

## Testing Both Modes

### Test Predefined Mode
1. Register new character
2. Select "PRE-DEFINED STORIES" (green button)
3. Choose social class and start game
4. Verify images load instantly from `/public/images/story/`
5. Check mode indicator shows "Story" badge

### Test AI Creative Mode
1. Register new character
2. Select "AI CREATIVE MODE" (purple button)
3. Enter Gemini API key when prompted
4. Choose social class and start game
5. Verify images are generated (may take 2-3 seconds)
6. Check mode indicator shows "AI" badge

---

## User Benefits

### Predefined Story Mode Benefits
- ⚡ **Fast**: Instant image loading
- 🎨 **Polished**: Professional quality images
- 📱 **Offline-Ready**: No internet needed (after initial load)
- 🔒 **Private**: No external API calls
- 💰 **Free**: No API costs

### AI Creative Mode Benefits
- 🎲 **Unique**: Different images every playthrough
- 🎭 **Dynamic**: Adapts to player choices
- 🌟 **Creative**: Endless visual variety
- 🔧 **Customizable**: Uses player's own API quota
- 🚀 **Cutting Edge**: Latest AI image generation

---

## Future Enhancements

Potential additions to the dual-mode system:

1. **Hybrid Mode**: Mix predefined + AI images
2. **Image Gallery**: Save favorite AI-generated images
3. **Prompt Customization**: Let players tweak image prompts
4. **Local AI Models**: Offline AI generation option
5. **Community Images**: Share and download player-created images

---

## Troubleshooting

### "Image not loading" in Predefined Mode
- Check browser console for 404 errors
- Verify image files exist in `/public/images/story/`
- Clear browser cache and reload

### "Failed to generate image" in AI Creative Mode
- Verify API key is correct
- Check Google Cloud Console for API quota
- Ensure Gemini Imagen API is enabled
- Falls back to Pollinations AI if Gemini fails

### Mode not saving between sessions
- Check browser localStorage is enabled
- Verify Supabase connection for cloud saves
- Re-select mode in profile registration if needed

---

## Credits

**Image Sources (Predefined Mode)**
- All images generated using AI tools (Midjourney, DALL-E, Stable Diffusion)
- Curated and organized to match game scenarios
- 32 images covering 10 story chapters

**AI Integration (AI Creative Mode)**
- Powered by Google Gemini Imagen API
- Fallback: Pollinations.ai (free, no key required)
- Prompt engineering for Melbourne/immigration context

---

**Version**: 1.0  
**Last Updated**: January 2025  
**Repository**: https://github.com/Mystacknew/Melbournelife
