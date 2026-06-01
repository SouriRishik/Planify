import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authenticate, authController.me);

export default router;
