import { IconName, IconProps, IconSize } from '@/typings';
import { ArrowLeftIcon, XIcon } from 'lucide-react';

export function Icon(props: IconProps) {
  const { name, size = 'medium', className } = props;

  const sizes: Record<IconSize, string> = {
    'x-small': 'size-3',
    small: 'size-3.5',
    medium: 'size-4',
    large: 'size-6',
    'x-large': 'size-8',
  };

  const commonClasses = `${sizes[size]} ${className ?? ''}`;

  const icons: Record<IconName, React.JSX.Element> = {
    'arrow-left': <ArrowLeftIcon className={commonClasses} />,
    x: <XIcon className={commonClasses} />,
  };

  return icons[name];
}
