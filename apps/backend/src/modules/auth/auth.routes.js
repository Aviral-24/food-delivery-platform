import { Router } from "express";
import { register, login, me } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { authRateLimiter } from "../../middlewares/rateLimiter.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;
