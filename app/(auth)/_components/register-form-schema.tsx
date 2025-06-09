import * as z from 'zod';

export function formSchema(t?: (key: string) => string) {
  return z
    .object({
      email: z.string().email({
        message: t ? t('invalid') : 'Please enter a valid email address.'
      }),

      password: z
        .string()
        .min(8, {
          message: t
            ? t('password_validation')
            : 'Password must be at least 8 characters.'
        })
        .max(100, {
          message: t
            ? t('password_validation')
            : 'Password must not exceed 100 characters.'
        })
        .regex(/[a-z]/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one lowercase letter.'
        }) // Lowercase letter
        .regex(/[A-Z]/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one uppercase letter.'
        }) // Uppercase letter
        .regex(/\d/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one number.'
        }) // Number
        .regex(/[@$!%*;?&#]/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one special character (@$!%*;?&#).'
        }),
      confirmPassword: z.string().min(8, {
        message: t ? t('required') : 'Password must be at least 8 characters.'
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t ? t('password_notmatching') : 'Password does not match.',
      path: ['confirmPassword']
    });
}

export type UserFormValue = z.infer<Awaited<ReturnType<typeof formSchema>>>;
