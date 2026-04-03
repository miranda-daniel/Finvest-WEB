import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/api/hooks/auth/useLogin'

const signInSchema = z.object({
  email: z.email({ message: 'Enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

type SignInFormValues = z.infer<typeof signInSchema>

// SignInForm — the login form.
//
// Uses React Hook Form + Zod for validation.
// Delegates the actual login request and navigation to useLogin().
export function SignInForm() {
  const { submit, loading, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      {error && <p>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
