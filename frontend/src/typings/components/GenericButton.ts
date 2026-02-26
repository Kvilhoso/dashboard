import { ButtonHTMLAttributes } from 'react';

export type GenericButtonLayout = 'default' | 'outline';
export type GenericButtonRounded = 'full' | 'lg';

export interface GenericButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  layout?: GenericButtonLayout;
  rounded?: GenericButtonRounded;
  loading?: boolean;
}
