// For page routing
const express = require("express");
const https = require("https");

const Post = require("../models/Post");

const authenticatedUserInfo = require("../middleware/authenticatedUser");
const limiter = require("../middleware/rateLimit");

const pageRouter = express.Router();

// GET HOME page
pageRouter.get("", authenticatedUserInfo, async (req, res) => {
  try {
    const locals = {
      title: "NodeJs Blog",
      description: "Simple blog page with NodeJs and MongoDB.",
      user: req.user ? req.user.firstName : "Login",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const posts = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      posts,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET Post page
pageRouter.get("/post/:id", authenticatedUserInfo, async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);

    const locals = {
      title: "Post - " + post.title,
      description: "Simple blog page with NodeJs and MongoDB.",
      user: req.user ? req.user.firstName : "Login",
    };

    res.render("post", {
      locals,
      post,
      currentRoute: `/posts/${id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST search
pageRouter.post("/search", authenticatedUserInfo, async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple blog page with NodeJs and MongoDB.",
      user: req.user ? req.user.firstName : "Login",
    };

    const searchTerm = req.body.searchTerm;
    const searchNoSpecialCharacters = searchTerm.replace(/[^a-zA-Z0-9. ]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialCharacters, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialCharacters, "i") } },
      ],
    });

    res.render("search", {
      locals,
      posts: data,
      searchTerm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST paystack
pageRouter.post("/paystack", limiter, async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email ||!amount) {
      return res
       .status(400)
       .json({ message: "Email and amount are required" });
    }
    
    const params = JSON.stringify({
      email: email,
      amount: amount * 100,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_LIVEKEY}`,
        "Content-Type": "application/json",
      },
    };

    const reqpaystack = https
      .request(options, (respaystack) => {
        let data = "";

        respaystack.on("data", (chunk) => {
          data += chunk;
        });

        respaystack.on("end", () => {
          const response = JSON.parse(data);
          console.log(response);

          if (response.status) {
            // Redirect to the authorization URL
            return res.redirect(response.data.authorization_url);
          } else {
            return res.status(400).send("Failed to initialize payment");
          }
        });
      })
      .on("error", (error) => {
        console.error(error);
      });

    reqpaystack.write(params);
    reqpaystack.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET ABOUT page
pageRouter.get("/contact", authenticatedUserInfo, (req, res) => {
  const locals = {
    title: "Contact Me",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName : "Login",
  };
  res.render("contact", { locals, currentRoute: "/contact" });
});

module.exports = pageRouter;

//   // Insert sample data into the MongoDB collection
// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js",
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments...",
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries.",
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications.",
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js.",
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications.",
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations.",
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers.",
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic.",
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan.",
//     },
//   ]);
// }
// insertPostData();
