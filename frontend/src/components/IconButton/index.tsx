import React from 'react';
import { ArrowLeftIcon, XIcon } from 'lucide-react';
import { IconButtonName, IconButtonProps, IconButtonSize } from '@/typings';

export function IconButton(props: IconButtonProps) {
  const {
    name,
    className,
    rounded = 'large',
    size = 'medium',
    ...rest
  } = props;

  const sizes: Record<IconButtonSize, string> = {
    'x-small': 'size-3',
    small: 'size-3.5',
    medium: 'size-4',
    large: 'size-6',
    'x-large': 'size-8',
  };

  const icons: Record<IconButtonName, React.JSX.Element> = {
    'arrow-left': <ArrowLeftIcon className={sizes[size]} />,
    x: <XIcon className={sizes[size]} />,
  };

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg';

  return (
    <button
      className={`size-10 flex items-center justify-center ${roundedClass} border border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500 focus:ring-neutral-900 transition-all duration-300 focus:outline-none focus:ring-1 active:scale-[0.98] ${className}`}
      {...rest}
    >
      {icons[name]}
    </button>
  );
}
