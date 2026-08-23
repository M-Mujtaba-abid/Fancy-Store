<div align="center">
    <a href="https://www.fancystore.store">
  <img src="client/public/logoB.png" width="128px" />
    </a>
    <h1><i>Fancy Store ⚡</i></h1>
    <p align="center">
         <p><i>Full-Stack E-Commerce | AI Shopping Assistant & Live Support</i></p>
    </p>


```
 Give a Star ⭐️ & Fork to this project ... Happy coding! 🤩`
```

*Fancy Store is a production e-commerce platform for automotive accessories (car & bike covers, floor mats, seat covers, and more). It pairs a Next.js storefront with an Express REST API, PostgreSQL + pgvector, Stripe/COD checkout, an admin dashboard, AI-powered product discovery, and real-time live chat.*

</div>

***Live Demo*** : [_click here_](https://www.fancystore.store)

## _Key Features_ :

- _JWT, Google OAuth & OTP Password Reset with Admin Roles_
- _Variant-Aware Product Catalog, Categories & Cloudinary Media_
- _Server & Guest Cart/Wishlist with Auto-Sync on Login_
- _Guest & User Checkout — Buy Now, COD, Stripe & Order Tracking_
- _Verified Reviews with Moderation & Admin Contact Inbox_
- _Full Admin Dashboard — Orders, Users, Stats, Labels & Live Chat_

## _Standout Features_ :

- _Groq LangChain AI Agent — Search, Recommend, Order & Track_
- _Cohere Embeddings + pgvector Semantic Product Discovery_
- _Socket.IO Live Chat for Guests & Admins_
- _Stripe Checkout Sessions, Webhooks & PKR Payments_
- _Dynamic Sitemap, JSON-LD Schema & Google Merchant Feed_

## _Impact or Outcomes_ :

- _Browse, Ask AI, Get Live Help & Checkout — Guest or Logged-In_
- _Run Catalog, Orders, Reviews & Shipping from One Dashboard_
- _Cut Support Load with AI Search & Real-Time Chat_
- _Automate Payment Confirmation, Emails & Order Creation_

## _Tech Stack_ :

**Frontend (`client/`)**
- _Next.js 16 (App Router), React 19, TypeScript_
- _Tailwind CSS 4, TanStack React Query, Framer Motion_
- _Socket.IO Client, jsPDF + QRCode (shipping labels), react-markdown (AI chat)_

**Backend (`server/`)**
- _Node.js, Express 5, Sequelize ORM_
- _PostgreSQL with pgvector extension_
- _JWT + Passport (Google OAuth 2.0), bcryptjs_
- _Stripe, Cloudinary, Nodemailer, Multer_
- _Socket.IO, LangChain + Groq, Cohere Embeddings API_
- _express-rate-limit (AI chat), CORS, cookie-parser_

## Getting Started

### Prerequisites

- Node.js 18+ (recommended for Next.js 16)
- PostgreSQL database with **pgvector** support (e.g. Neon, Supabase, or local Postgres + `CREATE EXTENSION vector`)
- Accounts/keys for optional integrations: Stripe, Cloudinary, Google OAuth, Groq, Cohere, Gmail SMTP

### Project Structure

```
E-com/
├── client/   # Next.js storefront + admin dashboard
└── server/   # Express REST API + Socket.IO
```

### 1. Clone & install

```bash
git clone https://github.com/M-Mujtaba-abid/Fancy-Store.git
cd Fancy-Store

# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

### 2. Environment variables

**`server/.env`** (required)

```env
PORT=5000
NODE_ENV=development

# Database — use DATABASE_URL or individual vars
DATABASE_URL=postgresql://user:password@host:5432/dbname

JWT_SECRET=your_jwt_secret

# Frontend URLs (CORS + redirects)
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Stripe (optional — for card payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/user/auth/google/callback

# Cloudinary (product/review/category images)
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

# Email (order notifications, OTP reset)
EMAIL_USER=
EMAIL_PASS=
ADMIN_EMAIL=

# AI chatbot (optional)
GROQ_API_KEY=
COHERE_API_KEY=
```

**`client/.env`** (required)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Optional — on-demand ISR revalidation
REVALIDATE_SECRET=
```

### 3. Database migrations

From the `server/` directory, run Sequelize migrations against your Postgres instance:

```bash
cd server
npx sequelize-cli db:migrate
```

> Ensure `DATABASE_URL` (or `DB_*` vars in `config/db.js`) points to your database before migrating. The server also runs `CREATE EXTENSION IF NOT EXISTS vector` on startup.

### 4. Run locally

**Backend** (port 5000)

```bash
cd server
npm run dev
```

**Frontend** (port 3000)

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:5000](http://localhost:5000).

### Default ports

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |
