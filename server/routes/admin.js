const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();
const layout = path.join(__dirname, "..", "..", "views", "layouts", "admin");

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

// GET admin page
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin Panel",
      description: "Simple blog page with NodeJs and MongoDB.",
    };
    res.render("admin/login", { layout: layout, locals, showLogout: false });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET dashboard page
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple blog page with NodeJs and MongoDB.",
    };
    const posts = await Post.find();
    res.render("admin/dashboard", {
      layout: layout,
      locals,
      showLogout: true,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET add post page
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple blog page with NodeJs and MongoDB.",
    };
    res.render("admin/addPost", { layout: layout, locals, showLogout: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST add post to database
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = await Post.create({ title, body: content });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET edit post page
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post - " + req.body.title,
      description: "Simple blog page with NodeJs and MongoDB.",
    };
    const id = req.params.id;
    const post = await Post.findById(id);
    res.render("admin/editPost", {
      layout: layout,
      locals,
      showLogout: true,
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// PUT edit post
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    await Post.findByIdAndUpdate(id, {
      title,
      body: content,
      updatedAt: Date.now(),
    });

    res.redirect(`/post/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// DELETE post/:id
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    const post = await Post.findByIdAndDelete(id);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET post/:id
router.get("/logout", authMiddleware, async (req, res) => {
  try {
    res.clearCookie("token");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// GET register page
router.get("/register", async (req, res) => {
  try {
    const locals = {
      title: "Register",
      description: "Simple blog page with NodeJs and MongoDB.",
    };
    res.render("admin/register", { layout: layout, locals, showLogout: false });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// POST register user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username and password are required" });
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
        return res
          .status(400)
          .json({ message: "Username already exists", user });
      } else {
        return res.status(500).json({ message: "Internal Server Error", err });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
