export type IconName = 'arrow-left' | 'x';
export type IconSize = 'x-small' | 'small' | 'medium' | 'large' | 'x-large';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
}
