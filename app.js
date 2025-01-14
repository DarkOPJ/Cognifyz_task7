require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
// const cors = require("cors");

const connectDB = require("./server/config/db");
const isActiveRoute = require("./server/helpers/routeHelpers");
const errorHandler = require("./server/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000; // to use the default port of the hosting platform
// app.use(cors());

// Global error handler
app.use(errorHandler);

// Connect to Database
connectDB();

// Middleware for body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

// For static files
app.use(express.static("public"));
app.use("/css", express.static("src"));

// EJS
app.use(expressLayouts);
app.set("layout", "layouts/main"); // Specify the main layout file
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

// For Frontend page routing
app.use("/", require("./server/routes/main"));
// For Admin page routing
app.use("/", require("./server/routes/admin"));
// For pages without any routes
app.all("*", (req, res, next) => {
  const error = new Error(`Cannot find ${req.originalUrl} on the server`);
  error.status = "fail";
  error.statusCode = 404;
  res.render("error", { error, currentRoute: "/error" });
  next(error);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGODB_URI
//     }),
//     // cookie: { maxAge: new Date ( Date.now() + (3600000) ) }
// }))
