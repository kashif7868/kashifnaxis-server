const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const User = require('../module/users/entity/model');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// Verify the JWT token and extract the user
const jwtVerify = async (payload, done) => {
  try {
    // Check if the token type is ACCESS
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    // Find the user by ID from the payload
    const user = await User.findById(payload.sub);
    if (user) {
      // User found, pass user object to the next middleware
      return done(null, user);
    }

    // If no user found, return false
    done(null, false);
  } catch (error) {
    // Error occurred during verification
    done(error, false);
  }
};

// JWT strategy for authentication
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
