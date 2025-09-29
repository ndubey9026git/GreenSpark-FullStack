GreenSpark FullStack (Prototype)
================================

Structure:
- backend/  (Express + MongoDB)
- frontend/ (Vite + React + Tailwind)

Quick start (after unzip):
1) Backend:
   - cd backend
   - copy .env.example to .env and set MONGO_URI and JWT_SECRET
   - npm install
   - npm run dev

2) Frontend:
   - cd frontend
   - npm install
   - npm run dev
   - open http://localhost:5173

Notes:
- Frontend expects backend at http://localhost:5000/api
- Replace placeholder logo at frontend/src/assets/placeholder-logo.png
