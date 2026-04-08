// src/components/SettingsPage/sections/SecuritySection.tsx
//
// Change password form.
// The submit button is disabled — the API endpoint does not yet exist.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

const FormField = ({ label, error, inputProps }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-slate-400 uppercase tracking-wide">{label}</label>
    <input
      {...inputProps}
      className={`h-9 rounded-lg border bg-white/[0.05] px-3 text-[13px] text-slate-200 outline-none focus:ring-1 transition-colors ${
        error
          ? 'border-rose-500/60 focus:ring-rose-500/40'
          : 'border-white/10 focus:ring-white/20'
      }`}
    />
    {error && <span className="text-[11px] text-rose-400">{error}</span>}
  </div>
);

export const SecuritySection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Submit handler is a no-op — the endpoint is not yet implemented.
  const onSubmit = (_values: ChangePasswordFormValues) => {
    // intentional no-op: API endpoint not yet available
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100 mb-1">Security</h2>
      <p className="text-sm text-slate-400 mb-6">Change your account password.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm">
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
          inputProps={{ type: 'password', ...register('currentPassword') }}
        />
        <FormField
          label="New password"
          error={errors.newPassword?.message}
          inputProps={{ type: 'password', ...register('newPassword') }}
        />
        <FormField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          inputProps={{ type: 'password', ...register('confirmPassword') }}
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled
            title="Coming soon — API endpoint not yet implemented"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 cursor-not-allowed opacity-60"
          >
            Change password
          </button>
        </div>
      </form>
    </div>
  );
};
