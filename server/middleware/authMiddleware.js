// Middleware
const authMiddleware = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).redirect("/admin");
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.clearCookie("token"); // Clear expired token
        console.log("JWT expired. Token removed.");
      }
      res.status(401).redirect("/admin");
    }
  };

  module.exports = authMiddleware;