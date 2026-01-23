const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkAvailableModels() {
  console.log("🔍 Checking available models for your API Key...");
  try {
    // This is a special hidden method to fetch the model list
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("✅ SUCCESS! Here are the valid model names you can use:");
    console.log("------------------------------------------------");
    
    // Filter for models that support 'generateContent'
    const validModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    validModels.forEach(model => {
      // We strip the "models/" prefix so you see just the name to use
      console.log(`Model Code: "${model.name.replace('models/', '')}"`);
    });
    console.log("------------------------------------------------");

  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

checkAvailableModels();