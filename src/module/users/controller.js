const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const userService = require("./service");
const tokenService = require("../tokens/service");
const pick = require("../../utils/pick");
const path = require("path");

// Register and generate authentication tokens
const register = catchAsync(async (req, res) => {
  const user = await userService.register(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

// Login and generate authentication tokens
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

// Logout
const logout = catchAsync(async (req, res) => {
  await userService.logout(req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

// Query users
const queryUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ["page", "limit"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

// Get a user by ID
const getUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log("Received ID:", id); // Debugging log
  const result = await userService.getUserById(id);
  console.log("User data:", result); // Debugging log
  if (!result) {
    return res.status(httpStatus.NOT_FOUND).send({ message: "User not found" });
  }
  res.send(result);
});

// Update user profile
const updateProfile = catchAsync(async (req, res) => {
  const { id } = req.params; // Use id here instead of id
  const { fullName, email } = req.body;
  const image = req.file ? path.join("uploads", req.file.filename) : null;

  console.log("User ID:", id); // This should now log the id from the URL

  const updatedUser = await userService.updateProfile(id, {
    fullName,
    email,
    image,
  });
  res.status(httpStatus.OK).json(updatedUser);
});

// Delete a user
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params; // Ensure that this correctly extracts the 'id' from the URL
  console.log("User ID to delete:", id); // Debugging log
  const result = await userService.deleteUser(id);
  console.log("Delete user result:", result); // Debugging log
  if (!result) {
    return res.status(httpStatus.NOT_FOUND).send({ message: "User not found" });
  }
  res.status(httpStatus.NO_CONTENT).send(); // Responding with 204 for successful deletion
});

// Refresh authentication tokens
const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await userService.refreshAuth(refreshToken);
  res.send({ ...tokens });
});

// Forgot password (send reset email)
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const response = await userService.forgotPassword(email);
  res.json(response);
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  const { resetPasswordToken, newPassword } = req.body;
  const response = await userService.resetPassword(
    resetPasswordToken,
    newPassword
  );
  res.status(httpStatus.NO_CONTENT).send(response);
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  getUser,
  queryUsers,
  updateProfile,
  deleteUser,
};
