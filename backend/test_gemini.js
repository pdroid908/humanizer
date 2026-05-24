require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    try {
        console.log("Mencoba menghubungkan ke Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
        
        const result = await model.generateContent("Halo, apakah API key ini bekerja?");
        console.log("✅ BERHASIL! AI menjawab:", result.response.text());
    } catch (error) {
        console.error("❌ GAGAL! Error-nya adalah:", error.message);
    }
}

testConnection();