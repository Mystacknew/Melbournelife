# 🐛 AI Mode Debugging Guide

## Current Issue
**AI mode doesn't progress after the first choice**

---

## Diagnostic Steps

### Step 1: Check Browser Console
1. Open the game in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Select **AI Creative Mode**
5. Enter API key and start game
6. Make first choice
7. Look for these log messages:

```
🎮 Starting game in mode: ai
📸 Image source: AI Generated via Gemini
```

### Step 2: Check for Errors
Look for any RED error messages in console, especially:
- `TypeError: Cannot read property...`
- `Failed to fetch`
- `Gemini API error`
- `Uncaught (in promise)`

### Step 3: Check Network Tab
1. In DevTools, go to **Network** tab
2. Make first choice
3. Look for requests to:
   - `generativelanguage.googleapis.com` (Gemini API)
   - `image.pollinations.ai` (Fallback image service)
4. Check if requests are:
   - ✅ Status 200 (OK)
   - ❌ Status 401 (API key invalid)
   - ❌ Status 429 (Rate limit exceeded)
   - ❌ Status 500 (Server error)

---

## Common Issues & Solutions

### Issue 1: API Key Invalid
**Symptom:** Network request returns 401 error

**Solution:**
1. Get new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Go to Settings in game
3. Enter new API key
4. Save and try again

### Issue 2: Async/Await Not Waiting
**Symptom:** Game advances before AI response comes back

**Check in code:** Line ~295
```typescript
if (useAI && apiKey) {
  nextScene = await generateScene(contextSummary, choice.text, fullProfile, stats, inventory);
  // ^^^^ This SHOULD wait for the response
}
```

**Fix:** Already implemented with `await` keyword

### Issue 3: State Not Updating
**Symptom:** Scene data received but UI doesn't update

**Check:** React state updates
```typescript
setCurrentScenario({
  id: nextScene.id,
  title: nextScene.title,
  description: nextScene.description,
  choices: nextScene.choices,
  image: sceneImg
});
```

**Fix:** Ensure all state updates happen AFTER async operations complete

### Issue 4: Error Swallowing
**Symptom:** No error messages, just silently fails

**Current Protection:**
```typescript
try {
  nextScene = await generateScene(...);
} catch (error) {
  console.error('❌ AI Scene Generation Error:', error);
  // Should fall back to predefined scenarios
}
```

**Fix:** Add better error handling and fallback

---

## Code Flow Analysis

### When Player Makes a Choice (AI Mode)

1. **handleChoice()** called with selected choice
2. Update stats based on choice consequences
3. **Check if AI mode:**
   ```typescript
   if (useAI && apiKey) {
     nextScene = await generateScene(contextSummary, choice.text, fullProfile, stats, inventory);
   }
   ```
4. **generateScene()** in geminiService.ts:
   - Calls Gemini API with context
   - Waits for response
   - Parses JSON response
   - Returns new scenario object
5. **Generate scene image:**
   ```typescript
   const sceneImg = await generateSceneImage(
     nextScene.description, 
     nextScene.imagePrompt || '', 
     apiKey
   );
   ```
6. **Update state:**
   ```typescript
   setCurrentScenario({...nextScene, image: sceneImg});
   setStats(newStats);
   setChoiceHistory([...]);
   ```
7. **UI re-renders** with new scenario

### Potential Break Points

- ❌ Line 295: `await generateScene()` throws error
- ❌ Line 300: Response not in expected format
- ❌ Line 305: Image generation fails
- ❌ Line 310: State update doesn't trigger re-render
- ❌ Line 315: Scene validation fails

---

## Debug Code Addition

Add this to `App.tsx` around line 293 for better debugging:

```typescript
if (useAI && apiKey) {
  console.log('🤖 AI Mode: Generating next scene...');
  console.log('📝 Context:', contextSummary);
  console.log('🎯 Choice:', choice.text);
  
  try {
    nextScene = await generateScene(contextSummary, choice.text, fullProfile, stats, inventory);
    console.log('✅ AI Scene Generated:', nextScene);
    
    if (!nextScene || !nextScene.choices || nextScene.choices.length === 0) {
      console.error('❌ Invalid AI response format:', nextScene);
      throw new Error('Invalid AI response');
    }
    
  } catch (error) {
    console.error('❌ AI Generation Failed:', error);
    console.log('🔄 Falling back to predefined scenario...');
    // Fallback to predefined scenario
    const fallbackScenario = getNextScenario(currentScenario.id, choiceIndex, character);
    nextScene = fallbackScenario;
  }
}
```

---

## Testing Protocol

### Test 1: Basic AI Mode
1. Start game in AI Creative mode
2. Enter valid API key
3. Complete character creation
4. Make first choice
5. **Expected:** New scenario loads
6. **Actual:** ???

### Test 2: Error Handling
1. Use INVALID API key
2. Start game
3. Make choice
4. **Expected:** Error message OR fallback to predefined
5. **Actual:** ???

### Test 3: Multiple Choices
1. Use valid API key
2. Make 5 consecutive choices
3. **Expected:** Each choice generates new scenario
4. **Actual:** ???

### Test 4: Network Delay
1. Slow down network (DevTools > Network > Slow 3G)
2. Make choice
3. **Expected:** Loading indicator shown
4. **Actual:** ???

---

## Quick Fix Checklist

- [ ] Check API key is valid
- [ ] Check Gemini API quota not exceeded
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Add console.log statements at each step
- [ ] Test with predefined mode (does it work?)
- [ ] Test with different choices
- [ ] Clear browser cache and localStorage
- [ ] Try in different browser
- [ ] Check if payment method added to Google Cloud (if using paid tier)

---

## Immediate Actions Needed

### For User:
1. **Share Console Logs:** Copy all errors from browser console
2. **Share Network Errors:** Screenshot of failed API requests
3. **Test Predefined Mode:** Confirm if that works fine
4. **API Key Status:** Is it from Google AI Studio? Is billing enabled?

### For Developer:
1. **Add Better Logging:** More console.log statements
2. **Add Loading States:** Show "Generating next scene..." message
3. **Add Error UI:** Show error messages to user instead of silent fails
4. **Add Fallback:** If AI fails, automatically switch to predefined
5. **Add Retry Logic:** Auto-retry failed API calls

---

## Expected Gemini Response Format

```json
{
  "id": "scenario_xyz",
  "title": "New Scenario Title",
  "description": "Detailed scenario description...",
  "imagePrompt": "Description for image generation",
  "choices": [
    {
      "text": "Choice option 1",
      "consequences": {
        "money": -50,
        "stress": 10,
        "energy": -10
      }
    },
    {
      "text": "Choice option 2",
      "consequences": {
        "money": 0,
        "stress": -5,
        "energy": 5
      }
    }
  ],
  "chapter": "current_chapter"
}
```

If response doesn't match this format → ERROR

---

## Success Criteria

✅ AI mode should:
1. Generate contextually relevant scenarios
2. Maintain story continuity
3. Progress after each choice (no freezing)
4. Handle errors gracefully
5. Fall back to predefined if AI fails
6. Show loading states during generation
7. Work for entire game duration (Day 1 to 90)

---

**Next Step:** User should test AI mode with console open and report exact errors
