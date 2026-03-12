import { verifyAccessToken } from "../utils/token/jwt.util.js";

const authMiddleware = (req, res, next) => {
  try {

    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    // Expected format: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid authorization format");
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      userId: decoded.userId
    };

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });

  }
};

export default authMiddleware;