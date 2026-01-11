# VIKAS - Virtually Intelligent Knowledge Assisted Shopping

An Amazon-like intelligent retail assistant demonstrating the future of omnichannel commerce.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (or use the existing one):
```env
DATABASE_URL=postgres://avnadmin:AVNS_dH70CC3PVYwR474Ti9O@uno-saarthi-nt.h.aivencloud.com:27803/defaultdb?sslmode=require
JWT_SECRET=vikas-jwt-secret-change-in-production-2024
GROQ_API_KEY=your-groq-api-key-here  # Optional, for AI features
PORT=5000
NODE_ENV=development
```

### 2. Seed the Database

```bash
cd backend
node scripts/seedData.js
```

This will create:
- 16 sample products across categories
- Store inventory for omnichannel demo
- Demo users: `demo@vikas.com / demo1234`

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs at: http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 📁 Project Structure

```
VIKAS/
├── backend/                    # Express.js API
│   ├── config/db.js           # PostgreSQL connection
│   ├── models/                # Sequelize models
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth middleware
│   ├── agents/                # AI agents (orchestrator)
│   ├── services/              # Groq & RAG services
│   └── scripts/seedData.js    # Data seeding script
│
├── frontend/                   # Next.js 14 App
│   ├── src/app/               # Pages
│   ├── src/components/        # React components
│   ├── src/lib/               # API client & Auth context
│   └── src/styles/            # Global CSS
│
└── README.md
```

---

## 🗄️ Database Schema (PostgreSQL)

All tables use `VIKAS-` prefix as required:

| Table | Description |
|-------|-------------|
| `VIKAS-users` | User accounts with bcrypt hashed passwords |
| `VIKAS-sessions` | JWT session management |
| `VIKAS-dataset` | Product catalog (single source of truth) |
| `VIKAS-cart` | User shopping carts |
| `VIKAS-orders` | Order history |
| `VIKAS-inventory` | Store-level stock for omnichannel |

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Products
- `GET /api/products` - List products (paginated, filterable)
- `GET /api/products/:id` - Single product
- `GET /api/products/:id/stores` - Store availability
- `GET /api/products/meta/categories` - Categories
- `GET /api/products/meta/brands` - Brands

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update quantity
- `DELETE /api/cart/:id` - Remove item

### Orders
- `GET /api/orders` - Order history
- `POST /api/orders` - Create order (checkout)
- `POST /api/orders/buy-now` - Direct purchase

### AI (Groq RAG)
- `POST /api/ai/query` - AI-powered product queries
- `GET /api/ai/recommendations/:productId` - Recommendations
- `POST /api/ai/product/:id/ask` - Product Q&A
- `POST /api/ai/compare` - Compare products

---

## 🎨 Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, categories, featured products |
| Products | `/products` | Filterable product grid |
| Product Detail | `/product/[id]` | Full product page with buy box |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Address & order placement |
| Orders | `/orders` | Order history |
| Login | `/auth/login` | Sign in |
| Register | `/auth/register` | Create account |
| Stores | `/stores` | Find offline stores |

---

## 🤖 AI Features (Groq Integration)

When `GROQ_API_KEY` is configured:

1. **Product Intelligence** - Ask questions about any product
2. **RAG-powered responses** - Only uses actual product data (no hallucination)
3. **Recommendations** - Find similar products with AI explanation
4. **Product Comparison** - Compare multiple products

---

## 🏬 Omnichannel Features

- **Find in Store** - Check product availability at offline stores
- **Store Locator** - Find VIKAS stores by city/pincode
- **Click & Collect** - (Demo ready)

---

## ✅ MVP Success Criteria

- [x] User can register/login
- [x] Browse products from PostgreSQL
- [x] Open product detail page
- [x] Add product to cart
- [x] Find offline availability
- [x] Complete purchase (COD)
- [x] See order confirmation
- [x] All tables use VIKAS- prefix
- [x] UI is investor-ready
- [x] AI assistant integrated (with Groq)

---

## 🔐 Security

- SSL-enforced PostgreSQL connection
- bcrypt password hashing (12 rounds)
- JWT-based authentication
- Session management in database
- Environment variable isolation
- No secrets in frontend

---

## 📊 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@vikas.com | demo1234 | Customer |
| admin@vikas.com | admin1234 | Admin |

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Aiven)
- **ORM**: Sequelize
- **Auth**: JWT + bcrypt
- **AI/LLM**: Groq (llama-3.3-70b-versatile)

---

## 🚀 For Investors

VIKAS demonstrates:

1. **Real ecommerce functionality** - Not a mockup, fully working
2. **AI-powered shopping** - Groq LLM with RAG architecture
3. **Omnichannel ready** - Online + offline store integration
4. **Scalable architecture** - Agentic AI foundation
5. **Premium UX** - Amazon-like interface

---

Built with ❤️ for the future of retail.
