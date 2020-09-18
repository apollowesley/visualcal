type VuetifyRule = (v?: string) => boolean | string;

export const passwordRules = {
  required: (value?: string) => !!value || 'Required.',
  min: (value?: string) => value && value.length >= 8 || 'Min 8 characters',
  emailMatch: () => ('The email and password you entered don\'t match'),
}
