import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import restaurantsRoutes from "../modules/restaurants/restaurants.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/restaurants", restaurantsRoutes);

export default router;
