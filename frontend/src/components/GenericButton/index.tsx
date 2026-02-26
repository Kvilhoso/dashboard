import { GenericButtonLayout, GenericButtonProps } from '@/typings';

export function GenericButton(props: GenericButtonProps) {
  const {
    type = 'button',
    rounded = 'large',
    layout = 'default',
    loading,
    disabled,
    children,
    className,
    ...rest
  } = props;

  const buttonLayouts: Record<GenericButtonLayout, string> = {
    default:
      'bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500 focus:ring-neutral-900',
    outline:
      'bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-800 focus:ring-white',
    ghost:
      'bg-transparent text-white border-none hover:bg-neutral-900 hover:text-neutral-200 disabled:bg-neutral-900 disabled:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-white',
  };

  const buttonsLoadingClass: Record<GenericButtonLayout, string> = {
    default: 'border-neutral-500 border-t-neutral-400',
    outline: 'border-neutral-400 border-t-neutral-500',
    ghost: 'border-neutral-400 border-t-neutral-500',
  };

  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  const cursorState = loading
    ? 'disabled:cursor-progress'
    : 'disabled:cursor-not-allowed';
  const cursorClass = `cursor-pointer ${cursorState}`;

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`w-full h-10 flex items-center justify-center p-3 ${roundedClass} text-base font-normal ${buttonLayouts[layout]} transition-all duration-300 ${cursorClass} focus:outline-none focus:ring-1 active:scale-[0.98] ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          className={`size-6 border-2 ${buttonsLoadingClass[layout]} rounded-full animate-spin`}
        />
      ) : (
        children
      )}
    </button>
  );
}
