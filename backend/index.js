import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const port = process.env.PORT || 6000;
const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to load
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter); // Apply to all routes

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cookieParser());

// Serve static files (images)
app.use('/images', express.static('public'));

app.use(
  cors({
    origin: [
      "https://neocart-frontend.onrender.com",
      "https://neocart-admin.onrender.com",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authLimiter, authRoutes); // Apply strict rate limiting to auth routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// Start Server
app.listen(port, () => {
  console.log("Hello From Server", port);
  connectDb();
});
