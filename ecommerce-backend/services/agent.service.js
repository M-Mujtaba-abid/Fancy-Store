import { tool } from "@langchain/core/tools";
import { z } from "zod";
// import { sequelize } from "../config/db.js";
import { generateEmbedding } from "../utils/ai.util.js";
import { ChatGroq } from "@langchain/groq";
import sequelize from "../config/db.js";
import { getOrdersService, placeOrderService } from "./order.service.js";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
// ==========================================
// 1. CREATE THE SEARCH TOOL (RAG RETRIEVAL)
// ==========================================
const searchStoreTool = tool(
  async ({ searchQuery }) => {
    console.log(`🔍 AI is searching for: "${searchQuery}"`);

    try {
      // User ki query (e.g., "civic cover") ko vector mein convert karein
      const queryVector = await generateEmbedding(searchQuery);
      const vectorString = `[${queryVector.join(",")}]`;

      // SQL Query: Hybrid Search (Vector Similarity + Category Filter)
      let sqlQuery = `
        SELECT id, name, description, price, category, stock, "averageRating", 
               1 - (embedding <=> :vector) AS similarity_score
        FROM "Products"
        WHERE embedding IS NOT NULL
      `;

      const replacements = { vector: vectorString };
      // Note: Removed strict category ILIKE filtering here. Vector similarity naturally handles 
      // semantic concepts like 'mehran car cover' much better than strict text matching.

      // Sab se best matching 2 products nikal kar layein taa k tokens bach sakein
      sqlQuery += ` ORDER BY embedding <=> :vector LIMIT 2;`;

      const [results] = await sequelize.query(sqlQuery, { replacements });

      if (results.length === 0) {
        return "No exact products found. Tell the user we are out of stock for this specific item but ask if they want something else.";
      }
      // 👇 NAYA CODE: Data ko clean karna taa ke Tokens zaya na hon
      const cleanResults = results.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        stock: product.stock,
        rating: product.averageRating,
        // similarity_score: product.similarity_score // AI ko score janne ki zaroorat nahi
      }));

      // AI ko DB ka result return karein
      return JSON.stringify(cleanResults);
    } catch (error) {
      console.error("Tool Error:", error);
      return "Error connecting to the database.";
    }
  },
  {
    name: "search_store",
    description: "Search the Fancy Store database for ANY automotive accessory. Our available categories are: car top covers, bike top covers, scooty top covers, steering covers, seat covers, dashboard mats, cow floor mats, and car foot mats. ALWAYS use this tool to check inventory before answering and price return in Pak Rupees Currency(Rs.).",
    schema: z.object({
      searchQuery: z.string().describe("The specific product to search for (e.g., 'Corolla top cover')"),
    }),
  }
);


// ==========================================
// 2. GET BEST SELLERS TOOL (Top Rated)
// ==========================================
const getBestSellersTool = tool(
  async ({ category }) => {
    console.log(`📈 Fetching best sellers for category: ${category || 'All'}`);
    try {
      let sqlQuery = `
        SELECT id, name, price, "averageRating", "totalReviews" 
        FROM "Products"
        WHERE stock > 0
      `;
      const replacements = {};

      if (category && category !== "All") {
        sqlQuery += ` AND category ILIKE :category`;
        replacements.category = `%${category}%`;
      }

      // Sab se achi rating aur reviews wali top 3 items
      sqlQuery += ` ORDER BY "averageRating" DESC, "totalReviews" DESC LIMIT 3;`;

      const [results] = await sequelize.query(sqlQuery, { replacements });

      if (results.length === 0) return "No best sellers found currently.";
      return JSON.stringify(results);
    } catch (error) {
      console.error("Best Sellers Tool Error:", error);
      return "Error fetching best sellers.";
    }
  },
  {
    name: "get_best_sellers",
    description: "Use this tool ONLY when the user explicitly asks for 'top selling', 'best', 'highest rated', or 'most popular' products.",
    schema: z.object({
      category: z.enum(["All", "floor_mat", "trunk_tray", "dashboard_mat", "seat_cover", "steering_cover", "car_topCover", "bike_topCover"])
        .default("All")
        .describe("The exact database category if mentioned, otherwise 'All'"),
    }),
  }
);

