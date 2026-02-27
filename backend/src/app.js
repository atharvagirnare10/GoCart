import express from "express";
import cors from "cors";
import path from "path"; // ✅ Path module import karein
import { fileURLToPath } from "url"; // ✅ ES Module ke liye zaroori

// ✅ ES Module mein __dirname manually set karna padta hai
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes Imports
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js"; 
import orderRoutes from "./routes/order.routes.js"; 
import reviewRoutes from "./routes/review.routes.js"; 
import userRoutes from "./routes/user.routes.js"; 
import wishlistRoutes from "./routes/wishlist.routes.js";

const app = express();

// ✅ CORS SETTINGS
app.use(cors({
  origin: true, 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}));

app.use(express.json());

// ✅ STATIC FOLDER ENABLE (Isse images access ho payengi)
// Ye line check karegi ki 'uploads' folder aapke backend root mein hai ya nahi
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); 

// Routes Mount
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);

export default app;
