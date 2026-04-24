import { useMutation } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = (onSuccess?: () => void) => {
  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      apiClient.post('/users/change-password', payload),
    onSuccess,
  });

  return {
    submit: mutate,
    loading: isPending,
    error: error ? getApiError(error, 'Failed to change password.') : null,
    isSuccess,
  };
};
