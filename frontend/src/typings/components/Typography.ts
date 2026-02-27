import { HTMLMotionProps } from 'framer-motion';
import { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';

export type TypographyElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'label'
  | 'span';
export type TypographyColor =
  | 'always-light'
  | 'always-dark'
  | 'success'
  | 'error'
  | 'neutral'
  | 'disabled';
export type TypographyWeight =
  | 'thin'
  | 'extra-light'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extra-bold'
  | 'black';

export interface NativePropsMap {
  h1: HTMLAttributes<HTMLHeadingElement>;
  h2: HTMLAttributes<HTMLHeadingElement>;
  h3: HTMLAttributes<HTMLHeadingElement>;
  h4: HTMLAttributes<HTMLHeadingElement>;
  h5: HTMLAttributes<HTMLHeadingElement>;
  h6: HTMLAttributes<HTMLHeadingElement>;
  p: HTMLAttributes<HTMLParagraphElement>;
  label: LabelHTMLAttributes<HTMLLabelElement>;
  span: HTMLAttributes<HTMLSpanElement>;
}

export interface MotionPropsMap {
  h1: HTMLMotionProps<'h1'>;
  h2: HTMLMotionProps<'h2'>;
  h3: HTMLMotionProps<'h3'>;
  h4: HTMLMotionProps<'h4'>;
  h5: HTMLMotionProps<'h5'>;
  h6: HTMLMotionProps<'h6'>;
  p: HTMLMotionProps<'p'>;
  label: HTMLMotionProps<'label'>;
  span: HTMLMotionProps<'span'>;
}

export interface BaseProps {
  children?: ReactNode;
  className?: string;
  color?: TypographyColor;
  weight?: TypographyWeight;
  withPresence?: boolean;
}

export type TypographyProps<T extends TypographyElement = 'p'> = BaseProps & {
  as?: T;
} & Omit<MotionPropsMap[T], keyof BaseProps>;