// ==========================================
// 3. PLACE ORDER TOOL (Transaction)
export const createPlaceOrderTool = (userId) => {
  return tool(
    async (orderDataFromAI) => {
      // 🛑 NAYA CHECK: User logged in nahi hai to rok dein
      if (!userId) {
        return "FAILED: User is not logged in. You cannot place an order for a guest. Please apologize and tell the user they must login or create an account first to place an order through chat.";
      }

      console.log(`🛒 AI is placing order for Product ID: ${orderDataFromAI.buyNowProductId}`);

      try {

        // 👇 1. NAYA VALIDATION CHECK ADD KAREIN
        const { fullName, phoneNumber, email, address, city, postalCode } = orderDataFromAI;

        const allValues = [fullName, phoneNumber, email, address, city, postalCode].map(v => (typeof v === 'string' ? v.toLowerCase() : ""));
        const hasPlaceholders = allValues.some(v => v.includes("insert") || v.includes("dummy") || v.includes("placeholder") || v.includes("your"));

        // Agar AI ne koi string khali chhodi hai ya placeholder daala hai, to fauran order rok dein
        if (!fullName || !phoneNumber || !email || !address || !city || !postalCode || hasPlaceholders) {
          console.log("❌ AI tried to place order with missing or placeholder details.");
          return "FAILED: You cannot place the order with empty or placeholder details. Stop calling this tool. Review the conversation history carefully and extract the ACTUAL Name, Phone, Email, Address, City, and Postal Code provided by the user. If they haven't provided them all, explicitly ask the user for the missing details.";
        }
        // AI se aane wale data ko aapki service ke format ke mutabiq set kar rahe hain
        const orderData = {
          ...orderDataFromAI,
          paymentMethod: "COD", // Default COD for chat orders
          country: "Pakistan",  // Default country
        };

        // Service call (userId pass kar rahe hain, agar guest hai to null chala jayega)
        const result = await placeOrderService(userId || null, orderData);

        return `SUCCESS! Order placed successfully. The Order ID is #${result.orderId}. Tell the user their order is confirmed, emails have been sent, and it will be dispatched soon on COD.`;

      } catch (error) {
        console.error("Tool Error (Place Order):", error);
        // Agar stock khatam ho ya validation error ho
        const errorMessage = error.message || "Unknown error occurred while placing order.";
        return `FAILED to place order. Reason: ${errorMessage}. Apologize to the customer and ask if they want to try something else.`;
      }
    },
    {
      name: "place_order",
      description: "Place a direct order in the database. ONLY call this when the user has confirmed they want to buy AND has provided all 6 required personal details.",
      schema: z.object({
        // 👇 CRITICAL: AI ko strictly bata diya ke ID kahan se leni hai
        buyNowProductId: z.number().describe("The EXACT numeric 'id' of the product from the search_store results. NEVER guess or use 0."),
        buyNowQuantity: z.number().optional().default(1).describe("Quantity they want to buy"),
        fullName: z.string().describe("Customer's full name"),
        phoneNumber: z.string().describe("Customer's phone number"),
        email: z.string().describe("Customer's email address"),
        address: z.string().describe("Customer's complete street address"),
        city: z.string().describe("Customer's city"),
        postalCode: z.string().describe("Customer's postal/zip code"),
      }),
    }
  );
};


