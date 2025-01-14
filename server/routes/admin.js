const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAppwriteClient = require("../config/appwrite.js");
const { OAuthProvider } = require("node-appwrite");

const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();

const layout = path.join(__dirname, "..", "..", "views", "layouts", "admin");

// GET admin
router.get("/admin", async (req, res) => {
  const locals = {
    title: "Admin Panel",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };

  try {
    const { account } = await createAppwriteClient("admin");
    // Generate OAuth2 login URL
    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google, // Replace "google" with the correct provider string for Appwrite
      "http://localhost:3000/oauth-login", // Success callback
      "http://localhost:3000/oauth-failed" // Fail callback
    );

    // Render login page with the OAuth link
    res.render("admin/login", {
      layout,
      locals,
      showLogout: false,
      googleOauth: redirectUrl,
    });
  } catch (error) {
    error.status = "Server error";
    error.statusCode = 500;
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

router.get("/oauth-login", async (req, res) => {
  const locals = {
    title: "Admin Panel",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };

  try {
    // Extract userId and secret from query parameters
    const { userId, secret } = req.query;

    if (!userId || !secret) {
      const error = new Error("Missing required OAuth query parameters.");
      error.status = "Fail";
      error.statusCode = 400;
      res
        .status(400)
        .render("error", { error, currentRoute: "/error", locals });
      return;
    }

    // Initialize Appwrite client
    const { account } = await createAppwriteClient("admin");

    // Create a session using the userId and secret
    const session = await account.createSession(userId, secret);

    res.cookie("session", session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: new Date(session.expire),
      path: "/",
    });

    // try {
    //   const sessionCookie = req.cookies.session;
    //   const { account } = await createAppwriteClient("session", sessionCookie);
    //   const user = await account.get();

    // } catch (errorData) {
    //   errorData.status = "Fail";
    //   errorData.statusCode = 500;

    //   res.status(500).render("error", {
    //     error: errorData,
    //     currentRoute: "/error",
    //     locals,
    //   });
    // }

    return res.redirect("/loginSuccess");

  } catch (error) {
    console.error("OAuth login failed:", error.message);

    const errorData = new Error("OAuth login failed");
    errorData.status = "Fail";
    errorData.statusCode = 500;

    res.status(500).render("error", {
      error: errorData,
      currentRoute: "/error",
      locals,
    });
  }
});

router.get("/loginSuccess", authMiddleware, async (req, res) => {
  const locals = {
    title: "Login Successful",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  res.render("loginSuccess", { locals, currentRoute: "/loginSuccess"});
});

router.get("/oauth-failed", (req, res) => {
  const locals = {
    title: "Login Failed",
    description: "Unable to complete the login process. Please try again.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  const error = new Error("OAuth login failed");
  error.status = "Fail";
  error.statusCode = 500;
  res.render("admin/auth-failed", { locals, error });
});

// POST login
router.post("/admin", async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = new Error("Username and password are required");
      error.status = "Fail";
      error.statusCode = 400;

      res
        .status(error.statusCode)
        .render("error", { error, currentRoute: "/error", locals });
      next(error);
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      const error = new Error("Invalid username or password");
      error.status = "Fail";
      error.statusCode = 401;

      res
        .status(error.statusCode)
        .render("error", { error, currentRoute: "/error", locals });
      next(error);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid username or password");
      error.status = "Fail";
      error.statusCode = 401;

      res
        .status(error.statusCode)
        .render("error", { error, currentRoute: "/error", locals });
      next(error);
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// GET dashboard page
router.get("/dashboard", authMiddleware, async (req, res) => {
  const locals = {
    title: "Dashboard",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const posts = await Post.find();
    res.render("admin/dashboard", {
      layout: layout,
      locals,
      showLogout: true,
      posts,
    });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
  // res.send("/dashboard");
});

// GET add post page
router.get("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    title: "Add Post",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    res.render("admin/addPost", { layout: layout, locals, showLogout: true });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// POST add post to database
router.post("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      const error = new Error("Title and content are required");
      error.status = "Fail";
      error.statusCode = 400;
      res.render(error, { error, locals, currentRoute: "/error" });
      next(error);
      return;
    }

    const post = await Post.create({ title, body: content });
    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// GET edit post page
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    title: "Edit Post - " + req.body.title,
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    res.render("admin/editPost", {
      layout: layout,
      locals,
      showLogout: true,
      post,
    });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// PUT edit post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    if (!title || !content) {
      const error = new Error("Title and content are required");
      error.status = "Fail";
      error.statusCode = 400;
      res.render("error", { error, currentRoute: "/error", locals });
      next(error);
    }

    await Post.findByIdAndUpdate(id, {
      title,
      body: content,
      updatedAt: Date.now(),
    });

    res.redirect(`/post/${id}`);
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// DELETE post/:id
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const id = req.params.id;

    const post = await Post.findByIdAndDelete(id);

    // Check if the post exists
    if (!post) {
      const error = new Error("Post not found");
      error.statusCode = 404;
      error.status = "Not Found";
      res.render("error", { error, currentRoute: "/error", locals });
      next(error);
      return;
    }

    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// GET logout
router.get("/logout", authMiddleware, async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    res.clearCookie("session");
    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// GET register page
router.get("/register", async (req, res) => {
  const locals = {
    title: "Register",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    res.render("admin/register", { layout: layout, locals, showLogout: false });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

// POST register user
router.post("/register", async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName || req.user.name : "Admin",
  };
  try {
    const { firstName, lastName, email, username, password } = req.body;
    if (!email || !username || !password) {
      const error = new Error("Email, username and password are required");
      error.status = "Fail";
      error.statusCode = 400;
      res.render(error, { error, locals, currentRoute: "/error" });
      next(error);
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
      });
      res.redirect("/admin");
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error("Username already exists");
        error.status = "Fail";
        error.statusCode = 400;
        res.render("error", { error, currentRoute: "/error", locals });
        next(error);
        return;
      } else {
        err.status = "Fail";
        err.statusCode = 500;
        res.render("error", { error: err, currentRoute: "/error", locals });
        next(err);
        return;
      }
    }
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
  }
});

module.exports = router;

// const { OAuth2Client } = require('google-auth-library');
// const jwt = require('jsonwebtoken');

// // Google OAuth2 setup
// const googleClient = new OAuth2Client(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// // Endpoint to handle Google OAuth callback
// app.get('/auth/callback', async (req, res) => {
//   try {
//     const { code } = req.query;

//     // Exchange authorization code for tokens
//     const { tokens } = await googleClient.getToken(code);

//     // Verify the ID token from Google
//     const ticket = await googleClient.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
