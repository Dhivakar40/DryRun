require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    console.log("Fetching available models...");
    // This lists specifically the models your key can access
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; 
    // Actually, the SDK doesn't have a clean 'listModels' in the lightweight client, 
    // so let's just brute force test the most common ones.

    const candidates = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];

    for (const m of candidates) {
       try {
          process.stdout.write(`Testing ${m}... `);
          const model = genAI.getGenerativeModel({ model: m });
          await model.generateContent("Hi");
          console.log("WORKS!");
       } catch (e) {
          console.log("FAILED (404/403)");
       }
    }
  } catch (e) {
    console.error(e);
  }
}
main();