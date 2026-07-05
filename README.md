# 🤖 AI Humanizer

An AI-powered web application that transforms AI-generated text into more natural, human-like writing.

The project consists of a **React frontend** and an **Express.js backend** in a single repository. The frontend provides a clean and responsive interface, while the backend securely processes requests through the Groq API with built-in security, validation, and rate limiting.

---

## ✨ Features

- AI Text Humanization
- Modern Responsive UI
- Secure REST API
- Input Validation
- Rate Limiting
- Request Queue
- Security Headers
- CORS Protection
- Copy-to-Clipboard
- Error Handling

---

# 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Fetch API

### Backend

- Node.js
- Express.js
- Groq API
- Helmet
- CORS
- express-rate-limit
- express-validator
- PQueue
- dotenv

---

# 📂 Project Structure

```text
humanizer/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── ...
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/pdroid908/humanizer.git

cd humanizer
```

## Backend

```bash
cd backend

npm install

npm start
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Security

The backend includes several security mechanisms:

- HTTP Security Headers (Helmet)
- CORS Configuration
- Request Rate Limiting
- Request Queue Management
- Input Validation
- Input Sanitization
- Request Size Limiting
- Environment Variables
- Graceful Error Handling

---

# ⚙️ Environment Variables

```env
GEMINI_API_KEY=your_api_key
PORT=8080
```

---

# 🔄 Application Flow

```text
User
   │
   ▼
React Frontend
   │
POST /api/humanize
   │
   ▼
Express Backend
   │
Validate Request
   │
Queue Request
   │
Groq API
   │
Humanized Text
   ▼
Frontend
```

---

# 🎯 Project Goals

- Build a secure AI-powered web application.
- Practice frontend and backend integration.
- Implement production-ready API security.
- Create a responsive user experience.
- Explore LLM integration using Groq.

---

# 📌 Future Improvements

- Authentication
- User History
- Multiple AI Models
- Usage Analytics
- Export Results
- API Documentation
- Docker Support

---

# 👨‍💻 Author

**Putra Rohman**

Backend & Full Stack Developer

**Core Skills**

- Go
- TypeScript
- Node.js
- Express.js
- React
- PostgreSQL
- Redis
- Docker
- REST API

GitHub

https://github.com/pdroid908

---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

## License

This project is licensed under the MIT License.
