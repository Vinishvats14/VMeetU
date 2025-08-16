import express from 'express';
import { signup, login, logout , onboard, getMe } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);     // why post here becuz post is ued to change the server sode region so invalid the token is a thing 
router.get('/me', protectRoute, getMe);

router.post("/onboarding", protectRoute, onboard);

export default router;