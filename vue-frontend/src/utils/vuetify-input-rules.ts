import { isValidEmailAddress } from './validation';

type VuetifyRule = (v?: string) => boolean | string;

export const passwordRules = {
  required: (value?: string) => !!value || 'Required.',
  min: (value?: string) => (value && value.length >= 8) || 'Min 8 characters',
  email: (value: string) => (isValidEmailAddress(value)) || ('Please enter a valid email address'),
}