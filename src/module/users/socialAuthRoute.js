const express = require('express');
const passport = require('passport');
const router = express.Router();

// Facebook authentication route
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook callback route
router.get('/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

module.exports = {
  socialAuthRoutes: router,
};
