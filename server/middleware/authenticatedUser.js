const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust the path as needed

const authenticatedUserInfo = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        req.user = null; // No token means the user is logged out
        return next();
      }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // Exclude the password
    if (!user) {
      return next();
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token"); // Clear the expired token
      console.log("JWT expired. Token removed.");
    }
    req.user = null; // Set user to null
    console.log("Error: " + error.message);
    next(); // Proceed without throwing an error
  }
};

module.exports = authenticatedUserInfo;
