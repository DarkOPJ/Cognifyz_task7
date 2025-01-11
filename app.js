require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const connectDB = require("./server/config/db");
const isActiveRoute = require("./server/helpers/routeHelpers");


const app = express();
const PORT = process.env.PORT || 3000  // to use the default port of the hosting platform

// Connect to Database
connectDB();

// Middleware for body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));


// For static files
app.use(express.static('public'))
app.use("/css", express.static('src'))

// EJS
app.use(expressLayouts);
app.set("layout", "layouts/main");  // Specify the main layout file
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

// For Frontend page routing
app.use('/', require('./server/routes/main'));
// For Admin page routing
app.use('/', require('./server/routes/admin'));

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