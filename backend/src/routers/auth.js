const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../app/controllers/AuthController');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// Facebook login routes
router.get('/facebook',
    passport.authenticate('facebook', { 
        scope: ['email', 'public_profile'],
        authType: 'rerequest',
        display: 'popup'
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })
);

// Google login routes
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })
);

module.exports = router;