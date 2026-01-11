# VIKAS - Virtually Intelligent Knowledge Assisted Shopping

An Amazon-like intelligent retail assistant demonstrating the future of omnichannel commerce.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Aiven or local)
- Internet connection (for Mediapipe WASM, Groq AI, Mediapipe models)

### Step 1: Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Configure Backend Environment

Create/update `backend/.env`:
```env
# PostgreSQL Database (Aiven)
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require

# JWT Secret - Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key

# Groq API Key (for AI features, get from https://console.groq.com)
GROQ_API_KEY=your-groq-api-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS on deployed instance)
FRONTEND_URL=http://localhost:3000
```

**For Production Deployment:**
```env
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 3: Seed the Database

```bash
cd backend
node scripts/seedData.js
```

This will create:
- 28,000+ fashion products (Flipkart dataset)
- 6 sample stores with inventory
- Demo user: `demo@vikas.com / demo1234`

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs at: **http://localhost:5000**

Health check: `curl http://localhost:5000/api/health`

### Step 5: Configure Frontend Environment

Create `frontend/.env.local` (optional, only for local overrides):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, the default will use the deployed backend URL.

### Step 6: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🌐 Deployed Instance

- **Frontend:** https://vikas.naitiktiwari.in
- **Backend API:** https://vikas-x4i8.onrender.com
- **Health Check:** https://vikas-x4i8.onrender.com/api/health

---

## 🏗️ Building for Production

### Backend Deployment (Render/Railway/Heroku)

```bash
cd backend

# Ensure .env is set with production database
# Set FRONTEND_URL to your domain
# NODE_ENV=production

# Start the server
npm start
```

### Frontend Deployment (Vercel)

```bash
cd frontend

# Set NEXT_PUBLIC_API_URL environment variable in Vercel dashboard
# Deploy to Vercel
vercel deploy --prod
```

Or use Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_API_URL https://your-backend-api.com
vercel deploy --prod
```

---

## 📱 Features Overview

### Core E-Commerce
- **User Authentication** - Secure login/register with JWT
- **Product Catalog** - Browse 28,000+ products with filters
- **Shopping Cart** - Add/remove items, persistent cart
- **Checkout** - Shipping address, COD payment, order confirmation
- **Order History** - Track orders and reservations

### AI Shopping Assistant
- **Smart Search** - AI-powered product discovery
- **Product Q&A** - Ask questions about any product
- **Recommendations** - Get AI suggestions based on preferences
- **Product Comparison** - Compare multiple products side-by-side

### Omnichannel Experience
- **Store Locator** - Find 6 VIKAS stores by location
- **Real-time Availability** - Check stock at nearby stores
- **Click & Collect** - Reserve products for in-store pickup with QR code
- **Seamless Integration** - Switch between online and offline shopping

### AR Try-On (Beta)
- **Virtual Glasses** - Try eyewear with face tracking
- **Virtual Caps** - See how hats fit your head
- **Mediapipe Face Landmarks** - Real-time face detection
- **GPU-accelerated** - Smooth performance on modern devices

---

## 🔧 Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start dev server with nodemon
npm run seed       # Seed database with products
npm run migrate    # Sync database schema
```

### Frontend
```bash
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

---

## 🧪 Testing the Application

### 1. Register a New Account
- Go to `/auth/register`
- Enter email and password
- Account will be created

### 2. Login with Demo Account
- Email: `demo@vikas.com`
- Password: `demo1234`

### 3. Browse Products
- Homepage shows featured categories
- `/products` page has full search and filters
- Filter by category, brand, price, rating

### 4. Try AI Features
- Search: "blue dress"
- Ask: "What's the best running shoe?"
- Compare: Select 2+ products and compare

### 5. Test Checkout
- Add products to cart
- Go to `/checkout`
- Enter shipping address
- Place order (demo COD)
- View confirmation

### 6. Try AR (Beta)
- Go to `/ar` in the navigation
- Select "Virtual Glasses" or "Baseball Cap"
- Allow camera permission
- See yourself with the product overlay

### 7. Find Stores
- Click "Find Store" in header
- See all 6 VIKAS store locations
- Check product availability per store

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check database connection
node scripts/testConnection.js

# Ensure environment variables are set
echo $DATABASE_URL

# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Frontend Shows "Cannot reach API"
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check NEXT_PUBLIC_API_URL environment variable
echo $NEXT_PUBLIC_API_URL

# For Vercel deployment, verify env vars in dashboard:
# Settings > Environment Variables > NEXT_PUBLIC_API_URL
```

### AR Not Working
- **Black Screen:** Enable camera permissions, ensure HTTPS on production
- **No Face Detection:** Use well-lit area, ensure face is visible
- **Model Not Loading:** Check network tab for 404s on model files in `/public/models/`

### CORS Errors
- Backend must have correct `FRONTEND_URL` in `.env`
- Frontend must point to correct `NEXT_PUBLIC_API_URL`
- Restart backend after changing `FRONTEND_URL`

### Products Not Showing
```bash
# Reseed database
cd backend
node scripts/seedData.js
npm run dev
```

---

## 📚 API Documentation

