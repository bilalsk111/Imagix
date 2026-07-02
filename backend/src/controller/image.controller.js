import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// OpenRouter client — for prompt enhancement only (free model)
const openRouterApi = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Pollinations.AI client — free, no key needed
const pollinationsApi = axios.create({
  baseURL: "https://image.pollinations.ai",
  timeout: 120000, // 2 min — image gen can be slow
  responseType: "arraybuffer",
});

/**
 * POST /api/image/generate
 * Body: { prompt: string, enhancePrompt?: boolean }
 * Response: { success: true, data: { image: "data:image/jpeg;base64,...", usedPrompt, enhanced } }
 */
export const generateImage = async (req, res) => {
  const { prompt, enhancePrompt = false } = req.body;

  // --- Validation ---
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: "prompt is required and must be a non-empty string.",
    });
  }

  let usedPrompt = prompt.trim();
  let enhanced = false;

  // --- Step 1: Optionally enhance with free LLM ---
  if (enhancePrompt) {
    try {
      console.log("[enhancer] Enhancing prompt using free Llama model...");

      const enhanceRes = await openRouterApi.post("/chat/completions", {
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert AI Image Prompt Engineer specializing in Midjourney v6.
- Output EXACTLY ONE single paragraph using comma-separated tokens. No full sentences.
- Never include introductions, explanations, or markdown.
- Describe textures, lighting, and camera gear naturally.
- Order: Subject, Environment, Style, Lighting, Camera/Lens, Color Palette.
- Always end with: --ar 16:9 --style raw`,
          },
          {
            role: "user",
            content: `Create a premium image prompt for: "${usedPrompt}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      const enhanced_text =
        enhanceRes.data?.choices?.[0]?.message?.content?.trim();

      if (enhanced_text) {
        usedPrompt = enhanced_text;
        enhanced = true;
        console.log("[enhancer] Enhanced prompt ready.");
      } else {
        console.warn("[enhancer] Empty response — using original prompt.");
      }
    } catch (enhanceErr) {
      const detail = enhanceErr?.response?.data || enhanceErr.message;
      console.error("[enhancer] Failed:", detail);
      // Non-fatal — fall through with original prompt
    }
  }

  // --- Step 2: Generate image via Pollinations.AI (free, no key needed) ---
  try {
    // Strip Midjourney params like --ar 16:9 --style raw (Pollinations doesn't support them)
    const cleanPrompt = usedPrompt.replace(/--\w+[\s\w:.]*/g, "").trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);

    console.log(`[pollinations] Generating image for: "${cleanPrompt.substring(0, 80)}..."`);

    const imageRes = await pollinationsApi.get(
      `/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${Math.floor(Math.random() * 99999)}`
    );

    // Convert arraybuffer → base64 data URL
    const base64 = Buffer.from(imageRes.data).toString("base64");
    const contentType = imageRes.headers["content-type"] || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log("[pollinations] Image generated successfully.");

    return res.status(200).json({
      success: true,
      data: {
        image: dataUrl,
        usedPrompt,
        enhanced,
      },
    });
  } catch (err) {
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || err.message;
    console.error(`[pollinations] Error (${status}):`, detail);

    return res.status(500).json({
      success: false,
      message: "Image generation failed.",
      error: err.message,
    });
  }
};

/**
 * POST /api/image/enhance
 * Body: { prompt: string }
 * Response: { success: true, data: { enhancedPrompt: "..." } }
 */
export const enhancePromptOnly = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      message: "prompt is required and must be a non-empty string.",
    });
  }

  try {
    const enhanceRes = await openRouterApi.post("/chat/completions", {
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        {
          role: "system",
          content: `You are an expert AI Image Prompt Engineer specializing in Midjourney v6.
- Output EXACTLY ONE single paragraph using comma-separated tokens. No full sentences.
- Never include introductions, explanations, or markdown.
- Describe textures, lighting, and camera gear naturally.
- Order: Subject, Environment, Style, Lighting, Camera/Lens, Color Palette.
- Always end with: --ar 16:9 --style raw`,
        },
        {
          role: "user",
          content: `Create a premium image prompt for: "${prompt.trim()}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const enhanced_text = enhanceRes.data?.choices?.[0]?.message?.content?.trim();

    if (enhanced_text) {
      return res.status(200).json({
        success: true,
        data: { enhancedPrompt: enhanced_text },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Could not enhance prompt.",
      });
    }
  } catch (enhanceErr) {
    console.error("[enhancer] Failed:", enhanceErr?.response?.data || enhanceErr.message);
    return res.status(500).json({
      success: false,
      message: "Enhancement API failed.",
      error: enhanceErr.message,
    });
  }
};
