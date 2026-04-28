import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, getApiError } from '@/api/client';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = (onSuccess?: () => void) => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      apiClient.post('/users/change-password', payload),
    onSuccess: () => {
      toast.success('Password changed successfully.');
      onSuccess?.();
    },
  });

  return {
    submit: mutate,
    loading: isPending,
    error: error ? getApiError(error, 'Failed to change password.') : null,
  };
};
