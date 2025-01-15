const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");
const User = require("./entity/model");
const Token = require("../tokens/entity/model");
const path = require("path");
const fs = require("fs");
const systemConfigService = require("../systemConfig/service");
const jwt = require("jsonwebtoken");
const emailService = require("../emails/passwordEmailService");

/**
 * Register a new user
 * @param {Object} body - The user data
 * @returns {Promise<Object>} - The created user
 */
const register = async (body) => {
  const emailTaken = await User.isEmailTaken(body.email);
  if (emailTaken) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
  }
  return await User.create(body);
};

/**
 * Login with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<Object>} - The logged-in user
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await getUser({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  if (user.suspended) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Your account has been suspended, Please contact administration!"
    );
  }
  return user;
};

/**
 * Helper function to get a user by filter
 * @param {Object} filter - The filter criteria for finding the user
 * @returns {Promise<Object>} - The user matching the filter
 */
const getUser = async (filter) => {
  return await User.findOne(filter);
};

/**
 * Logout the user by removing the refresh token
 * @param {Object} data - The logout data containing refreshToken
 * @returns {Promise<void>}
 */
const logout = async (data) => {
  const { refreshToken } = data;
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    await systemConfigService.updateActiveSessionCount(-1);
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await refreshTokenDoc.remove();
};

const getUserById = async (id) => {
  console.log("Searching for user with ID:", id); // Debugging log
  const user = await User.findById(id);
  console.log("Found user:", user); // Debugging log
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

/**
 * Update user profile
 * @param {string} id - The user ID
 * @param {Object} data - The user data to update (fullName, email, image)
 * @returns {Promise<Object>} - The updated user
 */
const updateProfile = async (id, { fullName, email, image }) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found"); // Error is thrown here
  }

  // Update fields
  if (fullName) user.fullName = fullName;
  if (email) user.email = email;

  // Handle image upload
  if (image) {
    // If image exists, remove old image if there is one
    if (user.image) {
      const oldImagePath = path.join(__dirname, "..", "..", user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete old image file
      }
    }
    user.image = image; // Save new image path
  }

  await user.save();
  return user;
};

const deleteUser = async (id) => {
  console.log("Searching for user with ID:", id); // Debugging log
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.remove();
  return user; // Return the deleted user data (optional)
};

/**
 * Query users with pagination and filtering
 * @param {Object} filter - The filter criteria
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated user list
 */
const queryUsers = async (filter, options) => {
  return await User.paginate(filter, options);
};


/**
 * Forgot password (send reset email with token)
 * @param {string} email - The user's email
 * @returns {Promise<Object>} - Confirmation message
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email Address");
  }

  // Generate reset password token using jwt.sign()
  const resetPasswordToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Create the token document in the database
  const token = new Token({
    token: resetPasswordToken,
    user: user._id,
    type: tokenTypes.RESET_PASSWORD,
    expires: Date.now() + 60 * 60 * 1000,  // Token expiration time (1 hour from now)
    uid: user._id,  // Store the user ID
  });

  await token.save();

  // Send reset password email with the token
  await emailService.sendForgotPasswordEmail(user.email, resetPasswordToken);

  return { message: "Password reset email sent" };
};

/**
 * Reset password using the reset token
 * @param {string} resetPasswordToken - The reset password token
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - Confirmation message
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    // Verify the reset password token
    const decoded = jwt.verify(resetPasswordToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    // Delete the token after successful password reset
    await Token.deleteMany({ user: user._id, type: tokenTypes.RESET_PASSWORD });

    // Send confirmation email for successful password reset
    await emailService.sendResetPasswordConfirmationEmail(user.email);

    return { message: "Password reset successfully. A confirmation email has been sent" };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired token");
  }
};

module.exports = {
  register,
  loginUserWithEmailAndPassword,
  logout,
  forgotPassword,
  resetPassword,
  getUserById,
  updateProfile,
  deleteUser,
  queryUsers,
  getUser, // Export the getUser method
};
