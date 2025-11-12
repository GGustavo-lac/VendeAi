import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Configure OAuth strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.API_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { user, token } = await AuthService.loginOrRegisterOAuth(
      'google',
      profile.id,
      profile.emails?.[0]?.value || '',
      profile.displayName || profile.name?.givenName || '',
      profile.photos?.[0]?.value
    );
    return done(null, { user, token });
  } catch (error) {
    return done(error, undefined);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { user, token } = await AuthService.loginOrRegisterOAuth(
      'facebook',
      profile.id,
      profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
      profile.displayName || '',
      profile.photos?.[0]?.value
    );
    return done(null, { user, token });
  } catch (error) {
    return done(error, undefined);
  }
}));

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 2, max: 50 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', authenticateToken, async (req: any, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await AuthService.logout(token);
    }
    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${req.auth.token}&user=${encodeURIComponent(JSON.stringify(req.auth.user))}`;
    res.redirect(redirectUrl);
  }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req: any, res) => {
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${req.auth.token}&user=${encodeURIComponent(JSON.stringify(req.auth.user))}`;
    res.redirect(redirectUrl);
  }
);

export default router;