const jwt = require("jsonwebtoken");

const verifyToken = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, "SECRET_KEY");
      if (role && decoded.role !== role) {
        return res.status(401).json({ message: "Unauthorized role" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = verifyToken;
