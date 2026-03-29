# 🛒 Amazon Clone

A full-stack e-commerce web application inspired by Amazon, built with React on the frontend and Node.js/Express on the backend.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Live Demo

> [https://your-deployment-url.vercel.app](https://your-deployment-url.vercel.app)  
> *(Replace with your actual Vercel URL)*

---

## ✨ Features

- 🛍️ **Product Listings** — Browse a wide catalog of products with images, prices, and ratings
- 🛒 **Cart & Checkout** — Add items to cart and manage quantities seamlessly
- 🔐 **User Authentication** — Sign up, log in, and manage your account securely
- 💳 **Payment Integration** — Checkout with a secure payment flow
- 📱 **Responsive Design** — Fully optimized for mobile and desktop

---

## 🧱 Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React, CSS              |
| Backend  | Node.js, Express        |
| Database | MongoDB / Firebase      |
| Hosting  | Vercel                  |

---

## 📁 Project Structure

```
amazon-clone/
├── client/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Node.js/Express backend
│   ├── routes/
│   ├── models/
│   └── package.json
└── package.json     # Root scripts (install-all, build)
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 16
- npm >= 8
- A MongoDB URI or Firebase project (depending on your DB)

### Installation

```bash
# Clone the repo
git clone https://github.com/priyanshuraj200604-del/scalar.git
cd scalar

# Install all dependencies (root + server + client)
npm run install-all
```

### Running Locally

```bash
# Start the backend server
cd server
npm start

# In a separate terminal, start the React dev server
cd client
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key   # if using Stripe
```

Create a `.env` file in the `client/` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_key   # if using Firebase
```

> ⚠️ Never commit `.env` files to version control.

---

## 🚢 Deployment

This project is deployed using **Vercel**. The root `package.json` contains a `build` script that:

1. Installs all dependencies across root, server, and client
2. Builds the React client for production

```json
"scripts": {
  "install-all": "npm install && cd server && npm install && cd ../client && npm install",
  "build": "npm run install-all && cd client && npm run build"
}
```

Vercel automatically picks up the build output from `client/build`.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Priyanshu Raj**  
GitHub: [@priyanshuraj200604-del](https://github.com/priyanshuraj200604-del)
