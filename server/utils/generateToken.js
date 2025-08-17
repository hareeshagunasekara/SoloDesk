const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret =
    process.env.JWT_SECRET || "fallback-secret-for-development-only";

  if (!process.env.JWT_SECRET) {
    console.warn(
      "WARNING: JWT_SECRET not set, using fallback secret. This should only be used in development.",
    );
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = generateToken;
