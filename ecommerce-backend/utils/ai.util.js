// utils/ai.util.js — Cohere HTTP API (no local ML / onnxruntime)

const COHERE_EMBED_URL = "https://api.cohere.com/v1/embed";
const EMBED_MODEL = "embed-english-light-v3.0";

export const generateEmbedding = async (text, inputType = "search_query") => {
  if (!text) return [];

  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not configured");
  }

  try {
    const response = await fetch(COHERE_EMBED_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: [text],
        model: EMBED_MODEL,
        input_type: inputType,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Cohere API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const vector = data.embeddings?.[0];
    if (!vector?.length) {
      throw new Error("Cohere returned no embedding vector");
    }
    return vector;
  } catch (error) {
    console.error("❌ Cohere Embedding Error:", error);
    throw new Error("Failed to generate embeddings from Cohere");
  }
};
