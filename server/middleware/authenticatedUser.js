// const jwt = require("jsonwebtoken");
// const User = require("../models/User"); // Adjust the path as needed

// const authenticatedUserInfo = async (req, res, next) => {
//   try {
//     const token = req.cookies.token; // Get the token from cookies
//     if (!token) {
//         req.user = null; // No token means the user is logged out
//         return next();
//       }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select("-password"); // Exclude the password
//     if (!user) {
//       return next();
//     }

//     req.user = user; // Attach the user object to the request
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       res.clearCookie("token"); // Clear the expired token
//       console.log("JWT expired. Token removed.");
//     }
//     req.user = null; // Set user to null
//     console.log("Error: " + error.message);
//     next(); // Proceed without throwing an error
//   }
// };

// module.exports = authenticatedUserInfo;


const createAppwriteClient = require("../config/appwrite");

const authenticatedUserInfo = async (req, res, next) => {
  try {
    // Retrieve the session cookie
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      req.user = null; // No session means no logged-in user
      return next();
    }

    // Initialize Appwrite client with the session
    const { account } = await createAppwriteClient("session", sessionCookie);

    // Get user details using the session
    const user = await account.get();

    // Attach user information to the request object
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error retrieving user session:", error.message);

    // Clear the session cookie if it's invalid or expired
    if (error.message.includes("Invalid session") || error.message.includes("expired")) {
      res.clearCookie("session", { path: "/" });
      console.log("Cleared invalid or expired session cookie.");
    }

    req.user = null; // Ensure req.user is null if an error occurs
    next(); // Proceed without throwing an error
  }
};

module.exports = authenticatedUserInfo;
