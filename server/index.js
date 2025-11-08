import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; // <- import db connection

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
connectDB();

// --- Real-time logic ---
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("joinQueue", (data) => {
    console.log("User joined queue:", data);
    io.emit("queueUpdated", { message: "Queue updated", data });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// --- Simple test route ---
app.get("/", (req, res) => res.send("Server is running..."));

// --- Start Server ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
