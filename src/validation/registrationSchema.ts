import { z } from 'zod';

export const passwordCriteria = {
  minLength: (p: string) => p.length >= 12,
  hasUpper: (p: string) => /[A-Z]/.test(p),
  hasLower: (p: string) => /[a-z]/.test(p),
  hasNumber: (p: string) => /[0-9]/.test(p),
  hasSpecial: (p: string) => /[^A-Za-z0-9]/.test(p),
};

export const calculatePasswordScore = (password: string): { score: number; label: string } => {
  if (!password) return { score: 0, label: 'No password entered' };
  let passedCount = 0;
  if (passwordCriteria.minLength(password)) passedCount++;
  if (passwordCriteria.hasUpper(password)) passedCount++;
  if (passwordCriteria.hasLower(password)) passedCount++;
  if (passwordCriteria.hasNumber(password)) passedCount++;
  if (passwordCriteria.hasSpecial(password)) passedCount++;

  if (passedCount <= 1) return { score: 1, label: 'Weak (does not meet criteria)' };
  if (passedCount === 2 || passedCount === 3) return { score: 2, label: 'Moderate' };
  if (passedCount === 4) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong (all criteria met)' };
};

export const registrationSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required.' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters in length.' })
      .max(80, { message: 'Full name cannot exceed 80 characters.' }),
    email: z
      .string({ required_error: 'Email address is required.' })
      .trim()
      .min(1, { message: 'Email address is required.' })
      .email({ message: 'Enter a valid email address, such as name@example.com.' }),
    accountType: z.enum(['individual', 'developer', 'enterprise'], {
      errorMap: () => ({ message: 'Please select an account type.' }),
    }),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(12, { message: 'Password must contain at least 12 characters.' })
      .refine(passwordCriteria.hasUpper, {
        message: 'Password must include at least one uppercase letter (A-Z).',
      })
      .refine(passwordCriteria.hasLower, {
        message: 'Password must include at least one lowercase letter (a-z).',
      })
      .refine(passwordCriteria.hasNumber, {
        message: 'Password must include at least one numerical digit (0-9).',
      })
      .refine(passwordCriteria.hasSpecial, {
        message: 'Password must include at least one special symbol (e.g. !@#$%^&*).',
      }),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required.' })
      .min(1, { message: 'Please confirm your password.' }),
    accommodations: z.array(z.string()).default([]),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must review and accept the Terms of Service to continue.' }),
    }),
    agreePrivacy: z.literal(true, {
      errorMap: () => ({ message: 'You must review and accept the Privacy Policy to continue.' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match. Please ensure both password entries are identical.',
    path: ['confirmPassword'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
