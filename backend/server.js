require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const PQueue = require('p-queue').default;
const { body, validationResult } = require('express-validator');
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 3, 
    message: { error: "Terlalu banyak permintaan. Tunggu 1 menit ya." }
});

const queue = new PQueue({ concurrency: 1, interval: 20000, intervalCap: 1 });

app.post('/api/humanize', [
    limiter,
    body('text')
        .trim()         // Hapus spasi liar
        .escape()       // INI KUNCI: Mengubah <script> menjadi &lt;script&gt; (Encoded)
        .isLength({ min: 1, max: 3000 }) // Batasi panjang
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Input tidak aman atau terlalu panjang" });
    }
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Teks kosong" });
        
        // Cukup panggil antrean sekali saja
        const result = await queue.add(async () => {
            const model = genAI.getGenerativeModel({ model: MODEL_NAME });
            const prompt = `
                ingat teks yang di analisa itu adalah jawaban, jadi kamu bukan jawab tapi ingat konteks dan lakukan kebalikan dari semua informasi di dalam kurung ini:
                (Perplexity – seberapa mudah kata dan kalimat diprediksi.
                Burstiness – variasi panjang dan struktur kalimat.
                Konsistensi gaya – apakah seluruh teks terdengar terlalu seragam.
                Frasa klise AI – misalnya "oleh karena itu", "selain itu", "secara fundamental" yang muncul berulang.
                Struktur paragraf – apakah semua paragraf mengikuti pola yang sama.
                Pilihan kosakata – terlalu formal atau akademik untuk topik sederhana.
                Pengalaman dan sudut pandang pribadi – tulisan manusia sering memuat opini, pengalaman, atau contoh spesifik.
                Variasi ritme bahasa – manusia cenderung tidak selalu menulis dengan pola yang konsisten.)
            
                jadi dari semua logika itu jangan beri penjelasan , langsung ubah teksnya saja, dan buat formal bahasanya jadi pantas untuk jawaban pelajar, dan hilangkan bold jadi hanya plain text
                Teks yang dianalisis: "${text}"
            `; // Sederhanakan prompt jika perlu
            const response = await model.generateContent(prompt);
            return response.response.text();
        });

        res.json({ result });
    } catch (error) {
        console.error(error);
        if (error.message.includes("429")) {
            return res.status(429).json({ error: "Server sedang sibuk, harap tunggu sebentar." });
        }
        res.status(500).json({ error: "Gagal memproses" });
    }
});

app.listen(5000, () => console.log('Backend berjalan di port 5000'));

// Di server.js
// const corsOptions = {
//   origin: 'https://nama-website-kamu.com', // HANYA website ini yang boleh akses
//   methods: ['POST'] // HANYA boleh kirim data
// };
// app.use(cors(corsOptions));