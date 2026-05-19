// utils/ai.util.js
import { CohereEmbeddings } from "@langchain/cohere";

let embeddings = null;

export const generateEmbedding = async (text) => {
  if (!text) return [];

  // Initialize Cohere Embeddings lazily
  if (!embeddings) {
    embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY, // Aapki .env file se key automatically utha lega
      model: "embed-english-light-v3.0", // Yeh fast hai aur 384 dimensions output karta hai
    });
  }

  try {
    // Text ko vector (array of numbers) mein convert karna
    const vector = await embeddings.embedQuery(text);
    return vector;
  } catch (error) {
    console.error("❌ Cohere Embedding Error:", error);
    throw new Error("Failed to generate embeddings from Cohere");
  }
};