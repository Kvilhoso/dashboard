import { IconButtonProps } from '@/typings';
import { Icon } from '../Icon';

export function IconButton(props: IconButtonProps) {
  const {
    name,
    className,
    rounded = 'large',
    size = 'medium',
    ...rest
  } = props;

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg';

  return (
    <button
      className={`size-10 flex items-center justify-center ${roundedClass} border border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500 focus:ring-neutral-900 transition-all duration-300 focus:outline-none focus:ring-1 active:scale-[0.98] ${className}`}
      {...rest}
    >
      <Icon name={name} size={size} className={className} />
    </button>
  );
}
