import { ElementType, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TypographyColor,
  TypographyElement,
  TypographyProps,
  TypographyWeight,
} from '@/typings';

export function Typography<T extends TypographyElement = 'p'>({
  as,
  children,
  className,
  color = 'always-light',
  weight = 'normal',
  withPresence = true,
  ...rest
}: TypographyProps<T>) {
  const _as = as ?? 'p';
  const Tag = motion[_as] as ElementType;

  const sizes: Record<TypographyElement, string> = {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl',
    h4: 'text-xl',
    h5: 'text-lg',
    h6: 'text-base',
    p: 'text-base',
    label: 'text-sm',
    span: 'text-xs',
  };

  const weights: Record<TypographyWeight, string> = {
    thin: 'font-thin',
    'extra-light': 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    'extra-bold': 'font-extrabold',
    black: 'font-black',
  };

  const colors: Record<TypographyColor, string> = {
    'always-light': 'text-white',
    'always-dark': 'text-black',
    success: 'text-green-300',
    error: 'text-red-300',
    neutral: 'text-neutral-500',
    disabled: 'text-neutral-600',
  };

  const renderTag = useMemo(
    () => (
      <Tag
        className={`${sizes[_as]} ${weights[weight]} ${colors[color]} ${className ?? ''}`}
        {...rest}
      >
        {children}
      </Tag>
    ),
    [Tag, _as, color, weight, className, rest, children],
  );

  return withPresence ? (
    <AnimatePresence>{renderTag}</AnimatePresence>
  ) : (
    renderTag
  );
}
