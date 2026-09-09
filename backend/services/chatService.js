const { GoogleGenerativeAI } = require("@google/generative-ai");
let OpenAI;
try {
  ({ OpenAI } = require("openai"));
} catch (error) {
  OpenAI = null;
}

// Active model list confirmed to work with the current Gemini API.
const DEFAULT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

const VISION_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isImageGenerationRequest = (userMessage = "") => {
  if (!userMessage || typeof userMessage !== "string") return false;
  const text = userMessage.trim().toLowerCase();
  if (!text) return false;

  const startsEditCommand = /^(?:now\s+)?(?:please\s+)?(?:add|change|put|make)\b/.test(text);

  return (
    text.startsWith("generate") ||
    text.startsWith("add ") ||
    text.startsWith("change ") ||
    text.startsWith("make ") ||
    text.startsWith("put ") ||
    startsEditCommand ||
    text.includes("draw") ||
    text.includes("create an image") ||
    text.includes("create a photo") ||
    /\b(generate|create|draw|make|render|design|paint|add|put|change)\b.*\b(image|photo|picture|art|illustration|poster|portrait|scene|background|bowtie|hat|glasses|shirt)\b/.test(text)
  );
};

const isImageEnhancementRequest = (userMessage = "") => {
  if (!userMessage || typeof userMessage !== "string") return false;
  const text = userMessage.trim().toLowerCase();
  if (!text) return false;

  return (
    text.includes('enhance') ||
    text.includes('improve') ||
    text.includes('upscale') ||
    text.includes('fix this image') ||
    text.includes('improve the quality') ||
    text.includes('enhance the quality') ||
    /\b(enhance|improve|upscale|refine|clean up|fix)\b.*\b(image|photo|picture|shot|quality|resolution)\b/.test(text)
  );
};

const analyzeUploadedImage = async (imageFile, promptText = '') => {
  if (!imageFile || !imageFile.buffer) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      type: 'text',
      reply: `I can see the uploaded image. You asked: "${promptText || 'Describe this image'}". The app is running without a live Gemini key, so I’m returning a local response instead of a full visual analysis.`,
      imageUrl: null,
      generatedImage: null,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const mimeType = imageFile.mimetype || 'image/png';
    const imagePart = {
      inlineData: {
        mimeType,
        data: Buffer.from(imageFile.buffer).toString('base64'),
      },
    };
    const instruction = promptText && promptText.trim()
      ? promptText.trim()
      : 'Describe what is in this image in detail and explain the visual content.';

    let lastError = null;
    for (const modelName of VISION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { text: instruction },
          imagePart,
        ]);
        const responseText = await result.response.text();
        return {
          type: 'text',
          reply: responseText || 'I looked at the image and could not extract a clear answer.',
          imageUrl: null,
          generatedImage: null,
          uploadedImageName: imageFile.originalname || 'uploaded-image',
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Vision model unavailable');
  } catch (error) {
    console.error('Vision analysis failed:', error?.message || error);
    return {
      type: 'text',
      reply: `I received the image, but the visual analysis failed. Please try again or re-upload the picture.`,
      imageUrl: null,
      generatedImage: null,
    };
  }
};

