import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js';
import { profilesQueries } from '../../db/queries/profiles.queries.js';
import { ApiError } from '../../utils/ApiError.js';

export const authService = {
  async register({ name, email, password, role }) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role },
    });

    if (createErr) {
      const status = createErr.message.toLowerCase().includes('already') ? 409 : 400;
      throw new ApiError(status, createErr.message);
    }

    const { data: sessionData, error: loginErr } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr || !sessionData.session) {
      throw new ApiError(500, loginErr?.message || 'Failed to issue session');
    }

    return {
      user: {
        id: created.user.id,
        name,
        email: created.user.email,
        role,
      },
      token: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    };
  },

  async login({ email, password }) {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const userContext = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.app_metadata?.role || 'customer',
    };

    const profile = await profilesQueries.findById(userContext, userContext.id);

    return {
      user: profile || userContext,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  async sendPhoneOtp({ phone }) {
    const { error } = await supabaseAnon.auth.signInWithOtp({ phone });
    if (error) throw new ApiError(400, error.message);
    return { phone, sent: true };
  },

  async verifyPhoneOtp({ phone, token }) {
    const { data, error } = await supabaseAnon.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error || !data.session) {
      throw new ApiError(401, error?.message || 'Invalid OTP');
    }
    return {
      user: {
        id: data.user.id,
        phone: data.user.phone,
        role: data.user.app_metadata?.role || 'customer',
      },
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  async getProfile(user) {
    const profile = await profilesQueries.findById(user, user.id);
    if (!profile) {
      throw new ApiError(404, 'Profile not found');
    }
    return profile;
  },
};