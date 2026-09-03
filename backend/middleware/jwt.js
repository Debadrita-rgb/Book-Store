const jwt = require("jsonwebtoken");

// Import environment variables

require("dotenv").config();

// Middleware for token verification

const jwtAuthMiddleware = (req, res, next) => {
  //Check if the authorization header exists in the request
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader)
    return res
      .status(401)
      .json({ message: "Authorization header not provided." });

  //Extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token not provided." });

  try {
    //verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Attach user information to the request object
    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token." });
  }
};

// Usage:
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { jwtAuthMiddleware, generateToken };