Base URL: `http://localhost:5000/api` (local) or `https://vikas-x4i8.onrender.com/api` (deployed)

All authenticated endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Key Endpoints

**Health Check**
```
GET /health
```

**Authentication**
```
POST /auth/register       # { email, password, name }
POST /auth/login          # { email, password }
GET  /auth/me             # Get current user (requires auth)
```

**Products**
```
GET /products?category=Fashion&page=1&limit=12
GET /products/:id
GET /products/:id/stores  # Check availability
GET /products/meta/categories
```

**Cart**
```
GET  /cart
POST /cart                # { productId, quantity }
PUT  /cart/:itemId        # { quantity }
DELETE /cart/:itemId
```

**Orders**
```
GET  /orders
POST /orders              # { shippingAddress, paymentMethod }
POST /orders/buy-now      # { productId, quantity, shippingAddress }
```

**AI** (requires GROQ_API_KEY)
```
POST /ai/query            # { query, productIds }
GET  /ai/recommendations/:productId
POST /ai/product/:id/ask  # { question }
POST /ai/compare          # { productIds }
```

**Reservations**
```
POST /reservations/create # { productId, storeId, quantity }
POST /reservations/:id/pay # { paymentMethod }
GET  /reservations/:id
```

---

## 💾 Database Models

All tables prefixed with `VIKAS-`:

- **users** - User accounts (email, hashed password)
- **products** - Product catalog (title, price, category, description)
- **inventory** - Store-level stock (storeId, productId, quantity)
- **cart** - Shopping carts (userId, productId, quantity)
- **orders** - Order history (userId, total, status)
- **reservations** - In-store reservations (productId, storeId, status)
- **sessions** - JWT session tokens

---

