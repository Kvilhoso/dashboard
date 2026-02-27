import { ButtonHTMLAttributes } from 'react';
import { IconName, IconSize } from './Icon';

export type IconButtonRounded = 'full' | 'large';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  name: IconName;
  size?: IconSize;
  rounded?: IconButtonRounded;
}