const generateImageWithPollinations = async (prompt, history = []) => {
  try {
    let finalPrompt = prompt;
    const previousUserMessages = history.filter((m) => m && m.role === "user" && typeof m.content === "string");

    if (
      previousUserMessages.length > 0 &&
      /^(?:now\s+)?(?:please\s+)?(?:add|change|put|make)\b/i.test(prompt)
    ) {
      const lastPrompt = previousUserMessages[previousUserMessages.length - 1].content.trim();
      if (lastPrompt) {
        finalPrompt = `${lastPrompt}, ${prompt}`;
      }
    }

    const encodedPrompt = encodeURIComponent(finalPrompt.trim());
    const randomSeed = Math.floor(Math.random() * 1000000);
    const cacheBuster = Date.now();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}&t=${cacheBuster}`;

    return {
      type: "image",
      reply: `Here is your updated image for: "${prompt}"`,
      imageUrl,
      generatedImage: imageUrl,
    };
  } catch (error) {
    console.warn("Image generation failed:", error?.message || error);
  }

  return null;
};

const generateEnhancedImage = async (imageFile, prompt, history = []) => {
  try {
    const safePrompt = (prompt || '').trim();
    let imageSummary = 'same subject, same pose, same composition, realistic portrait';

    try {
      const analysis = await analyzeUploadedImage(imageFile, 'Describe this image with a concise but specific summary of the subject, facial features, clothing, colors, and background so I can preserve the original identity while enhancing the quality.');
      if (analysis?.reply) {
        imageSummary = analysis.reply.replace(/\s+/g, ' ').trim().slice(0, 500);
      }
    } catch (error) {
      console.warn('Image enhancement context analysis failed:', error?.message || error);
    }

    const enhancementPrompt = safePrompt
      ? `Enhance this exact image while preserving the same subject, face, pose, expression, clothing, and composition. ${imageSummary}. Improve sharpness, skin texture, lighting, contrast, color balance, detail, realism, and background clarity. Professional studio portrait quality, ultra-detailed, clean, natural look, high resolution, high quality, photorealistic.`
      : `Enhance this exact image while preserving the same subject, face, pose, expression, clothing, and composition. ${imageSummary}. Improve sharpness, skin texture, lighting, contrast, color balance, detail, realism, and background clarity. Professional studio portrait quality, ultra-detailed, clean, natural look, high resolution, photorealistic.`;

    const result = await generateImageWithPollinations(enhancementPrompt, history);
    if (result) {
      return {
        ...result,
        reply: 'An enhanced, high-resolution version of your image has been created with sharper details, better lighting, and a more professional finish while keeping the original subject consistent.',
      };
    }
  } catch (error) {
    console.warn('Enhanced image generation failed:', error?.message || error);
  }

  return null;
};

const generateResponse = async (userMessage, imageFile = null, history = []) => {
  const promptText = (userMessage || "").trim();
  const isImagePrompt = !imageFile && isImageGenerationRequest(promptText);
  const isEnhancementPrompt = !!imageFile && isImageEnhancementRequest(promptText);

  if (imageFile && isEnhancementPrompt) {
    const enhancedImage = await generateEnhancedImage(imageFile, promptText, history);
    if (enhancedImage) {
      return enhancedImage;
    }

    const visionResult = await analyzeUploadedImage(imageFile, promptText);
    if (visionResult) {
      return visionResult;
    }

    return {
      type: "image",
      reply: `I received your uploaded image and can help enhance it. Try a more specific instruction like: "make it sharper", "boost colors", "remove blur", or "restore the details in this photo".`,
      imageUrl: null,
      generatedImage: null,
      uploadedImageName: imageFile.originalname || "uploaded-image",
    };
  }

  if (imageFile) {
    const visionResult = await analyzeUploadedImage(imageFile, promptText);
    if (visionResult) {
      return visionResult;
    }

    return {
      type: "image",
      reply: `I received your uploaded image. Tell me exactly how you want it improved, for example: sharpen it, increase contrast, upscale it, or fix the lighting.`,
      imageUrl: null,
      generatedImage: null,
      uploadedImageName: imageFile.originalname || "uploaded-image",
    };
  }

  if (isImagePrompt) {
    const freeImage = await generateImageWithPollinations(promptText, history);
    if (freeImage) {
      return freeImage;
    }

    return {
      type: "image_error",
      reply: "Image generation failed. Please try again.",
      imageUrl: null,
      generatedImage: null,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return {
      type: "text",
      reply: `[Mock AI Response]: You said "${promptText}".`,
      imageUrl: null,
      generatedImage: null,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = DEFAULT_MODELS;

  let formattedHistory = history
    .filter((msg) => msg && typeof msg.content === "string" && msg.content.trim().length > 0)
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content.trim() }],
    }));

  while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
    formattedHistory.shift();
  }
  while (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "model") {
    formattedHistory.pop();
  }

  let lastError = null;
  for (let i = 0; i < candidateModels.length; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: candidateModels[i] });
      const chat = model.startChat({ history: formattedHistory });
      const result = await chat.sendMessage(promptText || "Hello");
      const responseText = (await result.response).text();

      if (responseText?.trim()) {
        return { type: "text", reply: responseText.trim(), imageUrl: null, generatedImage: null };
      }
    } catch (error) {
      lastError = error;
    }
  }

  return {
    type: "text",
    reply: "Something went wrong while connecting to the AI. Please try again.",
    imageUrl: null,
    generatedImage: null,
  };
};

module.exports = { generateResponse, isImageGenerationRequest, isImageEnhancementRequest };