import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { authDataSchema, userSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/authStore';

export const useLoginMutation = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();

  return useMutation({
    /** @param {{ email: string, password: string }} credentials */
    mutationFn: (credentials) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
        schema: authDataSchema,
      }),
    onSuccess: (data) => {
      setSession(data);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useRegisterMutation = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();

  return useMutation({
    /** @param {{ name: string, email: string, password: string, role: string }} payload */
    mutationFn: (payload) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: payload,
        schema: authDataSchema,
      }),
    onSuccess: (data) => {
      setSession(data);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useMeQuery = () => {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['me'],
    enabled: Boolean(token),
    queryFn: async () => {
      const user = await apiRequest('/auth/me', { schema: userSchema });
      setUser(user);
      return user;
    },
  });
};

export const useSendPhoneOtpMutation = () =>
  useMutation({
    mutationFn: ({ phone }) =>
      apiRequest('/auth/phone/send-otp', {
        method: 'POST',
        body: { phone },
      }),
  });

export const useVerifyPhoneOtpMutation = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, token }) =>
      apiRequest('/auth/phone/verify-otp', {
        method: 'POST',
        body: { phone, token },
        schema: authDataSchema,
      }),
    onSuccess: (data) => {
      setSession(data);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
};