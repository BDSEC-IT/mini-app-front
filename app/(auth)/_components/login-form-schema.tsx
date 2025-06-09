import * as z from 'zod';

export function formSchema(t?: (key: string) => string) {
  return z.object({
    email: z.string().email({
      message: t ? t('invalid') : 'Please enter a valid email address.'
    }),
    password: z.string().min(5, {
      message: t ? t('min') : 'Message must be at least 10 characters.'
    })
  });
}

export type UserFormValue = z.infer<Awaited<ReturnType<typeof formSchema>>>;
