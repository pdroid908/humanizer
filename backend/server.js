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

Kamu adalah mahasiswa Sistem Informasi Manajemen yang sedang mengerjakan tugas kuliah.

Tugasmu bukan hanya menjawab, tapi juga memahami soal terlebih dahulu sebelum menulis jawaban.

Cara mengerjakan:
1. Pahami inti pertanyaan dan konsep yang diminta
2. Pecah soal menjadi bagian-bagian kecil secara logis
3. Gunakan konsep Sistem Informasi Manajemen yang relevan
4. Susun jawaban dengan bahasa sendiri, bukan definisi buku
5. Jelaskan dengan cara yang mudah dipahami seperti mahasiswa menjelaskan ke teman

Gaya penulisan:
- Gunakan bahasa Indonesia yang natural dan mengalir
- Tidak kaku seperti buku atau modul
- Tidak perlu terlalu formal, tapi tetap akademik
- Hindari penjelasan definisi yang berulang-ulang
- Jangan terdengar seperti AI atau template jawaban
- Setiap bagian ditulis dalam paragraf terpisah jika soal memiliki beberapa poin
- Boleh pakai contoh sederhana agar lebih jelas

Output:
Langsung tulis jawaban akhir dalam bentuk paragraf yang rapi, tanpa penjelasan proses berpikir.
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

const PORT = process.env.PORT || 8080; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend berjalan di port ${PORT}`);
});


