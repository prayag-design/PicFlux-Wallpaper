
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, Wallpaper, LicenseType, ResolutionType } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a wallpaper using gemini-3-pro-image-preview
   */
  generateWallpaper: async (config: GenerationConfig): Promise<Wallpaper | null> => {
    if (!apiKey) {
      console.error("API Key is missing");
      return null;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: config.prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: config.aspectRatio,
            imageSize: config.resolution
          }
        },
      });

      let imageUrl = '';
      
      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        }
      }

      if (!imageUrl) throw new Error("No image generated");

      // Create a transient Wallpaper object
      const newWallpaper: Wallpaper = {
        id: `gen-${Date.now()}`,
        title: config.prompt.slice(0, 30) + (config.prompt.length > 30 ? '...' : ''),
        thumbnailUrl: imageUrl, // In a real app, we would upload to S3 and get a thumbnail URL
        originalUrl: imageUrl,
        resolutions: [
          { 
            type: ResolutionType.Original, 
            width: config.resolution === '4K' ? 3840 : 1024, // Approximation
            height: config.resolution === '4K' ? 2160 : 1024,
            size: 'Unknown', 
            url: imageUrl 
          }
        ],
        uploader: { 
          id: 'gemini-ai',
          name: 'Gemini AI', 
          avatar: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg' 
        },
        license: LicenseType.AI_Generated,
        tags: ['ai', 'generated', 'gemini'],
        category: 'AI Art',
        views: 0,
        downloads: 0,
        createdAt: new Date().toISOString(),
        colors: [],
        aspectRatio: config.aspectRatio.replace(':', ':'),
        status: 'published'
      };

      return newWallpaper;

    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  },

  /**
   * Suggests tags for a wallpaper description using Gemini Flash
   */
  suggestTags: async (description: string): Promise<string[]> => {
      if (!apiKey) return [];
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 5 comma-separated relevant tags for a wallpaper described as: "${description}". Return only the tags.`,
        });
        return response.text?.split(',').map(s => s.trim()) || [];
      } catch (e) {
          console.error("Tag generation failed", e);
          return [];
      }
  }
};
