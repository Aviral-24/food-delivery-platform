import { supabaseAnon } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) {
      return next(new ApiError(401, 'Invalid or expired authentication token'));
    }

    const supaUser = data.user;
    req.user = {
      id: supaUser.id,
      email: supaUser.email,
      role: supaUser.app_metadata?.role || ROLES.CUSTOMER,
    };

    return next();
  } catch (err) {
    return next(err);
  }
};