// 4. CHECK ORDER STATUS TOOL (Using Existing Service)
const createCheckOrderStatusTool = (userId) => {
  return tool(
    async ({ orderId }) => {
      console.log(`📦 AI is checking orders for User ID: ${userId}, Specific Order: ${orderId || 'Latest'}`);

      try {
        // 1. Agar user logged in nahi hai (userId null hai)
        if (!userId) {
          return "FAILED: User is not authenticated. Ask the user to kindly log in first to check their order details.";
        }

        // 2. Aapki existing service call kar di! 🚀
        const orders = await getOrdersService(userId);

        if (!orders || orders.length === 0) {
          return "Tell the user: You don't have any previous orders in your account.";
        }

        let targetOrder;

        // 3. Agar AI ne specific ID bheji hai to wo dhundhein, warna sab se latest order utha lein
        if (orderId) {
          targetOrder = orders.find(o => o.id === orderId);
          if (!targetOrder) {
            return `Tell the user: No order found with ID #${orderId}. Your latest order is #${orders[0].id}.`;
          }
        } else {
          targetOrder = orders[0]; // array ka pehla (latest) order kyunke DESC sort hai
        }

        // 4. Format Data for AI
        const orderDate = new Date(targetOrder.createdAt).toLocaleDateString();

        // Items ke naam extract karein taa ke AI user ko bata sake ke box mein kya hai
        const itemsList = targetOrder.OrderItems
          ? targetOrder.OrderItems.map(item => `${item.Product?.name} (x${item.quantity})`).join(", ")
          : "Items";

        return `SUCCESS! Tell the user: Order #${targetOrder.id} containing [${itemsList}] was placed on ${orderDate}. The current status is '${targetOrder.status}'. Total amount is ${targetOrder.totalAmount} PKR on ${targetOrder.paymentMethod}.`;

      } catch (error) {
        console.error("Order Status Tool Error:", error);
        return "Error fetching order status. Apologize to the user.";
      }
    },
    {
      name: "check_order_status",
      description: "Use this tool to check the status, delivery, or details of a user's previously placed order.",
      schema: z.object({
        orderId: z.number().optional().describe("The exact Order ID if the user mentions it (e.g., 97). Leave empty to fetch their latest order automatically."),
      }),
    }
  );
};

export const chatWithAgent = async (
  userMessage,
  chatHistory = [],
  userId,
  userContext
) => {
  // Prevent users from sending massive messages that eat up tokens
  const safeUserMessage = userMessage.substring(0, 300);
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    // model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    maxTokens: 1024,
    maxRetries: 2,
  });

  const tools = [
    searchStoreTool,
    getBestSellersTool,
    createPlaceOrderTool(userId),
    createCheckOrderStatusTool(userId),
  ];

  // Fix: Use bindTools which automatically converts Zod schemas to valid JSON Schemas
  const llmWithTools = llm.bindTools(tools);

  let userContextString = "";

  if (userContext?.userName) {
    userContextString = `
Authenticated Customer Context:
- Name: ${userContext.userName}
- Recent Orders: ${userContext.recentOrdersText || "No recent orders"}

Address them politely by name.
`;
  }

  // const systemPrompt = `
  // You are the official AI Sales Agent for Fancy Store ([www.fancystore.store](http://www.fancystore.store)).

  // Rules:
  // - ONLY answer automotive/store/order questions.
  // - Use search_store before recommending products.
  // - Use get_best_sellers for top/popular products.
  // - Use place_order ONLY after getting:
  //   Full Name, Phone, Email, Address, City, Postal Code.
  // - Never invent products/prices/IDs.
  // - Always use real DB product IDs.
  // - Include product links:
  //   http://localhost:3000/products/[id]
  // - Use markdown formatting.
  // - Speak naturally in short English/Roman Urdu.
  // - Refuse unrelated topics politely.

  // ${userContextString}
  // `;
