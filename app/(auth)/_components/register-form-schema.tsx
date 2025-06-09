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
        })
        .regex(/[A-Z]/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one uppercase letter.'
        })
        .regex(/\d/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one number.'
        })
        .regex(/[@$!%*;?&#]/, {
          message: t
            ? t('password_validation')
            : 'Password must contain at least one special character.'
        }),
      confirmPassword: z.string().min(8, {
        message: t ? t('required') : 'Password must be at least 8 characters.'
      }),
      firstName: z.string().min(1, {
        message: t ? t('required') : 'First name is required.'
      }),
      lastName: z.string().min(1, {
        message: t ? t('required') : 'Last name is required.'
      }),
      phone: z.string().min(5, {
        message: t ? t('required') : 'Phone number is required.'
      })
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t ? t('password_notmatching') : 'Password does not match.',
      path: ['confirmPassword']
    });
}


export type UserFormValue = z.infer<Awaited<ReturnType<typeof formSchema>>>;