## 🔐 Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Random secure string (min 32 chars)
- [ ] `GROQ_API_KEY` - From https://console.groq.com (optional)
- [ ] `FRONTEND_URL` - Frontend domain (localhost:3000 or https://yourdomain.com)
- [ ] `PORT` - Server port (default 5000)
- [ ] `NODE_ENV` - "development" or "production"

### Frontend (.env.local or Vercel)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (default: https://vikas-x4i8.onrender.com/api)

## 📁 Project Structure

```
VIKAS/
├── backend/                          # Express.js + Sequelize API
│   ├── config/
│   │   └── db.js                    # PostgreSQL (Aiven) connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Inventory.js
│   │   ├── Store.js
│   │   ├── Reservation.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── reservationRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication
│   ├── agents/
│   │   ├── orchestrator.js          # AI agent coordinator
│   │   ├── analyticsEngine.js
│   │   ├── customerExperience.js
│   │   ├── personalization.js
│   │   └── ...
│   ├── services/
│   │   ├── groq.js                  # Groq LLM integration
│   │   └── rag.js                   # Retrieval-Augmented Generation
│   ├── scripts/
│   │   ├── seedData.js              # Seed 28,000+ products
│   │   ├── seedStores.js
│   │   └── testConnection.js
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express entry point
│   └── package.json
│
├── frontend/                         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js              # Home page
│   │   │   ├── layout.js            # Root layout
│   │   │   ├── products/            # Products page
│   │   │   ├── product/[id]/        # Product detail
│   │   │   ├── cart/                # Shopping cart
│   │   │   ├── checkout/            # Checkout flow
│   │   │   ├── orders/              # Order history
│   │   │   ├── auth/                # Login/Register
│   │   │   ├── stores/              # Store locator
│   │   │   ├── ar/                  # AR try-on (beta)
│   │   │   ├── reservation/         # Click & collect
│   │   │   └── admin/               # Admin dashboard
│   │   ├── components/
│   │   │   ├── Header.js            # Navigation header
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ARView.js            # Mediapipe face tracking
│   │   │   ├── ChatBubble.js        # AI chat assistant
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.js               # API client
│   │   │   └── auth.js              # Auth context
│   │   └── styles/
│   │       └── globals.css          # Global styles (Glassmorphism)
│   ├── public/
│   │   ├── models/                  # 3D OBJ models for AR
│   │   │   ├── glasses/
│   │   │   ├── cap/
│   │   │   └── knitcap/
│   │   └── ...
│   ├── next.config.js
│   ├── package.json
│   └── .env.local                   # Local overrides
│
├── flipkart_fashion_products_dataset.json  # 28k product data
└── README.md
```

---

## 🗄️ Database Schema (PostgreSQL via Aiven)

All tables use `VIKAS-` prefix as required:

| Table | Purpose |
|-------|---------|
| `VIKAS-users` | User accounts with bcrypt passwords |
| `VIKAS-sessions` | JWT session tokens |
| `VIKAS-dataset` | 28,000+ product catalog |
| `VIKAS-inventory` | Store-level stock (for omnichannel) |
| `VIKAS-carts` | User shopping carts |
| `VIKAS-orders` | Order history |
| `VIKAS-reservations` | In-store click & collect |
| `VIKAS-stores` | 6 physical store locations |

**SSL-Enabled Connection:** All connections to Aiven use SSL with certificate pinning for security.

---

## 🔌 API Reference

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

## 📖 Full Documentation

For detailed API documentation, troubleshooting, and advanced configuration, see the sections below.

### Backend Documentation
- Database models and schemas
- Authentication & session management
- AI integration (Groq LLM + RAG)
- Store inventory & omnichannel features

### Frontend Documentation
- Component architecture
- State management (Auth context)
- Mobile-responsive design
- AR implementation with Mediapipe

---

## 🎯 Use Cases

### Case 1: Browse & Buy
1. User lands on homepage
2. Filters products by category (e.g., "Running Shoes")
3. Clicks product to see details
4. Adds to cart and proceeds to checkout
5. Enters shipping address (COD payment)
6. Receives order confirmation

### Case 2: AI-Powered Discovery
1. User searches "blue winter coat"
2. AI returns results with explanation
3. User asks "What's the warmest fabric?"
4. AI answers based on product specs
5. User adds top recommendation to cart

### Case 3: Omnichannel Shopping
1. User searches for "designer glasses"
2. Sees product is available at 2 stores
3. Clicks "Find in Store"
4. Selects nearest store
5. Reserves item (click & collect)
6. Gets QR code for store pickup

### Case 4: Try Before You Buy (AR)
1. User browses hats/glasses on mobile
2. Clicks "Try in AR"
3. Allows camera permission
4. Uses phone to preview product on their face
5. Decides to buy or continue browsing

---

## 🚀 Deployment Guide

### Vercel (Frontend)

```bash
# Connect GitHub repo to Vercel
# In Vercel Dashboard:
# 1. Project Settings > Environment Variables
# 2. Add: NEXT_PUBLIC_API_URL = https://your-backend.com/api
# 3. Click Deploy
```

### Render (Backend)

```bash
# 1. Create new Web Service on Render
# 2. Connect your GitHub repo
# 3. Set Environment Variables:
#    - DATABASE_URL (from Aiven PostgreSQL)
#    - JWT_SECRET (generate random secure string)
#    - GROQ_API_KEY (from Groq console)
#    - FRONTEND_URL = https://your-frontend.com
#    - NODE_ENV = production
# 4. Click Deploy
```

### Using Docker (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t vikas-backend .
docker run -p 5000:5000 --env-file .env vikas-backend
```

---

## 🛠️ Development Tips

### Hot Reload
- **Backend:** Uses `nodemon` - restarts on file changes
- **Frontend:** Next.js HMR - instant updates on save

### Database Debugging
```bash
# Connect to PostgreSQL CLI
psql $DATABASE_URL

# List all tables
\dt

# View VIKAS-users table
SELECT * FROM "VIKAS-users";

# Count products
SELECT COUNT(*) FROM "VIKAS-dataset";
```

### API Testing with cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vikas.com","password":"test123","name":"Test"}'

# Login (get JWT token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@vikas.com","password":"demo1234"}' | jq -r '.data.token')

# Use token to fetch current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Performance
- Run Lighthouse in DevTools
- Check network waterfall for API delays
- Optimize images in `/public/`
- Monitor Core Web Vitals

---

## 📊 Analytics & Monitoring

### Backend Logs
- Check `ingestion_log.txt` for data import logs
- Server console shows request logs with timestamps
- Error stack traces help debug API issues

### Frontend Errors
- Browser DevTools Console for JavaScript errors
- Network tab for API failures
- Performance tab for slow page loads

### Database Monitoring (Aiven Dashboard)
- CPU and memory usage
- Connection pool status
- Slow query logs

---

## ✨ Advanced Features

### Groq LLM Integration
Requires `GROQ_API_KEY` from https://console.groq.com

Features:
- Fast inference (Mixtral 8x7B model)
- RAG pipeline for product knowledge
- Streaming responses for chat
- Cost-effective API pricing

### Mediapipe Face Landmarks
AR feature uses Mediapipe Vision Tasks:
- Real-time face detection (30+ FPS)
- 468 facial landmarks
- Works on mobile with GPU acceleration
- Fallback to CPU if GPU unavailable

### Omnichannel Inventory
- Real-time stock sync across 6 stores
- Click & collect with QR codes
- Store-specific pricing (future)
- Inventory reservations

---

## 🐞 Known Limitations

1. **AR on Low-End Devices** - Requires WebGL2 support
2. **Groq API Rate Limit** - Free tier has request limits
3. **3D Models** - Only 4 AR models included (can add more)
4. **Payment Integration** - COD only (Razorpay/Stripe ready)
5. **Admin Panel** - Basic implementation (can expand)

---

## 🤝 Contributing

Feel free to fork and submit PRs for:
- New AR models
- Additional payment methods
- Performance optimizations
- Mobile UI improvements
- AI feature enhancements

---

## 📄 License

MIT License - Free to use and modify

---

## 📞 Support

- **Issues:** Create an issue in GitHub
- **Questions:** Check existing issues for answers
- **Deployment Help:** See troubleshooting section

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [Mediapipe Vision](https://developers.google.com/mediapipe/solutions/vision)
- [Groq API Docs](https://console.groq.com/docs)

---

**Last Updated:** January 2025  
**Version:** 1.0.0 (MVP)

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
