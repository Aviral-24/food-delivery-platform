import { Router } from 'express';
import { register, login, sendPhoneOtp, verifyPhoneOtp, me } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  phoneOtpSendSchema,
  phoneOtpVerifySchema,
} from './auth.schema.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/phone/send-otp', authRateLimiter, validate(phoneOtpSendSchema), sendPhoneOtp);
router.post('/phone/verify-otp', authRateLimiter, validate(phoneOtpVerifySchema), verifyPhoneOtp);
router.get('/me', authenticate, me);

export default router;