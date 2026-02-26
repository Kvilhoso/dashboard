import { GenericButtonProps } from '@/typings';

export function GenericButton(props: GenericButtonProps) {
  const {
    type = 'button',
    rounded = 'lg',
    layout = 'default',
    loading,
    disabled,
    children,
    className,
    ...rest
  } = props;

  const isDefault = layout === 'default';

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  const layoutButtonClass = isDefault
    ? 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500 focus:ring-neutral-900'
    : 'bg-white text-black hover:bg-neutral-100 disabled:bg-neutral-300 disabled:text-neutral-800 focus:ring-white';
  const layoutLoadingClass = isDefault
    ? 'border-neutral-500 border-t-neutral-400'
    : 'border-neutral-400 border-t-neutral-500';
  const cursorState = loading
    ? 'disabled:cursor-progress'
    : 'disabled:cursor-not-allowed';
  const cursorClass = `cursor-pointer ${cursorState}`;

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`w-full h-10 flex items-center justify-center p-3 ${roundedClass} text-base font-normal ${layoutButtonClass} transition-all duration-300 ${cursorClass} focus:outline-none focus:ring-1 active:scale-[0.98] ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          className={`size-6 border-2 ${layoutLoadingClass} rounded-full animate-spin`}
        />
      ) : (
        children
      )}
    </button>
  );
}
