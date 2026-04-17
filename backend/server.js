// const express = require("express");
// const cors = require("cors");

// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Test route
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });

// // Example API route
// app.get("/api/test", (req, res) => {
//   res.json({ message: "API working!" });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all origins (for development)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle OPTIONS globally
app.options("*", cors());

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/verify", require("./routes/verify"));
app.use("/users", require("./routes/users"));
app.use("/events", require("./routes/sidequest"));
app.use("/circle", require("./routes/circle"));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ✅ Bind to 0.0.0.0 so phone on same Wi-Fi can reach it
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));