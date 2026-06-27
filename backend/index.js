import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import Project from "./models/Project.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "";
const allowedOrigins = configuredOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!mongoUri) {
  throw new Error("MONGO_URI is required");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

if (isProduction && allowedOrigins.length === 0) {
  throw new Error("FRONTEND_URL or CORS_ORIGIN is required in production");
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to DB
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  },
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  // Handle joining a room
  socket.on("join", async ({ roomId, userName }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).users.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom).users));
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId); // Join the room

    if (!rooms.has(roomId)) {
      try {
        const project = await Project.findById(roomId);
        const initialCode = project ? project.code : "// start code here";
        rooms.set(roomId, { users: new Set(), code: initialCode });
      } catch (err) {
        rooms.set(roomId, { users: new Set(), code: "// start code here" });
      }
    }

    rooms.get(roomId).users.add(userName); // Add user to the room

    // Emit the current code to the new user
    socket.emit("codeUpdate", rooms.get(roomId).code);

    // Emit the updated user list to the room
    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId).users));
  });

  // Handle code changes from users
  socket.on("codeChange", ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code; // Update the room's code with the new code
      io.to(roomId).emit("codeUpdate", code); // Emit updated code to all users in the room
    }
  });

  // Handle user typing indication
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  // Handle language change
  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  // Handle leaving a room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).users.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom).users));

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).users.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom).users));
    }
    console.log("User Disconnected");
  });
});

const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(port, () => {
  console.log(`Server is working on port ${port}`);
});
