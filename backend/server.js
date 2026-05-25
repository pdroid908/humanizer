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
  origin: 'https://humanizer-638.pages.dev/', // HANYA website ini yang boleh akses
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

Tulis ulang teks berikut agar terdengar alami seperti tulisan manusia.

Aturan:
- Pertahankan makna asli.
- Variasikan panjang dan struktur kalimat.
- Hindari frasa khas AI dan kalimat yang terlalu formal atau terlalu rapi.
- Jangan menambah informasi baru.
- buat buritnes nya meningkat 50% dari teks asli
- Jika teks bukan artikel, opini, penjelasan, atau pembahasan, kembalikan apa adanya.
- Output hanya hasil akhir, tanpa komentar atau penjelasan.

Teks:
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend berjalan di port ${PORT}`);
});



