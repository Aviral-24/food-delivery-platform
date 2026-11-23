import { asyncHandler } from '../../utils/asyncHandler.js';
import { authService } from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'User registered successfully', data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json({ success: true, message: 'Login successful', data });
});

export const sendPhoneOtp = asyncHandler(async (req, res) => {
  const data = await authService.sendPhoneOtp(req.body);
  res.status(200).json({ success: true, message: 'OTP sent', data });
});

export const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const data = await authService.verifyPhoneOtp(req.body);
  res.status(200).json({ success: true, message: 'Phone verified', data });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user);
  res.status(200).json({ success: true, data: user });
});