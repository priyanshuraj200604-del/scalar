# Amazon Clone - Full-Stack E-Commerce Platform

A functional e-commerce web application that replicates Amazon's design and user experience, built as an SDE Intern Fullstack Assignment.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Vanilla CSS |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | PostgreSQL |
| **Dev Tools** | Concurrently, Nodemon |

## ✨ Features

### Core Features
- **Product Listing Page**: Grid layout with search, category filters, discount badges
- **Product Detail Page**: Image carousel with zoom, specifications table, buy box
- **Shopping Cart**: Add/remove items, quantity management, subtotal calculation
- **Order Placement**: Shipping address form, order review, confirmation with order ID

### Bonus Features
- 📱 Responsive design (mobile, tablet, desktop)
- 📋 Order history - view past orders
- 🎨 Amazon-faithful UI with hover effects, transitions, skeleton loading
- 🔍 Search functionality across product names and descriptions
- 🏷️ Category-based filtering

## 📂 Project Structure

```
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Header/         # Nav bar with search
│   │   │   ├── Footer/         # Site footer
│   │   │   ├── ProductCard/    # Product grid card
│   │   │   ├── ImageCarousel/  # Product image viewer
│   │   │   ├── StarRating/     # Star rating display
│   │   │   └── CartItem/       # Cart row component
│   │   ├── pages/              # Page components
│   │   ├── context/            # React Context (Cart state)
│   │   └── services/           # API service layer
│   └── package.json
├── server/                     # Express Backend
│   ├── routes/                 # API route handlers
│   ├── db/                     # Database config, schema, seed
│   ├── middleware/             # Error handling
│   └── package.json
├── .env                        # Environment variables
└── package.json                # Root with dev scripts
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/amazon-clone.git
cd amazon-clone
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Set up the database

Create the PostgreSQL database and tables:
```bash
psql -U postgres -f server/db/schema.sql
```

Seed sample data (30+ products across 6 categories):
```bash
psql -U postgres -d amazon_clone -f server/db/seed.sql
```

### 4. Configure environment variables

Edit `.env` at the project root:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=amazon_clone
DB_PASSWORD=postgres
DB_PORT=5432
PORT=5000
```

### 5. Start the development server
```bash
npm run dev
```

This starts both:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📊 Database Schema

The database uses 7 tables with proper relationships:

- **users** - Application users (default user seeded)
- **categories** - Product categories (6 categories)
- **products** - Product catalog with pricing, stock, ratings
- **product_images** - Multiple images per product
- **cart_items** - Shopping cart (per user, with unique constraint)
- **orders** - Order records with shipping info
- **order_items** - Individual items in each order

Key design decisions:
- `UNIQUE(user_id, product_id)` on cart_items prevents duplicate entries
- `ON CONFLICT` upsert for cart additions
- Transactional order placement with stock validation
- `price_at_purchase` in order_items preserves historical pricing

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `?search=`, `?category=`, `?sort=`) |
| GET | `/api/products/:id` | Get product detail with images |
| GET | `/api/categories` | List all categories |
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:id` | Update cart item quantity |
| DELETE | `/api/cart/:id` | Remove from cart |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | List past orders |
| GET | `/api/orders/:id` | Get order details |

## 🎨 Design Decisions

- **No authentication**: A default user (id=1) is seeded; all operations use this user
- **Amazon-faithful UI**: Dark navy header (#131921), orange accents (#FF9900), product card design
- **Responsive**: CSS Grid + Flexbox with breakpoints at 480px, 600px, 768px, 900px, 1024px
- **Performance**: Lazy image loading, skeleton loading states, efficient SQL queries with indexes

## 📝 Assumptions

1. Single user mode - no login/signup required
2. Product images sourced from Unsplash (free-to-use)
3. Prices displayed in INR (₹)
4. Free delivery for all orders
5. PostgreSQL running locally on default port 5432
