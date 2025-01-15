const Joi = require('joi');

// Register user schema
const register = Joi.object({
  fullName: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(20),
  image: Joi.string().optional(),
  googleId: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin').optional().default('user'),
});

// Login schema
const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Logout schema
const logout = Joi.object({
  refreshToken: Joi.string().required(),
});

// Get user by ID schema
const getUser = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

// Update user profile schema
const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  image: Joi.string().optional(),
});

// Delete user schema
const deleteUser = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

// Query users schema
const queryUsers = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
});

// Forgot Password schema
const forgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

// Reset Password schema
const resetPassword = Joi.object({
  resetPasswordToken: Joi.string().required(),
  newPassword: Joi.string().min(6).max(20).required(),
});



module.exports = {
  register,
  login,
  logout,
  getUser,
  updateProfileSchema,
  deleteUser,
  queryUsers,
  forgotPassword,
  resetPassword,
};
