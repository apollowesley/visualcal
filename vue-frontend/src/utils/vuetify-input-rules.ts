import { isValidEmailAddress } from './validation';

export type VuetifyRule = (v?: string) => boolean | string;

export const requiredRule: VuetifyRule = (v) => v && v.length > 0 || 'Required';

export const passwordRules = {
  required: requiredRule,
  min: (value?: string) => (value && value.length >= 8) || 'Min 8 characters',
  email: (value: string) => (isValidEmailAddress(value)) || ('Please enter a valid email address'),
}
