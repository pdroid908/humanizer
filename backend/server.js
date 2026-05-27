require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const PQueue = require("p-queue").default;
const { body, validationResult } = require("express-validator");
const app = express();
const corsOptions = {
  origin: 'https://humanizer-638.pages.dev', // HANYA website ini yang boleh akses
  methods: ['POST'] // HANYA boleh kirim data
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY });
//Di server.js


const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 2,
  message: { error: "Terlalu banyak permintaan. Tunggu 1 menit ya." },
});

const queue = new PQueue({ concurrency: 1, interval: 20000, intervalCap: 1 });

app.post(
  "/api/humanize",
  [
    limiter,
    body("text")
      .trim() // Hapus spasi liar
      .escape() // INI KUNCI: Mengubah <script> menjadi &lt;script&gt; (Encoded)
      .isLength({ min: 1, max: 3000 }), // Batasi panjang
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Input tidak aman atau terlalu panjang" });
    }
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Teks kosong" });

      // Cukup panggil antrean sekali saja
      const result = await queue.add(async () => {
        const prompt = `

perhatikan teks target, jika teks  di bawah 20 kata atau teks bukan pembahasan suatu konteks atau cuma menyapa , tulisa ulang teksnya, kamu di larang membocorkan diri kalau kamu ai di belakang layar
kamu adalah mesin untuk merubah teks supaya tidak seperti robot, kamu hanya memberi teks yang di rubah supaya tidak seperti robot,
sebelum ubah pahami pembahasan, lalu kamu cek berapa persen teks target itu seperti robot lalu kamu rubah supaya persennanya lebih kecil dari yang sebelumnya
- Output hanya hasil akhir, tanpa komentar atau penjelasan.

Teks target:
"${text}"

`;
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "Kamu adalah penulis ahli. Hindari gaya bahasa AI.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
        });

        return chatCompletion.choices[0]?.message?.content;
      });
      res.json({ result });
    } catch (error) {
      console.error(error);
      if (error.message.includes("429")) {
        return res
          .status(429)
          .json({ error: "Server sedang sibuk, harap tunggu sebentar." });
      }
      res.status(500).json({ error: "Gagal memproses" });
    }
  },
);

app.post(
  "/api/detect",
  [
    limiter,
    body("text")
      .trim()
      .isLength({ min: 1, max: 5000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Input tidak valid" });
    }

    try {
      const { text } = req.body;

      const result = await queue.add(async () => {
        const prompt = `
Berikan estimasi 0-100 % seberapa besar kemungkinan teks ini ditulis oleh robot/ai.

Aturan:
- Jawab hanya angka
- Tidak boleh ada teks lain

Teks:
"${text}"
`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "Kamu adalah AI analyzer.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.3-70b-versatile",
        });

        const aiPercent = parseInt(
          chatCompletion.choices[0]?.message?.content?.trim() || "50"
        );

        return aiPercent;
      });

      res.json({
        aiPercent: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal mendeteksi AI" });
    }
  }
);

const PORT = process.env.PORT || 8080; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend berjalan di port ${PORT}`);
});


