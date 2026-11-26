import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js';
import { profilesQueries } from '../../db/queries/profiles.queries.js';
import { ApiError } from '../../utils/ApiError.js';

// Dev-only in-memory OTP store (phone -> { otp, expiresAt })
const devOtpStore = new Map();

const normalizePhone = (phone) => {
  const cleaned = String(phone || '').trim().replace(/[\s-]+/g, '');
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const getDevPhoneCredentials = (normalizedPhone) => {
  const digits = normalizedPhone.replace(/\D/g, '');
  const email = `phone_${digits}@phone.swadexpress.com`;
  const password =
    crypto
      .createHmac('sha256', env.SUPABASE_SERVICE_ROLE_KEY)
      .update(normalizedPhone)
      .digest('hex')
      .slice(0, 24) + 'Aa1!';
  return { digits, email, password };
};

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

  async sendPhoneOtp(input) {
    const phone = typeof input === 'string' ? input : input?.phone;
    const normalizedPhone = normalizePhone(phone);

    // Local/Dev mode: kisi bhi number ke liye dynamic 6-digit OTP (bina Twilio ke)
    if (env.NODE_ENV !== 'production') {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      devOtpStore.set(normalizedPhone, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      logger.info({ phone: normalizedPhone, otp }, 'Dev Phone OTP generated');

      return {
        phone: normalizedPhone,
        message: 'OTP sent successfully (dev mode)',
        devOtp: otp,
      };
    }

    // Production mode: real Supabase SMS provider
    const { error } = await supabaseAnon.auth.signInWithOtp({ phone: normalizedPhone });
    if (error) {
      throw new ApiError(400, error.message);
    }

    return { phone: normalizedPhone, message: 'OTP sent successfully' };
  },

  async verifyPhoneOtp({ phone, token, otp }) {
    const normalizedPhone = normalizePhone(phone);
    const code = String(token ?? otp ?? '').trim();

    if (env.NODE_ENV !== 'production') {
      const record = devOtpStore.get(normalizedPhone);
      if (!record || Date.now() > record.expiresAt || record.otp !== code) {
        throw new ApiError(401, 'Invalid or expired OTP');
      }
      devOtpStore.delete(normalizedPhone);

      const { digits, email, password } = getDevPhoneCredentials(normalizedPhone);

      // 1. Existing phone user ke liye direct sign-in
      let { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

      // 2. Naya number hone par confirmed Supabase user create karein
      if (error || !data?.session) {
        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          phone: normalizedPhone,
          password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            name: `User ${digits.slice(-4)}`,
            role: 'customer',
          },
          app_metadata: {
            role: 'customer',
          },
        });

        if (createErr && !createErr.message.toLowerCase().includes('already')) {
          throw new ApiError(400, createErr.message);
        }

        const retry = await supabaseAnon.auth.signInWithPassword({ email, password });
        if (retry.error || !retry.data?.session) {
          throw new ApiError(401, retry.error?.message || 'Could not create phone session');
        }
        data = retry.data;
      }

      return {
        user: {
          id: data.user.id,
          name: data.user.user_metadata?.name || `User ${digits.slice(-4)}`,
          email: data.user.email,
          phone: data.user.phone || normalizedPhone,
          role: data.user.app_metadata?.role || data.user.user_metadata?.role || 'customer',
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    }

    // Production mode: real Supabase OTP verification
    const { data, error } = await supabaseAnon.auth.verifyOtp({
      phone: normalizedPhone,
      token: code,
      type: 'sms',
    });

    if (error || !data?.session) {
      throw new ApiError(401, error?.message || 'Invalid OTP');
    }

    return {
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'User',
        email:
          data.user.email || `phone_${normalizedPhone.replace(/\D/g, '')}@phone.swadexpress.com`,
        phone: data.user.phone || normalizedPhone,
        role: data.user.app_metadata?.role || data.user.user_metadata?.role || 'customer',
      },
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },
};