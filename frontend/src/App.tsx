import React, { useState, useEffect } from "react";
const HumanizeTool: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Efek Timer: Error hilang otomatis setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // 5000 ms = 5 detik
      return () => clearTimeout(timer); // Bersihkan timer jika komponen unmount
    }
  }, [error, setError]);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Teks input tidak boleh kosong. Silakan masukkan sesuatu.");
      return;
    }

    if (inputText.length > 3000) {
      setError("Teks terlalu panjang. Maksimal 3000 karakter.");
      return;
    }
 
    setIsLoading(true);
    setError(null);
    setOutputText(""); // Reset hasil sebelumnya

    try {
      // Menghubungkan ke backend kita di port 5000
      const response = await fetch("humanizer-production-1a4c.up.railway.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }), // Mengirim teks ke backend
      });

      // A. Menangani Error dari Backend (Misal: 400 Bad Request, 500 Internal Server)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("API tidak ditemukan (404). Periksa konfigurasi URL.");
        } else if (response.status === 429) {
          throw new Error("Terlalu banyak request, tunggu sebentar ya!");
        } else if (response.status >= 500) {
          throw new Error("Server AI sedang bermasalah. Coba lagi nanti.");
        } else {
          throw new Error("Terjadi kesalahan pada permintaan Anda.");
        }
      }
      const data = await response.json();
      setOutputText(data.result); // Menampilkan hasil dari backend ke UI
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="absolute bottom-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-7xl rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.4)] p-5 sm:p-6 md:p-10">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs sm:text-sm tracking-widest uppercase">
            ✨ AI Powered Humanizer
          </div>
         

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
            AI Humanizer
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed px-2">
            Transform AI-generated text into smooth, natural, and human-like
            writing with modern intelligence.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INPUT */}
          <div className="flex flex-col order-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-base sm:text-lg">
                Input Text
              </h2>

              <span className="text-white/40 text-xs sm:text-sm">
                {inputText.length} chars
              </span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your AI generated text here..."
              className="
                w-full
                h-[280px]
                sm:h-[320px]
                md:h-[380px]
                rounded-3xl
                bg-slate-900/80
                border
                border-white/10
                p-5
                text-white
                text-sm
                sm:text-base
                leading-7
                placeholder:text-gray-500
                resize-none
                outline-none
                focus:ring-2
                focus:ring-cyan-400
                focus:border-cyan-400
                transition-all
                duration-300
                shadow-inner
              "
            />
          </div>

          <button
            onClick={handleHumanize}
            disabled={isLoading}
            className="
    order-2
    lg:hidden
    w-full
    py-4
    rounded-3xl
    bg-gradient-to-r
    from-cyan-400
    via-blue-500
    to-indigo-500
    text-white
    font-bold
  "
          >
            {isLoading ? "Processing..." : "✨ Humanize Now"}
          </button>

          {/* OUTPUT */}
          <div className="flex flex-col order-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-base sm:text-lg">
                Humanized Result
              </h2>

              {outputText && (
                <button
                  onClick={() => navigator.clipboard.writeText(outputText)}
                  className="
                    text-cyan-300
                    hover:text-cyan-200
                    text-xs
                    sm:text-sm
                    transition
                  "
                >
                  Copy
                </button>
              )}
            </div>

            <div
              className="
                w-full
                h-[280px]
                sm:h-[320px]
                md:h-[380px]
                rounded-3xl
                bg-slate-900/80
                border
                border-white/10
                p-5
                overflow-auto
                shadow-inner
              "
            >
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-5">
                  <div className="relative">
                    <div className="w-14 h-14 border-4 border-cyan-500/20 rounded-full"></div>

                    <div className="absolute top-0 left-0 w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  <p className="text-white/60 text-sm sm:text-base animate-pulse">
                    Humanizing your content...
                  </p>
                </div>
              ) : outputText ? (
                <p className="text-gray-100 leading-8 whitespace-pre-wrap text-sm sm:text-base">
                  {outputText}
                </p>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-500 text-sm sm:text-base px-4">
                  ✨ Your beautifully humanized text will appear here...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="hidden lg:block mt-7">
          <button
            onClick={handleHumanize}
            disabled={isLoading}
            className="
      w-full
      py-4
      sm:py-5
      rounded-3xl
      bg-gradient-to-r
      from-cyan-400
      via-blue-500
      to-indigo-500
      text-white
      font-bold
    "
          >
            {isLoading ? "Processing..." : "✨ Humanize Now"}
          </button>
        </div>
      </div>

      {/* Area Pesan Error Floating */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="p-4 bg-slate-900 border border-red-500/50 text-red-400 rounded-2xl flex items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-top-5 fade-in">
            <div className="flex items-center gap-3">
              <span>⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>

            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 transition-colors font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanizeTool;
