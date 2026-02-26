import { ButtonHTMLAttributes } from 'react';

export type IconButtonName = 'arrow-left' | 'x';
export type IconButtonSize =
  | 'x-small'
  | 'small'
  | 'medium'
  | 'large'
  | 'x-large';
export type IconButtonRounded = 'full' | 'large';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  name: IconButtonName;
  size?: IconButtonSize;
  rounded?: IconButtonRounded;
}
