// utils/ai.util.js
import { pipeline } from '@huggingface/transformers';

let extractor = null;

export const generateEmbedding = async (text) => {
  if (!text) return [];
  
  // Singleton pattern: Model bar bar load na ho, sirf pehli dafa ho
  if (!extractor) {
    console.log("⏳ Loading AI Embedding Model (Xenova/all-MiniLM-L6-v2)... This might take a few minutes on the first run as it downloads the model (~90MB).");
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (data) => {
        if (data.status === 'progress') {
          process.stdout.write(`\rDownloading ${data.file}... ${Math.round(data.progress)}%`);
        } else if (data.status === 'done') {
          console.log(`\n✅ Downloaded ${data.file}`);
        }
      }
    });
    console.log("✅ AI Embedding Model Loaded Successfully!");
  }
  
  // Text ko vector mein convert karna (384 dimensions)
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};
