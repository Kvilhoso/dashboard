import { ButtonHTMLAttributes } from 'react';

export type GenericButtonLayout = 'default' | 'outline';
export type GenericButtonRounded = 'full' | 'large';

export interface GenericButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  layout?: GenericButtonLayout;
  rounded?: GenericButtonRounded;
  loading?: boolean;
}
