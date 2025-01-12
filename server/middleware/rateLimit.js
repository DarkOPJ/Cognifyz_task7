const rateLimit = require('express-rate-limit');

// Initialize rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 10 requests per `windowMs`
    message: "Too many requests from this IP, please try again in 15 minutes.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // windowMs: Adjust the time window (e.g., 1 minute: 60 * 1000).
// max: Change the number of allowed requests per time window.
// message: Customize the error message for rate limit violations.
// Headers: Enabling standardHeaders or legacyHeaders can help the client know when the limit resets.

module.exports = limiter;