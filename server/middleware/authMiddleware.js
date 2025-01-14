// const jwt = require("jsonwebtoken");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).redirect("/admin");

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       res.clearCookie("token"); // Clear expired token
//       console.log("JWT expired. Token removed.");
//     }
//     res.status(401).redirect("/admin");
//   }
// };

// module.exports = authMiddleware;


const createAppwriteClient = require("../config/appwrite");

const authMiddleware = async (req, res, next) => {
  try {
    // Get the session cookie
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      // No session cookie means unauthorized
      return res.status(401).redirect("/admin");
    }

    // Initialize Appwrite client with the session cookie
    const { account } = await createAppwriteClient("session", sessionCookie);

    // Validate the session by retrieving user info
    const user = await account.get();

    // Attach user info to the request object for use in subsequent middleware/routes
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication failed:", error.message);

    // Handle session expiration or invalid session
    if (error.message.includes("Invalid session") || error.message.includes("expired")) {
      res.clearCookie("session"); // Clear the expired/invalid session cookie
    }

    // Redirect to the admin login page
    res.status(401).redirect("/admin");
  }
};

module.exports = authMiddleware;
