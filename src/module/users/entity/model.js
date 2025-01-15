// src/module/users/entity/model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { toJSON, paginate } = require('../../../utils/plugins'); // Utility plugins

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
 
  role: {
    type: String,
    enum: ['user', 'admin'],  // Possible roles (you can add more roles if needed)
    default: 'user',  // Default role is 'user'
  },
}, { timestamps: true });

// Add plugins to the schema
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The ID of the user to be excluded
 * @returns {Promise<boolean>} - Returns true if email is taken, else false
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user; // Returns true if email exists, else false
};

/**
 * Check if password matches the user's password
 * @param {string} password - The password to compare
 * @returns {Promise<boolean>} - Returns true if passwords match, else false
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password); // Compare given password with stored hashed password
};

/**
 * Generate Auth Token (JWT)
 * @returns {string} - Returns the generated auth token (JWT)
 */
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

/**
 * Generate Refresh Token
 * @returns {string} - Returns the generated refresh token
 */
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return refreshToken;
};

/**
 * Hash the password before saving the user
 * @param {Function} next - The callback to call when password hashing is done
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8); // Hash password before saving
  }
  next(); // Proceed to save the user
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
