const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Post = require("../models/Post");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const layout = path.join(__dirname, "..", "..", "views", "layouts", "admin");



// GET admin page
router.get("/admin", async (req, res) => {
  const locals = {
    title: "Admin Panel",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user ? req.user.firstName : "Admin",
  };
  try {
    res.render("admin/login", { layout: layout, locals, showLogout: false });
  } catch (error) {
      error.status = "Server error";
      error.statusCode = 500;
      res.render("error", { error, currentRoute: "/error", locals });
      next(error);
    }
});

// POST login
router.post("/admin", async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName : "Admin",
  };
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = new Error("Username and password are required")
        error.status = "Fail";
        error.statusCode = 400;
        
        res.status(error.statusCode)
        .render('error', { error, currentRoute: "/error", locals });
        next(error);
        return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      const error = new Error("Invalid username or password")
        error.status = "Fail";
        error.statusCode = 401;
        
        res.status(error.statusCode)
        .render('error', { error, currentRoute: "/error", locals });
        next(error);
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid username or password")
        error.status = "Fail";
        error.statusCode = 401;
        
        res.status(error.statusCode)
        .render('error', { error, currentRoute: "/error", locals });
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
    next(error);
  }
});

// GET dashboard page
router.get("/dashboard", authMiddleware, async (req, res) => {
  const locals = {
    title: "Dashboard",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user? req.user.firstName : "Admin",
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
    next(error);
  }
});

// GET add post page
router.get("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    title: "Add Post",
    description: "Simple blog page with NodeJs and MongoDB.",
    user: req.user? req.user.firstName : "Admin",
  };
  try {
    res.render("admin/addPost", { layout: layout, locals, showLogout: true });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
    next(error);
  }
});

// POST add post to database
router.post("/add-post", authMiddleware, async (req, res) => {
  const locals = {
    user:  req.user ? req.user.firstName : "Admin",
  };
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.status = "Fail";
      error.statusCode = 400;
      res.render(error, { error, locals, currentRoute: "/error" });
      next(error);
      return ;
    }

    const post = await Post.create({ title, body: content });
    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
    next(error);
  }
});

// GET edit post page
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    title: "Edit Post - " + req.body.title,
    description: "Simple blog page with NodeJs and MongoDB.",
    user:  req.user ? req.user.firstName : "Admin",
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
    next(error);
  }
});

// PUT edit post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    user:  req.user ? req.user.firstName : "Admin",
  };
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.status = "Fail";
      error.statusCode = 400;
      res.render("error", { error, currentRoute: "/error", locals });
      next(error);
      return;
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
    next(error);
  }
});

// DELETE post/:id
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  const locals = {
    user:  req.user ? req.user.firstName : "Admin",
  };
  try {
    const id = req.params.id;

    const post = await Post.findByIdAndDelete(id);

    // Check if the post exists
    if (!post) {
      const error = new Error("Post not found")
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
    next(error);
  }
});

// GET post/:id
router.get("/logout", authMiddleware, async (req, res) => {
  const locals = {
    user:  req.user ? req.user.firstName : "Admin",
  };
  try {
    res.clearCookie("token");
    res.redirect("/dashboard");
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
    next(error);
  }
});

// GET register page
router.get("/register", async (req, res) => {
  const locals = {
    title: "Register",
    description: "Simple blog page with NodeJs and MongoDB.",
    user:  req.user ? req.user.firstName : "Admin",
  };
  try {
    res.render("admin/register", { layout: layout, locals, showLogout: false });
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
    next(error);
  }
});

// POST register user
router.post("/register", async (req, res) => {
  const locals = {
    user: req.user ? req.user.firstName : "Admin",
  };
  try {
    const { firstName, lastName, email, username, password } = req.body;
    if (!email || !username || !password) {
      const error = new Error("Email, username and password are required");
      error.status = "Fail";
      error.statusCode = 400;
      res.render(error, { error, locals , currentRoute: '/error' });
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
        const error =new Error("Username already exists");
        error.status = "Fail";
        error.statusCode = 400;
        res.render("error", { error , currentRoute: '/error', locals });
        next(error)
        return;
      } else {
        err.status = "Fail";
        err.statusCode = 500;
        res.render("error", { error: err, currentRoute: '/error', locals });
        next(err);
        return;
      }
    }
  } catch (error) {
    error.statusCode = 500;
    error.status = "Server error";
    res.render("error", { error, currentRoute: "/error", locals });
    next(error);
  }
});

module.exports = router;