const systemPrompt = `
You are the official AI Sales Agent for Fancy Store (www.fancystore.store).

CRITICAL RULES:
1. STRICT DOMAIN LIMIT: You ONLY answer questions related to Fancy Store, automotive accessories, products, and the user's orders. Decline unrelated topics politely.
2. NO HIDDEN TOOLS: NEVER mention your internal tool names (like 'search_store') to the customer.
3. COMMON SENSE PRODUCT MATCHING (NO CONTRADICTIONS):
   - If the search results contain the item the user asked for (even with a slightly different name), CONFIDENTLY recommend it.
   - If the user asks for a specific vehicle cover (e.g., 'Aqua') and results show completely different vehicles (e.g., 'Mehran'), politely apologize. DO NOT offer a Mehran cover to an Aqua owner.
   - NEVER contradict yourself (e.g., absolutely NEVER say "We don't have X, but we have X").
4. DYNAMIC CLICKABLE LINKS: Whenever you mention a product, provide its markdown link EXACTLY like this: [Actual Name of the Product](https://www.fancystore.store/products/[id]) (replace [id] with the real ID).
5. BEAUTIFUL FORMATTING: Use Markdown. Use bullet points and bold text for readability.
6. MANDATORY SEARCH: You MUST use the 'search_store' tool to fetch the exact ID and details from the database before recommending any product. Never guess.
7. ORDER FLOW: ONLY ask for delivery details AFTER the user explicitly agrees to buy a specific product. Ask for all missing details in a SINGLE message.
8. TOOL SYNTAX SAFETY: NEVER output raw XML, HTML, or tags like <function=...> in your response. Rely strictly on the standard tool calling mechanism. Do NOT combine tool names and JSON arguments in a single string.
9. MULTIPLE ITEMS HANDLING: The 'place_order' tool can only process ONE item at a time. If the user wants to buy "both" or multiple items, process them ONE BY ONE. Tell the user: "I will place the order for the first item now. Once confirmed, we can place the order for the second item." NEVER try to cram multiple items into a single tool call.
10. PRICING DISPLAY: Always mention prices clearly in "PKR" (e.g., 2000 PKR). If a product has a sale/discounted price available, ALWAYS show the sale price to the customer and ignore the original higher price.

${userContextString}
`;
  const messages = [
    new SystemMessage(systemPrompt),

    ...chatHistory.slice(-4)
      // 👈 CRITICAL FIX: Ignore past messages that have the XML error so the model doesn't copy the mistake
      .filter(m => typeof m.content === "string" && !m.content.includes("<function="))
      .map((m) =>
        m.role === "assistant"
          ? new AIMessage(m.content)
          : new HumanMessage(m.content)
      ),

    new HumanMessage(safeUserMessage),
  ];

  // FIRST MODEL CALL
  let response = await llmWithTools.invoke(messages);

  console.log("FULL RESPONSE:");
  console.dir(response, { depth: null });
  // ADD AI RESPONSE
  messages.push(response);

  // HANDLE TOOL CALLS (Robust loop)
  const MAX_ITERATIONS = 5;
  let iterations = 0;

  while (response.tool_calls && response.tool_calls.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    for (const toolCall of response.tool_calls) {
      let toolResult;

      try {
        switch (toolCall.name) {
          case "search_store":
            toolResult = await searchStoreTool.invoke(toolCall.args);
            break;
          case "get_best_sellers":
            toolResult = await getBestSellersTool.invoke(toolCall.args);
            break;
          case "place_order":
            toolResult = await tools[2].invoke(toolCall.args);
            break;
          case "check_order_status":
            toolResult = await tools[3].invoke(toolCall.args);
            break;
          default:
            toolResult = "Unknown tool";
        }
      } catch (error) {
        console.error(`Error executing tool ${toolCall.name}:`, error);
        toolResult = `Error: ${error.message}`;
      }

      // IMPORTANT: Append the result using a ToolMessage
      messages.push(
        new ToolMessage({
          tool_call_id: toolCall.id,
          name: toolCall.name,
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
        })
      );
    }

    // NEXT MODEL CALL
    response = await llmWithTools.invoke(messages);
    messages.push(response);
  }

  return response.content;
};