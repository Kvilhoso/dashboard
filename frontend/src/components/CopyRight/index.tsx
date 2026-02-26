import { CopyRightProps } from '@/typings';

export function CopyRight(props: CopyRightProps) {
  return (
    <p className='text-xs text-neutral-500' {...props}>
      © {new Date().getFullYear()} projeKt Rage
    </p>
  );
}
