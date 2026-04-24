import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { IconCheck } from '@/components/ui/icons';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '@/api/hooks/users/useChangePassword';
import { passwordRules, passwordSchema } from '@/lib/passwordPolicy';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface PasswordRequirementsProps {
  value: string;
}

const PasswordRequirements = ({ value }: PasswordRequirementsProps) => {
  return (
    <ul className="flex flex-col gap-1 pt-0.5">
      {passwordRules.map((rule) => {
        const met = rule.test(value);

        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-[12px] transition-colors duration-200 ${
              met ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            <IconCheck size={12} className={met ? 'text-emerald-400' : 'text-slate-600'} />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};

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
        error ? 'border-rose-500/60 focus-visible:ring-rose-500/40' : 'border-white/10'
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
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword', defaultValue: '' });

  const { submit, loading, error } = useChangePassword(() => reset());

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
        <div className="flex flex-col gap-2">
          <FormField
            label="New password"
            error={errors.newPassword?.message}
            inputProps={{ autoComplete: 'new-password', ...register('newPassword') }}
          />
          <PasswordRequirements value={newPasswordValue} />
        </div>
        <FormField
          label="Confirm new password"
          error={errors.confirmPassword?.message}
          inputProps={{ autoComplete: 'new-password', ...register('confirmPassword') }}
        />

        {error && <p className="text-[12px] text-rose-400">{error}</p>}

        <div className="pt-1">
          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? 'Saving…' : 'Change password'}
          </Button>
        </div>
      </form>
    </div>
  );
};
