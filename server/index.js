import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import organizationRoutes from "./routes/organizationRoutes.js"; // ✅ import route
import branchRoutes from "./routes/branchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: "*" } });

// ✅ CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-OTP", "X-Email"],
    credentials: true,
  })
);

// CRITICAL: Parse JSON bodies
app.use(express.json()); // ADD THIS

// Parse URL-encoded (for forms) — optional but safe
app.use(express.urlencoded({ extended: true }));

// connect DB
connectDB();

// routes
app.use("/api/webhooks", webhookRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

// test
app.get("/", (req, res) => res.send("Server is running..."));

// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
