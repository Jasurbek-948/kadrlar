const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const employeeRoutes = require("./routes/employeeRoutes");
const archiveRoutes = require("./routes/archiveRoutes");
const disciplinaryRoutes = require("./routes/disciplinaryRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const authRoutes = require("./routes/auth");
const countRoutes = require("./routes/countRoutes")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fayllar uchun yuklash katalogini yaratish
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log(`"${uploadDir}" katalogi yaratildi.`);
}

// Middleware
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Token yoki cookie bilan ishlash uchun
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadDir));

// Routerlar
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/disciplinary", disciplinaryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/employee-counts", countRoutes);

// MongoDB ulanish
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/kadrlar", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
    process.exit(1);
  });