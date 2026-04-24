import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '@/api/hooks/users/useChangePassword';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface FormFieldProps {
  label: string;
  error?: string;
  inputProps: Omit<React.ComponentProps<'input'>, 'type'>;
}

const FormField = ({ label, error, inputProps }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-label">{label}</label>
    <PasswordInput
      {...inputProps}
      className={`h-9 rounded-lg border px-3 text-[13px] ${
        error
          ? 'border-rose-500/60 focus-visible:ring-rose-500/40'
          : 'border-white/10'
      }`}
    />
    {error && <span className="text-[11px] text-rose-400">{error}</span>}
  </div>
);

export const SecuritySection = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { submit, loading, error, isSuccess } = useChangePassword(() => reset());

  const onSubmit = (values: ChangePasswordFormValues) => {
    submit({ currentPassword: values.currentPassword, newPassword: values.newPassword });
  };

  return (
    <div>
      <h2 className="text-heading-2 mb-1">Security</h2>
      <p className="text-subtle mb-6">Change your account password.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
          inputProps={{ autoComplete: 'current-password', ...register('currentPassword') }}
        />
        <FormField
          label="New password"
          error={errors.newPassword?.message}
          inputProps={{ autoComplete: 'new-password', ...register('newPassword') }}
        />
        <FormField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          inputProps={{ autoComplete: 'new-password', ...register('confirmPassword') }}
        />

        {error && <p className="text-[12px] text-rose-400">{error.message}</p>}

        {isSuccess && (
          <p className="text-[12px] text-emerald-400">Password changed successfully.</p>
        )}

        <div className="pt-1">
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? 'Saving…' : 'Change password'}
          </Button>
        </div>
      </form>
    </div>
  );
};
