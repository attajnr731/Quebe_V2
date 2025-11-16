import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: "*" } });

// ✅ CORS setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-OTP", "X-Email"],
    credentials: true,
  })
);

// CRITICAL: Webhook route MUST come BEFORE express.json()
// Paystack needs raw body for signature verification
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

// Parse JSON bodies for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
connectDB();

// Routes
app.use("/api/organizations", organizationRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/queues", queueRoutes);

// Test route
app.get("/", (req, res) => res.send("Server is running..."));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
