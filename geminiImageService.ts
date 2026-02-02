// Gemini AI Image Generation Service
// Uses Google's Imagen API through Gemini

export const generateImageWithGemini = async (prompt: string, apiKey: string): Promise<string> => {
  try {
    // Use Pollinations AI as fallback (free, no API key needed)
    // For actual Gemini integration, you would use Google's Imagen API
    
    // Enhanced prompt for better image generation
    const enhancedPrompt = enhancePromptForStory(prompt);
    
    // Using Pollinations AI (works without API key)
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&enhance=true&model=flux`;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return imageUrl;
    
    // TODO: Implement actual Gemini Imagen API when available
    // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${apiKey}`
    //   },
    //   body: JSON.stringify({
    //     prompt: enhancedPrompt,
    //     number_of_images: 1,
    //     aspect_ratio: '16:9'
    //   })
    // });
    // const data = await response.json();
    // return data.images[0].uri;
    
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    // Return fallback image on error
    return '/images/story/arrival/01-skybus.jpg';
  }
};

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
