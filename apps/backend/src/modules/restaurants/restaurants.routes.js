import { Router } from "express";
import { z } from "zod";
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
} from "./restaurants.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { ROLES } from "../../constants/roles.js";

const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Restaurant name is required"),
    cuisine: z.array(z.string()).min(1, "At least one cuisine is required"),
    city: z.string().trim().min(2).optional(),
    avgCostForTwo: z.number().positive().optional(),
    deliveryTimeMins: z.number().int().positive().optional(),
  }),
});

const router = Router();

router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.post(
  "/",
  authenticate,
  authorize(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  validate(createRestaurantSchema),
  createRestaurant,
);

export default router;
