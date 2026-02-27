import { Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TextFieldProps, TextFieldState, TypographyColor } from '@/typings';
import { Typography } from '../Typography';

export function TextField(props: TextFieldProps) {
  const {
    className,
    type,
    eyebrow,
    disabled,
    hint,
    state = 'default',
    ...rest
  } = props;

  const [shouldPassword, setShouldPassword] = useState(false);

  const isPassword = type === 'password';
  const isError = state === 'error';

  const renderEye = useMemo(
    () =>
      shouldPassword ? (
        <EyeOff className='size-4' />
      ) : (
        <Eye className='size-4' />
      ),
    [shouldPassword],
  );

  const inputClasses: Record<TextFieldState, string> = {
    default: 'border-neutral-800 hover:ring-neutral-800 focus:ring-neutral-800',
    error: 'border-red-300 hover:ring-red-300 focus:ring-red-300',
    success: 'border-green-300 hover:ring-green-300 focus:ring-green-300',
  };

  const renderHint = useMemo(() => {
    const hintColors: Record<TextFieldState, TypographyColor> = {
      default: 'neutral',
      error: 'error',
      success: 'success',
    };
    const hintColor = disabled ? 'disabled' : hintColors[state];

    return (
      <AnimatePresence>
        {hint && (
          <Typography
            key='hint'
            as='span'
            weight='medium'
            color={hintColor}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='block mt-2'
            withPresence={false}
          >
            {hint}
          </Typography>
        )}
      </AnimatePresence>
    );
  }, [hint, disabled, state, isError]);

  return (
    <>
      {eyebrow && (
        <Typography
          as='label'
          weight='medium'
          color={disabled ? 'disabled' : 'neutral'}
          className='block text-xs mb-2'
          animate={false}
        >
          {eyebrow}
        </Typography>
      )}

      {isPassword ? (
        <div className='relative'>
          <input
            disabled={disabled}
            type={shouldPassword ? 'text' : 'password'}
            className={`w-full p-3 pr-9 rounded-lg bg-neutral-900 border ${inputClasses[state]} text-white placeholder-neutral-500 hover:outline-none hover:ring-1 focus:outline-none focus:ring-1 text-sm disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:placeholder-neutral-600 caret-white ${className}`}
            {...rest}
          />

          <button
            type='button'
            disabled={disabled}
            onClick={() => setShouldPassword(!shouldPassword)}
            className='absolute right-3 translate-y-full text-neutral-500 hover:text-neutral-400 transition duration-300 focus:outline-none focus:text-neutral-300 disabled:text-neutral-600 disabled:cursor-not-allowed'
          >
            {renderEye}
          </button>

          {renderHint}
        </div>
      ) : (
        <>
          <input
            type={type}
            disabled={disabled}
            className={`w-full p-3 rounded-lg bg-neutral-900 border ${inputClasses[state]} text-white placeholder-neutral-500 hover:outline-none hover:ring-1 focus:outline-none focus:ring-1 text-sm disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:placeholder-neutral-600 caret-white ${className}`}
            {...rest}
          />

          {renderHint}
        </>
      )}
    </>
  );
}
