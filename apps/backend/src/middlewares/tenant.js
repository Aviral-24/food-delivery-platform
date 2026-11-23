import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";

export const attachTenantContext = (req, res, next) => {
  const restaurantHeader = req.headers["x-restaurant-id"];

  req.tenant = {
    userId: req.user?.id || null,
    role: req.user?.role || null,
    restaurantId:
      (typeof restaurantHeader === "string" && restaurantHeader.trim()) ||
      req.params?.restaurantId ||
      null,
  };

  next();
};

export const requireOwnerOrAdmin = (getOwnerId) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  const ownerId = getOwnerId(req);
  if (!ownerId || ownerId !== req.user.id) {
    return next(new ApiError(403, "Tenant access denied for this resource"));
  }

  return next();
};
