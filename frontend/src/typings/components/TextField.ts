import { InputHTMLAttributes } from 'react';

export type TextFieldState = 'default' | 'error' | 'success';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  eyebrow?: string;
  hint?: string;
  state?: TextFieldState;
}
