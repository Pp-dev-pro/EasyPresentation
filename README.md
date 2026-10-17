# SlideForge – online presentation maker
1. Install Node 18+. In this folder: `npm install`
2. `cp .env.example .env` (add Stripe keys for real payments; blank = demo payments)
3. `npm start` → open http://localhost:3000

Features: sign up / log in (hashed passwords), per-user cloud save, drag/drop/resize, text editing (double-click),
photo upload & change, fonts/colors/backgrounds, 4 templates, 8 animations, present mode (arrows/Esc), JSON export,
Free vs Pro plan with Stripe Checkout (subscription).
Production notes: add HTTPS, a Stripe webhook, and a real database (users are stored in data.json).
