// utils/ai.util.js
import { CohereEmbeddings } from "@langchain/cohere";

// Initialize Cohere Embeddings
const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY, // Aapki .env file se key automatically utha lega
  model: "embed-english-light-v3.0", // Yeh fast hai aur 384 dimensions output karta hai
});

export const generateEmbedding = async (text) => {
  if (!text) return [];

  try {
    // Text ko vector (array of numbers) mein convert karna
    const vector = await embeddings.embedQuery(text);
    return vector;
  } catch (error) {
    console.error("❌ Cohere Embedding Error:", error);
    throw new Error("Failed to generate embeddings from Cohere");
  }
};