const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

// MongoDB ulanish
mongoose
  .connect("mongodb://localhost:27017/employeesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB ulanishida xatolik:", err));

// GridFS sozlamalari
let gfs;

mongoose.connection.once("open", () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads"); // Fayllarni 'uploads' kolleksiyasida saqlash
  console.log("GridFS initialized");
});

// Fayllarni yuklash uchun GridFsStorage sozlamasi
const storage = new GridFsStorage({
  url: "mongodb://localhost:27017/employeesDB", // Ulanish URL
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`, // Fayl nomi
      bucketName: "uploads", // Fayllar uchun bucket nomi
    };
  },
});

module.exports = { gfs, storage };
