const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  passportData: {
    fullName: { type: String, required: true },
    inn: { type: String, required: true, match: /^\d{9}$/ },
    insp: { type: String, required: true, unique: true, match: /^\d{14}$/ },
    address: { type: String, required: true },
    passportSeries: { type: String, required: true, match: /^[A-Z]{2}$/ },
    passportNumber: { type: String, required: true, match: /^\d{7}$/ },
    issuedBy: { type: String, required: true },
    issuedDate: { type: String, required: true },
    birthDate: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Erkak", "Ayol"] },
    birthPlace: { type: String, required: true },
    nationality: { type: String, required: true },
    phoneNumber: { type: String, required: true, match: /^\+998\d{9}$/ },
  },
  jobData: {
    department: { type: String, required: true },
    position: { type: String, required: true },
    grade: { type: String, required: true },
    salary: { type: String, required: true },
    employmentContract: { type: String, required: true },
    hireDate: { type: String, required: true },
    orderNumber: { type: String, required: true },
  },
  educationData: {
    educationLevel: { type: String, required: true, enum: ["Oliy", "O'rta", "O'rta maxsus"] },
    institution: { type: String, required: true },
    specialty: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    diplomaNumber: { type: String, required: true },
    academicTitle: { type: String, required: false },
  },
  vacationStatus: {
    type: String,
    enum: [
      "none",
      "mexnat tatili",
      "mexnatga layoqatsizlik davri",
      "ish xaqi saqlanmagan tatil",
      "o'quv tatili",
      "bir oylik xizmat",
      "homiladorlik va tug'ruqdan keyingi ta'til",
      "bola parvarish ta'tili",
    ],
    default: "none",
  },
  vacationStart: { type: Date, required: false },
  vacationEnd: { type: Date, required: false },
  documents: [
    {
      fileName: { type: String, required: true, trim: true },
      filePath: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  isArchived: { type: Boolean, default: false },
  terminationDate: { type: Date, required: false }, // Ishdan chiqish sanasi
  archiveDate: { type: Date, default: null }, // Arxivga ko'chirilgan vaqt
});

employeeSchema.virtual("jobData.experience").get(function () {
  if (!this.jobData || !this.jobData.hireDate) return "Ma'lumot mavjud emas";

  const hireDate = new Date(this.jobData.hireDate);
  const today = new Date();

  const diffTime = Math.abs(today - hireDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  if (years === 0 && months === 0 && days === 0) return "0 kun";
  if (years === 0 && months === 0) return `${days} kun`;
  if (years === 0) return `${months} oy va ${days} kun`;
  if (months === 0) return `${years} yil va ${days} kun`;
  return `${years} yil, ${months} oy va ${days} kun`;
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

// Dublikat INPS bo‘lsa xato qaytarish uchun middleware
employeeSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Bu INPS bilan xodim allaqachon ro‘yxatdan o‘tgan!"));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("Employee", employeeSchema);