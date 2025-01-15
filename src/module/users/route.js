const express = require("express");
const passport = require("passport");
const controller = require("./controller");
const validation = require("./validation");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const { fileUpload } = require("../../utils/fileUpload"); // Import the file upload middleware

const router = express.Router();

// Register and query users
router
  .route("/")
  .post(validate(validation.register), controller.register)
  .get(validate(validation.queryUsers), controller.queryUsers);

// Login and logout
router.route("/login").post(validate(validation.login), controller.login);
router.route("/logout").post(validate(validation.logout), controller.logout);

// Google OAuth Login route - Change this to GET
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Handle successful login
    res.redirect("/"); // Redirect after successful login
  }
);

// Facebook OAuth Login route - Change this to GET
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// Facebook OAuth callback route
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    // Handle successful login
    res.redirect("/"); // Redirect after successful login
  }
);

// User CRUD operations
router
  .route("/users/:id")
  .get(validate(validation.getUser), controller.getUser)
  .patch(
    fileUpload.single("image"),
    validate(validation.updateProfileSchema),
    controller.updateProfile
  )
  .delete(validate(validation.deleteUser), controller.deleteUser);

// Forgot Password Route
router
  .route("/forgot-password")
  .post(validate(validation.forgotPassword), controller.forgotPassword);

// Reset Password Route
router
  .route("/reset-password")
  .post(validate(validation.resetPassword), controller.resetPassword);

module.exports = {
  authRoutes: router,
};
