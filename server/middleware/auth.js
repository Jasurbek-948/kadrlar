const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(403).json({ error: "Token kiritilmadi" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token tekshiruvida xatolik:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token muddati tugagan. Qayta tizimga kiring!" });
    }
    return res.status(403).json({ error: "Noto'g'ri yoki yaroqsiz token!" });
  }
};

module.exports = authenticateToken;