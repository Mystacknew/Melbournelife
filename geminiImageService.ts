// Gemini AI Image Generation Service
// Uses Google's Nano Banana (Gemini 2.0 Flash) for native image generation

export const generateImageWithGemini = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    // Enhanced prompt for better story-relevant images
    const enhancedPrompt = enhancePromptForStory(prompt);
    
    console.log('🎨 Generating image with Gemini Nano Banana:', enhancedPrompt.substring(0, 60) + '...');
    
    // Use Gemini 2.0 Flash Experimental (has image generation capability) via REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate an image: ${enhancedPrompt}` }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got an image in the response
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
        // Convert base64 to data URL
        const imageData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const dataUrl = `data:${mimeType};base64,${imageData}`;
        console.log('✅ Image generated successfully with Nano Banana!');
        return dataUrl;
      }
    }
    
    // If no image in response, fall back to Pollinations
    console.log('⚠️ No image in Gemini response, falling back to Pollinations AI...');
    return await generateWithPollinations(enhancedPrompt);
    
  } catch (error) {
    console.error('Error generating image with Gemini Nano Banana:', error);
    // Fall back to Pollinations AI on error
    console.log('⚠️ Falling back to Pollinations AI...');
    return await generateWithPollinations(enhancePromptForStory(prompt));
  }
};

// Fallback to Pollinations AI (free, no API key needed)
async function generateWithPollinations(prompt: string): Promise<string> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&enhance=true&model=flux`;
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return imageUrl;
  } catch (error) {
    console.error('Pollinations fallback failed:', error);
    return '/images/story/arrival/01-skybus.jpg';
  }
}

function enhancePromptForStory(originalPrompt: string): string {
  const promptLower = originalPrompt.toLowerCase();
  let enhancedPrompt = "Photorealistic digital art, cinematic lighting, detailed scene: ";
  
  // Add context based on keywords
  if (promptLower.includes('airport') || promptLower.includes('arrival')) {
    enhancedPrompt += "Melbourne Tullamarine Airport, Sri Lankan immigrant arriving with luggage, modern terminal, hope and excitement, ";
  } else if (promptLower.includes('apartment') || promptLower.includes('docklands')) {
    enhancedPrompt += "Modern Melbourne apartment interior, young Sri Lankan person settling in, city view through windows, ";
  } else if (promptLower.includes('university') || promptLower.includes('campus')) {
    enhancedPrompt += "Australian university campus, diverse students, modern buildings, Sri Lankan student with backpack, ";
  } else if (promptLower.includes('tram')) {
    enhancedPrompt += "Iconic Melbourne green and yellow tram on city street, passengers visible, CBD backdrop, ";
  } else if (promptLower.includes('work') || promptLower.includes('job')) {
    enhancedPrompt += "Young Sri Lankan worker in Melbourne, professional or casual work environment, determination and focus, ";
  } else if (promptLower.includes('beach') || promptLower.includes('st kilda')) {
    enhancedPrompt += "St Kilda Beach Melbourne, pier in background, people enjoying sunny day, relaxed atmosphere, ";
  } else if (promptLower.includes('cafe') || promptLower.includes('coffee')) {
    enhancedPrompt += "Melbourne cafe interior, barista working, coffee machine, trendy hipster atmosphere, ";
  } else {
    enhancedPrompt += originalPrompt + ", Melbourne setting, ";
  }
  
  enhancedPrompt += "high quality, 4K, detailed, atmospheric, story-driven narrative scene";
  
  return enhancedPrompt;
}
